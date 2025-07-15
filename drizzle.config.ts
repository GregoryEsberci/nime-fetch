import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: 'drizzle',
  dialect: 'sqlite',
  schema: process.env.SCHEMA_PATH || 'src/db/schemas/*',
  dbCredentials: { url: process.env.DATABASE_PATH || 'nime-fetch.db' },
});
