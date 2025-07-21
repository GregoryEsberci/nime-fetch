import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { DATABASE_PATH } from '@/utils/constants';

const sqliteDb = drizzle(new Database(DATABASE_PATH));

export default sqliteDb;
