export const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS places (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  visitlater INTEGER NOT NULL DEFAULT 0,
  liked INTEGER NOT NULL DEFAULT 0,
  latitude REAL,
  longitude REAL,
  photos TEXT NOT NULL DEFAULT '[]',
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  startDate TEXT,
  endDate TEXT,
  createdAt TEXT NOT NULL,
  current INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS trip_places (
  id TEXT PRIMARY KEY NOT NULL,
  tripId TEXT NOT NULL,
  placeId TEXT NOT NULL,
  orderIndex INTEGER NOT NULL,
  visited INTEGER NOT NULL DEFAULT 0,
  visitDate TEXT,
  notes TEXT NOT NULL DEFAULT '',
  photos TEXT NOT NULL DEFAULT '[]',
  FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (placeId) REFERENCES places(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_trip_places_tripId ON trip_places(tripId);
CREATE INDEX IF NOT EXISTS idx_trip_places_order ON trip_places(tripId, orderIndex);
CREATE INDEX IF NOT EXISTS idx_trips_current ON trips(current);
`;
