import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

const sqliteDb = drizzle(new Database('sqlite.db'));

export default sqliteDb;
