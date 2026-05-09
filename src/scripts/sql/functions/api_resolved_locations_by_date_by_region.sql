DROP FUNCTION IF EXISTS api_resolved_locations_by_date_range_by_region;

CREATE OR REPLACE FUNCTION api_resolved_locations_by_date_by_region(
    q_date date
)
    RETURNS jsonb
AS
$$
SELECT jsonb_build_object(
               'locations', jsonb_build_object(
                    'metro', jsonb_agg(locations) filter (where locations."regionType" = 'METRO'),
                    'country', jsonb_agg(locations) filter (where locations."regionType" = 'COUNTRY')
                            ),
               'dateRange', jsonb_build_object(
                       'startDate', q_date,
                       'endDate', q_date
                            ),
               'limit', 500
       )
-- Quote camelCase output columns so PostgreSQL does not fold them to lowercase in RPC responses.
FROM (select *
      from api_resolved_locations_by_date_range(q_date, q_date)
      ORDER BY "regionType", "suburbName", "streetName", "cameraLocationId"
      LIMIT 500) locations;
$$ LANGUAGE sql STABLE;

-- select * from api_resolved_locations_by_date_by_region('2026-01-07'::date);
