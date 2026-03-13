/*
  Script to upsert values in streets_by_suburb (from streets_by_suburb_temp).

  * Make sure to run `pg_restore` command to load the streets_by_suburb_temp table into the target db.
 */
BEGIN;
-- In case table has not already been created
CREATE TABLE IF NOT EXISTS streets_by_suburb
(
    streets_by_suburb_id SERIAL PRIMARY KEY, -- surrogate PK
    street_canon         TEXT   NOT NULL,
    suburb_name          TEXT   NOT NULL,
    suburb_osm_id        BIGINT NOT NULL,
    street_osm_ids       BIGINT[],           -- array of street OSM IDs
    street_geom          GEOMETRY,           -- PostGIS geometry
    CONSTRAINT uq_street_suburb UNIQUE (street_canon, suburb_osm_id)
);
-- Create lookup index
CREATE INDEX IF NOT EXISTS street_by_suburb_lookup ON streets_by_suburb (street_canon, suburb_name);

-- DO upsert
INSERT INTO streets_by_suburb (street_canon,
                               suburb_name,
                               suburb_osm_id,
                               street_osm_ids,
                               street_geom)
SELECT street_canon,
       suburb_name,
       suburb_osm_id,
       street_osm_ids,
       street_geom
FROM streets_by_suburb_temp
ON CONFLICT (street_canon, suburb_osm_id)
    DO UPDATE SET suburb_name    = EXCLUDED.suburb_name,
                  street_osm_ids = EXCLUDED.street_osm_ids,
                  street_geom    = EXCLUDED.street_geom;

-- Now drop table that is no longer needed
DROP TABLE IF EXISTS streets_by_suburb_temp;
COMMIT;
