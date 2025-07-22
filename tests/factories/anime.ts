import { AnimeInsert } from '@/database/schemas/anime';

export const buildAnime = (
  overrides: Partial<AnimeInsert> = {},
): AnimeInsert => ({
  title: 'Test Anime Title',
  pageUrl: 'https://animefire.net/anime/test-anime',
  folderName: 'test-anime-folder',
  ...overrides,
});
