import { Router } from "express";
import {SapolScraper} from "../scraper.ts";

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

export default testingRoutes;
