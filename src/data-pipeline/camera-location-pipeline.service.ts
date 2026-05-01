import { type PostgrestMaybeSingleResponse, SupabaseClient } from '@supabase/supabase-js';

import { SapolDataService } from '../scraping/sapol-scraper.service.ts';
import { RunScrapeAndSaveResultsUseCase } from '../scraping/run-scrape-and-save.use-case.ts';
import { type CameraPipelineRunDb } from '../schemas/db/camera-pipeline-run-db.schema.ts';
import { CameraPipelineRunTableService } from '../db/table-services/camera-pipeline-run-table.service.ts';
import { type CanonisationRunDb } from '../schemas/db/canonisation-run-db.schema.ts';
import { CanonisationRunTableService } from '../db/table-services/canonisation-run-table.service.ts';
import { type LocationResolutionRunDb } from '../schemas/db/location-resolution-run-db.schema.ts';
import { DateTime } from 'luxon';
import { type SupabaseQuery } from '../db/sapol-db.service.ts';
import { AppError, DatabaseError, UnexpectedError } from '../errors/app-error.ts';
import { type ScrapeRun } from '../schemas/domain/scrape-run.schema.ts';
import { DebugService } from '../debug/debug.service.ts';
import { type Env } from '../../env.schema.ts';

export class CameraLocationPipelineService {
  db: SupabaseClient;
  scrapeAndSaveUseCase: RunScrapeAndSaveResultsUseCase;
  cameraPipelineRunTableService: CameraPipelineRunTableService;
  canonisationRunTableService: CanonisationRunTableService;

  constructor(db: SupabaseClient | null, env: Env) {
    if (!db) {
      throw new Error('Database is not initialised.');
    }
    this.db = db;
    this.scrapeAndSaveUseCase = new RunScrapeAndSaveResultsUseCase(db, env);
    this.cameraPipelineRunTableService = new CameraPipelineRunTableService(db, env);
    this.canonisationRunTableService = new CanonisationRunTableService(db);
  }

  /**
   * 1. Check there is no active pipeline before initiating a new pipeline run.
   *    - Throw error if exists
   * 2. initiate pipeline or throw error
   *    2.1 Returns new pipeline run and executes in the background
   *
   *    @param triggerSource - To track who originated
   */
  public async execute(triggerSource: string = 'unknown'): Promise<CameraPipelineRunDb> {
    // 1. check there are no existing pipeline requests
    const currentPipeline = await this.cameraPipelineRunTableService.getCurrentRunningPipeline();
    if (currentPipeline.error) {
      const dbError = currentPipeline.error;
      throw new DatabaseError('ERROR: Failed canonisation run',
        { hint: dbError?.hint, code: dbError?.code }, dbError);
    }

    if (currentPipeline.data) {
      const pipelineId = currentPipeline.data.camera_pipeline_run_id;
      throw new AppError({
        statusCode: 409,
        code: 'PIPELINE_ALREADY_RUNNING',
        message: `The this pipeline is already running (Pipeline id: ${pipelineId}). Please wait a moment before triggering again`
      });
    }

    // 2. Create pipeline record
    const pipelineRun: CameraPipelineRunDb = await this.initialiseCameraLocationPipelineRun();
    pipelineRun.meta = { trigger_source: triggerSource };

    // Not awaiting - execute in the background
    this._execute(pipelineRun).then((result: CameraPipelineRunDb) => {
      console.log('camera pipeline complete\n', result);
    });

    return pipelineRun;
  }

  /**
   * !! ATTENTION: Only execute once check for existing pipeline run has been made.
   * Executes the camera-location-pipeline in the following steps:
   * 1. Initialise camera-location-pipeline run record
   * 2. Execute Scrape & save use-case
   * 3. Canonise new camera locations
   *  3.1 Create location_canonisation_run
   *  3.2 Run SQL function
   *  3.3 Finalise location_canonisation_run
   * 4. Resolve locations with GeoSpatial OSM data (location_resolution_run tracked within SQL function)
   *  4.1 Run SQL function
   * 5. Finalise pipeline run
   */
  private async _execute(pipelineRun: CameraPipelineRunDb): Promise<CameraPipelineRunDb> {
    let scrapeRun: ScrapeRun | undefined;
    let canonisationRun: CanonisationRunDb | undefined;
    let resolutionRun: LocationResolutionRunDb | undefined;
    // return response if run could be initialised 200 / else 500

    try {
      // 2. Scrape camera locations
      const scrapeResult = await this.scrapeAndSaveUseCase.execute();
      scrapeRun = scrapeResult.scrapeRun;
      // res.json(scrapeResult);
      // scrapeRun.scrapeRunId

      if (scrapeRun?.scrapeRunId) {
        // throw new Error({
        //   statusCode: 500, code: 'PIPELINE_FAILED', message:'Scrape run could not be initialised'
        // });
        await this.cameraPipelineRunTableService.updateRow({ ...pipelineRun, scrape_run_id: scrapeRun?.scrapeRunId });
      }

      // 3. Canonise locations (SQL function)
      // 3.1
      // const canonisationRun = await this.initialiseCanonisationRun();
      // 3.2
      const canonisationRunResult: PostgrestMaybeSingleResponse<CanonisationRunDb> = await this.canoniseNewCameraLocations();
      if (canonisationRunResult?.error) {
        const dbError = canonisationRunResult?.error;
        throw new DatabaseError('ERROR: Failed canonisation run',
          { hint: dbError?.hint, code: dbError?.code }, dbError);
      }
      if (!canonisationRunResult?.data) {
        throw new Error('Something went wrong in the canonisation run');
      }
      canonisationRun = canonisationRunResult.data as CanonisationRunDb;
      await DebugService.writeDataForDebug(canonisationRun, 'canonisation-run.json');

      // 4. Resolve locations (SQL function)
      const resolutionRunResult: PostgrestMaybeSingleResponse<LocationResolutionRunDb> = await this.resolveNewCameraLocations();
      if (resolutionRunResult?.error) {
        const dbError = resolutionRunResult?.error;
        throw new DatabaseError('ERROR: Failed resolution run',
          { hint: dbError?.hint, code: dbError?.code }, dbError);
      }
      if (!resolutionRunResult?.data) {
        throw new Error('Something went wrong in the resolution run');
      }

      resolutionRun = resolutionRunResult.data as LocationResolutionRunDb;
      await DebugService.writeDataForDebug(resolutionRun, 'resolution-run.json');
    } catch (err) {
      // 5. Finalize FAILED pipeline
      pipelineRun.meta.error = err;
      const pipelineResult = await this.finaliseCameraLocationPipelineRun(
        pipelineRun,
        'FAIL',
        scrapeRun?.scrapeRunId || null,
        canonisationRun?.canonisation_run_id || null,
        resolutionRun?.resolution_run_id || null);
      // pipelineRun.
      console.log(err);
      await DebugService.writeDataForDebug(pipelineResult || {}, 'failed-pipeline-run.json');
      throw err;
    }

    // 5. Finalize SUCCESSFUL pipeline
    const pipelineResult = await this.finaliseCameraLocationPipelineRun(
      pipelineRun,
      'SUCCESS',
      scrapeRun?.scrapeRunId || null,
      canonisationRun?.canonisation_run_id || null,
      resolutionRun?.resolution_run_id || null);

    await DebugService.writeDataForDebug(pipelineResult || {}, 'successful-pipeline-run.json');
    if (pipelineResult?.error) {
      throw new DatabaseError('ERROR: Failed to finalise pipeline run');
    }
    if (!pipelineResult?.data) {
      throw new UnexpectedError('Something went wrong in the pipeline run');
    }
    return pipelineResult.data[0];
  }

  async initialiseCameraLocationPipelineRun(): Promise<CameraPipelineRunDb> {
    const result = await this.cameraPipelineRunTableService.insertRows([SapolDataService.generateGenericRun()]);

    if (result?.error) {
      console.error('ERROR: Failed initialising camera location pipeline run');
      console.error(result.error);
      throw result.error;
    } else if (!result?.data) {
      console.error('Something went wrong camera location pipeline run');
      throw new UnexpectedError('Something went wrong camera location pipeline run');
    }

    return result?.data[0];
  }

  finaliseCameraLocationPipelineRun(
    run: CameraPipelineRunDb,
    runStatus: 'SUCCESS' | 'FAIL',
    scrapeRunId: number | null,
    canonisationRunId: number | null,
    resolutionRunId: number | null): SupabaseQuery<CameraPipelineRunDb> {
    // resolutionRunId: number | null): Promise<CameraPipelineRunDb> {
    run.scrape_run_id = scrapeRunId;
    run.canonisation_run_id = canonisationRunId;
    run.resolution_run_id = resolutionRunId;
    run.run_end = DateTime.utc().toISO();
    run.run_result = runStatus;
    run.meta = {
      ...(run.meta || {})
    };

    return this.cameraPipelineRunTableService.updateRow(run);
  }

  /**
   * Execute SQL function to canonise new camera locations
   * @returns CanonisationRunDb
   */
  canoniseNewCameraLocations() {
    return this.db.rpc('canonise_camera_locations');
  }

  /**
   * Execute SQL function to resolve unresolved (canonised) camera locations
   * @returns LocationResolutionRunDb
   */
  resolveNewCameraLocations() {
    return this.db.rpc('resolve_camera_locations');
  }
}
