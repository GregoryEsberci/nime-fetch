import database from '@/database/connection';
import { PROJECT_ROOT } from '@/utils/constants';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'node:path';

migrate(database, { migrationsFolder: path.join(PROJECT_ROOT, 'drizzle') });
