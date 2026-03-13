-- INITIALISE canonical value tables
BEGIN;
DROP TABLE IF EXISTS public.canonical_direction_suffix;
DROP TABLE IF EXISTS public.canonical_street_type;
DROP TABLE IF EXISTS public.street_type_key_type;
-- street_type_key_type
create table public.street_type_key_type
(
    key_type_id   text                     not null,
    created_at    timestamp with time zone not null default now(),
    updated_at    timestamp with time zone null,
    display_value text                     null,
    constraint street_type_key_type_pkey primary key (key_type_id)
) TABLESPACE pg_default;

INSERT INTO "public"."street_type_key_type" ("key_type_id", "created_at", "updated_at", "display_value")
VALUES ('ABBREVIATION', '2026-02-17 00:21:13.977314+00', null, 'Abbreviation'),
       ('CANONICAL', '2026-02-17 00:20:44.788496+00', null, 'Canonical'),
       ('VARIANT', '2026-02-17 00:21:41.405656+00', null, 'Variant');

-- canonical_street_type
create table public.canonical_street_type
(
    street_type_key text                     not null,
    created_at      timestamp with time zone not null default now(),
    updated_at      timestamp with time zone null,
    key_type        text                     not null,
    canonical_key   text                     not null,
    constraint canonical_street_type_pkey primary key (street_type_key),
    constraint unique_street_type_key_canonical_key unique (street_type_key, canonical_key),
    constraint canonical_street_type_canonical_key_fkey foreign KEY (canonical_key) references canonical_street_type (street_type_key) on update CASCADE on delete RESTRICT,
    constraint canonical_street_type_key_type_fkey foreign KEY (key_type) references street_type_key_type (key_type_id) on update CASCADE on delete RESTRICT,
    constraint street_type_canonical_integrity_chk check (
        (
            (
                (key_type = 'CANONICAL'::text)
                    and (canonical_key = street_type_key)
                )
                or (
                (key_type <> 'CANONICAL'::text)
                    and (canonical_key <> street_type_key)
                )
            )
        )
) TABLESPACE pg_default;

create index IF not exists canonical_street_type_srteet_type_key_canonical_key_idx on public.canonical_street_type using btree (street_type_key, canonical_key) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS canonical_street_type_street_type_key_idx ON canonical_street_type (street_type_key);

INSERT INTO "public"."canonical_street_type" ("street_type_key", "created_at", "updated_at", "key_type",
                                              "canonical_key")
VALUES ('ACCESS', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'ACCESS'),
       ('ACCS', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'ACCESS'),
       ('ALLEY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'ALLEY'),
       ('ALLEYWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'ALLEYWAY'),
       ('ALLY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'ALLEY'),
       ('ALWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'ALLEYWAY'),
       ('AMBL', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'AMBLE'),
       ('AMBLE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'AMBLE'),
       ('ANCG', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'ANCHORAGE'),
       ('ANCHORAGE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'ANCHORAGE'),
       ('APP', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'APPROACH'),
       ('APPROACH', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'APPROACH'),
       ('ARC', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'ARCADE'),
       ('ARCADE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'ARCADE'),
       ('ART', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'ARTERY'),
       ('ARTERY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'ARTERY'),
       ('AVE', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'AVENUE'),
       ('AVENUE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'AVENUE'),
       ('BASIN', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'BASIN'),
       ('BASN', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'BASIN'),
       ('BCH', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'BEACH'),
       ('BDGE', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'BRIDGE'),
       ('BDWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'BROADWAY'),
       ('BEACH', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'BEACH'),
       ('BEND', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'BEND'),
       ('BLK', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'BLOCK'),
       ('BLOCK', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'BLOCK'),
       ('BOULEVARD', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'BOULEVARD'),
       ('BRACE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'BRACE'),
       ('BRAE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'BRAE'),
       ('BRCE', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'BRACE'),
       ('BREAK', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'BREAK'),
       ('BRIDGE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'BRIDGE'),
       ('BRK', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'BREAK'),
       ('BROADWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'BROADWAY'),
       ('BROW', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'BROW'),
       ('BVD', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'BOULEVARD'),
       ('BYPA', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'BYPASS'),
       ('BYPASS', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'BYPASS'),
       ('BYWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'BYWAY'),
       ('BYWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'BYWAY'),
       ('CAUS', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'CAUSEWAY'),
       ('CAUSEWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'CAUSEWAY'),
       ('CCT', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'CIRCUIT'),
       ('CDS', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'CUL-DE-SAC'),
       ('CENTRE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'CENTRE'),
       ('CENTREWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'CENTREWAY'),
       ('CH', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'CHASE'),
       ('CHASE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'CHASE'),
       ('CIR', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'CIRCLE'),
       ('CIRCLE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'CIRCLE'),
       ('CIRCLET', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'CIRCLET'),
       ('CIRCUIT', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'CIRCUIT'),
       ('CIRCUS', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'CIRCUS'),
       ('CL', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'CLOSE'),
       ('CLDE', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'COLONNADE'),
       ('CLOSE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'CLOSE'),
       ('CLT', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'CIRCLET'),
       ('CMMN', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'COMMON'),
       ('CNR', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'CORNER'),
       ('CNWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'CENTREWAY'),
       ('COLONNADE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'COLONNADE'),
       ('COMMON', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'COMMON'),
       ('CON', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'CONCOURSE'),
       ('CONCOURSE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'CONCOURSE'),
       ('COPSE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'COPSE'),
       ('CORNER', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'CORNER'),
       ('CORSO', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'CORSO'),
       ('COURT', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'COURT'),
       ('COURTYARD', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'COURTYARD'),
       ('COVE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'COVE'),
       ('COWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'CROSSWAY'),
       ('CPS', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'COPSE'),
       ('CRCS', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'CIRCUS'),
       ('CRD', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'CROSSROAD'),
       ('CRES', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'CRESCENT'),
       ('CRESCENT', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'CRESCENT'),
       ('CREST', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'CREST'),
       ('CROSS', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'CROSS'),
       ('CROSSING', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'CROSSING'),
       ('CROSSROAD', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'CROSSROAD'),
       ('CROSSWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'CROSSWAY'),
       ('CRSG', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'CROSSING'),
       ('CRSS', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'CROSS'),
       ('CRST', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'CREST'),
       ('CRUISEWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'CRUISEWAY'),
       ('CSO', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'CORSO'),
       ('CT', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'COURT'),
       ('CTR', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'CENTRE'),
       ('CTTG', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'CUTTING'),
       ('CTYD', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'COURTYARD'),
       ('CUL-DE-SAC', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'CUL-DE-SAC'),
       ('CUTTING', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'CUTTING'),
       ('CUWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'CRUISEWAY'),
       ('DALE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'DALE'),
       ('DELL', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'DELL'),
       ('DEVIATION', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'DEVIATION'),
       ('DEVN', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'DEVIATION'),
       ('DIP', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'DIP'),
       ('DISTRIBUTOR', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'DISTRIBUTOR'),
       ('DR', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'DRIVE'),
       ('DRIVE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'DRIVE'),
       ('DRIVEWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'DRIVEWAY'),
       ('DRWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'DRIVEWAY'),
       ('DSTR', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'DISTRIBUTOR'),
       ('EDGE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'EDGE'),
       ('ELB', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'ELBOW'),
       ('ELBOW', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'ELBOW'),
       ('END', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'END'),
       ('ENT', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'ENTRANCE'),
       ('ENTRANCE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'ENTRANCE'),
       ('ESP', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'ESPLANADE'),
       ('ESPLANADE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'ESPLANADE'),
       ('EST', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'ESTATE'),
       ('ESTATE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'ESTATE'),
       ('EXP', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'EXPRESSWAY'),
       ('EXPRESSWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'EXPRESSWAY'),
       ('EXTENSION', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'EXTENSION'),
       ('EXTN', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'EXTENSION'),
       ('FAIRWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'FAIRWAY'),
       ('FAWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'FAIRWAY'),
       ('FIRE', '2026-02-17 02:22:30.141692+00', null, 'VARIANT', 'FIRE TRACK'),
       ('FIRE TRACK', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'FIRE TRACK'),
       ('FIRETRAIL', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'FIRETRAIL'),
       ('FITR', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'FIRETRAIL'),
       ('FLAT', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'FLAT'),
       ('FOLLOW', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'FOLLOW'),
       ('FOLW', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'FOLLOW'),
       ('FOOTWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'FOOTWAY'),
       ('FORESHORE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'FORESHORE'),
       ('FORM', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'FORMATION'),
       ('FORMATION', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'FORMATION'),
       ('FREEWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'FREEWAY'),
       ('FRNT', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'FRONT'),
       ('FRONT', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'FRONT'),
       ('FRONTAGE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'FRONTAGE'),
       ('FRTG', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'FRONTAGE'),
       ('FSHR', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'FORESHORE'),
       ('FTRK', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'FIRE TRACK'),
       ('FTWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'FOOTWAY'),
       ('FWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'FREEWAY'),
       ('GAP', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'GAP'),
       ('GARDEN', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'GARDEN'),
       ('GARDENS', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'GARDENS'),
       ('GATE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'GATE'),
       ('GATES', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'GATES'),
       ('GDN', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'GARDEN'),
       ('GDNS', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'GARDENS'),
       ('GLADE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'GLADE'),
       ('GLD', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'GLADE'),
       ('GLEN', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'GLEN'),
       ('GLY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'GULLY'),
       ('GR', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'GROVE'),
       ('GRA', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'GRANGE'),
       ('GRANGE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'GRANGE'),
       ('GREEN', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'GREEN'),
       ('GRN', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'GREEN'),
       ('GRND', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'GROUND'),
       ('GROUND', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'GROUND'),
       ('GROVE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'GROVE'),
       ('GTE', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'GATE'),
       ('GTES', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'GATES'),
       ('GULLY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'GULLY'),
       ('HEIGHTS', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'HEIGHTS'),
       ('HIGHROAD', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'HIGHROAD'),
       ('HIGHWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'HIGHWAY'),
       ('HILL', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'HILL'),
       ('HRD', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'HIGHROAD'),
       ('HTS', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'HEIGHTS'),
       ('HWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'HIGHWAY'),
       ('INTERCHANGE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'INTERCHANGE'),
       ('INTERSECTION', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'INTERSECTION'),
       ('INTG', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'INTERCHANGE'),
       ('INTN', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'INTERSECTION'),
       ('JNC', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'JUNCTION'),
       ('JUNCTION', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'JUNCTION'),
       ('KEY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'KEY'),
       ('LANDING', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'LANDING'),
       ('LANE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'LANE'),
       ('LANEWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'LANEWAY'),
       ('LDG', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'LANDING'),
       ('LEES', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'LEES'),
       ('LINE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'LINE'),
       ('LINK', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'LINK'),
       ('LITTLE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'LITTLE'),
       ('LKT', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'LOOKOUT'),
       ('LNWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'LANEWAY'),
       ('LOOKOUT', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'LOOKOUT'),
       ('LOOP', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'LOOP'),
       ('LOWER', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'LOWER'),
       ('LT', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'LITTLE'),
       ('LWR', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'LOWER'),
       ('MALL', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'MALL'),
       ('MEANDER', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'MEANDER'),
       ('MEW', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'MEW'),
       ('MEWS', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'MEWS'),
       ('MNDR', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'MEANDER'),
       ('MOTORWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'MOTORWAY'),
       ('MOUNT', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'MOUNT'),
       ('MT', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'MOUNT'),
       ('MWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'MOTORWAY'),
       ('NOOK', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'NOOK'),
       ('OTLK', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'OUTLOOK'),
       ('OUTLOOK', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'OUTLOOK'),
       ('PARADE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'PARADE'),
       ('PARK', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'PARK'),
       ('PARKLANDS', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'PARKLANDS'),
       ('PARKWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'PARKWAY'),
       ('PART', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'PART'),
       ('PASS', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'PASS'),
       ('PASSAGE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'PASSAGE'),
       ('PATH', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'PATH'),
       ('PATHWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'PATHWAY'),
       ('PDE', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'PARADE'),
       ('PHWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'PATHWAY'),
       ('PIAZ', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'PIAZZA'),
       ('PIAZZA', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'PIAZZA'),
       ('PKLD', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'PARKLANDS'),
       ('PKT', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'POCKET'),
       ('PKWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'PARKWAY'),
       ('PL', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'PLACE'),
       ('PLACE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'PLACE'),
       ('PLAT', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'PLATEAU'),
       ('PLATEAU', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'PLATEAU'),
       ('PLAZA', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'PLAZA'),
       ('PLZA', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'PLAZA'),
       ('PNT', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'POINT'),
       ('POCKET', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'POCKET'),
       ('POINT', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'POINT'),
       ('PORT', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'PORT'),
       ('PROM', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'PROMENADE'),
       ('PROMENADE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'PROMENADE'),
       ('PSGE', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'PASSAGE'),
       ('QDGL', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'QUADRANGLE'),
       ('QDRT', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'QUADRANT'),
       ('QUAD', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'QUAD'),
       ('QUADRANGLE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'QUADRANGLE'),
       ('QUADRANT', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'QUADRANT'),
       ('QUAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'QUAY'),
       ('QUAYS', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'QUAYS'),
       ('QY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'QUAY'),
       ('QYS', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'QUAYS'),
       ('RAMBLE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'RAMBLE'),
       ('RAMP', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'RAMP'),
       ('RANGE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'RANGE'),
       ('RCH', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'REACH'),
       ('RD', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'ROAD'),
       ('RDGE', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'RIDGE'),
       ('RDS', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'ROADS'),
       ('RDSD', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'ROADSIDE'),
       ('RDWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'ROADWAY'),
       ('REACH', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'REACH'),
       ('RES', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'RESERVE'),
       ('RESERVE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'RESERVE'),
       ('REST', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'REST'),
       ('RETREAT', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'RETREAT'),
       ('RGWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'RIDGEWAY'),
       ('RIDE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'RIDE'),
       ('RIDGE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'RIDGE'),
       ('RIDGEWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'RIDGEWAY'),
       ('RIGHT', '2026-02-17 02:22:30.141692+00', null, 'VARIANT', 'RIGHT OF WAY'),
       ('RIGHT OF WAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'RIGHT OF WAY'),
       ('RING', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'RING'),
       ('RISE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'RISE'),
       ('RIVER', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'RIVER'),
       ('RIVERWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'RIVERWAY'),
       ('RIVIERA', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'RIVIERA'),
       ('RMBL', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'RAMBLE'),
       ('RND', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'ROUND'),
       ('RNDE', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'RONDE'),
       ('RNGE', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'RANGE'),
       ('ROAD', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'ROAD'),
       ('ROADS', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'ROADS'),
       ('ROADSIDE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'ROADSIDE'),
       ('ROADWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'ROADWAY'),
       ('RONDE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'RONDE'),
       ('ROSEBOWL', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'ROSEBOWL'),
       ('ROTARY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'ROTARY'),
       ('ROUND', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'ROUND'),
       ('ROUTE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'ROUTE'),
       ('ROW', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'ROW'),
       ('ROWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'RIGHT OF WAY'),
       ('RSBL', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'ROSEBOWL'),
       ('RTE', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'ROUTE'),
       ('RTT', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'RETREAT'),
       ('RTY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'ROTARY'),
       ('RUE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'RUE'),
       ('RUN', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'RUN'),
       ('RVR', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'RIVER'),
       ('RVRA', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'RIVIERA'),
       ('RVWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'RIVERWAY'),
       ('SBWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'SUBWAY'),
       ('SDNG', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'SIDING'),
       ('SERVICE', '2026-02-17 02:22:30.141692+00', null, 'VARIANT', 'SERVICE WAY'),
       ('SERVICE WAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'SERVICE WAY'),
       ('SHWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'STATE HIGHWAY'),
       ('SIDING', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'SIDING'),
       ('SLOPE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'SLOPE'),
       ('SLPE', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'SLOPE'),
       ('SND', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'SOUND'),
       ('SOUND', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'SOUND'),
       ('SPUR', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'SPUR'),
       ('SQ', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'SQUARE'),
       ('SQUARE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'SQUARE'),
       ('ST', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'STREET'),
       ('STAIRS', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'STAIRS'),
       ('STATE', '2026-02-17 02:22:30.141692+00', null, 'VARIANT', 'STATE HIGHWAY'),
       ('STATE HIGHWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'STATE HIGHWAY'),
       ('STEPS', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'STEPS'),
       ('STPS', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'STEPS'),
       ('STRA', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'STRAND'),
       ('STRAND', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'STRAND'),
       ('STREET', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'STREET'),
       ('STRIP', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'STRIP'),
       ('STRP', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'STRIP'),
       ('STRS', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'STAIRS'),
       ('SUBWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'SUBWAY'),
       ('SWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'SERVICE WAY'),
       ('TARN', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'TARN'),
       ('TCE', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'TERRACE'),
       ('TERRACE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'TERRACE'),
       ('THOR', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'THOROUGHFARE'),
       ('THOROUGHFARE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'THOROUGHFARE'),
       ('TKWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'TRUNKWAY'),
       ('TLWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'TOLLWAY'),
       ('TOLLWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'TOLLWAY'),
       ('TOP', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'TOP'),
       ('TOR', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'TOR'),
       ('TOWERS', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'TOWERS'),
       ('TRACK', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'TRACK'),
       ('TRAIL', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'TRAIL'),
       ('TRAILER', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'TRAILER'),
       ('TRI', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'TRIANGLE'),
       ('TRIANGLE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'TRIANGLE'),
       ('TRK', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'TRACK'),
       ('TRL', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'TRAIL'),
       ('TRLR', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'TRAILER'),
       ('TRUNKWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'TRUNKWAY'),
       ('TURN', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'TURN'),
       ('TWRS', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'TOWERS'),
       ('UNDERPASS', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'UNDERPASS'),
       ('UPAS', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'UNDERPASS'),
       ('UPPER', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'UPPER'),
       ('UPR', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'UPPER'),
       ('VALE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'VALE'),
       ('VDCT', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'VIADUCT'),
       ('VIADUCT', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'VIADUCT'),
       ('VIEW', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'VIEW'),
       ('VILLAS', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'VILLAS'),
       ('VISTA', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'VISTA'),
       ('VLLS', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'VILLAS'),
       ('VSTA', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'VISTA'),
       ('WADE', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'WADE'),
       ('WALK', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'WALK'),
       ('WALKWAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'WALKWAY'),
       ('WAY', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'WAY'),
       ('WHARF', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'WHARF'),
       ('WHRF', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'WHARF'),
       ('WKWY', '2026-02-17 02:22:30.141692+00', null, 'ABBREVIATION', 'WALKWAY'),
       ('WYND', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'WYND'),
       ('YARD', '2026-02-17 02:22:30.141692+00', null, 'CANONICAL', 'YARD');

-- canonical_direction_suffix
create table public.canonical_direction_suffix
(
    direction_suffix_norm text                     not null,
    created_at            timestamp with time zone not null default now(),
    updated_at            timestamp with time zone null,
    key_type              text                     not null,
    canonical_direction   text                     not null,
    constraint canonical_direction_suffix_pkey primary key (direction_suffix_norm),
    constraint canonical_direction_suffix_canonical_direction_fkey foreign KEY (canonical_direction) references canonical_direction_suffix (direction_suffix_norm) on update CASCADE on delete RESTRICT,
    constraint canonical_direction_suffix_key_type_fkey foreign KEY (key_type) references street_type_key_type (key_type_id) on update CASCADE on delete RESTRICT
) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS canonical_direction_suffix_direction_suffix_norm_idx ON canonical_direction_suffix (direction_suffix_norm);

INSERT INTO "public"."canonical_direction_suffix" ("direction_suffix_norm", "created_at", "updated_at", "key_type",
                                                   "canonical_direction")
VALUES ('E', '2026-02-19 12:21:47.806743+00', null, 'ABBREVIATION', 'EAST'),
       ('EAST', '2026-02-19 12:21:47.806743+00', null, 'CANONICAL', 'EAST'),
       ('N', '2026-02-19 12:21:47.806743+00', null, 'ABBREVIATION', 'NORTH'),
       ('NE', '2026-02-19 12:21:47.806743+00', null, 'ABBREVIATION', 'NORTHEAST'),
       ('NORTH', '2026-02-19 12:21:47.806743+00', null, 'CANONICAL', 'NORTH'),
       ('NORTH EAST', '2026-02-19 12:21:47.806743+00', null, 'VARIANT', 'NORTHEAST'),
       ('NORTH WEST', '2026-02-19 12:21:47.806743+00', null, 'VARIANT', 'NORTHWEST'),
       ('NORTHEAST', '2026-02-19 12:21:47.806743+00', null, 'CANONICAL', 'NORTHEAST'),
       ('NORTHWEST', '2026-02-19 12:21:47.806743+00', null, 'CANONICAL', 'NORTHWEST'),
       ('NW', '2026-02-19 12:21:47.806743+00', null, 'ABBREVIATION', 'NORTHWEST'),
       ('S', '2026-02-19 12:21:47.806743+00', null, 'ABBREVIATION', 'SOUTH'),
       ('SE', '2026-02-19 12:21:47.806743+00', null, 'ABBREVIATION', 'SOUTHEAST'),
       ('SOUTH', '2026-02-19 12:21:47.806743+00', null, 'CANONICAL', 'SOUTH'),
       ('SOUTH EAST', '2026-02-19 12:21:47.806743+00', null, 'VARIANT', 'SOUTHEAST'),
       ('SOUTH WEST', '2026-02-19 12:21:47.806743+00', null, 'VARIANT', 'SOUTHWEST'),
       ('SOUTHEAST', '2026-02-19 12:21:47.806743+00', null, 'CANONICAL', 'SOUTHEAST'),
       ('SOUTHWEST', '2026-02-19 12:21:47.806743+00', null, 'CANONICAL', 'SOUTHWEST'),
       ('SW', '2026-02-19 12:21:47.806743+00', null, 'ABBREVIATION', 'SOUTHWEST'),
       ('W', '2026-02-19 12:21:47.806743+00', null, 'ABBREVIATION', 'WEST'),
       ('WEST', '2026-02-19 12:21:47.806743+00', null, 'CANONICAL', 'WEST');

COMMIT;

-- Create helper functions
BEGIN;
CREATE OR REPLACE FUNCTION normalise_token(raw_val TEXT)
    RETURNS TEXT
    LANGUAGE sql
    IMMUTABLE
AS
$$
SELECT CASE
           WHEN $1 IS NULL THEN NULL
           ELSE REGEXP_REPLACE(UPPER(raw_val), '-|\.|\s', '', 'g')
           END;
$$;
COMMIT;

-- RUN CANONISATION JOB
BEGIN;
-- Increase memory for session
-- SET work_mem = '512MB';

-- suburbs
DROP TABLE IF EXISTS suburbs;
CREATE TABLE suburbs AS
SELECT osm_id,
       name,
       upper(name)                    AS name_norm,
       admin_level,
       place,
       ST_UnaryUnion(ST_Collect(way)) AS geom
FROM planet_osm_polygon
WHERE name IS NOT NULL
  AND (place = 'suburb'
    OR (boundary = 'administrative' AND admin_level IN ('8', '9', '10'))
    )
GROUP BY osm_id,
         name,
         name_norm,
         admin_level,
         place;

-- canonised streets
DROP TABLE IF EXISTS streets_canon;

CREATE TABLE streets_canon AS
WITH tokenised AS MATERIALIZED (SELECT s_norm.osm_id,
                                       s_norm.name_norm,
                                       string_to_array(s_norm.name_norm, ' ') AS tokens
                                -- Filter highway & normalise OSM street names first
                                FROM (SELECT osm_id,
                                             regexp_replace(UPPER(name), '\s+', ' ', 'g') AS name_norm
                                      FROM planet_osm_line
                                      WHERE name IS NOT NULL
                                        AND highway IS NOT NULL
                                        AND (
                                          highway NOT IN ('footway', 'path', 'track', 'cycleway',
                                                          'steps', 'pedestrian', 'elevator', 'ladder',
                                                          'motorway_link')
                                          )) s_norm),

     parsed AS MATERIALIZED (SELECT t.*,
                                    array_length(tokens, 1)                              AS token_count,

                                    -- Safe token access
                                    normalise_token(tokens[array_length(tokens, 1)])     AS last_token,
                                    normalise_token(tokens[array_length(tokens, 1) - 1]) AS second_last_token,
                                    normalise_token(tokens[array_length(tokens, 1) - 2]) AS third_last_token,

                                    -- Placeholder: merged_direction, in case direction is last 2 tokens "NORTH EAST"
                                    normalise_token(
                                            tokens[array_length(tokens, 1) - 1] ||
                                            tokens[array_length(tokens, 1)]
                                    )                                                    AS merged_direction
                             FROM tokenised t),

     direction_resolved AS (SELECT p.*,
                                   -- detect direction (prefer merged)
                                   ds_merged.canonical_direction AS merged_direction_canon,
                                   ds_single.canonical_direction AS single_direction_canon,
                                   CASE
                                       -- TRACK how many tokens are used for direction suffix
                                       WHEN ds_merged.canonical_direction IS NOT NULL THEN 2
                                       WHEN ds_single.canonical_direction IS NOT NULL THEN 1
                                       ELSE 0
                                       END                       AS direction_token_count

                            FROM parsed p
                                     -- Get the canonical direction for the direction tokens
                                     LEFT JOIN canonical_direction_suffix ds_merged
                                               ON ds_merged.direction_suffix_norm = p.merged_direction
                                     LEFT JOIN canonical_direction_suffix ds_single
                                               ON ds_single.direction_suffix_norm = p.last_token),

     -- Step 2: resolve the street type
     type_resolved AS (SELECT d.*,
                              st.canonical_key AS type_canon,

                              -- TRACK how many tokens are used for direction suffix
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
                                -- Check the street type token based on the direction_token_count
                                LEFT JOIN canonical_street_type st
                                          ON st.street_type_key =
                                             CASE
                                                 WHEN d.direction_token_count = 2 THEN d.third_last_token
                                                 WHEN d.direction_token_count = 1 THEN d.second_last_token
                                                 ELSE d.last_token
                                                 END),

     -- Sum the token count
     finalised AS (SELECT *, (direction_token_count + type_token_count) AS tokens_consumed_from_end
                   FROM type_resolved)
-- STEP 3: SELECT and define the required fields
SELECT osm_id,
       l.name,
       -- l.name_norm,

       -- Full canonical
       CONCAT_WS(
               ' ', CASE
                        WHEN token_count > tokens_consumed_from_end
                            THEN array_to_string(
                                tokens[1:token_count - tokens_consumed_from_end], ' '
                                 )
                        ELSE NULL
           END, type_canon, COALESCE(
                       merged_direction_canon, single_direction_canon
                            )
       )          AS street_full_canon,

       -- Street name canonical
       CASE
           WHEN token_count > tokens_consumed_from_end
               THEN array_to_string(
                   tokens[1:token_count - tokens_consumed_from_end], ' '
                    )
           ELSE NULL
           END    AS street_name_canon,
       -- Street type canonical
       type_canon AS street_type_canon,
       -- Street direction canonical
       COALESCE(
               merged_direction_canon, single_direction_canon
       )          AS direction_suffix_canon,
       l.highway,
       l.way      AS geom
FROM finalised
         JOIN planet_osm_line l USING (osm_id);

-- CREATE indexes for spatial queries
DROP INDEX IF EXISTS idx_streets_geom;
CREATE INDEX idx_streets_geom
    ON streets_canon
        USING GIST (geom);

DROP INDEX IF EXISTS idx_suburbs_geom;
CREATE INDEX idx_suburbs_geom
    ON suburbs
        USING GIST (geom);

DROP INDEX IF EXISTS idx_streets_canon_fullname;
CREATE INDEX idx_streets_canon_full_name
    ON streets_canon (street_full_canon);

DROP INDEX IF EXISTS idx_suburb_name_norm;
CREATE INDEX idx_suburb_name_norm
    ON suburbs (name_norm);

COMMIT;


/*
CREATE streets_by_suburb_temp
*/
BEGIN;
DROP TABLE IF EXISTS streets_by_suburb_temp;
CREATE TABLE streets_by_suburb_temp AS
SELECT s.street_full_canon as street_canon,
       sub.name_norm as suburb_name,
       sub.osm_id          AS suburb_osm_id,
       array_agg(s.osm_id) AS street_osm_ids,
       -- Street geometries merged -> IF they are within the suburb AND have the same street_full_canon
       ST_LineMerge(
               ST_UnaryUnion(
                       ST_Collect(
                               CASE
                                   WHEN ST_Within(s.geom, sub.geom)
                                       THEN s.geom
                                   ELSE ST_Intersection(s.geom, sub.geom)
                                   END
                       )
               )
       )                   AS street_geom
-- Find streets that intersect with a suburb
FROM streets_canon s
         JOIN suburbs sub
              ON s.geom && sub.geom
                  AND ST_Intersects(s.geom, sub.geom)
GROUP BY s.street_full_canon,
         sub.name_norm,
         sub.osm_id;

ALTER TABLE streets_by_suburb_temp
    ADD CONSTRAINT uq_street_suburb_temp UNIQUE (street_canon, suburb_osm_id);

-- INDEX USED for location resolution pipeline
DROP INDEX IF EXISTS streets_by_suburb_temp_lookup;
CREATE INDEX streets_by_suburb_temp_lookup
    ON streets_by_suburb_temp (street_canon, suburb_name);
COMMIT;

-- SELECT pg_size_pretty(pg_database_size(current_database()));

-- SELECT * FROM streets_canon LIMIT 10000;
-- SELECT count(*) FROM streets_canon;

-- SELECT * FROM streets_canon WHERE direction_suffix IS NOT NULL LIMIT 10000;
-- SELECT * FROM suburbs LIMIT 10000;
-- SELECT COUNT(*) FROM suburbs;
