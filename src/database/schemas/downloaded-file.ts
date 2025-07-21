import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { idColumn, timestampsColumns } from '@/utils/column';

const downloadedFileSchema = sqliteTable('download_files', {
  id: idColumn,
  status: text({ enum: ['done', 'error', 'pending', 'downloading'] })
    .notNull()
    .default('pending'),
  path: text().notNull(),
  downloadUrl: text().notNull(),
  attempts: integer().default(0).notNull(),
  ...timestampsColumns,
});

export type DownloadedFile = (typeof downloadedFileSchema)['$inferSelect'];
export type DownloadedFileInsert =
  (typeof downloadedFileSchema)['$inferInsert'];

export default downloadedFileSchema;
