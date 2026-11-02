import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { serverEnv } from './env';

/**
 * File besar TIDAK melewati Server Action — ada batas ukuran dan bikin lambat.
 * Polanya: server menerbitkan signed upload URL, browser mengunggah langsung
 * ke Supabase Storage, lalu melapor balik path-nya untuk disimpan di DB.
 */

export const PHOTO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const AUDIO_MAX_BYTES = 12 * 1024 * 1024; // 12 MB

export const PHOTO_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
export const AUDIO_MIME = ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav'];

let cached: ReturnType<typeof createClient> | null = null;

function admin() {
  if (!cached) {
    cached = createClient(serverEnv.supabaseUrl, serverEnv.supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}

export function publicUrl(storagePath: string): string {
  // Sample photos bundled in public/ are stored as site paths, not bucket keys.
  if (storagePath.startsWith('/image/')) return storagePath;
  const { data } = admin()
    .storage.from(serverEnv.storageBucket)
    .getPublicUrl(storagePath);
  return data.publicUrl;
}

/** Ekstensi aman dari MIME — jangan percaya nama file dari client. */
function extFor(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/ogg': 'ogg',
    'audio/wav': 'wav',
  };
  return map[mime] ?? 'bin';
}

export async function createSignedUpload(params: {
  letterId: string;
  kind: 'photo' | 'audio';
  mime: string;
  size: number;
}) {
  const { letterId, kind, mime, size } = params;

  const allowed = kind === 'photo' ? PHOTO_MIME : AUDIO_MIME;
  if (!allowed.includes(mime)) {
    throw new Error(`Tipe file tidak didukung: ${mime}`);
  }

  const limit = kind === 'photo' ? PHOTO_MAX_BYTES : AUDIO_MAX_BYTES;
  if (size > limit) {
    throw new Error(
      `File terlalu besar (maks ${Math.round(limit / 1024 / 1024)} MB).`,
    );
  }

  const name = `${crypto.randomUUID()}.${extFor(mime)}`;
  const storagePath = `${letterId}/${kind}/${name}`;

  const { data, error } = await admin()
    .storage.from(serverEnv.storageBucket)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    throw new Error(`Gagal membuat URL upload: ${error?.message ?? 'unknown'}`);
  }

  return { storagePath, signedUrl: data.signedUrl, token: data.token };
}

export async function removeObject(storagePath: string): Promise<void> {
  const { error } = await admin()
    .storage.from(serverEnv.storageBucket)
    .remove([storagePath]);
  if (error) throw new Error(`Gagal menghapus file: ${error.message}`);
}
