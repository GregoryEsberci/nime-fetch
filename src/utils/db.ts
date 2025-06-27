import { AnyColumn, sql } from 'drizzle-orm';

export const increment = (column: AnyColumn, value = 1) =>
  sql`${column} + ${value}`;

export const now = sql`CURRENT_TIMESTAMP`;
