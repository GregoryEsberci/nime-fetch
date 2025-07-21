import { count } from 'drizzle-orm';
import { animeRepository } from '@/db/repositories/anime';
import httpStatusCodes from '@/utils/http-status-codes';
import { router } from './app';

router.get('/healthcheck', (_request, response) => {
  try {
    animeRepository.select({ count: count() }).get();

    response.status(httpStatusCodes.OK).json({ health: true });
  } catch {
    response
      .status(httpStatusCodes.SERVICE_UNAVAILABLE)
      .json({ health: false });
  }
});

router.use((_request, response) => {
  response.status(httpStatusCodes.NOT_FOUND).json({ error: 'Not found' });
});
