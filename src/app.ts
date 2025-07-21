import express from 'express';
import { PORT, BASE_PATH } from '@/utils/constants.js';

export const app = express();
export const router = express.Router();

router.use(express.json());

app.enable('trust proxy');
app.use(BASE_PATH, router);

app
  .listen(PORT, () =>
    console.log(`Listening on http://localhost:${PORT}/${BASE_PATH}`),
  )
  .on('error', (error) => {
    console.error(error);
    process.exit(1);
  });
