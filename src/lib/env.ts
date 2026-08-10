/** Validasi env di startup — gagal cepat dengan pesan jelas, bukan error misterius saat runtime. */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Environment variable ${name} belum diset. Lihat .env.example.`,
    );
  }
  return value;
}

export const serverEnv = {
  get authSecret() {
    return required('AUTH_SECRET');
  },
  get supabaseUrl() {
    return required('NEXT_PUBLIC_SUPABASE_URL');
  },
  /**
   * Key rahasia sisi server.
   *
   * Supabase memakai dua sistem key: yang baru (`sb_secret_…`) dan legacy
   * (`service_role`, berbentuk JWT `eyJ…`). Keduanya diterima supabase-js,
   * jadi kita terima dua-duanya dan utamakan yang baru.
   *
   * Key ini TIDAK BOLEH berprefix NEXT_PUBLIC_ — apa pun yang berprefix itu
   * ikut masuk bundle browser.
   */
  get supabaseServiceKey() {
    const key =
      process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!key) {
      throw new Error(
        'SUPABASE_SECRET_KEY belum diset. Ambil dari Supabase → Project Settings → API Keys → Secret keys (sb_secret_…).',
      );
    }

    if (key.startsWith('sb_publishable_')) {
      throw new Error(
        'SUPABASE_SECRET_KEY diisi publishable key. Yang dibutuhkan key rahasia (sb_secret_…) — publishable key tidak punya izin menulis ke Storage.',
      );
    }

    return key;
  },
  get storageBucket() {
    return process.env.SUPABASE_STORAGE_BUCKET || 'letter-media';
  },
  get siteUrl() {
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  },
};
