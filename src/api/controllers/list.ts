import httpStatusCodes from 'http-status-codes';
import ApiError from '../../utils/api-error.js';
import { animeRepository } from '../../db/repositories/anime.js';
import animeSchema from '../../db/schemas/anime.js';
import animeEpisodeSchema from '../../db/schemas/anime-episode.js';
import downloadedFileSchema, {
  DownloadedFile,
} from '../../db/schemas/downloaded-file.js';
import { eq } from 'drizzle-orm';
import ContextLogger from '../../utils/context-logger.js'; // ou o path correto aí
import { app } from '../app';
import { join } from 'path';

interface ListResult {
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

app.get('/list', (request, response) => {
  const logger = new ContextLogger('GET /list');

  try {
    logger.log('Fetching anime list from DB');

    const rawRows = animeRepository
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

    logger.log(`Fetched ${rawRows.length} rows`);

    const animes = Object.values(
      rawRows.reduce<Record<number, ListResult>>((acc, row) => {
        if (!acc[row.animeId]) {
          acc[row.animeId] = {
            id: row.animeId,
            title: row.animeTitle,
            createdAt: row.animeCreatedAt,
            updatedAt: row.animeUpdatedAt,
            episodes: [],
          };
        }

        if (row.episodeId != null) {
          /* eslint-disable @typescript-eslint/no-non-null-assertion */
          acc[row.animeId].episodes.push({
            id: row.episodeId,
            title: row.episodeTitle!,
            createdAt: row.episodeCreatedAt!,
            updatedAt: row.episodeUpdatedAt!,
            filePath: join('downloads', row.episodeDownloadPath!),
            fileStatus: row.episodeDownloadStatus!,
            downloadAttempts: row.episodeDownloadAttempts!,
          });
          /* eslint-enable @typescript-eslint/no-non-null-assertion */
        }

        return acc;
      }, {}),
    );

    logger.log(`Returning ${animes.length} animes`);
    response.status(httpStatusCodes.OK).json(animes);
  } catch (error) {
    logger.error('Error occurred:', error);

    let statusCode;
    let cause;

    if (error instanceof ApiError) {
      statusCode = error.statusCode;
      cause = error.message;
    } else if (error instanceof Error) {
      cause = error.message;
    }

    response
      .status(statusCode ?? httpStatusCodes.INTERNAL_SERVER_ERROR)
      .json({ cause });
  }
});
