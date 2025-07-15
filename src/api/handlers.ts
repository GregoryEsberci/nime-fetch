import httpStatusCodes from '../utils/http-status-codes';
import { router } from './app';

router.use((_request, response) => {
  response.status(httpStatusCodes.NOT_FOUND).json({ error: 'Not found' });
});
