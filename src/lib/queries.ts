import 'server-only';
import { asc, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { letter, media, section } from '@/db/schema';
import { getPreset } from '@/design/presets';
import type { DesignSpec, LetterBundle, MediaRecord, SectionRecord } from '@/design/types';
import { publicUrl } from './storage';

/**
 * Query dipakai langsung oleh Server Component — halaman surat tidak
 * memanggil API sama sekali, jadi tidak ada waterfall jaringan.
 */

function toMedia(rows: (typeof media.$inferSelect)[]): MediaRecord[] {
  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    path: row.storagePath,
    url: publicUrl(row.storagePath),
    caption: row.caption,
    order: row.order,
    meta: row.meta,
  }));
}

function toSections(rows: (typeof section.$inferSelect)[]): SectionRecord[] {
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    order: row.order,
    enabled: row.enabled,
    content: row.content,
  }));
}

/** Desain rusak/kosong tidak boleh menjatuhkan halaman — jatuh ke preset. */
function safeDesign(raw: unknown): DesignSpec {
  if (raw && typeof raw === 'object' && 'palette' in raw && 'variants' in raw) {
    return raw as DesignSpec;
  }
  return getPreset('dark-romantic');
}

export async function getLetterBundleBySlug(
  slug: string,
  options: { publishedOnly?: boolean } = {},
): Promise<LetterBundle | null> {
  const [row] = await db.select().from(letter).where(eq(letter.slug, slug)).limit(1);
  if (!row) return null;

  if (options.publishedOnly) {
    if (row.status !== 'published') return null;
    if (row.opensAt && row.opensAt.getTime() > Date.now()) return null;
  }

  return buildBundle(row);
}

export async function getLetterBundleById(id: string): Promise<LetterBundle | null> {
  const [row] = await db.select().from(letter).where(eq(letter.id, id)).limit(1);
  if (!row) return null;
  return buildBundle(row);
}

/**
 * Editor butuh baris `letter` lengkap sekaligus bundle-nya. Kalau dipanggil
 * terpisah, baris yang sama diambil dua kali — dan setiap round-trip ke
 * database berharga puluhan milidetik. Satu fungsi, satu pengambilan.
 */
export async function getEditorData(id: string) {
  const [row] = await db.select().from(letter).where(eq(letter.id, id)).limit(1);
  if (!row) return null;

  const bundle = await buildBundle(row);
  return { row, bundle };
}

async function buildBundle(row: typeof letter.$inferSelect): Promise<LetterBundle> {
  const [sectionRows, mediaRows] = await Promise.all([
    db.select().from(section).where(eq(section.letterId, row.id)).orderBy(asc(section.order)),
    db.select().from(media).where(eq(media.letterId, row.id)).orderBy(asc(media.order)),
  ]);

  return {
    id: row.id,
    slug: row.slug,
    recipientName: row.recipientName,
    design: safeDesign(row.design),
    sections: toSections(sectionRows),
    media: toMedia(mediaRows),
  };
}

export async function getLetterMeta(slug: string) {
  const [row] = await db
    .select({
      id: letter.id,
      slug: letter.slug,
      title: letter.title,
      recipientName: letter.recipientName,
      status: letter.status,
      passwordHash: letter.passwordHash,
      opensAt: letter.opensAt,
      design: letter.design,
    })
    .from(letter)
    .where(eq(letter.slug, slug))
    .limit(1);

  return row ?? null;
}

export async function listLetters() {
  return db
    .select({
      id: letter.id,
      slug: letter.slug,
      title: letter.title,
      recipientName: letter.recipientName,
      status: letter.status,
      viewCount: letter.viewCount,
      publishedAt: letter.publishedAt,
      updatedAt: letter.updatedAt,
      design: letter.design,
    })
    .from(letter)
    .orderBy(desc(letter.updatedAt));
}
