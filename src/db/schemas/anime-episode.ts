import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { idColumn, timestampsColumns } from '../base/column';
import animeSchema from './anime';
import downloadedFileSchema from './downloaded-file';

const animeEpisodeSchema = sqliteTable('anime_episodes', {
  id: idColumn,
  pageUrl: text().notNull(),
  title: text().notNull(),
  order: integer().notNull(),
  fileName: text(),
  status: text({ enum: ['done', 'error', 'pending', 'scraping'] })
    .notNull()
    .default('pending'),
  attempts: integer().default(0).notNull(),
  animeId: integer()
    .notNull()
    .references(() => animeSchema.id, { onDelete: 'cascade' }),
  downloadedFileId: integer().references(() => downloadedFileSchema.id, {
    onDelete: 'cascade',
  }),
  ...timestampsColumns,
});

export type AnimeEpisode = (typeof animeEpisodeSchema)['$inferSelect'];
export type AnimeEpisodeInsert = (typeof animeEpisodeSchema)['$inferInsert'];

export default animeEpisodeSchema;
