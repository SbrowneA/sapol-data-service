DROP FUNCTION IF EXISTS api_resolved_locations_by_date_range;
CREATE OR REPLACE FUNCTION api_resolved_locations_by_date_range(q_start_date date, q_end_date date)
    RETURNS TABLE
            (
                resolved_location_id bigint,
                street_name          text,
                suburb_name          text,
                start_date           date,
                end_date             date,
                street_geom          text,
                suburb_geom          text
            )
AS $$
SELECT rcl.resolved_location_id,
       loc.street_full_canon                             as street_name,
       --     loc.id AS location_id,
       sub.suburb_name,
       loc.start_date,
       loc.end_date,
       --     rcl.streets_by_suburb_id,
       --     rcl.resolution_run_id,
       --     sbs.street_osm_ids,
       --     region_type,
       ST_AsGeoJSON(ST_Transform(sbs.street_geom, 4326)) AS street_geom,
       ST_AsGeoJSON(ST_Transform(sub.suburb_geom, 4326)) AS suburb_geom
FROM resolved_camera_location rcl
         JOIN streets_by_suburb sbs
              ON rcl.street_by_suburb_id = sbs.streets_by_suburb_id
         JOIN suburbs sub
              ON sbs.suburb_osm_id = sub.suburb_osm_id
         JOIN mobile_speed_camera_location loc
              ON loc.id = rcl.location_id
WHERE loc.start_date <= q_end_date AND loc.end_date >= q_start_date;

$$ LANGUAGE sql STABLE;

-- SELECT * FROM api_streets_by_date_range('2026-01-14'::date, '2026-01-14'::date);
