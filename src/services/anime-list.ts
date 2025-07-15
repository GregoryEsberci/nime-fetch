import { animeRepository } from '../db/repositories/anime';
import animeSchema from '../db/schemas/anime';
import animeEpisodeSchema from '../db/schemas/anime-episode';
import downloadedFileSchema, {
  DownloadedFile,
} from '../db/schemas/downloaded-file';
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
    filePath: string;
    fileStatus: DownloadedFile['status'];
    downloadAttempts: number;
  }[];
}

export default class AnimeList {
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
            title: row.episodeTitle!,
            createdAt: row.episodeCreatedAt!,
            updatedAt: row.episodeUpdatedAt!,
            filePath: path.join('downloads', row.episodeDownloadPath!),
            fileStatus: row.episodeDownloadStatus!,
            downloadAttempts: row.episodeDownloadAttempts!,
          });
        }

        return acc;
      }, {}),
    );
  }
}
