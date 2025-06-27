import { app } from '../app';
import registerAnimeFromUrl from '../../services/register-anime-from-url';
import ApiError from '../../utils/api-error';
import ContextLogger from '../../utils/context-logger';
import httpStatusCodes from 'http-status-codes';

app.post('/url', async (request, response) => {
  const logger = new ContextLogger('POST /url');
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
