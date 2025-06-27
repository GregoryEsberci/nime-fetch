import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { idColumn, timestampsColumns } from '../base/column';

const animeSchema = sqliteTable('animes', {
  id: idColumn,
  title: text().notNull(),
  pageUrl: text(),
  ...timestampsColumns,
});

export type Anime = (typeof animeSchema)['$inferSelect'];
export type AnimeInsert = (typeof animeSchema)['$inferInsert'];

export default animeSchema;
