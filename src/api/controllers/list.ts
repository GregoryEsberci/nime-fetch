import ContextLogger from '../../utils/context-logger';
import { router } from '../app';
import AnimeList from '../../services/anime-list';
import httpStatusCodes from '../../utils/http-status-codes';
import sendResponseError from '../../utils/send-error-response';

router.get('/api/list', (_request, response) => {
  const logger = new ContextLogger('GET api/list');

  try {
    logger.log('Fetching anime list from DB');

    const animes = new AnimeList().queryAll();

    logger.log(`Returning ${animes.length} animes`);
    response.status(httpStatusCodes.OK).json(animes);
  } catch (error) {
    logger.error('Error occurred:', error);

    sendResponseError(error, response);
  }
});
