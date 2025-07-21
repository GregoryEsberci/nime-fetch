import { eq, inArray, sql } from 'drizzle-orm';
import Repository from '@/database/repositories/base';
import animeEpisodeSchema from '@/database/schemas/anime-episode';
import downloadedFileSchema from '@/database/schemas/downloaded-file';
import DownloadedFileRepository from './downloaded-file';

export default class AnimeEpisodeRepository extends Repository<
  typeof animeEpisodeSchema
> {
  override readonly schema = animeEpisodeSchema;

  // TODO: Not the best way to handle the deletion of linked files, review
  deleteById(episodeId: number) {
    return this.db.transaction((tx) => {
      const animeEpisodeRepository = new AnimeEpisodeRepository(tx);
      const downloadedFileRepository = new DownloadedFileRepository(tx);

      const subquery = sql`
        (SELECT ${animeEpisodeSchema.downloadedFileId}
         FROM ${animeEpisodeSchema}
         WHERE ${animeEpisodeSchema.id} = ${episodeId})`;

      downloadedFileRepository
        .delete()
        .where(inArray(downloadedFileSchema.id, subquery))
        .run();

      // onDelete: ‘cascate’ already deletes the episode, kept just in case
      animeEpisodeRepository
        .delete()
        .where(eq(animeEpisodeSchema.id, episodeId))
        .run();

      const success = !animeEpisodeRepository
        .select({ id: animeEpisodeSchema.id })
        .where(eq(animeEpisodeSchema.id, episodeId))
        .get();

      return { success };
    });
  }
}

export const animeEpisodeRepository = new AnimeEpisodeRepository();
