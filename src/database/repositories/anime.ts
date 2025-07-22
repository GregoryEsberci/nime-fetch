import { eq, inArray, sql } from 'drizzle-orm';
import Repository from '@/database/repositories/base';
import animeSchema from '@/database/schemas/anime';
import animeEpisodeSchema from '@/database/schemas/anime-episode';
import DownloadedFileRepository from '@/database/repositories/downloaded-file';
import downloadedFileSchema from '@/database/schemas/downloaded-file';

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
