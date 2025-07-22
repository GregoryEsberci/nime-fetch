import { PORT } from '@/utils/constants';
import path from 'node:path';

export const BASE_URL = `http://localhost:${PORT}`;

export const PAGE_URL = {
  global: {
    blank: 'about:blank',
  },
  animefirePlus: {
    anime: 'https://animefire.plus/animes/sousou-no-frieren-todos-os-episodios',
    episode1: 'https://animefire.plus/animes/sousou-no-frieren/1',
    episode2: 'https://animefire.plus/animes/sousou-no-frieren/2',
    episode1Download: 'https://animefire.plus/download/sousou-no-frieren/1',
    episode2Download: 'https://animefire.plus/download/sousou-no-frieren/2',
  },
};

export const PAGES_PATH = path.join(import.meta.dirname, 'mocks', 'pages');
