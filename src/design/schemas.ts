import { z } from 'zod';
import { SECTION_TYPES, SECTION_VARIANTS } from './types';
import type { SectionType } from './types';

/**
 * Satu schema per tipe section. Dipakai tiga kali:
 *   1. validasi form di client   2. validasi di Server Action
 *   3. metadata untuk membangun form editor secara otomatis
 *
 * Menambah tipe section baru = tambah schema di sini + komponen di registry.
 * Tidak ada migration database, karena content disimpan sebagai JSONB.
 */

const text = (max = 280) => z.string().trim().max(max);
const richText = (max = 1200) => z.string().trim().max(max);

export const introSchema = z.object({
  hint: text(60).default('tap to open'),
  label: text(80).default(''),
});

export const heroSchema = z.object({
  eyebrow: text(80).default('a love letter in bloom'),
  titleTop: text(80).default('For You,'),
  titleBottom: text(80).default('My Everything'),
  subtitle: richText(240).default(''),
  scrollLabel: text(40).default('scroll to discover'),
});

export const letterSchema = z.object({
  label: text(80).default('from my heart'),
  title: text(160).default(''),
  /** markdown ringan: **tebal**, *miring*, baris baru */
  body: richText(2000).default(''),
  signature: text(120).default(''),
});

export const reasonItemSchema = z.object({
  icon: text(32).default('rose'),
  title: text(80).default(''),
  body: richText(400).default(''),
});

export const reasonsSchema = z.object({
  eyebrow: text(80).default('a thousand reasons why'),
  title: text(120).default('Why I Love You'),
  items: z.array(reasonItemSchema).max(24).default([]),
});

export const flowerItemSchema = z.object({
  flower: text(32).default('rose'),
  name: text(60).default(''),
  meaning: text(80).default(''),
});

export const gardenSchema = z.object({
  eyebrow: text(80).default('our secret garden'),
  title: text(120).default('A Garden Grown Just For You'),
  note: text(120).default('hover each flower to discover its meaning'),
  flowers: z.array(flowerItemSchema).max(12).default([]),
});

export const gallerySchema = z.object({
  eyebrow: text(80).default('captured in time'),
  title: text(120).default('Your Beautiful Pictures'),
  /** id media (kind = photo) yang dipakai section ini, terurut */
  mediaIds: z.array(z.string()).max(24).default([]),
});

export const finaleSchema = z.object({
  eyebrow: text(80).default('always & forever'),
  title: text(160).default('You Are Loved Beyond Words'),
  body: richText(1200).default(''),
  signature: text(120).default(''),
});

export const SECTION_SCHEMAS = {
  intro: introSchema,
  hero: heroSchema,
  letter: letterSchema,
  reasons: reasonsSchema,
  garden: gardenSchema,
  gallery: gallerySchema,
  finale: finaleSchema,
} satisfies Record<SectionType, z.ZodTypeAny>;

export type SectionContent<T extends SectionType> = z.infer<
  (typeof SECTION_SCHEMAS)[T]
>;

/** Parse aman: konten rusak/lama tidak menjatuhkan halaman, jatuh ke default. */
export function parseSectionContent<T extends SectionType>(
  type: T,
  raw: unknown,
): SectionContent<T> {
  const schema = SECTION_SCHEMAS[type];
  const result = schema.safeParse(raw ?? {});
  if (result.success) return result.data as SectionContent<T>;
  return schema.parse({}) as SectionContent<T>;
}

/* ── Design spec ─────────────────────────────────────────────── */

const hexOrRgba = z
  .string()
  .trim()
  .regex(
    /^(#[0-9a-fA-F]{3,8}|rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(,\s*[\d.]+\s*)?\))$/,
    'Warna harus hex (#rrggbb) atau rgba()',
  );

export const paletteSchema = z.object({
  bgDeep: hexOrRgba,
  bgMid: hexOrRgba,
  bgSoft: hexOrRgba,
  accent: hexOrRgba,
  accentSoft: hexOrRgba,
  text: hexOrRgba,
  textMuted: hexOrRgba,
  glass: hexOrRgba,
  glow: hexOrRgba,
});

/**
 * Varian divalidasi terhadap daftar yang benar-benar ada di registry.
 * Nilai tak dikenal (misal sisa versi lama) ditolak, bukan diam-diam
 * dirender sebagai varian default yang salah.
 */
const variantsShape = Object.fromEntries(
  SECTION_TYPES.map((type) => [
    type,
    z.string().refine(
      (value) => (SECTION_VARIANTS[type] as readonly string[]).includes(value),
      { message: `Varian tidak dikenal untuk section "${type}"` },
    ),
  ]),
) as Record<SectionType, z.ZodString | z.ZodType<string>>;

const variantsSchema = z.object(variantsShape);

export const designSchema = z.object({
  preset: z.string().min(1).max(60),
  name: z.string().trim().min(1).max(60),
  palette: paletteSchema,
  fontPair: z.string().min(1).max(60),
  surface: z.object({
    kind: z.enum(['aurora', 'gradient', 'mesh', 'grain', 'solid']),
    vignette: z.number().min(0).max(1),
    grain: z.number().min(0).max(1),
  }),
  motion: z.object({
    speed: z.number().min(0.4).max(2),
    reveal: z.enum(['fade-up', 'fade', 'blur-in']),
    parallax: z.boolean(),
  }),
  particles: z.object({
    kind: z.enum(['sakura', 'rose', 'dust', 'none']),
    density: z.number().min(0).max(1),
  }),
  shape: z.object({
    radius: z.number().min(0).max(48),
    glassBlur: z.number().min(0).max(40),
  }),
  variants: variantsSchema,
});

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya huruf kecil, angka, dan tanda hubung');
