'use server';

import { revalidatePath } from 'next/cache';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { letter, letterTemplate, section } from '@/db/schema';
import { designSchema, slugSchema } from '@/design/schemas';
import type { TemplateRow, TemplateSection } from '@/lib/template-types';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import type { ActionResult } from './letter';

/**
 * Template acara bikinan sendiri.
 *
 * Template hanya CETAKAN AWAL: mengubahnya tidak mengubah surat yang sudah
 * dibuat darinya. Isinya disalin saat surat dibuat, lalu keduanya berdiri
 * sendiri — satu salah sunting tidak merusak surat client yang sudah terbit.
 */

function fail(error: unknown): ActionResult<never> {
  const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
  if (message === 'UNAUTHORIZED') {
    return { ok: false, error: 'Sesi berakhir, silakan login lagi.' };
  }
  if (error instanceof z.ZodError) {
    return { ok: false, error: error.issues[0]?.message ?? 'Isian tidak valid' };
  }
  return { ok: false, error: message };
}

/** Satu section di dalam template. */
const templateSectionSchema = z.object({
  type: z.string().min(1).max(60),
  variant: z.string().max(40).default(''),
  enabled: z.boolean().default(true),
  /** kosong = pakai naskah awal block-nya */
  content: z.record(z.string(), z.unknown()).optional(),
});

export async function listTemplates(): Promise<TemplateRow[]> {
  await requireAdmin();

  const rows = await db
    .select()
    .from(letterTemplate)
    .orderBy(asc(letterTemplate.label));

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    label: row.label,
    note: row.note,
    preset: row.preset,
    sections: (row.sections ?? []) as TemplateSection[],
    design: row.design,
    builtin: false as const,
  }));
}

const saveSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().trim().min(1, 'Nama template wajib diisi').max(60),
  note: z.string().trim().max(200).default(''),
  preset: z.string().min(1).max(60).default('dark-romantic'),
  sections: z.array(templateSectionSchema).min(1, 'Template butuh minimal satu section').max(40),
  design: designSchema.nullable().optional(),
});

export async function saveTemplate(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const data = saveSchema.parse(input);

    if (data.id) {
      await db
        .update(letterTemplate)
        .set({
          label: data.label,
          note: data.note,
          preset: data.preset,
          sections: data.sections,
          design: data.design ?? null,
          updatedAt: new Date(),
        })
        .where(eq(letterTemplate.id, data.id));

      revalidatePath('/dashboard');
      return { ok: true, data: { id: data.id } };
    }

    const slug = await uniqueTemplateSlug(slugify(data.label) || 'template');

    const [created] = await db
      .insert(letterTemplate)
      .values({
        slug,
        label: data.label,
        note: data.note,
        preset: data.preset,
        sections: data.sections,
        design: data.design ?? null,
      })
      .returning({ id: letterTemplate.id });

    revalidatePath('/dashboard');
    return { ok: true, data: { id: created.id } };
  } catch (error) {
    return fail(error);
  }
}

/** Slug template hanya untuk identifikasi internal — dibuat unik otomatis. */
async function uniqueTemplateSlug(base: string): Promise<string> {
  for (let i = 0; i < 50; i += 1) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const [clash] = await db
      .select({ id: letterTemplate.id })
      .from(letterTemplate)
      .where(eq(letterTemplate.slug, candidate))
      .limit(1);
    if (!clash) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export async function deleteTemplate(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    z.string().uuid().parse(id);
    await db.delete(letterTemplate).where(eq(letterTemplate.id, id));
    revalidatePath('/dashboard');
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* ── Simpan surat jadi template ────────────────────────────── */

const fromLetterSchema = z.object({
  letterId: z.string().uuid(),
  label: z.string().trim().min(1, 'Nama template wajib diisi').max(60),
  note: z.string().trim().max(200).default(''),
  /** ikut menyimpan teks yang sudah ditulis, bukan hanya susunannya */
  includeContent: z.boolean().default(true),
});

export async function saveLetterAsTemplate(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const data = fromLetterSchema.parse(input);

    const [source] = await db
      .select({ design: letter.design })
      .from(letter)
      .where(eq(letter.id, data.letterId))
      .limit(1);

    if (!source) return { ok: false, error: 'Surat tidak ditemukan.' };

    const rows = await db
      .select()
      .from(section)
      .where(eq(section.letterId, data.letterId))
      .orderBy(asc(section.order));

    if (!rows.length) {
      return { ok: false, error: 'Surat ini belum punya section.' };
    }

    const sections: TemplateSection[] = rows.map((row) => ({
      type: row.type,
      variant: row.variant,
      enabled: row.enabled,
      // mediaIds menunjuk foto milik surat asal — tidak boleh ikut terbawa.
      ...(data.includeContent ? { content: stripMedia(row.content) } : {}),
    }));

    const slug = await uniqueTemplateSlug(slugify(data.label) || 'template');

    const [created] = await db
      .insert(letterTemplate)
      .values({
        slug,
        label: data.label,
        note: data.note,
        preset: source.design?.preset ?? 'dark-romantic',
        sections,
        design: source.design ?? null,
      })
      .returning({ id: letterTemplate.id });

    revalidatePath('/dashboard');
    return { ok: true, data: { id: created.id } };
  } catch (error) {
    return fail(error);
  }
}

/**
 * Buang rujukan media dari konten. Id foto hanya sah di surat asalnya —
 * dibawa ke surat lain, gambarnya tidak akan muncul.
 */
const MEDIA_KEYS = new Set(['mediaIds', 'photoId', 'bridePhotoId', 'groomPhotoId']);

function stripMedia(content: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(content)) {
    if (MEDIA_KEYS.has(key)) {
      out[key] = Array.isArray(value) ? [] : '';
      continue;
    }

    if (Array.isArray(value)) {
      out[key] = value.map((item) =>
        item && typeof item === 'object'
          ? stripMedia(item as Record<string, unknown>)
          : item,
      );
      continue;
    }

    out[key] = value;
  }

  return out;
}

/* ── Duplikat surat ────────────────────────────────────────── */

const duplicateSchema = z.object({
  letterId: z.string().uuid(),
  title: z.string().trim().min(1, 'Judul wajib diisi').max(120),
  recipientName: z.string().trim().max(80).default(''),
  slug: slugSchema.optional(),
});

export async function duplicateLetter(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const data = duplicateSchema.parse(input);

    const [source] = await db
      .select()
      .from(letter)
      .where(eq(letter.id, data.letterId))
      .limit(1);

    if (!source) return { ok: false, error: 'Surat tidak ditemukan.' };

    const slug = data.slug ?? slugify(data.recipientName || data.title);
    if (!slug) return { ok: false, error: 'Slug tidak bisa dibuat dari judul ini.' };

    const [clash] = await db
      .select({ id: letter.id })
      .from(letter)
      .where(eq(letter.slug, slug))
      .limit(1);

    if (clash) return { ok: false, error: `Slug "${slug}" sudah dipakai.` };

    const [created] = await db
      .insert(letter)
      .values({
        slug,
        title: data.title,
        recipientName: data.recipientName,
        design: source.design,
        // Salinan selalu mulai sebagai draft, tanpa sandi & tanpa statistik.
        status: 'draft',
      })
      .returning({ id: letter.id });

    const rows = await db
      .select()
      .from(section)
      .where(eq(section.letterId, data.letterId))
      .orderBy(asc(section.order));

    if (rows.length) {
      await db.insert(section).values(
        rows.map((row) => ({
          letterId: created.id,
          type: row.type,
          order: row.order,
          enabled: row.enabled,
          variant: row.variant,
          // Foto tidak ikut disalin, jadi rujukannya dikosongkan.
          content: stripMedia(row.content),
        })),
      );
    }

    revalidatePath('/dashboard');
    return { ok: true, data: { id: created.id } };
  } catch (error) {
    return fail(error);
  }
}
