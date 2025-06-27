import { sql } from 'drizzle-orm';
import { integer } from 'drizzle-orm/sqlite-core';

export const idColumn = integer('id').primaryKey({ autoIncrement: true });

export const timestampsColumns = {
  createdAt: integer({ mode: 'timestamp_ms' })
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
};
