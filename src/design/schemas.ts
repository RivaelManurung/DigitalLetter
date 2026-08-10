import { z } from 'zod';
import { BLOCKS, SECTION_TYPES, type SectionType } from './blocks';

/**
 * Schema section berasal dari registry block (design/blocks). Berkas ini
 * menyediakan bentuk gabungannya plus schema desain — yang bukan milik satu
 * block tertentu.
 *
 * Menambah tipe section = tambah berkas di design/blocks + daftarkan di
 * index.ts-nya. Tidak ada yang perlu disunting di sini.
 */

export const SECTION_SCHEMAS = Object.fromEntries(
  SECTION_TYPES.map((type) => [type, BLOCKS[type].schema]),
) as { [T in SectionType]: (typeof BLOCKS)[T]['schema'] };

export type SectionContent<T extends SectionType> = z.infer<
  (typeof BLOCKS)[T]['schema']
>;

export { parseSectionContent } from './blocks';

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
 * Semua kunci opsional: preset lama tidak menyebut block yang baru
 * ditambahkan, dan itu sah — block memakai varian bawaannya sendiri.
 * Nilai yang disebut tapi tidak dikenal tetap ditolak.
 */
const variantsShape = Object.fromEntries(
  SECTION_TYPES.map((type) => [
    type,
    z
      .string()
      .refine(
        (value) => (BLOCKS[type].variants as readonly string[]).includes(value),
        { message: `Varian tidak dikenal untuk section "${type}"` },
      )
      .optional(),
  ]),
) as unknown as Record<SectionType, z.ZodOptional<z.ZodString>>;

const variantsSchema = z.object(variantsShape);

/** Varian per-section: boleh kosong, artinya ikut varian bawaan desain. */
export const sectionVariantSchema = (type: SectionType) =>
  z
    .string()
    .trim()
    .refine(
      (value) =>
        value === '' || (BLOCKS[type].variants as readonly string[]).includes(value),
      { message: `Varian tidak dikenal untuk section "${type}"` },
    );

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
