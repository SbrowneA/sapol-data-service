\if :{?db_name}
\else
\echo 'Missing required variable: db_name'
\quit 1
\endif

-- WARNING BEFORE EXECUTING SCRIPT
\echo 'Warning: Any database named "' :db_name '" will DROPPED and recreated.'
\prompt 'Type YES to continue: ' confirm

SELECT UPPER(:'confirm') = 'YES' AS ok \gset

\if :ok
    \echo 'Continuing...'
\else
    \echo 'Cancelled.'
    \quit
\endif

-- CREATE DATABASE
SELECT format('DROP DATABASE IF EXISTS %I', :'db_name') AS sql \gexec
SELECT format('CREATE DATABASE %I', :'db_name') AS sql \gexec

-- connect to created DB
\c :db_name

-- Install required extensions
CREATE EXTENSION IF NOT EXISTS hstore;
CREATE EXTENSION IF NOT EXISTS postgis;

\echo 'database "' :db_name '" created successfully'
