import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { idColumn, timestampsColumns } from '@/db/base/column';

const animeSchema = sqliteTable('animes', {
  id: idColumn,
  title: text().notNull(),
  pageUrl: text().notNull(),
  folderName: text().notNull(),
  ...timestampsColumns,
});

export type Anime = (typeof animeSchema)['$inferSelect'];
export type AnimeInsert = (typeof animeSchema)['$inferInsert'];

export default animeSchema;
