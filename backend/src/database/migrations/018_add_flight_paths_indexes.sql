-- Migration 018: Add performance-optimizing indexes to flight path tables

-- 1. Indexes for departure_flight_paths
-- Optimized for search queries: route, date, trip type, and travel class
CREATE INDEX IF NOT EXISTS idx_departure_flight_paths_search_composite 
ON departure_flight_paths(route_id, departure_date, trip_type, travel_class);

-- Optimized for airport-specific analysis (e.g., dashboard stats)
CREATE INDEX IF NOT EXISTS idx_departure_flight_paths_airport_date 
ON departure_flight_paths(dep_airport, departure_date);

-- Optimized for carrier-based filtering within a date range
CREATE INDEX IF NOT EXISTS idx_departure_flight_paths_date_airline 
ON departure_flight_paths(departure_date, airline_id);

-- 2. Indexes for arrival_flight_paths
-- Optimized for search queries: route, date, trip type, and travel class
CREATE INDEX IF NOT EXISTS idx_arrival_flight_paths_search_composite 
ON arrival_flight_paths(route_id, arrival_date, trip_type, travel_class);

-- Optimized for airport-specific analysis (e.g., dashboard stats)
CREATE INDEX IF NOT EXISTS idx_arrival_flight_paths_airport_date 
ON arrival_flight_paths(arr_airport, arrival_date);

-- Optimized for carrier-based filtering within a date range
CREATE INDEX IF NOT EXISTS idx_arrival_flight_paths_date_airline 
ON arrival_flight_paths(arrival_date, airline_id);

-- Add comments for documentation
COMMENT ON INDEX idx_departure_flight_paths_search_composite IS 'Optimizes flight search by route, date, trip type, and class';
COMMENT ON INDEX idx_arrival_flight_paths_search_composite IS 'Optimizes flight search by route, date, trip type, and class';
