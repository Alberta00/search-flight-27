-- Migration to add aircraft column to flight_paths table
ALTER TABLE flight_paths ADD COLUMN aircraft TEXT;
