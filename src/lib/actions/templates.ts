'use server';

import { revalidatePath } from 'next/cache';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { customBlock, letter, letterTemplate, section } from '@/db/schema';
import { designSchema, sectionStyleSchema, slugSchema } from '@/design/schemas';
import { getPreset } from '@/design/presets';
import { OCCASIONS, isOccasionId } from '@/design/occasions';
import {
  createRegistry,
  parseWith,
  starterWith,
  type CustomBlockRecord,
} from '@/design/blocks/resolve';
import type { DesignSpec } from '@/design/types';
import type { TemplateRow, TemplateSection } from '@/lib/template-types';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import type { ActionResult } from './letter';
import { actionErrorMessage } from '@/lib/action-error';

/**
 * Template acara bikinan sendiri.
 *
 * Template hanya CETAKAN AWAL: mengubahnya tidak mengubah surat yang sudah
 * dibuat darinya. Isinya disalin saat surat dibuat, lalu keduanya berdiri
 * sendiri — satu salah sunting tidak merusak surat client yang sudah terbit.
 */

function fail(error: unknown): ActionResult<never> {
  return { ok: false, error: actionErrorMessage(error) };
}

/** Satu section di dalam template. */
const templateSectionSchema = z.object({
  type: z.string().min(1).max(60),
  variant: z.string().max(40).default(''),
  enabled: z.boolean().default(true),
  /** kosong = pakai naskah awal block-nya */
  content: z.record(z.string(), z.unknown()).optional(),
  /** kosong = ikut desain surat */
  style: sectionStyleSchema.optional(),
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

/* ── Buat template baru ────────────────────────────────────── */

const createSchema = z.object({
  label: z.string().trim().min(1, 'Nama template wajib diisi').max(60),
  note: z.string().trim().max(200).default(''),
  /**
   * Titik mulai:
   *   blank      → satu section pembuka saja
   *   occasion   → salin susunan acara bawaan
   *   template   → salin template bikinan sendiri yang lain
   */
  from: z.enum(['blank', 'occasion', 'template']).default('blank'),
  /** id occasion atau id template, tergantung `from` */
  source: z.string().max(60).optional(),
  preset: z.string().min(1).max(60).default('dark-romantic'),
});

export async function createTemplate(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const data = createSchema.parse(input);

    let sections: TemplateSection[] = [];
    let design: DesignSpec | null = null;
    let preset = data.preset;

    if (data.from === 'occasion' && isOccasionId(data.source)) {
      const blueprint = OCCASIONS[data.source];
      preset = blueprint.preset;
      sections = blueprint.sections.map((type) => ({
        type,
        variant: '',
        enabled: true,
      }));
    } else if (data.from === 'template' && data.source) {
      const [origin] = await db
        .select()
        .from(letterTemplate)
        .where(eq(letterTemplate.id, data.source))
        .limit(1);

      if (!origin) return { ok: false, error: 'Template asal tidak ditemukan.' };

      preset = origin.preset;
      design = origin.design;
      sections = (origin.sections ?? []) as TemplateSection[];
    } else {
      // Template kosong tetap diberi pembuka + hero: halaman tanpa section
      // sama sekali tidak bisa dipratinjau, dan itu membingungkan.
      sections = [
        { type: 'intro', variant: '', enabled: true },
        { type: 'hero', variant: '', enabled: true },
      ];
    }

    const slug = await uniqueTemplateSlug(slugify(data.label) || 'template');

    const [created] = await db
      .insert(letterTemplate)
      .values({
        slug,
        label: data.label,
        note: data.note,
        preset,
        sections,
        design,
      })
      .returning({ id: letterTemplate.id });

    revalidatePath('/dashboard/templates');
    return { ok: true, data: { id: created.id } };
  } catch (error) {
    return fail(error);
  }
}

/* ── Editor template ───────────────────────────────────────── */

export type TemplateEditorData = {
  id: string;
  label: string;
  note: string;
  preset: string;
  design: DesignSpec;
  sections: TemplateSection[];
  customBlocks: CustomBlockRecord[];
};

/**
 * Data untuk editor template, dibentuk semirip mungkin dengan LetterBundle
 * supaya panel & pratinjau surat bisa dipakai ulang apa adanya.
 */
export async function getTemplateEditorData(
  id: string,
): Promise<TemplateEditorData | null> {
  await requireAdmin();

  const [row] = await db
    .select()
    .from(letterTemplate)
    .where(eq(letterTemplate.id, id))
    .limit(1);

  if (!row) return null;

  const customs = await db
    .select({
      slug: customBlock.slug,
      label: customBlock.label,
      note: customBlock.note,
      layout: customBlock.layout,
      spec: customBlock.spec,
      starter: customBlock.starter,
    })
    .from(customBlock);

  const registry = createRegistry(customs);
  const stored = (row.sections ?? []) as TemplateSection[];

  // Section yang tipenya sudah tidak dikenal (block custom terhapus) dibuang
  // di sini, bukan dibiarkan merender kosong di editor.
  const sections = stored
    .filter((item) => registry.has(item.type))
    .map((item) => ({
      type: item.type,
      variant: item.variant ?? '',
      enabled: item.enabled ?? true,
      content: parseWith(
        registry,
        item.type,
        item.content ?? starterWith(registry, item.type),
      ),
    }));

  return {
    id: row.id,
    label: row.label,
    note: row.note,
    preset: row.preset,
    design: row.design ?? getPreset(row.preset),
    sections,
    customBlocks: customs,
  };
}

const draftSchema = z.object({
  id: z.string().uuid(),
  label: z.string().trim().min(1, 'Nama template wajib diisi').max(60),
  note: z.string().trim().max(200).default(''),
  design: designSchema,
  sections: z
    .array(templateSectionSchema)
    .min(1, 'Template butuh minimal satu section')
    .max(40),
});

/** Simpan seluruh isi editor template sekaligus. */
export async function saveTemplateDraft(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = draftSchema.parse(input);

    await db
      .update(letterTemplate)
      .set({
        label: data.label,
        note: data.note,
        preset: data.design.preset,
        design: data.design,
        sections: data.sections,
        updatedAt: new Date(),
      })
      .where(eq(letterTemplate.id, data.id));

    revalidatePath('/dashboard/templates');
    revalidatePath(`/dashboard/templates/${data.id}`);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
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
      // Tampilan section ikut jadi bagian template — itulah yang membuat
      // template terasa seperti "desain jadi", bukan cuma daftar section.
      ...(hasStyle(row.style) ? { style: row.style } : {}),
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

/** Style dianggap ada hanya kalau benar-benar berisi — bukan objek kosong. */
function hasStyle(style: unknown): boolean {
  return Boolean(style && typeof style === 'object' && Object.keys(style).length > 0);
}

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
          style: row.style ?? {},
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
