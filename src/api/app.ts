import express from 'express';
import { API_PORT, DOWNLOAD_DIR, PROJECT_ROOT } from '../utils/constants.js';
import { join } from 'node:path';
import mime from 'mime';

export const app = express();

app.use(express.json());
app.listen(API_PORT, () => console.log(`Listening on localhost:${API_PORT}`));

app.use(express.static(join(PROJECT_ROOT, 'static')));

app.use('/', express.static(join(PROJECT_ROOT, 'static', 'index.html')));

app.use(
  '/downloads',
  (request, response, next) => {
    const type = mime.getType(request.path);

    if (type?.startsWith('video/')) {
      response.setHeader('Content-Type', type);
    }

    next();
  },
  express.static(DOWNLOAD_DIR),
);
