import { and, eq, exists, ne } from 'drizzle-orm';
import AnimeEpisodeRepository, {
  animeEpisodeRepository,
} from '../db/repositories/anime-episode';
import animeEpisodeSchema, { AnimeEpisode } from '../db/schemas/anime-episode';
import ContextLogger from '../utils/context-logger';
import sleep from '../utils/sleep';
import { animeRepository } from '../db/repositories/anime';
import animeSchema from '../db/schemas/anime';
import { findScraperByUrl } from '../scrapers/index';
import { ScraperClass } from '../scrapers/base';
import sqliteDb from '../db/base/sqlite';
import DownloadedFileRepository from '../db/repositories/downloaded-file';
import path from 'node:path';
import sanitizeFileName from '../utils/sanitize-file-name';

const logger = new ContextLogger('Episode scraper', { withId: false });
const LOOP_INTERVAL = 5000;

const decodeDispositionFilename = (header: string) => {
  const match = header.match(
    /filename\*=UTF-8''(.+)|filename="([^"]+)"|filename=(\S+)/i,
  );

  if (!match) return;

  return decodeURIComponent(match[1] || match[2] || match[3]);
};

const fetchContentDisposition = async (url: string) => {
  const response = await fetch(url, { method: 'HEAD' });

  if (!response.ok) {
    throw new Error(`${response.statusText} on ${url}`);
  }

  return response.headers.get('content-disposition');
};

const fetchFileName = async (url: string) => {
  const contentDisposition = await fetchContentDisposition(url);

  if (!contentDisposition) return;

  return decodeDispositionFilename(contentDisposition);
};

const processEpisode = async ({
  episode,
  scraper,
  animeFolderName,
}: {
  scraper: InstanceType<ScraperClass>;
  episode: AnimeEpisode;
  animeFolderName: string;
}) => {
  const downloadUrl = await scraper.getDownloadUrl(episode.pageUrl);
  const fileName = sanitizeFileName(
    (await fetchFileName(downloadUrl)) ?? `${episode.title}.mp4`,
  );

  sqliteDb.transaction((tx) => {
    const animeEpisodeRepositoryTx = new AnimeEpisodeRepository(tx);
    const downloadedFileRepositoryTx = new DownloadedFileRepository(tx);

    const downloadFile = downloadedFileRepositoryTx
      .create({
        downloadUrl,
        path: path.join(animeFolderName, fileName),
      })
      .returning()
      .get();

    animeEpisodeRepositoryTx.updateById(episode.id, {
      fileName,
      status: 'done',
      downloadedFileId: downloadFile.id,
    });
  });
};

const process = async () => {
  while (true) {
    const anime = animeRepository
      .select({
        id: animeSchema.id,
        pageUrl: animeSchema.pageUrl,
        folderName: animeSchema.folderName,
      })
      .limit(1)
      .where(
        exists(
          animeEpisodeRepository
            .select()
            .where(
              and(
                eq(animeEpisodeSchema.animeId, animeSchema.id),
                ne(animeEpisodeSchema.status, 'done'),
              ),
            ),
        ),
      )
      .get();

    if (!anime) break;

    const Scraper = findScraperByUrl(anime.pageUrl);

    const episodesQuery = and(
      eq(animeEpisodeSchema.animeId, anime.id),
      ne(animeEpisodeSchema.status, 'done'),
    );

    const episodes = animeEpisodeRepository.select().where(episodesQuery).all();

    logger.log(
      `Found ${episodes.length} episodes to process for anime ${anime.id}`,
    );

    if (Scraper) {
      const scraper = new Scraper(anime.pageUrl);

      for (const episode of episodes) {
        try {
          await processEpisode({
            scraper,
            episode,
            animeFolderName: anime.folderName,
          });
        } catch (error) {
          logger.error(`processEpisode ${episode.id} failed.`, error);

          animeEpisodeRepository.updateById(episode.id, { status: 'error' });
        }
      }
    } else {
      logger.error(`No scraper found for anime ${anime.id}.`);

      animeEpisodeRepository
        .update({ status: 'error' })
        .where(episodesQuery)
        .run();
    }
  }
};

const cleanup = () => {
  logger.log('Start cleanup.');

  const updated = animeEpisodeRepository
    .update({ status: 'pending' })
    .where(eq(animeEpisodeSchema.status, 'scraping'))
    .run();

  logger.log(`Finished cleanup, reset ${updated.changes} episodes.`);
};

const startEpisodeScraper = async () => {
  logger.log('Anime scraper worker started');

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

export default startEpisodeScraper;
