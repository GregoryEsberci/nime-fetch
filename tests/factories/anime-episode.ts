import type { AnimeEpisodeInsert } from '@/database/schemas/anime-episode';

export const buildAnimeEpisode = (
  overrides: Partial<AnimeEpisodeInsert> = {},
): AnimeEpisodeInsert => ({
  pageUrl: 'https://animefire.net/anime/test-anime/episode-1',
  title: 'Episode 1 - Test Episode',
  order: 1,
  attempts: 0,
  animeId: 1,
  ...overrides,
});
