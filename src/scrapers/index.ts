import AnimeFirePlusScraper from './animefire-plus';
import { ScraperClass } from './base';

export const SCRAPERS: ScraperClass[] = [AnimeFirePlusScraper];

export const findScraperByUrl = (url: string) =>
  SCRAPERS.find((Scraper) => Scraper.isValidUrl(url));
