# SAPOL Data Service

A service for data analysis and visualisation of data published by SA Police.

## Features:

* [Mobile Speed Camera Locations](#mobile-speed-camera-locations)

## Technologies

* Backend API: Node.js (TypeScript)
    * Web Scraping: Cherio.js
* Frontend: Vite-React ([sapol-web-app](https://github.com/SbrowneA/sapol-web-app))
* GeoSpatial data pipeline (ingestion, transformation, load)
    * OpenStreetMap(OSM) `planet.pbf` extract
    * Transform Tools: osmconvert -> osmfilter -> osm2pgsql -> PostgreSQL + PostGIS
* Database: PosgreSQL

## Environment Variables

`APP_STAGE` is the primary environment flag for this service.

Use it to select the deployment stage and env file:
- `local`
- `dev`
- `test`
- `prod`

`NODE_ENV` is treated as a standard runtime compatibility flag for Node tooling
and libraries. You can set it explicitly in `.env` files when needed; otherwise
it is derived from `APP_STAGE`:
- `prod` -> `production`
- `test` -> `test`
- `dev` / `local` -> `development`

For normal app startup, set only `APP_STAGE`. Set `NODE_ENV` explicitly only
when you need to override the default mapping.

Examples:
- Local: `APP_STAGE=local`
- Production: `APP_STAGE=prod`

## Mobile Speed Camera Locations
View it live on ([sapol-web-app](https://github.com/SbrowneA/sapol-web-app))

![Demo of map with higligted streets and suburbs](/assets/streets-live.gif)
