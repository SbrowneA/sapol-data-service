import * as cheerio from "cheerio";
import {readFile, writeFile} from "fs/promises";
import { get as httpGet } from 'node:http'
import {DateTime} from 'luxon';
import path from 'node:path'
import { fileURLToPath } from "node:url";

import {env, isLocal} from "../env.ts";
import {type MobileSpeedCameraLocation} from "./schemas/MobileSpeedCameraLocationSchema.ts";

export class SapolScraper {
  /**
   * Loads the HTML to be parsed from the SAPOL page.
   */
  private async loadPageHtml() {
    if (isLocal) {
      return this.loadPageHtmlMock();
    } else {
      // fixme
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
  private parseHtmlPage(html: string): MobileSpeedCameraLocation[] {
    console.log('Parsing HTML:', html.length, 'chars');
    const metroLocations: MobileSpeedCameraLocation[] = [];
    const countryLocations: MobileSpeedCameraLocation[] = [];

    const $ = cheerio.load(html);
    // Parse metro locations
    const metroContainers = $('div.container').not('.country');
    // getting the first metro list (ul) because each metro-list contains all the metro locations
    const metroElements = metroContainers.children('ul').first().children('li');
    console.log('metro', metroElements.length);
    metroElements.each((i, el) => {
      const date: string = (el.attribs as any)?.['data-value'] || '';
      const text: string = (el.children?.[0] as any)?.data || null;
      const location: MobileSpeedCameraLocation = {
        startDate: new Date(date),
        endDate: new Date(date),
        location: text,
        regionType: "METRO",
        createdAt: DateTime.now().toISO(),
        editedAt: DateTime.now().toISO(),
        meta: {cssClass: (el.attribs as any)?.['class'] || undefined}
      };
      metroLocations.push(location);
    });

    // Parse country locations
    const countryContainer = $('div.container.country');
    const countryElements = countryContainer.children('ul.countrylist').children('li')
    console.log('country', countryElements.length);

    countryElements.each((i, el) => {
      const dateStart: string = (el.attribs as any)?.['datestart'] || '';
      const dateEnd: string = (el.attribs as any)?.['dateend'] || '';
      const text: string = (el.children?.[0] as any)?.data || null;
      const location: MobileSpeedCameraLocation = {
        startDate: new Date(dateStart),
        endDate: new Date(dateEnd),
        location: text,
        regionType: "COUNTRY",
        createdAt: DateTime.now().toISO(),
        editedAt: DateTime.now().toISO(),
        meta: {cssClass: (el.attribs as any)?.['class'] || undefined}
      };
      metroLocations.push(location);
    });

    return [...metroLocations, ...countryLocations];
  }

  /**
   * Main method to:
   * 1. Load HTML from SAPOL page
   * 2. Parse HTML to MobileSpeedCameraLocation
   * 3. Save/write MobileSpeedCameraLocation
   */
  async getData(dateRange?: { startDate: string, endDate: string }): Promise<MobileSpeedCameraLocation[]> {
    // TODO check if data has already been saved for date range (if no date check for week (from now/Today)
    // if YES - use saved results (if they are less than 2 days old)
    // todo
    // ELSE - load html from SAPOL site
    // load HTML from SAPOL site
    const html = await this.loadPageHtml();

    // Parse html into data
    // todo should load data from saved locations in supabase
    const data: MobileSpeedCameraLocation[] = this.parseHtmlPage(html || '');

    await this.writeData(data)
    return data;
  }

  async writeData(data: Object) {
    // TODO save to supabase
    // todo sync loaded results with saved results
    try {
      await writeFile("mobile-cameras.json", JSON.stringify(data, null, 2), {encoding: "utf8"});
      console.log("Wrote mobile-cameras.json");
    } catch (err) {
      console.error(err);
    }
  }
}

/**
 * TODO
 * Database for historical reference of streets.
 * - Reduces frequency of calls to SAPOL site.
 */
export class SapolDataService {

}

