import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/database/schema.ts',
  out: './src/database/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './pos.db',
  },
  verbose: true,
  strict: true,
}); 