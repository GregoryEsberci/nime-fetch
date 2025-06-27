import Repository from '../base/repository';
import animeSchema from '../schemas/anime';

export default class AnimeRepository extends Repository<typeof animeSchema> {
  override readonly schema = animeSchema;
}

export const animeRepository = new AnimeRepository();
