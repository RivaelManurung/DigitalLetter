'use server';

import { revalidatePath } from 'next/cache';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { letter, media } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { createSignedUpload, removeObject } from '@/lib/storage';
import type { ActionResult } from './letter';
import { actionErrorMessage } from '@/lib/action-error';

/**
 * Upload tidak melewati server ini. Action hanya menerbitkan signed URL,
 * browser mengunggah langsung ke Supabase Storage, lalu memanggil
 * attachMedia() untuk mencatat hasilnya.
 */

const signSchema = z.object({
  letterId: z.string().uuid(),
  kind: z.enum(['photo', 'audio']),
  mime: z.string().min(3).max(80),
  size: z.number().int().positive(),
});

export async function requestUpload(input: unknown): Promise<
  ActionResult<{ storagePath: string; signedUrl: string; token: string }>
> {
  try {
    await requireAdmin();
    const data = signSchema.parse(input);
    const result = await createSignedUpload(data);
    return { ok: true, data: result };
  } catch (error) {
    return toFail(error);
  }
}

const attachSchema = z.object({
  letterId: z.string().uuid(),
  kind: z.enum(['photo', 'audio']),
  storagePath: z.string().min(3).max(300),
  caption: z.string().trim().max(120).nullable().optional(),
  meta: z.record(z.string(), z.unknown()).default({}),
});

export async function attachMedia(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const data = attachSchema.parse(input);

    const rows = await db
      .select({ order: media.order })
      .from(media)
      .where(eq(media.letterId, data.letterId))
      .orderBy(asc(media.order));

    const nextOrder = rows.length ? Math.max(...rows.map((r) => r.order)) + 1 : 0;

    const [created] = await db
      .insert(media)
      .values({
        letterId: data.letterId,
        kind: data.kind,
        storagePath: data.storagePath,
        caption: data.caption ?? null,
        order: nextOrder,
        meta: data.meta,
      })
      .returning({ id: media.id });

    await touch(data.letterId);
    return { ok: true, data: { id: created.id } };
  } catch (error) {
    return toFail(error);
  }
}

const updateSchema = z.object({
  id: z.string().uuid(),
  caption: z.string().trim().max(120).nullable().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export async function updateMedia(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = updateSchema.parse(input);

    const patch: Partial<typeof media.$inferInsert> = {};
    if (data.caption !== undefined) patch.caption = data.caption;
    if (data.meta !== undefined) patch.meta = data.meta;

    const [row] = await db
      .update(media)
      .set(patch)
      .where(eq(media.id, data.id))
      .returning({ letterId: media.letterId });

    if (row) await touch(row.letterId);
    return { ok: true };
  } catch (error) {
    return toFail(error);
  }
}

export async function reorderMedia(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { letterId, orderedIds } = z
      .object({
        letterId: z.string().uuid(),
        orderedIds: z.array(z.string().uuid()).max(60),
      })
      .parse(input);

    await db.transaction(async (tx) => {
      for (const [index, id] of orderedIds.entries()) {
        await tx.update(media).set({ order: index }).where(eq(media.id, id));
      }
    });

    await touch(letterId);
    return { ok: true };
  } catch (error) {
    return toFail(error);
  }
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    z.string().uuid().parse(id);

    const [row] = await db
      .select({ letterId: media.letterId, storagePath: media.storagePath })
      .from(media)
      .where(eq(media.id, id))
      .limit(1);

    if (!row) return { ok: false, error: 'Media tidak ditemukan.' };

    await db.delete(media).where(eq(media.id, id));

    // Baris DB sudah hilang; file yatim tidak fatal, jadi jangan gagalkan aksi.
    try {
      await removeObject(row.storagePath);
    } catch {
      // diabaikan dengan sengaja
    }

    await touch(row.letterId);
    return { ok: true };
  } catch (error) {
    return toFail(error);
  }
}

async function touch(letterId: string): Promise<void> {
  const [row] = await db
    .update(letter)
    .set({ updatedAt: new Date() })
    .where(eq(letter.id, letterId))
    .returning({ slug: letter.slug });

  revalidatePath('/dashboard');
  if (row?.slug) revalidatePath(`/l/${row.slug}`);
}

function toFail(error: unknown): ActionResult<never> {
  return { ok: false, error: actionErrorMessage(error) };
}
