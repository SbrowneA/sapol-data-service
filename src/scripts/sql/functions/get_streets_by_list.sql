DROP FUNCTION IF EXISTS api_get_streets_from_input;
CREATE OR REPLACE FUNCTION api_get_streets_from_input(input_json jsonb)
    RETURNS TABLE
            (
                streets_by_suburb_id bigint,
                street_canon         text,
                suburb_name          text,
                street_geom          text,
                suburb_geom          text
            )
AS
$$
    -- Join matching streets, then enrich results.
WITH search_inputs AS (SELECT street as q_street,
                              suburb as q_suburb
                       FROM jsonb_to_recordset(input_json) AS v(street text, suburb text))
SELECT st.streets_by_suburb_id,
       st.street_canon,
       sub.suburb_name,
       ST_AsGeoJSON(ST_Transform(st.street_geom, 4326))  AS street_geom,
       ST_AsGeoJSON(ST_Transform(sub.suburb_geom, 4326)) AS suburb_geom
-- st.street_geom,
-- sub.suburb_geom
FROM streets_by_suburb st
         JOIN suburbs sub
              ON sub.suburb_osm_id = st.suburb_osm_id
         JOIN search_inputs v
              ON st.street_canon = v.q_street
                  AND sub.suburb_name = v.q_suburb;
$$ LANGUAGE sql STABLE;
