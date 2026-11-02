'use server';

import { revalidatePath } from 'next/cache';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { customBlock, section } from '@/db/schema';
import {
  CUSTOM_LAYOUT_IDS,
  compileCustomBlock,
  customBlockSpecSchema,
  customTypeOf,
} from '@/design/blocks/custom';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import type { ActionResult } from './letter';
import { actionErrorMessage } from '@/lib/action-error';

/**
 * Block bikinan sendiri. Definisinya disimpan di database lalu dikompilasi
 * jadi BlockDef biasa saat dipakai — jadi seluruh editor, template markdown,
 * dan perender bekerja tanpa tahu block itu bawaan atau bikinan sendiri.
 */

function fail(error: unknown): ActionResult<never> {
  return { ok: false, error: actionErrorMessage(error) };
}

const saveSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().trim().min(1, 'Nama section wajib diisi').max(60),
  note: z.string().trim().max(200).default(''),
  layout: z.enum(CUSTOM_LAYOUT_IDS as [string, ...string[]]),
  spec: customBlockSpecSchema,
});

export type CustomBlockRow = {
  id: string;
  slug: string;
  label: string;
  note: string;
  layout: string;
  spec: unknown;
  starter: unknown;
  /** berapa section yang memakai block ini */
  usage: number;
};

export async function listCustomBlocks(): Promise<CustomBlockRow[]> {
  await requireAdmin();

  const [rows, sections] = await Promise.all([
    db.select().from(customBlock).orderBy(asc(customBlock.label)),
    db.select({ type: section.type }).from(section),
  ]);

  const used = new Map<string, number>();
  for (const row of sections) {
    used.set(row.type, (used.get(row.type) ?? 0) + 1);
  }

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    label: row.label,
    note: row.note,
    layout: row.layout,
    spec: row.spec,
    starter: row.starter,
    usage: used.get(customTypeOf(row.slug)) ?? 0,
  }));
}

export async function saveCustomBlock(
  input: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin();
    const data = saveSchema.parse(input);

    // Kunci field tidak boleh kembar — kalau kembar, satu menimpa yang lain
    // dan datanya hilang diam-diam.
    const keys = data.spec.fields.map((field) => field.key);
    const duplicate = keys.find((key, i) => keys.indexOf(key) !== i);
    if (duplicate) {
      return { ok: false, error: `Kunci field "${duplicate}" dipakai lebih dari sekali.` };
    }

    for (const field of data.spec.fields) {
      if (field.kind !== 'list') continue;
      const itemKeys = field.fields.map((leaf) => leaf.key);
      const dup = itemKeys.find((key, i) => itemKeys.indexOf(key) !== i);
      if (dup) {
        return {
          ok: false,
          error: `Kunci "${dup}" di daftar "${field.label}" dipakai lebih dari sekali.`,
        };
      }
    }

    // "eyebrow" dan "title" selalu ditambahkan otomatis oleh kompiler.
    const reserved = keys.find((key) => key === 'eyebrow' || key === 'title');
    if (reserved) {
      return {
        ok: false,
        error: `Kunci "${reserved}" sudah dipakai bawaan (Eyebrow & Judul selalu ada).`,
      };
    }

    if (data.id) {
      // Slug tidak diubah saat menyunting: ia sudah tertulis di section yang
      // memakai block ini.
      await db
        .update(customBlock)
        .set({
          label: data.label,
          note: data.note,
          layout: data.layout,
          spec: data.spec,
          updatedAt: new Date(),
        })
        .where(eq(customBlock.id, data.id));

      const [row] = await db
        .select({ slug: customBlock.slug })
        .from(customBlock)
        .where(eq(customBlock.id, data.id))
        .limit(1);

      revalidatePath('/dashboard');
      return { ok: true, data: { id: data.id, slug: row?.slug ?? '' } };
    }

    const slug = slugify(data.label);
    if (!slug) {
      return { ok: false, error: 'Nama section tidak bisa dijadikan slug.' };
    }

    const [clash] = await db
      .select({ id: customBlock.id })
      .from(customBlock)
      .where(eq(customBlock.slug, slug))
      .limit(1);

    if (clash) {
      return { ok: false, error: `Section "${data.label}" sudah ada.` };
    }

    // Naskah awal diambil dari nilai awal tiap field, lewat schema hasil
    // kompilasi — jadi bentuknya dijamin sah.
    const compiled = compileCustomBlock({
      slug,
      label: data.label,
      note: data.note,
      layout: data.layout,
      spec: data.spec,
      starter: {},
    });
    const starter = compiled.schema.parse(compiled.starter) as Record<string, unknown>;

    const [created] = await db
      .insert(customBlock)
      .values({
        slug,
        label: data.label,
        note: data.note,
        layout: data.layout,
        spec: data.spec,
        starter,
      })
      .returning({ id: customBlock.id });

    revalidatePath('/dashboard');
    return { ok: true, data: { id: created.id, slug } };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteCustomBlock(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    z.string().uuid().parse(id);

    const [row] = await db
      .select({ slug: customBlock.slug, label: customBlock.label })
      .from(customBlock)
      .where(eq(customBlock.id, id))
      .limit(1);

    if (!row) return { ok: false, error: 'Section tidak ditemukan.' };

    // Menghapus definisi akan membuat section yang memakainya jadi kosong —
    // ditolak, supaya tidak ada surat client yang diam-diam kehilangan bagian.
    const used = await db
      .select({ id: section.id })
      .from(section)
      .where(eq(section.type, customTypeOf(row.slug)))
      .limit(1);

    if (used.length) {
      return {
        ok: false,
        error: `"${row.label}" masih dipakai di surat. Hapus section-nya dulu.`,
      };
    }

    await db.delete(customBlock).where(eq(customBlock.id, id));
    revalidatePath('/dashboard');
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
