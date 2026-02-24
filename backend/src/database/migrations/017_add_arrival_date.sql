-- Migration 017: Add arrival_date column to departure_flight_paths and arrival_flight_paths

-- 1. Add arrival_date to departure_flight_paths
ALTER TABLE departure_flight_paths ADD COLUMN IF NOT EXISTS arrival_date DATE;

-- 2. Add arrival_date to arrival_flight_paths
ALTER TABLE arrival_flight_paths ADD COLUMN IF NOT EXISTS arrival_date DATE;

-- 3. Populate arrival_date from arrival_time for existing records
UPDATE departure_flight_paths SET arrival_date = DATE(arrival_time) WHERE arrival_date IS NULL;
UPDATE arrival_flight_paths SET arrival_date = DATE(arrival_time) WHERE arrival_date IS NULL;

-- 4. Create indexes for arrival_date
CREATE INDEX IF NOT EXISTS idx_departure_flight_paths_arrival_date ON departure_flight_paths(arrival_date);
CREATE INDEX IF NOT EXISTS idx_arrival_flight_paths_arrival_date ON arrival_flight_paths(arrival_date);

-- Add comments
COMMENT ON COLUMN departure_flight_paths.arrival_date IS 'The date when the flight arrives';
COMMENT ON COLUMN arrival_flight_paths.arrival_date IS 'The date when the flight arrives';
