import path from 'node:path';

export const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
export const SOURCE_DIR = path.resolve(import.meta.dirname, '../');

export const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

export const BASE_PATH = process.env.BASE_PATH ?? '';

export const DATABASE_PATH =
  process.env.DATABASE_PATH ?? path.join(PROJECT_ROOT, 'nime-fetch.db');

export const DOWNLOAD_DIR =
  process.env.DOWNLOAD_DIR ?? path.join(PROJECT_ROOT, 'downloads');

export const NODE_ENV = (process.env.NODE_ENV ?? 'development') as
  | 'development'
  | 'production'
  | 'test';
