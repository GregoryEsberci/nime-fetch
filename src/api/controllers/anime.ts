import ContextLogger from '../../utils/context-logger';
import { router } from '../app';
import AnimeService from '../../services/anime';
import httpStatusCodes from '../../utils/http-status-codes';
import sendResponseError from '../../utils/send-error-response';
import { animeRepository } from '../../db/repositories/anime';
import ApiError from '../../utils/api-error';
import registerAnimeFromUrl from '../../services/register-anime-from-url';
import isValidHttpUrl from '../../utils/is-valid-http-url';
import isObject from '../../utils/is-object';

router.get('/api/anime', (request, response) => {
  const logger = new ContextLogger(request);

  try {
    logger.log('Fetching anime list from DB.');

    const animes = new AnimeService().queryAll();

    logger.log(`Returning ${animes.length} animes`);
    response.status(httpStatusCodes.OK).json(animes);
  } catch (error) {
    logger.error('Request error:', error);

    sendResponseError(error, response);
  }
});

router.delete('/api/anime/:id', async (request, response) => {
  const logger = new ContextLogger(request);

  try {
    const { id } = request.params;

    logger.log(`Received id: ${id}`);

    const animeId = parseInt(id);

    if (!isFinite(animeId)) {
      throw new ApiError('Invalid anime ID.', {
        statusCode: httpStatusCodes.BAD_REQUEST,
      });
    }

    const deleteResult = animeRepository.deleteById(animeId);

    if (!deleteResult.success) {
      throw new ApiError('Failed to delete anime.');
    }

    logger.log(`Successfully deleted anime with ID ${animeId}.`);
    response.status(httpStatusCodes.NO_CONTENT).end();
  } catch (error) {
    logger.error('Request error:', error);
    sendResponseError(error, response);
  }
});

router.post('/api/anime/url', async (request, response) => {
  const logger = new ContextLogger(request);

  try {
    const { url } = request.body;

    logger.log(
      `Received body: ${isObject(request.body) ? JSON.stringify(request.body) : request.body}`,
    );

    if (typeof url !== 'string' || !isValidHttpUrl(url)) {
      logger.error('Invalid URL');
      throw new ApiError('Invalid URL.', {
        statusCode: httpStatusCodes.BAD_REQUEST,
      });
    }

    logger.log(`Registering anime from URL: ${url}`);

    await registerAnimeFromUrl(url);

    logger.log('Finished registering anime.');
    response.status(httpStatusCodes.CREATED).end();
  } catch (error) {
    logger.error('Request error:', error);

    sendResponseError(error, response);
  }
});
