-- Migration to create imported_files table to track which CSV files have been processed
-- This allows skipping already imported files in subsequent runs

CREATE TABLE IF NOT EXISTS imported_files (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) UNIQUE NOT NULL,
  file_hash VARCHAR(64), -- Optional: for future proofing
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups by filename
CREATE INDEX IF NOT EXISTS idx_imported_files_filename ON imported_files(filename);
