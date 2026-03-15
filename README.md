# SAPOL Data Service

A service for data analysis and visualisation of data published by SA Police.

## Features:

* [Mobile Speed Camera Locations (P.O.C.)](#mobile-speed-camera-locations-poc)

## Technologies

* Backend API: Node.js (TypeScript)
    * Web Scraping: Cherio.js
* Frontend: JavaScript, HTML, CSS, GeoJSON
    * Map API: Mplibre + MapTiler
* GeoSpatial data pipeline (ingestion, transformation, load)
    * OpenStreetMap(OSM) `planet.pbf` extract
    * Transform Tools: osmconvert -> osmfilter -> osm2pgsql -> PostgreSQL + PostGIS
* Database: PosgreSQL

## Mobile Speed Camera Locations (P.O.C.)
As of now, proof-of-concept that scrapes mobile speed camera locations from SAPOL, and uses OSM data to resolve them
geospatially for display on a map.

![Demo of map with higligted streets](/assets/streets-poc.gif)
_Demo of poof-of-concept_
