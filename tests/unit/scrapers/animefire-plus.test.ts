import AnimeFirePlusScraper from '@/scrapers/animefire-plus';
import { when } from 'jest-when';
import { getHtmlResponse } from '@tests/mocks/fetch';
import { PAGE_URL } from '@tests/constants';

describe('AnimeFirePlusScraper', () => {
  let scraper: AnimeFirePlusScraper;

  beforeEach(() => {
    scraper = new AnimeFirePlusScraper(PAGE_URL.animefirePlus.anime);
  });

  describe('isValidUrl', () => {
    it('should return true for valid AnimeFirePlus URLs', () => {
      expect(
        AnimeFirePlusScraper.isValidUrl(PAGE_URL.animefirePlus.anime),
      ).toBeTrue();
    });

    it('should return false for invalid URLs', () => {
      expect(AnimeFirePlusScraper.isValidUrl('https://google.com')).toBeFalse();
      expect(
        AnimeFirePlusScraper.isValidUrl('https://animefire.com/animes/naruto'),
      ).toBeFalse();
      expect(AnimeFirePlusScraper.isValidUrl('invalid-url')).toBeFalse();
    });
  });

  describe('getAnime', () => {
    it('should get anime information successfully', async () => {
      const anime = await scraper.getAnime();

      expect(anime).toEqual({
        pageUrl: PAGE_URL.animefirePlus.anime,
        title: expect.any(String),
      });

      expect(anime).toEqual({
        pageUrl: PAGE_URL.animefirePlus.anime,
        title: 'Sousou no Frieren',
      });
    });

    it('should fallback to URL pathname when title element is not found', async () => {
      when(fetch)
        .calledWith(PAGE_URL.animefirePlus.anime)
        .mockImplementation(
          async () => (await getHtmlResponse(PAGE_URL.global.blank))!,
        );

      const anime = await scraper.getAnime();

      expect(anime).toEqual({
        pageUrl: PAGE_URL.animefirePlus.anime,
        title: 'sousou-no-frieren-todos-os-episodios',
      });
    });
  });

  describe('getAnimeEpisodes', () => {
    it('should get all anime episodes successfully', async () => {
      const episodes = await scraper.getAnimeEpisodes();

      expect(episodes).toBeArray();
      expect(episodes).toHaveLength(28);

      expect(episodes[0]).toEqual({
        order: 1,
        title: 'Sousou no Frieren - Episódio 1',
        pageUrl: 'https://animefire.plus/animes/sousou-no-frieren/1',
      });
    });

    it('should return empty array when no episodes are found', async () => {
      when(fetch)
        .calledWith(PAGE_URL.animefirePlus.anime)
        .mockImplementation(
          async () => (await getHtmlResponse(PAGE_URL.global.blank))!,
        );

      const episodes = await scraper.getAnimeEpisodes();

      expect(episodes).toBeArray();
      expect(episodes).toHaveLength(0);
    });
  });

  describe('getDownloadUrl', () => {
    it('should get download URL for episode successfully', async () => {
      const downloadUrl = await scraper.getDownloadUrl(
        PAGE_URL.animefirePlus.episode1,
      );

      expect(downloadUrl).toStartWith(
        'https://lightspeedst.net/s6/mp4_temp/sousou-no-frieren/1/720p.mp4',
      );
    });

    it('should throw error when download page link has no href', async () => {
      when(fetch)
        .calledWith(expect.toStartWith(PAGE_URL.animefirePlus.episode1))
        .mockImplementation(
          async () => (await getHtmlResponse(PAGE_URL.global.blank))!,
        );

      await expect(
        scraper.getDownloadUrl(PAGE_URL.animefirePlus.episode1),
      ).rejects.toThrow('Missing download page');
    });

    it('should throw error when download URL is missing', async () => {
      when(fetch)
        .calledWith(expect.toStartWith(PAGE_URL.animefirePlus.episode1Download))
        .mockImplementation(
          async () => (await getHtmlResponse(PAGE_URL.global.blank))!,
        );

      await expect(
        scraper.getDownloadUrl(PAGE_URL.animefirePlus.episode1),
      ).rejects.toThrow('Missing download URL');
    });
  });
});
