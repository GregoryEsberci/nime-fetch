import ContextLogger from '@/utils/context-logger';
import { router } from '@/app';
import httpStatusCodes from '@/utils/http-status-codes';
import sendResponseError from '@/utils/send-error-response';
import ApiError from '@/utils/api-error';
import AnimeEpisodeRepository from '@/database/repositories/anime-episode';
import database from '@/database/connection';
import { count, eq } from 'drizzle-orm';
import animeEpisodeSchema from '@/database/schemas/anime-episode';
import AnimeRepository from '@/database/repositories/anime';

router.delete('/api/anime-episode/:id', async (request, response) => {
  const logger = new ContextLogger(request);

  try {
    const { id } = request.params;

    logger.log(`Received id: ${id}`);

    const episodeId = parseInt(id);
    if (!isFinite(episodeId)) {
      throw new ApiError('Invalid anime episode ID.', {
        statusCode: httpStatusCodes.BAD_REQUEST,
      });
    }

    database.transaction((tx) => {
      const animeEpisodeRepository = new AnimeEpisodeRepository(tx);
      const animeRepository = new AnimeRepository(tx);

      const animeId = animeEpisodeRepository
        .select({ animeId: animeEpisodeSchema.animeId })
        .limit(1)
        .where(eq(animeEpisodeSchema.id, episodeId))
        .get()?.animeId;

      const deleteResult = animeEpisodeRepository.deleteById(episodeId);

      if (!deleteResult.success) {
        throw new ApiError('Failed to update anime episode.');
      }

      if (animeId) {
        const remainingEpisodes =
          animeEpisodeRepository
            .select({ count: count() })
            .where(eq(animeEpisodeSchema.animeId, animeId))
            .get()?.count ?? 0;

        if (remainingEpisodes === 0) {
          animeRepository.deleteById(animeId);
        }
      }
    });

    logger.log(`Successfully deleted anime episode with ID ${episodeId}.`);
    response.status(httpStatusCodes.NO_CONTENT).end();
  } catch (error) {
    logger.error('Request error:', error);

    sendResponseError(error, response);
  }
});
