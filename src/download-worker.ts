import { eq, ne } from 'drizzle-orm';
import { downloadedFileRepository } from './db/repositories/downloaded-file';
import downloadedFileSchema, {
  DownloadedFile,
} from './db/schemas/downloaded-file';
import sleep from './utils/sleep';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { increment } from './utils/db';
import { SQLiteUpdateSetSource } from 'drizzle-orm/sqlite-core';
import ContextLogger from './utils/context-logger';
import { dirname, join } from 'node:path';
import { DOWNLOAD_DIR } from './utils/constants';
import { mkdir } from 'node:fs/promises';

const LOOP_INTERVAL = 5000;
const MAX_PEER_LOOP = 50;
const DOWNLOAD_BATCH_SIZE = 5;

const logger = new ContextLogger('DownloaderWorker');

const updateDownloadFile = (
  id: number,
  data: SQLiteUpdateSetSource<typeof downloadedFileSchema>,
) => {
  try {
    downloadedFileRepository
      .update(data)
      .where(eq(downloadedFileSchema.id, id))
      .run();
  } catch (error) {
    logger.error('update error', error);
    throw error;
  }
};

const download = async (downloadFile: DownloadedFile) => {
  logger.log(`Starting download from "${downloadFile.downloadUrl}"`);

  try {
    const response = await fetch(downloadFile.downloadUrl);
    if (!response.ok || !response.body) {
      throw new Error(`HTTP ${response.status}`);
    }

    const fullPath = join(DOWNLOAD_DIR, downloadFile.path);

    updateDownloadFile(downloadFile.id, { status: 'downloading' });

    await mkdir(dirname(fullPath), { recursive: true });

    await pipeline(response.body, createWriteStream(fullPath));

    updateDownloadFile(downloadFile.id, {
      status: 'done',
      attempts: increment(downloadedFileSchema.attempts),
    });
    logger.log(`Download completed: "${fullPath}"`);
  } catch (error) {
    logger.error('Download failed', error);

    updateDownloadFile(downloadFile.id, {
      status: 'error',
      attempts: increment(downloadedFileSchema.attempts),
    });
  }
};

const process = async (downloadFiles: DownloadedFile[]) => {
  logger.log(`Processing ${downloadFiles.length} download(s)`);

  const pending = [...downloadFiles];
  const promises = new Set<Promise<void>>();

  while (pending.length > 0) {
    if (promises.size) {
      await Promise.race(promises);
    }

    const batchSize = Math.min(
      DOWNLOAD_BATCH_SIZE - promises.size,
      pending.length,
    );

    for (let i = 0; i < batchSize; i++) {
      const downloadFile = pending.shift();
      if (!downloadFile) break;

      const promise = download(downloadFile);
      promises.add(promise);
      promise.finally(() => promises.delete(promise));
    }
  }

  await Promise.all(promises);

  logger.log('Finished batch');
};

const run = async () => {
  const downloadFiles = downloadedFileRepository
    .select()
    .where(ne(downloadedFileSchema.status, 'done'))
    .orderBy(downloadedFileSchema.attempts)
    .limit(MAX_PEER_LOOP)
    .all();

  if (downloadFiles.length) {
    logger.log(`Fetched ${downloadFiles.length} file(s) to download`);
  }

  if (downloadFiles.length) await process(downloadFiles);
};

const start = async () => {
  logger.log('Download worker started');

  while (true) {
    try {
      await run();
    } catch (error) {
      logger.error('Global error', error);
    } finally {
      await sleep(LOOP_INTERVAL);
    }
  }
};

start();
