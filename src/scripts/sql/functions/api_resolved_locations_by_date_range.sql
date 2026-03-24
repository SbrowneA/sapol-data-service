DROP FUNCTION IF EXISTS api_resolved_locations_by_date_range;
CREATE OR REPLACE FUNCTION api_resolved_locations_by_date_range(
    q_start_date date,
    q_end_date date,
    q_region text DEFAULT NULL
)
    RETURNS TABLE
            (
                "cameraLocationId"   bigint,
                "resolvedLocationId" bigint,
                "suburbName"         text,
                "streetName"         text,
                "suburbId"           bigint,
                "startDate"          date,
                "endDate"            date,
                "streetGeom"         jsonb,
                "suburbGeom"         jsonb
            )
AS
$$
-- Quote camelCase output columns so PostgreSQL does not fold them to lowercase in RPC responses.
SELECT loc.id                                            AS "cameraLocationId",
       rcl.resolved_location_id                          AS "resolvedLocationId",
       sub.suburb_name                                   AS "suburbName",
       loc.street_full_canon                             AS "streetName",
       sub.suburb_osm_id                                 AS "suburbId",
       loc.start_date                                    AS "startDate",
       loc.end_date                                      AS "endDate",
       ST_AsGeoJSON(ST_Transform(sbs.street_geom, 4326))::jsonb AS "streetGeom",
       ST_AsGeoJSON(ST_Transform(sub.suburb_geom, 4326))::jsonb AS "suburbGeom"
FROM mobile_speed_camera_location loc
         JOIN resolved_camera_location rcl
              ON loc.id = rcl.location_id
         JOIN streets_by_suburb sbs
              ON rcl.street_by_suburb_id = sbs.streets_by_suburb_id
         JOIN suburbs sub
              ON sbs.suburb_osm_id = sub.suburb_osm_id
WHERE loc.start_date <= q_end_date
  AND loc.end_date >= q_start_date
  AND (
    q_region IS NULL
        OR (
        q_region IN ('COUNTRY', 'METRO')
            AND loc.region_type = q_region
        )
    );
$$ LANGUAGE sql STABLE;

-- SELECT * FROM api_streets_by_date_range('2026-01-14'::date, '2026-01-14'::date);
