import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { idColumn, timestampsColumns } from '../base/column';
import animeSchema from './anime';
import downloadedFileSchema from './downloaded-file';

const animeEpisodeSchema = sqliteTable('anime_episodes', {
  id: idColumn,
  pageUrl: text(),
  title: text().notNull(),
  order: integer().notNull(),
  animeId: integer()
    .notNull()
    .references(() => animeSchema.id, { onDelete: 'cascade' }),
  downloadedFileId: integer()
    .notNull()
    .references(() => downloadedFileSchema.id, { onDelete: 'cascade' }),
  ...timestampsColumns,
});

export type AnimeEpisode = (typeof animeEpisodeSchema)['$inferSelect'];
export type AnimeEpisodeInsert = (typeof animeEpisodeSchema)['$inferInsert'];

export default animeEpisodeSchema;
