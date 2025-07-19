import { eq, inArray, sql } from 'drizzle-orm';
import Repository from '../base/repository';
import animeSchema from '../schemas/anime';
import animeEpisodeSchema from '../schemas/anime-episode';
import DownloadedFileRepository from './downloaded-file';
import downloadedFileSchema from '../schemas/downloaded-file';

export default class AnimeRepository extends Repository<typeof animeSchema> {
  override readonly schema = animeSchema;

  // TODO: Not the best way to handle the deletion of linked files, review
  deleteById(animeId: number) {
    return this.db.transaction((tx) => {
      const animeRepository = new AnimeRepository(tx);
      const downloadedFileRepository = new DownloadedFileRepository(tx);

      const subquery = sql`
        (SELECT ${animeEpisodeSchema.downloadedFileId}
         FROM ${animeEpisodeSchema}
         WHERE ${animeEpisodeSchema.animeId} = ${animeId})`;

      downloadedFileRepository
        .delete()
        .where(inArray(downloadedFileSchema.id, subquery))
        .run();

      const result = animeRepository
        .delete()
        .where(eq(animeSchema.id, animeId))
        .run();

      return { success: !!result.changes };
    });
  }
}

export const animeRepository = new AnimeRepository();
