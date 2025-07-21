import express from 'express';
import path from 'node:path';
import { DOWNLOAD_DIR, SOURCE_DIR } from '@/utils/constants';
import mime from 'mime';
import { router } from './app';

router.use(express.static(path.join(SOURCE_DIR, 'static')));

router.use(
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
