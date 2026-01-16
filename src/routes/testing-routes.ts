import { Router } from "express";

import { SapolScraper } from "../scraper.ts";
import { DataMapping } from "../db/mapping.ts";

const testingRoutes = Router();

const scraper = new SapolScraper();
testingRoutes.get("/", (req, res) => {
  res.json({message: `main route`});
});

testingRoutes.get("/data", (req, res) => {
  scraper.scrapeLocations().then(data => {
    res.json({message: `GET DATA`, data});
  });
});

testingRoutes.get("/save", async (req, res) => {
  // load mock values
  const data = await scraper.scrapeLocations();

  // parse to db datatype
  const dataToSave: MobileSpeedCameraLocationInsertDb[] = data.locations.map(DataMapping.cameraLocationBeToDbInsert);

  // todo
  // 1. group scraped locations into a queryableGroup
  const reconciliationMap = MobileSpeedCameraLocationReconciliation.generateReconciliationMap(dataToSave);

  // fixme
  reconciliationMap.forEach((val, key) => {
    console.log(`${key} scrapedLocations: ${val.scrapedLocations.length}`);
    val.scrapedLocations.forEach((loc, key) => {
      console.log(loc.start_date, '-', loc.end_date, loc.location);
    })
    console.log('\n');
  })
  // 2. query regionType|startDate|endDate
  MobileSpeedCameraLocationReconciliation.generateDateRangeQueries(reconciliationMap);

  // fixme
  reconciliationMap.forEach((val, key) => {
    console.log(`${key} query: ${typeof val.query}`);
  })

  // todo run query

  // 3. Do reconciliation (Update existing records)


  // 3.1 Deactivate - records that are NOT found in the scraped locations

  //
  res.json({message: `Saving Data`, run: data.scrapeRun, rows: dataToSave });
});

export default testingRoutes;
