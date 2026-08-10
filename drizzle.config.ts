import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

/**
 * drizzle-kit jalan di luar Next.js, jadi ia tidak otomatis membaca
 * `.env.local` seperti yang dilakukan Next. Urutannya sengaja disamakan
 * dengan Next: `.env.local` menang atas `.env`.
 */
loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL tidak ditemukan di .env.local maupun .env.\n' +
      'Ambil dari Supabase → Project Settings → Database → Connection string → tab "Connection pooling" (port 6543).',
  );
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
