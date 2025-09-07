import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import path from 'path';
const dataDirectory = process.env.DATA_DIRECTORY || './data';
const sqliteDb = new Database(path.join(dataDirectory, 'database.sqlite'));
export const db = new Kysely({
    dialect: new SqliteDialect({
        database: sqliteDb,
    }),
    log: ['query', 'error']
});
