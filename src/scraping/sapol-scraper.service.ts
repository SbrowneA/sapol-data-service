import {readFile} from "fs/promises";
import {get as httpsGet, type RequestOptions} from 'node:https'
import path from 'node:path'
import {fileURLToPath} from "node:url";

import {DateTime} from 'luxon';
import * as cheerio from "cheerio";
import {Element} from 'domhandler';

import { env } from "../../env.ts";
import {
  type MobileSpeedCameraLocationInsert,
  MobileSpeedCameraLocationSchema
} from "../schemas/domain/mobile-speed-camera-location.schema.ts";
import { type Cheerio } from "cheerio";
import { type ZodSafeParseResult } from "zod";
import { type ScrapeRun } from "../schemas/domain/scrape-run.schema.ts";
import { type RegionType, regionTypeValues} from "../schemas/domain/region-type.enum.ts";
import { type ScrapeRunInsertDb} from "../schemas/db/scrape-run-db.schema.ts";
import {DebugService} from "../debug/debug.service.ts";

export class SapolScraperService {
  /**
   * Main method to:
   * 1. Load HTML from SAPOL page
   * 2. Parse HTML to MobileSpeedCameraLocation
   * 3. Save/write MobileSpeedCameraLocations for debugging.
   */
  public async scrapeLocations(scrapeRun: ScrapeRun): Promise<{ locations: MobileSpeedCameraLocationInsert[], scrapeRun: ScrapeRun }> {
    let data: MobileSpeedCameraLocationInsert[] = [];
    try {
      // 1. load HTML from SAPOL site
      const html = await this.loadPageHtml();
      await DebugService.writeDataForDebug(html, 'last-scrape.html');
      // 2. Parse html into data
      data = this.parseHtmlPage(html || '', scrapeRun);
      // 2.1 save debug information
      await DebugService.writeDataForDebug(data, 'mobile-cameras.json');
      // 3. finalise run
      scrapeRun.runEnd = DateTime.utc().toISO();
      scrapeRun.runResult = 'SUCCESS';
    } catch (error) {
      console.error(error);
      // TODO throw error instead
      scrapeRun.runResult = 'FAIL';
    }
    return { locations: data, scrapeRun };
  }

  private generateHeader(host: string, userAgent?: string): {[key: string]: string} {
    // TODO:
    //  1. store header in Supabse Storage or env file
    //  2. Set up automatic header re-generation - in case request fails
    return {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      // "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "es-MX,es;q=0.9",
      "Dnt": "1",
      "Host": host,
      "Priority": "u=0, i",
      "Sec-Ch-Ua": "\"Google Chrome\";v=\"143\", \"Chromium\";v=\"143\", \"Not A(Brand\";v=\"24\"",
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": "\"Windows\"",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent": userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
      "X-Amzn-Trace-Id": "Root=1-6969f7e1-358745d37af42cb925356931"
    }
  }

  private generateHtmlRequest(hostname: string, requestPath: string, protocol: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const options: RequestOptions = {
        hostname: hostname,
        protocol: protocol,
        path: requestPath,
        method: 'GET',
        port: 443,
        headers: this.generateHeader(hostname)
      }
      httpsGet(options, (res) => {
        let body = '';

        console.log('Response status', res.statusCode);
        res.setEncoding('utf8');
        // append data chunks
        res.on('data', (chunk) => body += chunk);

        res.on('end', () => {
          console.log('Response from', res.url, body.length);
          resolve(body);
        })
      }).on('error', (err) => {
        reject(err)
      })
    });
  }

  /**
   * Loads the HTML to be parsed from the SAPOL page.
   */
  private async loadPageHtml() {
    if (env.USE_MOCK_HTML) {
      console.log('Using Mock HTML form SAPOL');
      return this.loadPageHtmlMock();
    } else {
      console.log('Making GET request to SAPOL');
      return this.generateHtmlRequest(
        env.SAPOL_LOCATIONS_REQUEST_OPTS.host,
        env.SAPOL_LOCATIONS_REQUEST_OPTS.path,
        env.SAPOL_LOCATIONS_REQUEST_OPTS.protocol
      );
    }
  }

  /**
   * Mocks response to request made to SAPOL page.
   * @see SapolScraperService.loadPageHtml()
   */
  private async loadPageHtmlMock(): Promise<string> {
    let htmlString = '';
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const filePath = path.join(__dirname, env.SAPOL_MOCK_RESPONSE_FILE_PATHS.SCRAPED);
      htmlString = await readFile(filePath, {encoding: 'utf8'});
    } catch (err) {
      console.error(err);
    }
    return htmlString;
  }

  /**
   * Parses the loaded HTML string to MobileSpeedCameraLocation
   * @param html : string
   * @param scrapeRun : ScrapeRun
   * @private
   */
  private parseHtmlPage(html: string, scrapeRun: ScrapeRun): MobileSpeedCameraLocationInsert[] {
    console.info('Parsing HTML:', html.length, 'chars');

    const $ = cheerio.load(html);
    // Parse metro locations
    const metroContainers = $('div.container').not('.country');
    // getting the first metro list (ul) because each metro-list contains all the metro locations
    const metroElements = metroContainers.children('ul').first().children('li');
    const metroLocations: MobileSpeedCameraLocationInsert[] = this.paresElementsToLocations("METRO", metroElements, scrapeRun.scrapeRunId);

    // Parse country locations
    const countryContainer = $('div.container.country');
    const countryElements = countryContainer.children('ul.countrylist').children('li')
    const countryLocations: MobileSpeedCameraLocationInsert[] = this.paresElementsToLocations("COUNTRY", countryElements, scrapeRun.scrapeRunId);

    console.info('metro elements:', metroElements.length);
    console.info('metro locations:', metroLocations.length);
    console.info('country elements:', countryElements.length);
    console.info('country locations:', countryLocations.length);
    console.log('unique locations: ', metroLocations.length + countryLocations.length);

    // TODO: alert support that no results were scraped and stop scrape run
    if (!metroLocations.length) {
      throw new Error('There were no valid locations scraped for ' + regionTypeValues.METRO);
    } else if (!countryLocations.length) {
      throw new Error('There were no valid locations scraped for ' + regionTypeValues.COUNTRY);
    }

    return [...metroLocations, ...countryLocations];
  }

  /**
   * Parses the scraped HTML elements to MobileSpeedCameraLocation[] based on the regionType provided
   * @param regionType
   * @param elements
   * @param scrapeRunId
   * @private
   */
  private paresElementsToLocations(regionType: RegionType, elements: Cheerio<Element>, scrapeRunId: number): MobileSpeedCameraLocationInsert[] {
    // locations map to de-duplicate values (Duplicates can still exist in same SAPOL list)
    const locationsMap: Map<string, MobileSpeedCameraLocationInsert> = new Map();

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
        let locationText: string = (el.children?.[0] as any)?.data || null;
        locationText = locationText.replace(/\s*\r?\n\s*/g, ' ').trim();
        const [street = '', suburb = ''] = locationText.toUpperCase().split(',');

        // Zod.parse() to validate scraped value
        const result: ZodSafeParseResult<MobileSpeedCameraLocationInsert> = MobileSpeedCameraLocationSchema.safeParse({
          startDate: startDate,
          endDate: endDate,
          location: locationText,
          streetNormalised: street.trim(),
          suburbNormalised: suburb.trim(),
          regionType: regionType,
          createdAt: DateTime.utc().toISO(),
          scrapeRunId: scrapeRunId,
          meta: {
            cssClass: cssClass || undefined,
            allScrapeRuns: []
          }
        });

        if (result.success) {
          const location = result.data
          const key = location.location + location.startDate + location.endDate;
          if (!locationsMap.has(key)) {
            locationsMap.set(key, location);
          } else {
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

export class SapolDataService {
  // TODO find a home
  static generateScrapeRun(): ScrapeRunInsertDb {
    return {
      run_start: DateTime.utc().toISO(),
      run_result: 'PENDING'
    }
  }
}
