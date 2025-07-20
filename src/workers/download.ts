import { and, eq, ne, notInArray } from 'drizzle-orm';
import { downloadedFileRepository } from '../db/repositories/downloaded-file';
import downloadedFileSchema, {
  DownloadedFile,
} from '../db/schemas/downloaded-file';
import sleep from '../utils/sleep';
import stream from 'node:stream/promises';
import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { increment } from '../utils/db';
import ContextLogger from '../utils/context-logger';
import { dirname, join } from 'node:path';
import { DOWNLOAD_DIR } from '../utils/constants';

const LOOP_INTERVAL = 5000;
const DOWNLOAD_BATCH_SIZE = 5;

const logger = new ContextLogger('DownloaderWorker');

const download = async (downloadFile: DownloadedFile) => {
  logger.log(`Starting download from "${downloadFile.downloadUrl}"`);

  try {
    const response = await fetch(downloadFile.downloadUrl);
    if (!response.ok || !response.body) {
      throw new Error(`HTTP ${response.status}`);
    }

    const fullPath = join(DOWNLOAD_DIR, downloadFile.path);

    downloadedFileRepository.updateById(downloadFile.id, {
      status: 'downloading',
    });

    await fs.mkdir(dirname(fullPath), { recursive: true });

    await stream.pipeline(response.body, createWriteStream(fullPath));

    downloadedFileRepository.updateById(downloadFile.id, {
      status: 'done',
      attempts: increment(downloadedFileSchema.attempts),
    });
    logger.log(`Download completed: "${fullPath}"`);
  } catch (error) {
    logger.error('Download failed', error);

    downloadedFileRepository.updateById(downloadFile.id, {
      status: 'error',
      attempts: increment(downloadedFileSchema.attempts),
    });
  }
};

const process = async () => {
  logger.log(`Start process`);

  const promises = new Set<Promise<void>>();
  const processingIds = new Set<number>();

  do {
    if (promises.size) {
      await Promise.race(promises);
    }

    const batchSize = DOWNLOAD_BATCH_SIZE - promises.size;

    const conditions = [ne(downloadedFileSchema.status, 'done')];

    if (processingIds.size > 0) {
      conditions.push(notInArray(downloadedFileSchema.id, [...processingIds]));
    }

    downloadedFileRepository
      .select()
      .where(and(...conditions))
      .orderBy(downloadedFileSchema.attempts)
      .limit(batchSize)
      .all()
      .forEach((downloadFile) => {
        const promise = download(downloadFile);

        promises.add(promise);
        processingIds.add(downloadFile.id);

        promise.finally(() => {
          promises.delete(promise);
          processingIds.delete(downloadFile.id);
        });
      });
  } while (promises.size > 0);

  logger.log('Finished process');
};

const cleanup = () => {
  logger.log('Start cleanup.');

  const updated = downloadedFileRepository
    .update({ status: 'pending' })
    .where(eq(downloadedFileSchema.status, 'downloading'))
    .run();

  logger.log(`Finished cleanup, reset ${updated.changes} downloads.`);
};

const startDownloadWorker = async () => {
  logger.log('Download worker started');

  cleanup();

  while (true) {
    try {
      await process();
    } catch (error) {
      logger.error('Global error', error);
    } finally {
      await sleep(LOOP_INTERVAL);
    }
  }
};

export default startDownloadWorker;
