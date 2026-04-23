DROP FUNCTION IF EXISTS canonise_camera_locations();

CREATE OR REPLACE FUNCTION canonise_camera_locations()
    RETURNS canonisation_run
    LANGUAGE plpgsql
AS
$$
DECLARE
    v_run               canonisation_run%ROWTYPE;
    v_updated_count     INTEGER := 0;
    v_to_canonise_count INTEGER := 0;
BEGIN
    -- Step 1: create the canonisation_run row so this execution is tracked from the start.
    INSERT INTO canonisation_run (run_start,
                                  run_result)
    VALUES (NOW(),
            'PENDING')
    RETURNING *
        INTO v_run;

    -- Step 2: canonise all camera locations that do not yet have canonical street values.
    -- Creating candidate table
    CREATE TEMP TABLE tmp_canonise_candidates
    ON COMMIT DROP AS
    SELECT id,
           street_norm,
           string_to_array(street_norm, ' ') AS tokens
    FROM mobile_speed_camera_location
    WHERE street_full_canon IS NULL;

    -- Count candidates to canonise
    SELECT COUNT(*)
    INTO v_to_canonise_count
    FROM tmp_canonise_candidates;

    UPDATE mobile_speed_camera_location loc
    SET street_full_canon      = q.street_full_canon,
        street_name_canon      = q.street_name_canon,
        street_type_canon      = q.street_type_canon,
        direction_suffix_canon = q.direction_suffix_canon
    FROM (
             -- Step 2.1: split the normalised street text into tokens.
             -- Benchmarked with EXPLAIN ANALYZE on this canonisation workload:
             -- median execution time was 8.577 ms with MATERIALIZED vs 14.057 ms without.
             WITH tokenised AS MATERIALIZED (SELECT *
                                             FROM tmp_canonise_candidates),
                  -- Step 2.2: derive token positions needed for street type and direction matching.
                  parsed AS MATERIALIZED (SELECT t.*,
                                                 array_length(t.tokens, 1)                              AS token_count,
                                                 normalise_token(t.tokens[array_length(t.tokens, 1)])     AS last_token,
                                                 normalise_token(t.tokens[array_length(t.tokens, 1) - 1]) AS second_last_token,
                                                 normalise_token(t.tokens[array_length(t.tokens, 1) - 2]) AS third_last_token,
                                                 normalise_token(
                                                         t.tokens[array_length(t.tokens, 1) - 1] ||
                                                         t.tokens[array_length(t.tokens, 1)]
                                                 )                                                    AS merged_direction
                                          FROM tokenised t),
                  -- Step 2.3: resolve any trailing direction suffix, preferring two-token forms.
                  direction_resolved AS (SELECT p.*,
                                                ds_merged.canonical_direction AS merged_direction_canon,
                                                ds_single.canonical_direction AS single_direction_canon,
                                                CASE
                                                    WHEN ds_merged.canonical_direction IS NOT NULL THEN 2
                                                    WHEN ds_single.canonical_direction IS NOT NULL THEN 1
                                                    ELSE 0
                                                    END                       AS direction_token_count
                                         FROM parsed p
                                                  LEFT JOIN canonical_direction_suffix ds_merged
                                                            ON ds_merged.direction_suffix_norm = p.merged_direction
                                                  LEFT JOIN canonical_direction_suffix ds_single
                                                            ON ds_single.direction_suffix_norm = p.last_token),
                  -- Step 2.4: resolve the street type based on the remaining trailing token.
                  type_resolved AS (SELECT d.*,
                                           st.canonical_key AS type_canon,
                                           CASE
                                               WHEN d.direction_token_count = 2
                                                   AND st.street_type_key = d.third_last_token THEN 1
                                               WHEN d.direction_token_count = 1
                                                   AND st.street_type_key = d.second_last_token THEN 1
                                               WHEN d.direction_token_count = 0
                                                   AND st.street_type_key = d.last_token THEN 1
                                               ELSE 0
                                               END          AS type_token_count
                                    FROM direction_resolved d
                                             LEFT JOIN canonical_street_type st
                                                       ON st.street_type_key =
                                                          CASE
                                                              WHEN d.direction_token_count = 2 THEN d.third_last_token
                                                              WHEN d.direction_token_count = 1 THEN d.second_last_token
                                                              ELSE d.last_token
                                                              END),
                  -- Step 2.5: calculate how many tokens were consumed from the end of the string.
                  finalised AS (SELECT *,
                                       (direction_token_count + type_token_count) AS tokens_consumed_from_end
                                FROM type_resolved)
             -- Step 2.6: assemble the final canonical street values to write back to the source rows.
             SELECT id,
                    CONCAT_WS(
                            ' ',
                            CASE
                                WHEN token_count > tokens_consumed_from_end
                                    THEN array_to_string(tokens[1:token_count - tokens_consumed_from_end], ' ')
                                ELSE NULL
                                END,
                            type_canon,
                            COALESCE(merged_direction_canon, single_direction_canon)
                    )          AS street_full_canon,
                    CASE
                        WHEN token_count > tokens_consumed_from_end
                            THEN array_to_string(tokens[1:token_count - tokens_consumed_from_end], ' ')
                        ELSE NULL
                        END    AS street_name_canon,
                    type_canon AS street_type_canon,
                    COALESCE(merged_direction_canon, single_direction_canon)
                               AS direction_suffix_canon
             FROM finalised) q
    WHERE loc.id = q.id
      AND loc.street_full_canon IS NULL;

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;

    -- Step 3: mark the canonisation_run row as successful once the update completes.
    UPDATE canonisation_run
    SET run_end    = NOW(),
        run_result = 'SUCCESS',
        updated_at = NOW(),
        meta       = jsonb_build_object(
                'updated_count', v_updated_count,
                'to_canonise_count', v_to_canonise_count
                     )
    WHERE canonisation_run_id = v_run.canonisation_run_id
    RETURNING *
        INTO v_run;

    RAISE NOTICE 'canonise_camera_locations updated % rows in run %',
        v_updated_count,
        v_run.canonisation_run_id;

    RETURN v_run;

EXCEPTION
    WHEN OTHERS THEN
        -- Step 4: if anything fails, close out the run as FAIL before surfacing the error.
        IF v_run.canonisation_run_id IS NOT NULL THEN
            UPDATE canonisation_run
            SET run_end    = NOW(),
                run_result = 'FAIL',
                updated_at = NOW(),
                meta       = jsonb_build_object(
                        'error', SQLERRM,
                        'to_canonise_count', v_to_canonise_count
                             )
            WHERE canonisation_run_id = v_run.canonisation_run_id;
        END IF;

        RAISE;
END;
$$;

-- BEGIN;
-- SELECT * FROM canonise_camera_locations();
-- ROLLBACK;