import Repository from '../base/repository';
import animeEpisodeSchema from '../schemas/anime-episode';

export default class AnimeEpisodeRepository extends Repository<
  typeof animeEpisodeSchema
> {
  override readonly schema = animeEpisodeSchema;
}

export const animeEpisodeRepository = new AnimeEpisodeRepository();
