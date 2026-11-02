import { DrizzleQueryError } from 'drizzle-orm/errors';
import { z } from 'zod';

const NETWORK_CODES = new Set(['ETIMEDOUT', 'ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND', 'EAI_AGAIN', 'CONNECT_TIMEOUT']);

type Logger = { log: (...args: unknown[]) => void };

function causeCode(error: DrizzleQueryError): string | undefined {
  const cause = error.cause as { code?: string; errors?: { code?: string }[] } | undefined;
  return cause?.code ?? cause?.errors?.[0]?.code;
}

/**
 * Mengubah error apa pun dari Server Action menjadi pesan untuk pengguna.
 * Error database dicatat lengkap di server, tapi SQL dan parameternya
 * tidak pernah dikirim ke browser.
 */
export function actionErrorMessage(error: unknown, logger: Logger = { log: console.error }): string {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? 'Isian tidak valid';

  if (error instanceof DrizzleQueryError) {
    logger.log('[action] query gagal:', error.query, error.cause);
    const code = causeCode(error);
    if (code && NETWORK_CODES.has(code)) {
      return 'Database sedang tidak bisa dihubungi. Periksa koneksi internet, lalu coba lagi.';
    }
    if (code === '23505') return 'Nilai itu sudah dipakai data lain (misalnya slug). Ganti lalu coba lagi.';
    return 'Gagal menyimpan ke database. Coba lagi sebentar lagi.';
  }

  if (error instanceof Error) {
    if (error.message === 'UNAUTHORIZED') return 'Sesi berakhir, silakan login lagi.';
    return error.message;
  }

  return 'Terjadi kesalahan';
}
