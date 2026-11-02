import net from 'node:net';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Koneksi dibuat malas (lazy) saat query pertama, bukan saat modul dimuat.
 * Kalau eager, `next build` gagal di mesin tanpa DATABASE_URL — padahal
 * build seharusnya tidak butuh database.
 *
 * `prepare: false` wajib untuk Supabase pooler (pgbouncer transaction mode),
 * yang tidak mendukung prepared statement.
 */

declare global {
  var __pgClient: ReturnType<typeof postgres> | undefined;
  var __drizzle: PostgresJsDatabase<typeof schema> | undefined;
}

function connect(): PostgresJsDatabase<typeof schema> {
  if (globalThis.__drizzle) return globalThis.__drizzle;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Pesan dibedakan: saat deploy, menyuruh orang membuat .env.local
    // justru menyesatkan — file itu tidak pernah ikut ter-deploy.
    throw new Error(
      process.env.VERCEL
        ? 'DATABASE_URL belum diset di Vercel. Buka Project → Settings → Environment Variables, tambahkan untuk environment Production/Preview/Development, lalu Redeploy (perubahan env tidak berlaku pada deployment lama).'
        : 'DATABASE_URL belum diset. Salin .env.example menjadi .env.local lalu isi dari Supabase → Project Settings → Database.',
    );
  }

  // Direct connection Supabase (db.<ref>.supabase.co:5432) hanya punya
  // alamat IPv6. Di jaringan tanpa rute IPv6 hasilnya ENETUNREACH yang
  // membingungkan — jadi tolak lebih awal dengan instruksi yang jelas.
  if (/@db\.[a-z0-9]+\.supabase\.co:5432/.test(connectionString)) {
    throw new Error(
      'DATABASE_URL memakai direct connection Supabase (port 5432), yang hanya beralamat IPv6.\n' +
        'Gunakan connection pooler: Supabase → Project Settings → Database → Connection string → tab "Transaction pooler".\n' +
        'Host menjadi aws-N-<region>.pooler.supabase.com:6543 dan username menjadi postgres.<project-ref>.',
    );
  }

  // Node 22 hanya memberi 250 ms per alamat IP (happy eyeballs); pooler
  // Supabase lintas region sering butuh 300 ms+, sehingga koneksi gagal
  // ETIMEDOUT secara acak. Lihat CLAUDE.md, "Jebakan".
  net.setDefaultAutoSelectFamilyAttemptTimeout(3000);

  const client =
    globalThis.__pgClient ??
    postgres(connectionString, { prepare: false, max: 5, idle_timeout: 20, connect_timeout: 15 });

  const instance = drizzle(client, { schema });

  // Disimpan di semua mode: tanpa ini setiap akses `db` di production
  // membuat pool baru dan membuka koneksi baru ke pooler.
  globalThis.__pgClient = client;
  globalThis.__drizzle = instance;

  return instance;
}

export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    return Reflect.get(connect(), prop, receiver);
  },
});

export { schema };
