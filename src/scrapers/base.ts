import ApiError from '../utils/api-error.js';
import sleep from '../utils/sleep';
import { JSDOM } from 'jsdom';
import httpStatusCodes from 'http-status-codes';
import ContextLogger from '../utils/context-logger.js';

export interface ScrapedAnimeEpisode {
  pageUrl: string;
  downloadUrl: string;
  order: number;
  fileName: string;
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
    throw new Error('Not implemented');
  }

  abstract getAnime(): Promise<ScrapedAnime>;

  abstract getAnimeEpisodes(): Promise<ScrapedAnimeEpisode[]>;

  async #fetchHtml(url: string): Promise<string> {
    const response = await fetch(url);

    if (response.status === TOO_MANY_REQUESTS) {
      this.logger.log('too many request, will be tried again in 10s');
      await sleep(10000);
      return this.#fetchHtml(url);
    }

    if (!response.ok) {
      throw new Error(`${response.statusText} on ${url}`);
    }

    return response.text();
  }

  protected async fetchDocument(url: string): Promise<Document> {
    const html = await this.#fetchHtml(url);
    return new JSDOM(html).window.document;
  }

  protected decodeDispositionFilename(header: string) {
    const match = header.match(
      /filename\*=UTF-8''(.+)|filename="([^"]+)"|filename=(\S+)/i,
    );

    if (!match) return;

    return decodeURIComponent(match[1] || match[2] || match[3]);
  }

  protected async fetchContentDisposition(url: string) {
    const response = await fetch(url, { method: 'HEAD' });

    if (!response.ok) {
      throw new Error(`${response.statusText} on ${url}`);
    }

    return response.headers.get('content-disposition');
  }

  protected async fetchFileName(url: string) {
    const contentDisposition = await this.fetchContentDisposition(url);

    if (!contentDisposition) return;

    return this.decodeDispositionFilename(contentDisposition);
  }
}

// Não é bonito mas é oq tem pra hj por conta das limitações do TS
export interface ScraperClass<T extends Scraper = Scraper> {
  new (url: string): T;
  isValidUrl(url: string): boolean;
}
