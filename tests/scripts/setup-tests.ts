import '@/controllers/index';

import database from '@/database/connection';
import { PROJECT_ROOT } from '@/utils/constants';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'node:path';
import { sql } from 'drizzle-orm';
import * as matchers from 'jest-extended';
import { applyMocks } from '@tests/mocks/index';

expect.extend(matchers);

jest.mock('@/utils/context-logger');

beforeEach(() => {
  jest.restoreAllMocks();
  applyMocks();

  const selectTableNames = sql`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name NOT LIKE 'sqlite_%';
  `;

  database
    .all<{ name: string }>(selectTableNames)
    .forEach(({ name }) => database.run(`DROP TABLE IF EXISTS "${name}";`));

  migrate(database, { migrationsFolder: path.join(PROJECT_ROOT, 'drizzle') });
});
