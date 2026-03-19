/*
  Script to upsert values in suburbs (from suburbs_temp).
  Script to upsert values in streets_by_suburb (from streets_by_suburb_temp).

  ***Make sure to first run the `pg_restore` command to load the "temp" tables into the target db.***
 */
BEGIN;
-- In case tables have not already been created
CREATE TABLE IF NOT EXISTS suburbs
(
    suburb_osm_id BIGINT PRIMARY KEY,
    suburb_name   TEXT NOT NULL,
    suburb_geom   GEOMETRY -- PostGIS geometry
);

CREATE TABLE IF NOT EXISTS streets_by_suburb
(
    streets_by_suburb_id SERIAL PRIMARY KEY, -- surrogate PK
    street_canon         TEXT   NOT NULL,
    suburb_osm_id        BIGINT NOT NULL,
    street_osm_ids       BIGINT[],           -- array of street OSM IDs
    street_geom          GEOMETRY,           -- PostGIS merged geometry of matching OSM streets (within suburb)
    CONSTRAINT uq_street_suburb UNIQUE (street_canon, suburb_osm_id)
);
/*
 Indexes for lookups on (suburb_name + street_canon)
 from joins for suburbs to streets_by_suburb
 e.g.
*/
-- find suburb_id quickly from suburb_name
CREATE INDEX ON suburbs (suburb_name);

-- once you have suburb_id, find the street quickly
CREATE INDEX ON streets_by_suburb (suburb_osm_id, street_canon);
-- CREATE INDEX IF NOT EXISTS street_by_suburb_lookup ON streets_by_suburb (street_canon, suburb_name);

-- DO upsert
INSERT INTO streets_by_suburb (street_canon,
                               suburb_osm_id,
                               street_osm_ids,
                               street_geom)
SELECT street_canon,
       suburb_osm_id,
       street_osm_ids,
       street_geom
FROM streets_by_suburb_temp
ON CONFLICT (street_canon, suburb_osm_id)
    DO UPDATE SET street_osm_ids = EXCLUDED.street_osm_ids,
                  street_geom    = EXCLUDED.street_geom;


INSERT INTO suburbs (suburb_osm_id,
                     suburb_name,
                     suburb_geom)
SELECT suburb_osm_id,
       suburb_name,
       suburb_geom
FROM suburbs_temp
ON CONFLICT (suburb_osm_id)
    DO UPDATE SET suburb_name = EXCLUDED.suburb_name,
                  suburb_geom = EXCLUDED.suburb_geom;

-- Now drop table that is no longer needed
DROP TABLE IF EXISTS streets_by_suburb_temp;
DROP TABLE IF EXISTS suburbs_temp;
COMMIT;
