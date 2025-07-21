import sqliteDb from '@/db/base/sqlite';
import { PROJECT_ROOT } from '@/utils/constants';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'node:path';

migrate(sqliteDb, { migrationsFolder: path.join(PROJECT_ROOT, 'drizzle') });
