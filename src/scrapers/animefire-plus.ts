import path from 'node:path';
import ApiError from '../utils/api-error';
import Scraper, { ScrapedAnime, ScrapedAnimeEpisode } from './base';
import ContextLogger from '../utils/context-logger';

class AnimeFirePlusScraper extends Scraper {
  override logger = new ContextLogger('AnimeFirePlusScraper');

  static override isValidUrl(url: string) {
    return url.startsWith('https://animefire.plus/animes');
  }

  async #getDownloadUrl(episodeUrl: string): Promise<string> {
    this.logger.log(`Fetching download URL for episode: ${episodeUrl}`);

    const document = await this.fetchDocument(episodeUrl);
    const dwElement = document.querySelector<HTMLAnchorElement>('#dw');

    if (!dwElement?.href) {
      const error = new ApiError(`Missing download page link on ${episodeUrl}`);
      this.logger.error(error.message, error);

      throw error;
    }

    const downloadPage = await this.fetchDocument(dwElement.href);
    const downloadAnchor = downloadPage.querySelector<HTMLAnchorElement>(
      '#body-content a[download]:last-of-type',
    );

    if (!downloadAnchor?.href) {
      const error = new ApiError(`Missing download URL on ${dwElement.href}`);
      this.logger.error(error.message, error);

      throw error;
    }

    this.logger.log(`Found download URL: ${downloadAnchor.href}`);

    return downloadAnchor.href;
  }

  async getAnime(): Promise<ScrapedAnime> {
    this.logger.log('Fetching anime page...');

    const animePage = await this.getAnimePage();
    const titleElement = animePage.querySelector(
      '#body-content .main_div_anime_info .div_anime_names h1',
    );

    const title =
      titleElement?.textContent ||
      new URL(this.animeUrl).pathname.split('/').pop() ||
      'undefined';

    this.logger.log(`Anime title resolved: "${title}"`);

    return {
      pageUrl: this.animeUrl,
      title,
    };
  }

  async getAnimeEpisodes() {
    this.logger.log('Fetching anime episodes...');

    const animePage = await this.getAnimePage();
    const anime = await this.getAnime();

    const episodeLinks = Array.from(
      animePage.querySelectorAll<HTMLAnchorElement>('.div_video_list a'),
    );

    this.logger.log(`Found ${episodeLinks.length} episodes`);

    const result: ScrapedAnimeEpisode[] = [];

    for (let index = 0; index < episodeLinks.length; index++) {
      const episode = episodeLinks[index];
      const order = index + 1;
      this.logger.log(`Processing episode ${index + 1}: ${episode.href}`);

      const pageUrl = episode.href;
      const downloadUrl = await this.#getDownloadUrl(pageUrl);
      let fileName =
        (await this.fetchFileName(downloadUrl)) ||
        `${anime.title}-(${index + 1}).mp4`;
      fileName = fileName.replace('[AnimeFire.plus]', '');

      const title = path.basename(fileName, path.extname(fileName));

      this.logger.log(`Episode ${order} fileName: ${fileName}`);

      result.push({ pageUrl, downloadUrl, order, fileName, title });
    }

    this.logger.log('Finished fetching episodes');

    return result;
  }
}

export default AnimeFirePlusScraper;
