import { createDatabase, type Database as DB0Database } from "db0";
import sqliteConnector from "db0/connectors/better-sqlite3";
import { createStorage, type Storage } from "unstorage";
import db0Driver from "unstorage/drivers/db0";
import path from "path";
import fs from "fs";
import { config } from "./env.js";

// Resolve SQLite database path
const dbPath =
  config.databaseUrl.replace(/^file:/, "") || "./data/vouchers.db";

const absoluteDbPath = path.isAbsolute(dbPath)
  ? dbPath
  : path.resolve(process.cwd(), dbPath);

// Ensure data directory exists
const dataDir = path.dirname(absoluteDbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 1. Create db0 Database interface for SQLite
export const db: DB0Database = createDatabase(
  sqliteConnector({ path: absoluteDbPath })
);

// 2. Create unstorage instance backed by db0 SQL driver
export const storage: Storage = createStorage({
  driver: db0Driver({
    database: db,
    tableName: "unstorage_vouchers",
  }),
});

/** Connect & initialize SQLite database schema via db0 */
export async function connectDB(): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS vouchers (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      crew_name     TEXT NOT NULL,
      crew_id       TEXT NOT NULL,
      flight_number TEXT NOT NULL,
      flight_date   TEXT NOT NULL,
      aircraft_type TEXT NOT NULL,
      seat1         TEXT NOT NULL,
      seat2         TEXT NOT NULL,
      seat3         TEXT NOT NULL,
      created_at    TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS uq_vouchers_flight_date
      ON vouchers (flight_number, flight_date);
  `);

  console.log(`✅  db0 (SQLite) connected & schema migrated at ${absoluteDbPath}`);
}

/** Disconnect cleanly */
export async function disconnectDB(): Promise<void> {
  try {
    if (typeof db.dispose === "function") {
      await db.dispose();
    }
    console.log("🛑  db0 SQLite connection closed cleanly");
  } catch (err) {
    console.error("Error closing SQLite connection:", err);
  }
}
