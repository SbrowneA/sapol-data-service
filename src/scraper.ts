import {readFile, writeFile} from "fs/promises";
import {get as httpGet} from 'node:http'
import path from 'node:path'
import {fileURLToPath} from "node:url";
import * as crypto from "node:crypto";

import {DateTime} from 'luxon';
import * as cheerio from "cheerio";
import {Element} from 'domhandler';

import {env, isLocal} from "../env.ts";
import {
  type MobileSpeedCameraLocation,
  MobileSpeedCameraLocationSchema
} from "./schemas/domain/MobileSpeedCameraLocationSchema.ts";
import {type Cheerio} from "cheerio";
import {type ZodSafeParseResult} from "zod";
import { type ScrapeRun } from "./schemas/domain/ScrapeRunSchema.ts";
import {type RegionType} from "./schemas/domain/regionTypeEnum.ts";
import {type MobileSpeedCameraLocationDb} from "./schemas/db/MobileSpeedCameraLocationsSchemaDb.ts";

const uuid = () => crypto.randomUUID();

export class SapolScraper {
  /**
   * Loads the HTML to be parsed from the SAPOL page.
   */
  private async loadPageHtml() {
    if (isLocal) {
      return this.loadPageHtmlMock();
    } else {
      // todo
      throw new Error("SET UP LIVE SCRAPING!")
      httpGet(env.SAPOL_LOCATIONS_URL, (value) => {
        console.log('Response from', env.SAPOL_LOCATIONS_URL, value)
      });
    }
  }

  /**
   * Mocks response to request made to SAPOL page.
   * @see SapolScraper.loadPageHtml()
   */
  private async loadPageHtmlMock(): Promise<string> {
    let htmlString = '';
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const filePath = path.join(__dirname, env.SAPOL_MOCK_RESPONSE_FILE_PATHS.SUCCESS);

      console.log(filePath);
      htmlString = await readFile(filePath, {encoding: 'utf8'});
    } catch (err) {
      console.error(err);
    }
    return htmlString;
  }

  /**
   * Parses the loaded HTML string to MobileSpeedCameraLocation
   * @param html : string
   * @private
   */
  private parseHtmlPage(html: string, scrapeRun: ScrapeRun ): MobileSpeedCameraLocation[] {
    console.info('Parsing HTML:', html.length, 'chars');

    const $ = cheerio.load(html);
    // Parse metro locations
    const metroContainers = $('div.container').not('.country');
    // getting the first metro list (ul) because each metro-list contains all the metro locations
    const metroElements = metroContainers.children('ul').first().children('li');
    const metroLocations: MobileSpeedCameraLocation[] = this.paresElementsToLocations("METRO", metroElements, scrapeRun.scrapeRunId);

    // Parse country locations
    const countryContainer = $('div.container.country');
    const countryElements = countryContainer.children('ul.countrylist').children('li')
    const countryLocations: MobileSpeedCameraLocation[] = this.paresElementsToLocations("COUNTRY", countryElements, scrapeRun.scrapeRunId);

    console.info('metro elements:', metroElements.length);
    console.info('metro locations:', metroLocations.length);
    console.info('country elements:', countryElements.length);
    console.info('country locations:', countryLocations.length);
    console.log('unique locations: ', metroLocations.length + countryLocations.length);

    return [...metroLocations, ...countryLocations];
  }

  /**
   * Main method to:
   * 1. Load HTML from SAPOL page
   * 2. Parse HTML to MobileSpeedCameraLocation
   * 3. Save/write MobileSpeedCameraLocation
   */
  async getData(dateRange?: { startDate: string, endDate: string }): Promise<{ locations: MobileSpeedCameraLocation[], scrapeRun: ScrapeRun }> {
    // TODO check if data has already been saved for date range (if no date check for week (from now/Today)
    // if YES - use saved results (if they are less than 2 days old)

    // if NO -
      // ELSE - load html from SAPOL site
    const scrapeRun: ScrapeRun = {
      scrapeRunId: uuid(),
      runStart: DateTime.utc().toISO(),
      runResult: 'PENDING'
    }

    let data: MobileSpeedCameraLocation[] = [];
    try {
      // 1. load HTML from SAPOL site
      const html = await this.loadPageHtml();
      // 2. Parse html into data
      data = this.parseHtmlPage(html || '', scrapeRun);
      // 2.1 save debug information
      await this.writeDataForDebug(data, 'mobile-cameras.json');
      // 3. finalise run
      scrapeRun.runEnd = DateTime.utc().toISO();
      scrapeRun.runResult = 'SUCCESS';
    } catch (error) {
      scrapeRun.runResult = 'FAIL';
    }
    return { locations: data, scrapeRun };
  }


  /**
   *
   * @param data
   * @param fileName
   * @private
   */
  private async writeDataForDebug(data: Object, fileName: string) {
    try {
      const filePath = path.join('src/debug', fileName);
      await writeFile(filePath, JSON.stringify(data, null, 2), {encoding: "utf8"});
      console.log("Wrote mobile-cameras.json");
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Upserts camera location records
   * @param data
   */
  async saveLocations(data: MobileSpeedCameraLocationDb) {
    try {
      // todo sync loaded results with saved results
      //  save to supabase
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Parses the scraped HTML elements to MobileSpeedCameraLocation[] based on the regionType provided
   * @param regionType
   * @param elements
   * @param scrapeRunId
   * @private
   */
  private paresElementsToLocations(regionType: RegionType, elements: Cheerio<Element>, scrapeRunId: string): MobileSpeedCameraLocation[] {
    // locations map to de-duplicate values (Duplicates can still exist in same SAPOL list)
    const locationsMap: Map<string, MobileSpeedCameraLocation> = new Map();

    elements.each((i, el) => {
      let startDate: string;
      let endDate: string;
      // only add locations that showlist to avoid duplicates
      const cssClass = (el.attribs as any)?.['class'];
      if (cssClass.includes('showlist')) {
        if (regionType === "METRO") {
          const date: string = (el.attribs as any)?.['data-value'] || '';
          const formattedDate = DateTime.fromFormat(date, "dd/MM/yyyy").toFormat('yyyy-MM-dd');
          startDate = formattedDate;
          endDate = formattedDate;
        } else {
          const dateStart: string = (el.attribs as any)?.['datestart'] || '';
          startDate = DateTime.fromFormat(dateStart, "dd/MM/yyyy").toFormat('yyyy-MM-dd');
          const dateEnd: string = (el.attribs as any)?.['dateend'] || '';
          endDate = DateTime.fromFormat(dateEnd, "dd/MM/yyyy").toFormat('yyyy-MM-dd');
        }
        let text: string = (el.children?.[0] as any)?.data || null;
        text = text.replace(/\s*\r?\n\s*/g, ' ').trim();

        // Zod.parse() to validate scraped value
        const result: ZodSafeParseResult<MobileSpeedCameraLocation> = MobileSpeedCameraLocationSchema.safeParse({
          startDate: startDate,
          endDate: endDate,
          location: text,
          regionType: regionType,
          createdAt: DateTime.utc().toISO(),
          // fixme comments
          // editedAt: DateTime.utc().toISO(),
          // assume true until deleted
          // isActive: true,
          scrapeRunId: scrapeRunId,
          meta: {
            cssClass: cssClass || undefined,
            allScrapeRuns: []
          }
        });

        if (result.success) {
          const location = result.data
          const key =  location.location + location.startDate + location.endDate;
          if (!locationsMap.has(key)){
            locationsMap.set(key, location);
          }
          else {
            console.info('duplicate location scraped from SAPOL: ',
              `(${regionType}) ${location.location}, from ${startDate} to ${endDate}`);
          }
        } else {
          console.error('Could not parse location', `text, ${startDate} -  ${endDate}`);
          console.error(result.error);
        }
      }
    });

    return Array.from(locationsMap.values());
  }
}

/**
 * TODO
 * Database for historical reference of streets.
 * - Reduces frequency of calls to SAPOL site.
 */
export class SapolDataService { }

