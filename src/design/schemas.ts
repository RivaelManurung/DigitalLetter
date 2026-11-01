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

/**
 * Latar section: warna biasa, atau gradien linear/radial.
 *
 * Nilainya masuk ke properti CSS `background`, jadi bentuknya dibatasi ketat
 * lewat daftar-putih — bukan sekadar "string bebas". Tanpa pagar ini sebuah
 * nilai seperti `url(...)` atau `image-set(...)` bisa menarik sumber luar
 * dari halaman surat yang dilihat publik.
 */
const bgValue = z
  .string()
  .trim()
  .max(400)
  .refine(
    (value) =>
      /^(#[0-9a-fA-F]{3,8}|rgba?\([\d.,\s%]+\))$/.test(value) ||
      /^(linear|radial)-gradient\([#0-9a-zA-Z.,()%\s-]+\)$/.test(value),
    { message: 'Latar harus warna hex/rgba atau linear-gradient()/radial-gradient()' },
  );

/**
 * Gambar latar section. Hanya menerima path relatif atau https — nilainya
 * dibungkus url() saat dirender, jadi bentuk bebas tidak boleh lolos.
 */
const imageUrl = z
  .string()
  .trim()
  .max(600)
  .refine((value) => /^(\/[^\s"')]*|https:\/\/[^\s"')]+)$/.test(value), {
    message: 'Gambar harus path relatif (/...) atau URL https',
  });

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
    image: imageUrl.optional(),
    imageOverlay: z.number().min(0).max(1).optional(),
  }),
  motion: z.object({
    speed: z.number().min(0.4).max(2),
    reveal: z.enum(['fade-up', 'fade', 'blur-in']),
    parallax: z.boolean(),
  }),
  particles: z.object({
    kind: z.enum(['sakura', 'rose', 'dust', 'snow', 'snowflake', 'heart', 'star', 'none']),
    density: z.number().min(0).max(1),
  }),
  music: z.object({ track: z.string().max(40) }).optional(),
  shape: z.object({
    radius: z.number().min(0).max(48),
    glassBlur: z.number().min(0).max(40),
  }),
  variants: variantsSchema,
});

/**
 * Penyesuaian tampilan per section.
 *
 * Semua opsional — tidak diisi berarti "ikut desain surat". Batas nilainya
 * sengaja ketat: panel ini dipakai untuk menyetel rasa, bukan untuk membuat
 * section yang tidak terbaca.
 */
export const sectionStyleSchema = z.object({
  bg: bgValue.optional(),
  bgImage: imageUrl.optional(),
  bgOverlay: z.number().min(0).max(1).optional(),
  text: hexOrRgba.optional(),
  textMuted: hexOrRgba.optional(),
  accent: hexOrRgba.optional(),

  fontPair: z.string().trim().max(60).optional(),
  titleScale: z.number().min(0.5).max(2.5).optional(),
  bodyScale: z.number().min(0.5).max(2).optional(),
  titleTracking: z.number().min(-0.1).max(0.5).optional(),

  padTop: z.number().min(0).max(24).optional(),
  padBottom: z.number().min(0).max(24).optional(),
  maxWidth: z.number().min(320).max(1600).optional(),
  align: z.enum(['left', 'center', 'right']).optional(),

  reveal: z.enum(['fade-up', 'fade', 'blur-in']).optional(),
  speed: z.number().min(0.4).max(2).optional(),
  particleDensity: z.number().min(0).max(1).optional(),
});

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya huruf kecil, angka, dan tanda hubung');
