import request from 'supertest';
import { app } from '@/app';
import { animeEpisodeRepository } from '@/database/repositories/anime-episode';
import { animeRepository } from '@/database/repositories/anime';
import { buildAnime } from 'tests/factories/anime';
import { buildAnimeEpisode } from 'tests/factories/anime-episode';
import { buildDownloadedFile } from 'tests/factories/downloaded-file';
import { Anime } from '@/database/schemas/anime';
import { AnimeEpisode } from '@/database/schemas/anime-episode';
import { DownloadedFile } from '@/database/schemas/downloaded-file';
import { downloadedFileRepository } from '@/database/repositories/downloaded-file';
import httpStatusCodes from '@/utils/http-status-codes';

describe('DELETE /api/anime-episode/:id', () => {
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
          title: 'Ep 1',
          status: 'done',
          animeId: anime.id,
          downloadedFileId: downloadFile.id,
        }),
        buildAnimeEpisode({
          title: 'Ep 2',
          animeId: anime.id,
        }),
      ])
      .returning()
      .all();
  });

  it('should delete episode successfully', async () => {
    await request(app)
      .delete(`/api/anime-episode/${episode1.id}`)
      .expect(httpStatusCodes.NO_CONTENT);

    expect(animeEpisodeRepository.findById(episode1.id)).toBeUndefined();
    expect(downloadedFileRepository.findById(downloadFile.id)).toBeUndefined();
    expect(animeRepository.findById(anime.id)).toEqual(anime);
  });

  it('should delete parent anime when no episodes remain', async () => {
    await request(app)
      .delete(`/api/anime-episode/${episode1.id}`)
      .expect(httpStatusCodes.NO_CONTENT);

    await request(app)
      .delete(`/api/anime-episode/${episode2.id}`)
      .expect(httpStatusCodes.NO_CONTENT);

    expect(animeEpisodeRepository.findById(episode1.id)).toBeUndefined();
    expect(animeEpisodeRepository.findById(episode2.id)).toBeUndefined();
    expect(downloadedFileRepository.findById(downloadFile.id)).toBeUndefined();
    expect(animeRepository.findById(anime.id)).toBeUndefined();
  });

  it('should return 400 for invalid ID', async () => {
    await request(app)
      .delete('/api/anime-episode/invalid')
      .expect(httpStatusCodes.BAD_REQUEST);
  });
});
