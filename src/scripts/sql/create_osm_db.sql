-- WARNING BEFORE EXECUTING SCRIPT
\prompt 'Warning: If any database is named "osm" it will DROPPED and recreated. Type YES to continue: ' confirm

SELECT :'confirm' = 'YES' AS ok \gset

\if :ok
    \echo 'Continuing...'
\else
    \echo 'Cancelled.'
    \quit
\endif

-- CREATE DATABASE
DROP DATABASE IF EXISTS osm;
CREATE DATABASE osm;

-- connect to created DB
\c osm

-- Install required extensions
CREATE EXTENSION IF NOT EXISTS hstore;
CREATE EXTENSION IF NOT EXISTS postgis;

\echo 'osm table created'
