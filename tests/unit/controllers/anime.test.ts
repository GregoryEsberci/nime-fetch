import request from 'supertest';
import { app } from '@/app';
import { animeRepository } from '@/database/repositories/anime';
import { animeEpisodeRepository } from '@/database/repositories/anime-episode';
import { buildAnime } from 'tests/factories/anime';
import { buildAnimeEpisode } from 'tests/factories/anime-episode';
import { Anime } from '@/database/schemas/anime';
import { AnimeEpisode } from '@/database/schemas/anime-episode';
import httpStatusCodes from '@/utils/http-status-codes';
import { buildDownloadedFile } from 'tests/factories/downloaded-file';
import { DownloadedFile } from '@/database/schemas/downloaded-file';
import { downloadedFileRepository } from '@/database/repositories/downloaded-file';
import { PAGE_URL } from '../../constants';
import { count } from 'drizzle-orm';

describe('GET /api/anime', () => {
  it('should get all anime successfully', async () => {
    const animes = animeRepository
      .create([
        buildAnime({ title: 'Anime 1' }),
        buildAnime({ title: 'Anime 2' }),
      ])
      .returning()
      .all();

    const episodes = animeEpisodeRepository
      .create([
        buildAnimeEpisode({ animeId: animes[0].id, title: 'Ep 1' }),
        buildAnimeEpisode({ animeId: animes[0].id, title: 'Ep 2' }),
      ])
      .returning()
      .all();

    const response = await request(app)
      .get('/api/anime')
      .expect(httpStatusCodes.OK);

    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body).toHaveLength(2);

    expect(response.body[0].id).toBe(animes[0].id);
    expect(response.body[0].title).toBe(animes[0].title);
    expect(response.body[1].id).toBe(animes[1].id);
    expect(response.body[1].title).toBe(animes[1].title);

    expect(Array.isArray(response.body[0].episodes)).toBeTruthy();
    expect(response.body[0].episodes).toHaveLength(2);
    expect(Array.isArray(response.body[1].episodes)).toBeTruthy();
    expect(response.body[1].episodes).toHaveLength(0);

    expect(response.body[0].episodes[0].id).toBe(episodes[0].id);
    expect(response.body[0].episodes[0].title).toBe(episodes[0].title);
    expect(response.body[0].episodes[1].id).toBe(episodes[1].id);
    expect(response.body[0].episodes[1].title).toBe(episodes[1].title);
  });

  it('should return empty array when no anime exists', async () => {
    const response = await request(app)
      .get('/api/anime')
      .expect(httpStatusCodes.OK);

    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body).toHaveLength(0);
  });
});

describe('DELETE /api/anime/:id', () => {
  let anime: Anime;
  let downloadFile: DownloadedFile;
  let episode1: AnimeEpisode;
  let episode2: AnimeEpisode;

  beforeEach(() => {
    anime = animeRepository.create(buildAnime()).returning().get();
    downloadFile = downloadedFileRepository
      .create(buildDownloadedFile())
      .returning()
      .get();

    [episode1, episode2] = animeEpisodeRepository
      .create([
        buildAnimeEpisode({
          animeId: anime.id,
          title: 'Ep 1',
          status: 'done',
          downloadedFileId: downloadFile.id,
        }),
        buildAnimeEpisode({
          animeId: anime.id,
          title: 'Ep 2',
        }),
      ])
      .returning()
      .all();
  });

  it('should delete anime and all associated episodes successfully', async () => {
    await request(app)
      .delete(`/api/anime/${anime.id}`)
      .expect(httpStatusCodes.NO_CONTENT);

    expect(animeRepository.findById(anime.id)).toBeUndefined();
    expect(animeEpisodeRepository.findById(episode1.id)).toBeUndefined();
    expect(animeEpisodeRepository.findById(episode2.id)).toBeUndefined();
    expect(downloadedFileRepository.findById(downloadFile.id)).toBeUndefined();
  });

  it('should return 400 for invalid ID', async () => {
    await request(app)
      .delete('/api/anime/invalid')
      .expect(httpStatusCodes.BAD_REQUEST);
  });
});

describe('POST /api/anime/url', () => {
  const countAnimes = () =>
    animeRepository.select({ count: count() }).get()?.count || 0;

  const countEpisodes = () =>
    animeEpisodeRepository.select({ count: count() }).get()?.count || 0;

  it('should register anime from valid URL successfully', async () => {
    const prevAnimesSize = countAnimes();
    const prevEpisodesSize = countEpisodes();

    await request(app)
      .post('/api/anime/url')
      .send({ url: PAGE_URL.animefirePlus.anime })
      .expect(httpStatusCodes.CREATED);

    expect(countAnimes() - prevAnimesSize).toBe(1);
    expect(countEpisodes() - prevEpisodesSize).toBe(28);
  });

  it.each(['invalid-url', 'https://google.com', 123, undefined, null])(
    'should return 400 for %p',
    async (url) => {
      await request(app)
        .post('/api/anime/url')
        .send({ url })
        .expect(httpStatusCodes.BAD_REQUEST);
    },
  );
});
