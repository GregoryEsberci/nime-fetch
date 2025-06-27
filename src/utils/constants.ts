import { join, resolve } from 'node:path';

export const PROJECT_ROOT = resolve(import.meta.dirname, '..');

export const API_PORT = process.env.API_PORT
  ? Number(process.env.API_PORT)
  : 3000;

export const DOWNLOAD_DIR =
  process.env.DOWNLOAD_DIR ?? join(PROJECT_ROOT, 'downloads');

export const NODE_ENV = (process.env.NODE_ENV ?? 'development') as
  | 'development'
  | 'production'
  | 'test';
