import ApiError from '@/utils/api-error';
import sleep from '@/utils/sleep';
import { JSDOM } from 'jsdom';
import ContextLogger from '@/utils/context-logger';
import httpStatusCodes from '@/utils/http-status-codes';

export interface ScrapedAnimeEpisode {
  pageUrl: string;
  order: number;
  title: string;
}

export interface ScrapedAnime {
  pageUrl: string;
  title: string;
}

const TOO_MANY_REQUESTS = 429;

export default abstract class Scraper {
  protected logger = new ContextLogger('Scraper');

  readonly animeUrl: string;

  #animePage: Document | undefined;

  protected async getAnimePage() {
    this.#animePage ??= await this.fetchDocument(this.animeUrl);

    return this.#animePage;
  }

  constructor(url: string) {
    const Base = this.constructor as typeof Scraper;

    if (!Base.isValidUrl(url)) {
      throw new ApiError(`Invalid URL "${url}"`, {
        statusCode: httpStatusCodes.BAD_REQUEST,
      });
    }

    this.logger.log(`instanced with url "${url}"`);
    this.animeUrl = url;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static isValidUrl(url: string): boolean {
    throw new ApiError('Not implemented');
  }

  abstract getAnime(): Promise<ScrapedAnime>;

  abstract getAnimeEpisodes(): Promise<ScrapedAnimeEpisode[]>;

  abstract getDownloadUrl(episodeUrl: string): Promise<string>;

  async #fetchHtml(url: string): Promise<string> {
    const response = await fetch(url);

    if (response.status === TOO_MANY_REQUESTS) {
      this.logger.log('too many request, will be tried again in 10s');
      await sleep(10000);
      return this.#fetchHtml(url);
    }

    if (!response.ok) {
      throw new ApiError(`${response.statusText} on ${url}`);
    }

    return response.text();
  }

  protected async fetchDocument(url: string): Promise<Document> {
    const html = await this.#fetchHtml(url);
    return new JSDOM(html).window.document;
  }
}

// Não é bonito mas é oq tem pra hj por conta das limitações do TS
export interface ScraperClass<T extends Scraper = Scraper> {
  new (url: string): T;
  isValidUrl(url: string): boolean;
}
