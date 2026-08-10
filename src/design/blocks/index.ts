import type { z } from 'zod';
import type { BlockDef, FieldSpec, ListSpec } from './kit';
import { isListSpec } from './kit';

import { introBlock } from './intro';
import { heroBlock } from './hero';
import { letterBlock } from './letter';
import { quoteBlock } from './quote';
import { reasonsBlock } from './reasons';
import { gardenBlock } from './garden';
import { galleryBlock } from './gallery';
import { finaleBlock } from './finale';
import { coupleBlock } from './couple';
import { eventBlock } from './event';
import { countdownBlock } from './countdown';
import { itineraryBlock } from './itinerary';
import { giftBlock } from './gift';
import { storyBlock } from './story';
import { rsvpBlock } from './rsvp';
import { questionBlock } from './question';
import { memoriesBlock } from './memories';
import { wishBlock } from './wish';

/**
 * Satu-satunya daftar block yang dikenal aplikasi.
 *
 * Menambah jenis section = tambah satu baris di sini + satu baris di
 * components/letter/block-renderers.tsx. Yang ikut menyesuaikan sendiri:
 * form editor, template markdown, tombol "tambah section", pilihan varian,
 * validasi Server Action, dan naskah awal surat baru.
 */
export const BLOCKS = {
  intro: introBlock,
  hero: heroBlock,
  letter: letterBlock,
  quote: quoteBlock,
  reasons: reasonsBlock,
  garden: gardenBlock,
  gallery: galleryBlock,
  couple: coupleBlock,
  event: eventBlock,
  countdown: countdownBlock,
  itinerary: itineraryBlock,
  story: storyBlock,
  gift: giftBlock,
  rsvp: rsvpBlock,
  question: questionBlock,
  memories: memoriesBlock,
  wish: wishBlock,
  finale: finaleBlock,
} satisfies Record<string, BlockDef>;

export type SectionType = keyof typeof BLOCKS;

export const SECTION_TYPES = Object.keys(BLOCKS) as SectionType[];

export function getBlock<T extends SectionType>(type: T): (typeof BLOCKS)[T] {
  return BLOCKS[type];
}

export function isSectionType(value: unknown): value is SectionType {
  return typeof value === 'string' && value in BLOCKS;
}

/** Konten satu block, sesuai schema-nya. */
export type BlockContent<T extends SectionType> = z.infer<(typeof BLOCKS)[T]['schema']>;

/** Varian bawaan tiap block — varian pertama yang dideklarasikan. */
export const DEFAULT_VARIANTS = Object.fromEntries(
  SECTION_TYPES.map((type) => [type, BLOCKS[type].variants[0]]),
) as Record<SectionType, string>;

export const SECTION_VARIANTS = Object.fromEntries(
  SECTION_TYPES.map((type) => [type, BLOCKS[type].variants]),
) as { [T in SectionType]: (typeof BLOCKS)[T]['variants'] };

export const SECTION_LABEL = Object.fromEntries(
  SECTION_TYPES.map((type) => [type, BLOCKS[type].label]),
) as Record<SectionType, string>;

/**
 * Varian yang dipakai sebuah section: pilihan per-section menang atas
 * varian bawaan desain. Nilai tak dikenal (sisa versi lama) jatuh ke bawaan
 * block, bukan dirender sebagai kelas CSS yang tidak ada.
 */
export function resolveVariant(
  type: SectionType,
  sectionVariant: string | undefined,
  designVariant: string | undefined,
): string {
  const allowed = BLOCKS[type].variants as readonly string[];
  if (sectionVariant && allowed.includes(sectionVariant)) return sectionVariant;
  if (designVariant && allowed.includes(designVariant)) return designVariant;
  return allowed[0];
}

/** Parse aman: konten rusak/lama tidak menjatuhkan halaman, jatuh ke default. */
export function parseSectionContent<T extends SectionType>(
  type: T,
  raw: unknown,
): BlockContent<T> {
  const { schema } = BLOCKS[type];
  const result = schema.safeParse(raw ?? {});
  if (result.success) return result.data as BlockContent<T>;
  return schema.parse({}) as BlockContent<T>;
}

/** Naskah awal satu block, sudah lewat schema. */
export function starterContent(type: SectionType): Record<string, unknown> {
  return BLOCKS[type].schema.parse(BLOCKS[type].starter) as Record<string, unknown>;
}

/** Satu block paling banyak punya satu field daftar — dipakai parser markdown. */
export function listFieldOf(type: SectionType): ListSpec | null {
  return (BLOCKS[type].fields.find(isListSpec) as ListSpec) ?? null;
}

export function fieldsOf(type: SectionType): FieldSpec[] {
  return BLOCKS[type].fields;
}

export * from './kit';
