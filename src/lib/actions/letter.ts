'use server';

import { revalidatePath } from 'next/cache';
import { and, asc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { customBlock, letter, letterTemplate, media, section } from '@/db/schema';
import { designSchema, slugSchema } from '@/design/schemas';
import { getPreset } from '@/design/presets';
import { createRegistry, parseWith, starterWith } from '@/design/blocks/resolve';
import { OCCASIONS, isOccasionId, type OccasionId } from '@/design/occasions';
import type { DesignSpec, SectionRecord } from '@/design/types';
import { hashPassword, requireAdmin } from '@/lib/auth';
import { parseLetterMarkdown } from '@/lib/markdown/parse';
import { defaultSectionsFor } from '@/lib/defaults';
import { slugify } from '@/lib/utils';

/**
 * Setiap action memanggil requireAdmin() sendiri. Middleware saja tidak cukup:
 * Server Action punya endpoint sendiri dan bisa dipanggil langsung.
 */

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

function fail(error: unknown): ActionResult<never> {
  const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
  if (message === 'UNAUTHORIZED') return { ok: false, error: 'Sesi berakhir, silakan login lagi.' };
  return { ok: false, error: message };
}

function refresh(slug?: string) {
  revalidatePath('/dashboard');
  if (slug) revalidatePath(`/l/${slug}`);
}

/* ── Surat ─────────────────────────────────────────────────── */

const createSchema = z.object({
  title: z.string().trim().min(1, 'Judul wajib diisi').max(120),
  recipientName: z.string().trim().max(80).default(''),
  slug: slugSchema.optional(),
  preset: z.string().min(1).optional(),
  /** occasion bawaan; diabaikan bila templateId diisi */
  occasion: z.string().default('love'),
  /** template bikinan sendiri — menang atas occasion */
  templateId: z.string().uuid().optional(),
});

export async function createLetter(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const data = createSchema.parse(input);

    const slug = data.slug ?? slugify(data.recipientName || data.title) ?? '';
    if (!slug) return { ok: false, error: 'Slug tidak bisa dibuat dari judul ini.' };

    const [existing] = await db.select({ id: letter.id }).from(letter).where(eq(letter.slug, slug)).limit(1);
    if (existing) return { ok: false, error: `Slug "${slug}" sudah dipakai.` };

    // Template bikinan sendiri menang atas occasion bawaan.
    const template = data.templateId ? await loadTemplate(data.templateId) : null;

    const occasion: OccasionId = isOccasionId(data.occasion) ? data.occasion : 'love';
    const design = template?.design
      ? template.design
      : getPreset(data.preset ?? template?.preset ?? OCCASIONS[occasion].preset);

    const [created] = await db
      .insert(letter)
      .values({
        slug,
        title: data.title,
        recipientName: data.recipientName,
        design,
      })
      .returning({ id: letter.id });

    // Section awal supaya editor tidak menyambut user dengan halaman kosong
    const rows = template
      ? await sectionsFromTemplate(created.id, template, data.recipientName || data.title)
      : defaultSectionsFor(created.id, data.recipientName || data.title, occasion);

    if (rows.length) await db.insert(section).values(rows);

    refresh();
    return { ok: true, data: { id: created.id } };
  } catch (error) {
    return fail(error);
  }
}

const metaSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(120),
  recipientName: z.string().trim().max(80),
  slug: slugSchema,
  opensAt: z.string().datetime().nullable().optional(),
});

export async function updateLetterMeta(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = metaSchema.parse(input);

    const [clash] = await db
      .select({ id: letter.id })
      .from(letter)
      .where(eq(letter.slug, data.slug))
      .limit(1);

    if (clash && clash.id !== data.id) {
      return { ok: false, error: `Slug "${data.slug}" sudah dipakai surat lain.` };
    }

    await db
      .update(letter)
      .set({
        title: data.title,
        recipientName: data.recipientName,
        slug: data.slug,
        opensAt: data.opensAt ? new Date(data.opensAt) : null,
        updatedAt: new Date(),
      })
      .where(eq(letter.id, data.id));

    refresh(data.slug);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function updateDesign(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { id, design } = z
      .object({ id: z.string().uuid(), design: designSchema })
      .parse(input);

    const [row] = await db
      .update(letter)
      .set({ design, updatedAt: new Date() })
      .where(eq(letter.id, id))
      .returning({ slug: letter.slug });

    refresh(row?.slug);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteLetter(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    z.string().uuid().parse(id);
    // section & media ikut terhapus lewat ON DELETE CASCADE
    await db.delete(letter).where(eq(letter.id, id));
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* ── Publish ───────────────────────────────────────────────── */

const publishSchema = z.object({
  id: z.string().uuid(),
  publish: z.boolean(),
  password: z.string().trim().max(72).optional(),
  clearPassword: z.boolean().optional(),
});

export async function setPublishState(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = publishSchema.parse(input);

    const patch: Partial<typeof letter.$inferInsert> = {
      status: data.publish ? 'published' : 'draft',
      publishedAt: data.publish ? new Date() : null,
      updatedAt: new Date(),
    };

    if (data.clearPassword) patch.passwordHash = null;
    else if (data.password) patch.passwordHash = await hashPassword(data.password);

    const [row] = await db
      .update(letter)
      .set(patch)
      .where(eq(letter.id, data.id))
      .returning({ slug: letter.slug });

    refresh(row?.slug);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* ── Section ───────────────────────────────────────────────── */

export async function updateSectionContent(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { sectionId, type, content } = z
      .object({
        sectionId: z.string().uuid(),
        type: z.string().min(1).max(60),
        content: z.unknown(),
      })
      .parse(input);

    // Validasi ulang di server dengan schema tipe section yang bersangkutan
    const registry = await loadRegistry();
    const block = registry.get(type);
    if (!block) return { ok: false, error: `Tipe section "${type}" tidak dikenal.` };

    const parsed = block.schema.parse(content ?? {});

    await db
      .update(section)
      .set({ content: parsed as Record<string, unknown> })
      .where(eq(section.id, sectionId));

    await touchLetterBySection(sectionId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function toggleSection(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { sectionId, enabled } = z
      .object({ sectionId: z.string().uuid(), enabled: z.boolean() })
      .parse(input);

    await db.update(section).set({ enabled }).where(eq(section.id, sectionId));
    await touchLetterBySection(sectionId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function reorderSections(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { letterId, orderedIds } = z
      .object({ letterId: z.string().uuid(), orderedIds: z.array(z.string().uuid()).max(40) })
      .parse(input);

    await db.transaction(async (tx) => {
      for (const [index, id] of orderedIds.entries()) {
        await tx
          .update(section)
          .set({ order: index })
          .where(and(eq(section.id, id), eq(section.letterId, letterId)));
      }
    });

    await touchLetter(letterId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function addSection(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { letterId, type } = z
      .object({
        letterId: z.string().uuid(),
        type: z.string().min(1).max(60),
      })
      .parse(input);

    const registry = await loadRegistry();
    const block = registry.get(type);
    if (!block) return { ok: false, error: `Tipe section "${type}" tidak dikenal.` };

    const rows = await db
      .select({ type: section.type, order: section.order })
      .from(section)
      .where(eq(section.letterId, letterId))
      .orderBy(asc(section.order));

    // Block bertanda unique hanya boleh sekali — dijaga di server, bukan
    // hanya disembunyikan di UI.
    if (block.unique && rows.some((row) => row.type === type)) {
      return { ok: false, error: `Section "${block.label}" hanya boleh satu.` };
    }

    const nextOrder = rows.length ? Math.max(...rows.map((r) => r.order)) + 1 : 0;

    await db.insert(section).values({
      letterId,
      type,
      order: nextOrder,
      enabled: true,
      variant: '',
      // Section baru berisi naskah, bukan form kosong.
      content: starterWith(registry, type),
    });

    await touchLetter(letterId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function setSectionVariant(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { sectionId, variant } = z
      .object({ sectionId: z.string().uuid(), variant: z.string().trim().max(40) })
      .parse(input);

    const [row] = await db
      .select({ type: section.type })
      .from(section)
      .where(eq(section.id, sectionId))
      .limit(1);

    if (!row) return { ok: false, error: 'Section tidak ditemukan.' };

    const registry = await loadRegistry();
    const block = registry.get(row.type);
    if (!block) return { ok: false, error: `Tipe section "${row.type}" tidak dikenal.` };

    const allowed = block.variants as readonly string[];
    if (variant !== '' && !allowed.includes(variant)) {
      return { ok: false, error: `Varian "${variant}" tidak dikenal.` };
    }

    await db.update(section).set({ variant }).where(eq(section.id, sectionId));
    await touchLetterBySection(sectionId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteSection(sectionId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    z.string().uuid().parse(sectionId);
    const letterId = await letterIdForSection(sectionId);
    await db.delete(section).where(eq(section.id, sectionId));
    if (letterId) await touchLetter(letterId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* ── Impor markdown ────────────────────────────────────────── */

const importSchema = z.object({
  letterId: z.string().uuid(),
  markdown: z.string().max(200_000, 'Berkas terlalu besar (maksimal 200 KB).'),
});

export type ImportSummary = {
  updated: number;
  created: number;
  warnings: string[];
  sections: SectionRecord[];
};

/**
 * Terapkan berkas markdown ke sebuah surat. Section yang tidak disebut di
 * berkas dibiarkan apa adanya — impor tidak pernah menghapus. Isi tetap
 * melewati schema Zod, jadi berkas rusak paling jauh hanya jatuh ke default
 * field yang bersangkutan.
 */
export async function importSectionsMarkdown(
  input: unknown,
): Promise<ActionResult<ImportSummary>> {
  try {
    await requireAdmin();
    const { letterId, markdown } = importSchema.parse(input);

    const registry = await loadRegistry();
    const parsed = parseLetterMarkdown(markdown, registry);
    if (!parsed.sections.length) {
      return { ok: false, error: parsed.warnings[0] ?? 'Berkas tidak berisi section.' };
    }

    const [existing, mediaRows] = await Promise.all([
      db.select().from(section).where(eq(section.letterId, letterId)).orderBy(asc(section.order)),
      db.select({ id: media.id }).from(media).where(eq(media.letterId, letterId)),
    ]);

    const ownedMedia = new Set(mediaRows.map((row) => row.id));
    const warnings = [...parsed.warnings];

    // Satu tipe boleh punya beberapa section, jadi pencocokan memakai
    // kemunculan ke-n dalam urutan yang ada — bukan tipe saja.
    const occurrences = new Map<string, typeof existing>();
    for (const row of existing) {
      const list = occurrences.get(row.type) ?? [];
      list.push(row);
      occurrences.set(row.type, list);
    }

    let updated = 0;
    let created = 0;
    let nextOrder = existing.length
      ? Math.max(...existing.map((row) => row.order)) + 1
      : 0;

    for (const item of parsed.sections) {
      const current = occurrences.get(item.type)?.[item.nth - 1];
      const merged = { ...(current?.content ?? {}), ...item.content };

      if (item.type === 'gallery' && Array.isArray(merged.mediaIds)) {
        const ids = (merged.mediaIds as unknown[]).map(String);
        const kept = ids.filter((id) => ownedMedia.has(id));
        if (kept.length !== ids.length) {
          warnings.push('Sebagian id foto di berkas tidak ada di surat ini — diabaikan.');
        }
        merged.mediaIds = kept;
      }

      const content = parseWith(registry, item.type, merged);

      if (current) {
        await db.update(section).set({ content }).where(eq(section.id, current.id));
        updated += 1;
      } else {
        await db.insert(section).values({
          letterId,
          type: item.type,
          order: nextOrder,
          enabled: true,
          variant: '',
          content,
        });
        nextOrder += 1;
        created += 1;
      }
    }

    await touchLetter(letterId);

    const fresh = await db
      .select()
      .from(section)
      .where(eq(section.letterId, letterId))
      .orderBy(asc(section.order));

    return {
      ok: true,
      data: {
        updated,
        created,
        warnings,
        sections: fresh.map((row) => ({
          id: row.id,
          type: row.type,
          order: row.order,
          enabled: row.enabled,
          variant: row.variant,
          content: row.content,
        })),
      },
    };
  } catch (error) {
    return fail(error);
  }
}

/* ── Template ──────────────────────────────────────────────── */

type LoadedTemplate = {
  preset: string;
  design: DesignSpec | null;
  sections: { type: string; variant: string; enabled: boolean; content?: unknown }[];
};

async function loadTemplate(id: string): Promise<LoadedTemplate | null> {
  const [row] = await db
    .select()
    .from(letterTemplate)
    .where(eq(letterTemplate.id, id))
    .limit(1);

  if (!row) return null;

  return {
    preset: row.preset,
    design: row.design,
    sections: (row.sections ?? []) as LoadedTemplate['sections'],
  };
}

/**
 * Section awal dari sebuah template. Isi yang tersimpan di template dipakai
 * bila ada; kalau tidak, jatuh ke naskah awal block-nya. Tipe yang sudah
 * tidak dikenal (block custom yang dihapus) dilewati, bukan bikin gagal.
 */
async function sectionsFromTemplate(
  letterId: string,
  template: LoadedTemplate,
  recipient: string,
) {
  const registry = await loadRegistry();

  const rows = [];
  let order = 0;

  for (const item of template.sections) {
    const block = registry.get(item.type);
    if (!block) continue;

    const base = item.content ?? starterWith(registry, item.type);
    const content = parseWith(registry, item.type, base);

    if (item.type === 'intro' && recipient && !content.label) {
      content.label = `Untuk ${recipient}`;
    }

    rows.push({
      letterId,
      type: item.type,
      order,
      enabled: item.enabled ?? true,
      variant: item.variant ?? '',
      content,
    });
    order += 1;
  }

  return rows;
}

/** Registry gabungan: block bawaan + block bikinan sendiri dari database. */
async function loadRegistry() {
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

  return createRegistry(customs);
}

/* ── Helper ────────────────────────────────────────────────── */

async function letterIdForSection(sectionId: string): Promise<string | null> {
  const [row] = await db
    .select({ letterId: section.letterId })
    .from(section)
    .where(eq(section.id, sectionId))
    .limit(1);
  return row?.letterId ?? null;
}

async function touchLetterBySection(sectionId: string): Promise<void> {
  const letterId = await letterIdForSection(sectionId);
  if (letterId) await touchLetter(letterId);
}

async function touchLetter(letterId: string): Promise<void> {
  const [row] = await db
    .update(letter)
    .set({ updatedAt: sql`now()` })
    .where(eq(letter.id, letterId))
    .returning({ slug: letter.slug });
  refresh(row?.slug);
}
