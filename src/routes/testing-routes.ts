import { Router } from "express";

import { SapolScraper } from "../scraper.ts";
import { DataMapping } from "../db/mapping.ts";

const testingRoutes = Router();

const scraper = new SapolScraper();
testingRoutes.get("/", (req, res) => {
    res.json({message: `main route` });
});

testingRoutes.get("/data", (req, res) => {
  scraper.getData().then(data => {
    res.json({message: `GET DATA`, data });
  });
});

testingRoutes.get("/save", async (req, res) => {
  // load mock values
  const data = await scraper.getData();

  // parse to db datatype
  const dataToSave = data.locations.map(DataMapping.cameraLocationBeToDb);

  //
  res.json({message: `Saving Data`, run: data.scrapeRun, rows: dataToSave });
});

export default testingRoutes;
