import '@/controllers/index';
import { app } from '@/app';
import { BASE_PATH, PORT } from '@/utils/constants';

export const server = app
  .listen(PORT, () =>
    console.log(`Listening on http://localhost:${PORT}/${BASE_PATH}`),
  )
  .on('error', (error) => {
    console.error(error);
    process.exit(1);
  });

const closeServer = () => {
  server.close();
};

process.on('SIGTERM', closeServer);
process.on('SIGINT', closeServer);
