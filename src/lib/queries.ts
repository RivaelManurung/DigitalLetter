import 'server-only';
import { asc, count, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  customBlock,
  letter,
  letterTemplate,
  media,
  rsvp,
  section,
} from '@/db/schema';
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
    variant: row.variant,
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
  const [sectionRows, mediaRows, customRows] = await Promise.all([
    db.select().from(section).where(eq(section.letterId, row.id)).orderBy(asc(section.order)),
    db.select().from(media).where(eq(media.letterId, row.id)).orderBy(asc(media.order)),
    // Definisi block bikinan sendiri ikut dibawa supaya halaman surat bisa
    // merendernya tanpa query tambahan di sisi klien.
    db
      .select({
        slug: customBlock.slug,
        label: customBlock.label,
        note: customBlock.note,
        layout: customBlock.layout,
        spec: customBlock.spec,
        starter: customBlock.starter,
      })
      .from(customBlock),
  ]);

  return {
    id: row.id,
    slug: row.slug,
    recipientName: row.recipientName,
    design: safeDesign(row.design),
    sections: toSections(sectionRows),
    media: toMedia(mediaRows),
    customBlocks: customRows,
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

export type LetterCard = Awaited<ReturnType<typeof listLetters>>[number] & {
  sectionCount: number;
  rsvpCount: number;
};

/**
 * Daftar surat lengkap dengan ringkasannya. Jumlah section & RSVP diambil
 * lewat dua query agregat, bukan satu query per surat — jadi bebannya tetap
 * konstan berapa pun banyaknya surat.
 */
export async function listLetterCards(): Promise<LetterCard[]> {
  const [rows, sectionCounts, rsvpCounts] = await Promise.all([
    listLetters(),
    db
      .select({ letterId: section.letterId, n: count() })
      .from(section)
      .groupBy(section.letterId),
    db
      .select({ letterId: rsvp.letterId, n: count() })
      .from(rsvp)
      .groupBy(rsvp.letterId),
  ]);

  const sections = new Map(sectionCounts.map((r) => [r.letterId, Number(r.n)]));
  const rsvps = new Map(rsvpCounts.map((r) => [r.letterId, Number(r.n)]));

  return rows.map((row) => ({
    ...row,
    sectionCount: sections.get(row.id) ?? 0,
    rsvpCount: rsvps.get(row.id) ?? 0,
  }));
}

export type DashboardStats = {
  total: number;
  published: number;
  draft: number;
  views: number;
  rsvpTotal: number;
  rsvpYes: number;
  customBlocks: number;
  templates: number;
};

/**
 * Semua angka dihitung DI DATABASE, bukan dengan menarik seluruh baris lalu
 * menjumlahkannya di JavaScript. Bedanya nyata: satu baris hasil per query
 * alih-alih ribuan baris melintasi jaringan — dan tanpa ini Supabase
 * memutus koneksi dengan `statement timeout` begitu datanya bertambah.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [letters, rsvpRow, blocks, templates] = await Promise.all([
    db
      .select({
        total: count(),
        published: sql<number>`count(*) filter (where ${letter.status} = 'published')`,
        views: sql<number>`coalesce(sum(${letter.viewCount}), 0)`,
      })
      .from(letter),
    db
      .select({
        total: count(),
        yes: sql<number>`count(*) filter (where ${rsvp.attendance} = 'yes')`,
      })
      .from(rsvp),
    db.select({ n: count() }).from(customBlock),
    db.select({ n: count() }).from(letterTemplate),
  ]);

  const total = Number(letters[0]?.total ?? 0);
  const published = Number(letters[0]?.published ?? 0);

  return {
    total,
    published,
    draft: total - published,
    views: Number(letters[0]?.views ?? 0),
    rsvpTotal: Number(rsvpRow[0]?.total ?? 0),
    rsvpYes: Number(rsvpRow[0]?.yes ?? 0),
    customBlocks: Number(blocks[0]?.n ?? 0),
    templates: Number(templates[0]?.n ?? 0),
  };
}

export type RecentRsvp = {
  id: string;
  name: string;
  attendance: 'yes' | 'no' | 'maybe';
  message: string | null;
  createdAt: Date;
  letterTitle: string;
  letterId: string;
};

/** Konfirmasi terbaru dari semua surat — untuk kartu aktivitas di ikhtisar. */
export async function listRecentRsvp(limit = 6): Promise<RecentRsvp[]> {
  return db
    .select({
      id: rsvp.id,
      name: rsvp.name,
      attendance: rsvp.attendance,
      message: rsvp.message,
      createdAt: rsvp.createdAt,
      letterTitle: letter.title,
      letterId: letter.id,
    })
    .from(rsvp)
    .innerJoin(letter, eq(rsvp.letterId, letter.id))
    .orderBy(desc(rsvp.createdAt))
    .limit(limit);
}
