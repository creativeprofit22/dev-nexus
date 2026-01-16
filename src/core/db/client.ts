import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync, existsSync } from "fs";
import { dirname, resolve } from "path";
import * as schema from "./schema";

// Ensure data directory exists
const dbPath = resolve(process.cwd(), "data/db.sqlite");
const dataDir = dirname(dbPath);

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Create SQLite connection
const sqlite = new Database(dbPath);

// Enable foreign keys
sqlite.pragma("foreign_keys = ON");

// Enable WAL mode for better concurrency
sqlite.pragma("journal_mode = WAL");

// Create Drizzle instance with schema
export const db = drizzle(sqlite, { schema });

// Export the raw sqlite instance for advanced operations
export { sqlite };

// Export types
export type Database = typeof db;
