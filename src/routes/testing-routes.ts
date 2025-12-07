import { Router } from "express";

const testingRoutes = Router();

testingRoutes.get("/", (req, res) => {
  res.json({message: `GET DATA` });
});


// TODO
// init puppeteer
testingRoutes.get("/data", (req, res) => {
  // get data
  // find items
  // parse data
  // return
  // NEXT: cache data
  //res.json({message: `GET DATA` });
});

export default testingRoutes;
