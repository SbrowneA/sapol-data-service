/*
  Resolve mobile speed camera locations against streets_by_suburb + suburbs.

  Matching criteria:
  - streets_by_suburb.street_canon = mobile_speed_camera_location.street_full_canon
  - suburbs.suburb_name            = mobile_speed_camera_location.suburb_norm

  Behavior:
  - creates a new location_resolution_run row
  - resolves only locations that do not already exist in resolved_camera_location
  - inserts exact matches into resolved_camera_location
  - completes successfully even when some locations remain unresolved
  - stores unresolved counts and ids in location_resolution_run.meta
*/

BEGIN;

DO $$
DECLARE
    -- Tracks the run row created for this execution so inserts can be linked back to it.
    v_resolution_run_id BIGINT;
    -- Holds ids of candidate camera locations that did not get a street/suburb match.
    v_unresolved_location_ids BIGINT[];
    -- Simple run metrics written into location_resolution_run.meta.
    v_unresolved_count INTEGER := 0;
    v_matched_count INTEGER := 0;
    v_candidate_count INTEGER := 0;
BEGIN
    -- Start a new resolution run in a pending state.
    INSERT INTO location_resolution_run (
        run_start,
        run_result,
        meta
    )
    VALUES (
        NOW(),
        'PENDING',
        jsonb_build_object(
            'status', 'running'
        )
    )
    RETURNING resolution_run_id
    INTO v_resolution_run_id;

    -- Collect the locations eligible for resolution in this run:
    -- 1. they already have canonised street data
    -- 2. they have a suburb value
    -- 3. they have not already been resolved in resolved_camera_location
    CREATE TEMP TABLE tmp_camera_resolution_candidates
        ON COMMIT DROP
    AS
    SELECT loc.id,
           loc.street_full_canon,
           loc.suburb_norm
    FROM mobile_speed_camera_location loc
             LEFT JOIN resolved_camera_location rcl
                       ON rcl.location_id = loc.id
    WHERE loc.street_full_canon IS NOT NULL
      AND loc.suburb_norm IS NOT NULL
      AND rcl.location_id IS NULL;

    GET DIAGNOSTICS v_candidate_count = ROW_COUNT;

    -- Resolve candidate locations by joining suburb first, then the street within that suburb.
    -- This keeps the matching logic explicit and gives a stable result set for the insert step
    -- and the unresolved debug metadata step below.
    CREATE TEMP TABLE tmp_camera_resolution_matches
        ON COMMIT DROP
    AS
    SELECT candidate.id AS location_id,
           st.streets_by_suburb_id
    FROM tmp_camera_resolution_candidates candidate
             JOIN suburbs sub
                  ON sub.suburb_name = candidate.suburb_norm
             JOIN streets_by_suburb st
                  ON st.suburb_osm_id = sub.suburb_osm_id
                     AND st.street_canon = candidate.street_full_canon;

    -- Persist only successful matches as relationship rows.
    INSERT INTO resolved_camera_location (
        location_id,
        resolution_run_id,
        street_by_suburb_id
    )
    SELECT match.location_id,
           v_resolution_run_id,
           match.streets_by_suburb_id
    FROM tmp_camera_resolution_matches match;

    GET DIAGNOSTICS v_matched_count = ROW_COUNT;

    -- Any candidate not present in the matched set is treated as unresolved for this run.
    -- These ids are stored in meta to support later debugging and data cleanup.
    SELECT COALESCE(array_agg(candidate.id ORDER BY candidate.id), ARRAY[]::BIGINT[])
    INTO v_unresolved_location_ids
    FROM tmp_camera_resolution_candidates candidate
    WHERE NOT EXISTS (
        SELECT 1
        FROM tmp_camera_resolution_matches match
        WHERE match.location_id = candidate.id
    );

    v_unresolved_count := COALESCE(array_length(v_unresolved_location_ids, 1), 0);

    -- Complete the run successfully even if some rows were unresolved.
    UPDATE location_resolution_run
    SET run_end = NOW(),
        run_result = 'SUCCESS',
        meta = jsonb_build_object(
            'candidate_count', v_candidate_count,
            'matched_count', v_matched_count,
            'unresolved_count', v_unresolved_count,
            'unresolved_location_ids', to_jsonb(v_unresolved_location_ids)
        )
    WHERE resolution_run_id = v_resolution_run_id;

EXCEPTION
    WHEN OTHERS THEN
        -- If anything fails, attempt to close out the run row with failure metadata
        -- before re-raising the original error to abort the transaction.
        IF v_resolution_run_id IS NOT NULL THEN
            UPDATE location_resolution_run
            SET run_end = NOW(),
                run_result = 'FAIL',
                meta = jsonb_build_object(
                    'error', SQLERRM,
                    'candidate_count', v_candidate_count,
                    'matched_count', v_matched_count
                )
            WHERE resolution_run_id = v_resolution_run_id;
        END IF;
        RAISE;
END
$$;

COMMIT;

-- SELECT *
-- FROM location_resolution_run
-- ORDER BY resolution_run_id DESC
-- LIMIT 10;
