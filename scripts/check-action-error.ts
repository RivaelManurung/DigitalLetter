import assert from 'node:assert/strict';
import { DrizzleQueryError } from 'drizzle-orm/errors';
import { z } from 'zod';
import { actionErrorMessage } from '../src/lib/action-error';

const quiet = { log: () => {} };
const dbError = (code: string) =>
  new DrizzleQueryError('update "letter" set "status" = $1', ['published'], Object.assign(new Error('x'), { code }));

const timeout = actionErrorMessage(dbError('ETIMEDOUT'), quiet);
assert.match(timeout, /tidak bisa dihubungi/);
assert.doesNotMatch(timeout, /update|letter|\$1/, 'SQL tidak boleh bocor ke pengguna');

assert.match(actionErrorMessage(dbError('23505'), quiet), /sudah dipakai/);
assert.match(actionErrorMessage(dbError('XX000'), quiet), /Gagal menyimpan/);
assert.equal(actionErrorMessage(new Error('UNAUTHORIZED'), quiet), 'Sesi berakhir, silakan login lagi.');
assert.equal(actionErrorMessage(new Error('Slug sudah dipakai surat lain'), quiet), 'Slug sudah dipakai surat lain');

const zod = z.object({ a: z.string().min(1, 'Judul wajib diisi') }).safeParse({ a: '' });
assert.equal(actionErrorMessage(zod.error, quiet), 'Judul wajib diisi');
assert.equal(actionErrorMessage('aneh', quiet), 'Terjadi kesalahan');

console.log('ok pesan error action aman dan berbahasa Indonesia');
