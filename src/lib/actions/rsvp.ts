'use server';

import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { letter, rsvp } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import type { ActionResult } from './letter';

/**
 * Satu-satunya action yang boleh dipanggil tanpa login — tamu mengisi
 * formulir dari halaman surat publik. Karena itu penjagaannya beda:
 * bukan requireAdmin, melainkan syarat bahwa suratnya memang terbit.
 */

const submitSchema = z.object({
  letterId: z.string().uuid(),
  name: z.string().trim().min(1, 'Nama wajib diisi').max(80),
  attendance: z.enum(['yes', 'no', 'maybe']),
  guests: z.coerce.number().int().min(1).max(20).default(1),
  message: z.string().trim().max(600).default(''),
});

export type PublicWish = {
  id: string;
  name: string;
  attendance: 'yes' | 'no' | 'maybe';
  message: string;
  createdAt: string;
};

export async function submitRsvp(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const data = submitSchema.parse(input);

    // Hanya surat yang sudah terbit yang menerima konfirmasi. Tanpa cek ini,
    // id surat yang bocor bisa dipakai mengisi draft orang lain.
    const [target] = await db
      .select({ id: letter.id, status: letter.status })
      .from(letter)
      .where(eq(letter.id, data.letterId))
      .limit(1);

    if (!target || target.status !== 'published') {
      return { ok: false, error: 'Surat ini belum menerima konfirmasi kehadiran.' };
    }

    const [created] = await db
      .insert(rsvp)
      .values({
        letterId: data.letterId,
        name: data.name,
        attendance: data.attendance,
        guests: data.attendance === 'yes' ? data.guests : 0,
        message: data.message || null,
      })
      .returning({ id: rsvp.id });

    return { ok: true, data: { id: created.id } };
  } catch (error) {
    const message = error instanceof z.ZodError
      ? (error.issues[0]?.message ?? 'Isian tidak valid')
      : 'Gagal mengirim konfirmasi. Coba lagi.';
    return { ok: false, error: message };
  }
}

/** Ucapan yang ditampilkan ke publik — tanpa jumlah tamu, tanpa id internal. */
export async function listPublicWishes(letterId: string): Promise<PublicWish[]> {
  const rows = await db
    .select({
      id: rsvp.id,
      name: rsvp.name,
      attendance: rsvp.attendance,
      message: rsvp.message,
      createdAt: rsvp.createdAt,
    })
    .from(rsvp)
    .where(and(eq(rsvp.letterId, letterId)))
    .orderBy(desc(rsvp.createdAt))
    .limit(60);

  return rows
    .filter((row) => row.message)
    .map((row) => ({
      id: row.id,
      name: row.name,
      attendance: row.attendance,
      message: row.message ?? '',
      createdAt: row.createdAt.toISOString(),
    }));
}

/* ── Sisi admin ────────────────────────────────────────────── */

export type RsvpSummary = {
  total: number;
  yes: number;
  no: number;
  maybe: number;
  guests: number;
  entries: {
    id: string;
    name: string;
    attendance: 'yes' | 'no' | 'maybe';
    guests: number;
    message: string;
    createdAt: string;
  }[];
};

export async function listRsvp(letterId: string): Promise<ActionResult<RsvpSummary>> {
  try {
    await requireAdmin();
    z.string().uuid().parse(letterId);

    const rows = await db
      .select()
      .from(rsvp)
      .where(eq(rsvp.letterId, letterId))
      .orderBy(desc(rsvp.createdAt));

    const summary: RsvpSummary = {
      total: rows.length,
      yes: rows.filter((r) => r.attendance === 'yes').length,
      no: rows.filter((r) => r.attendance === 'no').length,
      maybe: rows.filter((r) => r.attendance === 'maybe').length,
      guests: rows
        .filter((r) => r.attendance === 'yes')
        .reduce((sum, r) => sum + r.guests, 0),
      entries: rows.map((row) => ({
        id: row.id,
        name: row.name,
        attendance: row.attendance,
        guests: row.guests,
        message: row.message ?? '',
        createdAt: row.createdAt.toISOString(),
      })),
    };

    return { ok: true, data: summary };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
    if (message === 'UNAUTHORIZED') {
      return { ok: false, error: 'Sesi berakhir, silakan login lagi.' };
    }
    return { ok: false, error: message };
  }
}

export async function deleteRsvp(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    z.string().uuid().parse(id);
    await db.delete(rsvp).where(eq(rsvp.id, id));
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
    return { ok: false, error: message };
  }
}
