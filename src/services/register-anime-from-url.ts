import { findScraperByUrl } from '../scrapers/index';
import sqliteDb from '../db/base/sqlite';
import AnimeRepository from '../db/repositories/anime';
import AnimeEpisodeRepository from '../db/repositories/anime-episode';
import { AnimeEpisodeInsert } from '../db/schemas/anime-episode';
import ApiError from '../utils/api-error';
import ContextLogger from '../utils/context-logger';
import sanitizeFileName from '../utils/sanitize-file-name';
import httpStatusCodes from '../utils/http-status-codes';
import { eq } from 'drizzle-orm';
import animeSchema from '../db/schemas/anime';

const registerAnimeFromUrl = async (url: string) => {
  const contextLogger = new ContextLogger('registerAnimeFromUrl');

  contextLogger.log(`Start: "${url}"`);

  const Scraper = findScraperByUrl(url);

  if (!Scraper) {
    contextLogger.error(`No scraper found for: "${url}"`);
    throw new ApiError(`No scraper found for URL: "${url}"`, {
      statusCode: httpStatusCodes.BAD_REQUEST,
    });
  }

  const scraper = new Scraper(url);

  contextLogger.log(`Scraper instantiated: "${Scraper.name}"`);

  const [scrapedAnime, scrapedAnimeEpisodes] = await Promise.all([
    scraper.getAnime(),
    scraper.getAnimeEpisodes(),
  ]);

  contextLogger.log(
    `Scraped anime, target folder for episodes: "${scrapedAnime.title}"`,
  );
  contextLogger.log(`Scraped "${scrapedAnimeEpisodes.length}" episodes`);

  return sqliteDb.transaction((tx) => {
    const animeRepository = new AnimeRepository(tx);
    const animeEpisodeRepository = new AnimeEpisodeRepository(tx);

    const anime = animeRepository
      .create({
        pageUrl: scrapedAnime.pageUrl,
        title: scrapedAnime.title,
        folderName: '',
      })
      .returning()
      .get();

    animeRepository
      .update({ folderName: sanitizeFileName(`${anime.title}-${anime.id}`) })
      .where(eq(animeSchema.id, anime.id))
      .run();

    contextLogger.log(`Anime created with id "${anime.id}"`);

    const episodeInserts = scrapedAnimeEpisodes.map(
      (episode): AnimeEpisodeInsert => {
        return {
          pageUrl: episode.pageUrl,
          order: episode.order,
          animeId: anime.id,
          title: episode.title,
        };
      },
    );

    const animeEpisodes = animeEpisodeRepository
      .create(episodeInserts)
      .returning()
      .all();

    contextLogger.log(
      `"${animeEpisodes.length}" episodes inserted for anime, id: "${anime.id}" title: "${anime.title}"`,
    );

    return { animeEpisodes, anime };
  });
};

export default registerAnimeFromUrl;
