import { router } from '../app';
import registerAnimeFromUrl from '../../services/register-anime-from-url';
import ApiError from '../../utils/api-error';
import ContextLogger from '../../utils/context-logger';
import httpStatusCodes from '../../utils/http-status-codes';
import sendResponseError from '../../utils/send-error-response';

router.post('/api/url', async (request, response) => {
  const logger = new ContextLogger('POST api/url');
  try {
    const { url } = request.body;

    logger.log(`Received body: ${JSON.stringify(request.body)}`);

    if (typeof url !== 'string') {
      logger.error('Invalid URL');
      throw new ApiError('Invalid URL.', {
        statusCode: httpStatusCodes.BAD_REQUEST,
      });
    }

    const urlProtocol = url.includes('://') ? url.split('://')[0] : undefined;
    const formattedUrl = urlProtocol ? url : `https://${url}`;

    logger.log(`Registering anime from URL: ${formattedUrl}`);

    await registerAnimeFromUrl(formattedUrl);

    logger.log('Finished registering anime');
    response.status(httpStatusCodes.CREATED).end();
  } catch (error) {
    logger.error('Error occurred:', error);

    sendResponseError(error, response);
  }
});
