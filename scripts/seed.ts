import { config as loadEnv } from 'dotenv';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { adminUser } from '../src/db/schema';

// Sama seperti drizzle.config.ts: `.env.local` menang atas `.env`,
// mengikuti urutan yang dipakai Next.js.
loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

/**
 * Membuat akun admin awal dari ADMIN_EMAIL / ADMIN_PASSWORD.
 * Aman dijalankan berulang: kalau akun sudah ada, password-nya diperbarui.
 */

async function main() {
  const url = process.env.DATABASE_URL;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!url) throw new Error('DATABASE_URL belum diset.');
  if (!email || !password) {
    throw new Error('ADMIN_EMAIL dan ADMIN_PASSWORD harus diisi di .env.local');
  }
  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD minimal 8 karakter.');
  }

  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(client);

  const passwordHash = await bcrypt.hash(password, 10);
  const [existing] = await db
    .select({ id: adminUser.id })
    .from(adminUser)
    .where(eq(adminUser.email, email))
    .limit(1);

  if (existing) {
    await db.update(adminUser).set({ passwordHash }).where(eq(adminUser.id, existing.id));
    console.log(`✓ Password admin diperbarui: ${email}`);
  } else {
    await db.insert(adminUser).values({ email, passwordHash });
    console.log(`✓ Admin dibuat: ${email}`);
  }

  await client.end();
}

main().catch((error) => {
  console.error('✗ Seed gagal:', error instanceof Error ? error.message : error);
  process.exit(1);
});
