import { animeRepository } from '@/database/repositories/anime';
import animeSchema from '@/database/schemas/anime';
import animeEpisodeSchema, {
  AnimeEpisode,
} from '@/database/schemas/anime-episode';
import downloadedFileSchema, {
  DownloadedFile,
} from '@/database/schemas/downloaded-file';
import { eq } from 'drizzle-orm';
import path from 'node:path';

interface AnimeListItem {
  id: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  episodes: {
    id: number;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    filePath: string | undefined;
    fileStatus: DownloadedFile['status'];
    downloadAttempts: number;
    status: AnimeEpisode['status'];
    attempts: number;
  }[];
}

export default class AnimeService {
  #queryRawRows() {
    return animeRepository
      .select({
        animeId: animeSchema.id,
        animeTitle: animeSchema.title,
        animeCreatedAt: animeSchema.createdAt,
        animeUpdatedAt: animeSchema.updatedAt,
        episodeId: animeEpisodeSchema.id,
        episodeTitle: animeEpisodeSchema.title,
        episodeCreatedAt: animeEpisodeSchema.createdAt,
        episodeUpdatedAt: animeEpisodeSchema.updatedAt,
        episodeOrder: animeEpisodeSchema.order,
        episodeStatus: animeEpisodeSchema.status,
        episodeAttempts: animeEpisodeSchema.attempts,
        episodeDownloadPath: downloadedFileSchema.path,
        episodeDownloadStatus: downloadedFileSchema.status,
        episodeDownloadAttempts: downloadedFileSchema.attempts,
      })
      .orderBy(animeEpisodeSchema.order)
      .leftJoin(
        animeEpisodeSchema,
        eq(animeSchema.id, animeEpisodeSchema.animeId),
      )
      .leftJoin(
        downloadedFileSchema,
        eq(animeEpisodeSchema.downloadedFileId, downloadedFileSchema.id),
      )
      .all();
  }

  queryAll() {
    return Object.values(
      this.#queryRawRows().reduce<Record<number, AnimeListItem>>((acc, row) => {
        acc[row.animeId] ??= {
          id: row.animeId,
          title: row.animeTitle,
          createdAt: row.animeCreatedAt,
          updatedAt: row.animeUpdatedAt,
          episodes: [],
        };

        if (row.episodeId) {
          acc[row.animeId].episodes.push({
            id: row.episodeId,
            title: row.episodeTitle ?? '',
            createdAt: row.episodeCreatedAt ?? new Date(),
            updatedAt: row.episodeUpdatedAt ?? new Date(),
            filePath: row.episodeDownloadPath
              ? path.join('downloads', row.episodeDownloadPath)
              : undefined,
            fileStatus: row.episodeDownloadStatus || 'pending',
            downloadAttempts: row.episodeDownloadAttempts ?? 0,
            status: row.episodeStatus || 'pending',
            attempts: row.episodeAttempts ?? 0,
          });
        }

        return acc;
      }, {}),
    );
  }
}
