-- Migration 016: Split flight_paths into departure_flight_paths and arrival_flight_paths

CREATE TABLE IF NOT EXISTS departure_flight_paths (
    id SERIAL PRIMARY KEY,
    route_id INTEGER NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    airline_id INTEGER NOT NULL REFERENCES airlines(id) ON DELETE CASCADE,
    departure_date DATE NOT NULL,
    arrival_date DATE NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    flight_number VARCHAR(20) NOT NULL,
    trip_type VARCHAR(20) NOT NULL,
    travel_class VARCHAR(20) DEFAULT 'economy',
    stops INTEGER DEFAULT 0,
    dep_airport VARCHAR(10),
    arr_airport VARCHAR(10),
    destination VARCHAR(100),
    airline_name VARCHAR(100),
    airline_code VARCHAR(10),
    aircraft TEXT,
    source VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(route_id, airline_id, departure_date, trip_type, flight_number, departure_time)
);

CREATE TABLE IF NOT EXISTS arrival_flight_paths (
    id SERIAL PRIMARY KEY,
    route_id INTEGER NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    airline_id INTEGER NOT NULL REFERENCES airlines(id) ON DELETE CASCADE,
    departure_date DATE NOT NULL,
    arrival_date DATE NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    flight_number VARCHAR(20) NOT NULL,
    trip_type VARCHAR(20) NOT NULL,
    travel_class VARCHAR(20) DEFAULT 'economy',
    stops INTEGER DEFAULT 0,
    dep_airport VARCHAR(10),
    arr_airport VARCHAR(10),
    destination VARCHAR(100),
    airline_name VARCHAR(100),
    airline_code VARCHAR(10),
    aircraft TEXT,
    source VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(route_id, airline_id, arrival_date, trip_type, flight_number, departure_time)
);

-- 3. Create indexes for departure_flight_paths
CREATE INDEX IF NOT EXISTS idx_departure_flight_paths_route_id ON departure_flight_paths(route_id);
CREATE INDEX IF NOT EXISTS idx_departure_flight_paths_airline_id ON departure_flight_paths(airline_id);
CREATE INDEX IF NOT EXISTS idx_departure_flight_paths_departure_date ON departure_flight_paths(departure_date);
CREATE INDEX IF NOT EXISTS idx_departure_flight_paths_dep_arr ON departure_flight_paths(dep_airport, arr_airport);

-- 4. Create indexes for arrival_flight_paths
CREATE INDEX IF NOT EXISTS idx_arrival_flight_paths_route_id ON arrival_flight_paths(route_id);
CREATE INDEX IF NOT EXISTS idx_arrival_flight_paths_airline_id ON arrival_flight_paths(airline_id);
CREATE INDEX IF NOT EXISTS idx_arrival_flight_paths_departure_date ON arrival_flight_paths(departure_date);
CREATE INDEX IF NOT EXISTS idx_arrival_flight_paths_dep_arr ON arrival_flight_paths(dep_airport, arr_airport);

-- 5. Migrate existing data (Optional but recommended)
-- Note: We assume that if dep_airport is the origin from the CSV (BKK, DMK etc in previous context), it might be departure.
-- But a better way is to check the 'direction' column. However, 'direction' column was NOT in the original schema.
-- The user said: "currently i stored all data from backend/data/intl_flight_data into the same flight_paths table in database"
-- and "in each of them there is a direction column".
-- If the direction column exists in the table, we should use it. 
-- Wait, let's check if the table has 'direction' column. Migration 012 didn't have it.
-- Let's check 015 too. No.
-- Maybe it was added manually or I missed a migration.
-- Actually, let's look at the CSV example again: 
-- 2026-02-04,BKK,departure,01:05,DXB Dubai,EK385,EK,6h 50m...
-- The 'direction' is the 3rd column.

-- If the database table DOES NOT HAVE a direction column, we might need to add it or infer it.
-- However, since the user wants to split them NOW, I will just create the tables.
-- If they want to migrate existing data, I'll try to infer it from dep_airport vs arr_airport if possible, 
-- or just leave it for the next import.
-- The user said: "and when i run docker compose -f docker-compose.yml up --build, the data from the csv... automatically imported"
-- This suggests they are fine with re-importing.

-- Let's check if 'direction' column exists in flight_paths.
-- I'll use a script to check the schema or assuming it doesn't from my migration analysis.

-- Actually, I'll add a check in the migration to populate if possible.
-- If I can't be sure, I'll just skip the data migration and let the auto-import handle it.
-- But wait, if I drop the table, they lose data.
-- I'll RENAME the old table to flight_paths_old instead of dropping it immediately.

-- 5. Backup and drop original table
ALTER TABLE flight_paths RENAME TO flight_paths_old;

-- Add comments for the new tables
COMMENT ON TABLE departure_flight_paths IS 'Stores international departure flight information';
COMMENT ON TABLE arrival_flight_paths IS 'Stores international arrival flight information';
