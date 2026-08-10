import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/db';

export const dynamic = 'force-dynamic';

/**
 * Diagnosa deployment. Sengaja hanya melaporkan **ada/tidaknya** setiap
 * environment variable — tidak pernah nilainya — plus hasil satu ping ke
 * database. Cukup untuk menemukan penyebab deploy gagal tanpa membocorkan
 * apa pun yang rahasia.
 *
 * Aman diakses publik, tapi hapus saja kalau kamu tidak nyaman.
 */
export async function GET() {
  const env = {
    DATABASE_URL: present('DATABASE_URL'),
    NEXT_PUBLIC_SUPABASE_URL: present('NEXT_PUBLIC_SUPABASE_URL'),
    SUPABASE_SECRET_KEY:
      present('SUPABASE_SECRET_KEY') || present('SUPABASE_SERVICE_ROLE_KEY'),
    SUPABASE_STORAGE_BUCKET: present('SUPABASE_STORAGE_BUCKET'),
    AUTH_SECRET: present('AUTH_SECRET'),
    NEXT_PUBLIC_SITE_URL: present('NEXT_PUBLIC_SITE_URL'),
  };

  const missing = Object.entries(env)
    .filter(([, ok]) => !ok)
    .map(([key]) => key);

  let database: { ok: boolean; latencyMs?: number; error?: string };
  const started = Date.now();

  try {
    await db.execute(sql`select 1`);
    database = { ok: true, latencyMs: Date.now() - started };
  } catch (error) {
    database = {
      ok: false,
      latencyMs: Date.now() - started,
      error: error instanceof Error ? error.message : 'unknown',
    };
  }

  const healthy = missing.length === 0 && database.ok;

  return NextResponse.json(
    {
      healthy,
      env,
      missing,
      database,
      region: process.env.VERCEL_REGION ?? 'local',
    },
    { status: healthy ? 200 : 503 },
  );
}

function present(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}
