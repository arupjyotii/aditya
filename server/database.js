import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
const dataDirectory = process.env.DATA_DIRECTORY || './data';

// Ensure data directory exists
if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
}

const sqliteDb = new Database(path.join(dataDirectory, 'database.sqlite'));

export const db = new Kysely({
    dialect: new SqliteDialect({
        database: sqliteDb,
    }),
});
