import { z } from 'zod';
import { GLYPH_NAMES, GLYPH_LABEL } from '@/design/glyphs';

/**
 * Perkakas untuk mendeklarasikan satu block.
 *
 * Satu block = satu berkas yang menyatakan SELURUH dirinya: schema Zod,
 * naskah awal, varian layout, dan spec form. Tidak ada daftar paralel yang
 * harus ikut disunting — form editor, template markdown, tombol "tambah
 * section", dan validasi Server Action semuanya dibangkitkan dari sini.
 *
 * Menambah block baru = buat berkas di folder ini + daftarkan di index.ts +
 * pasangkan komponennya di block-renderers.tsx. Tidak ada migration database,
 * karena content disimpan sebagai JSONB.
 */

export const text = (max = 280) => z.string().trim().max(max);
export const richText = (max = 1200) => z.string().trim().max(max);

/**
 * Impor markdown selalu menghasilkan string ("true", "5"), jadi field non-teks
 * harus menerima bentuk teksnya juga. Tanpa ini satu berkas .md yang sah akan
 * ditolak schema.
 */
export const flag = (fallback: boolean) =>
  z
    .union([z.boolean(), z.string()])
    .transform((value) =>
      typeof value === 'boolean' ? value : !/^(false|0|tidak|no)$/i.test(value.trim()),
    )
    .default(fallback);

export const count = (min: number, max: number, fallback: number) =>
  z
    .union([z.number(), z.string()])
    .transform((value) => (typeof value === 'number' ? value : Number(value.trim())))
    .refine((value) => Number.isFinite(value), { message: 'Harus berupa angka' })
    .transform((value) => Math.min(max, Math.max(min, Math.round(value))))
    .default(fallback);

/* ── Spec form ─────────────────────────────────────────────────
 * Metadata yang cukup untuk membangkitkan tiga hal sekaligus:
 *   1. form editor (kind → komponen input)
 *   2. template markdown (kind → line/block/ids)
 *   3. petunjuk isi untuk manusia & AI (label, hint, options)
 */

export type FieldKind =
  | 'text'
  | 'longtext'
  | 'select'
  | 'number'
  | 'switch'
  | 'datetime'
  /** banyak foto: array id media */
  | 'photos'
  /** satu foto: satu id media */
  | 'photo';

export type SelectOption = { value: string; label: string };

export type LeafSpec = {
  key: string;
  label: string;
  kind: FieldKind;
  hint?: string;
  /** hanya untuk kind 'select' */
  options?: readonly SelectOption[];
  /** hanya untuk kind 'longtext' — tinggi textarea */
  rows?: number;
  /** hanya untuk kind 'number' */
  min?: number;
  max?: number;
  step?: number;
  /** tata letak: field dengan span sama digabung dalam satu baris grid */
  span?: 'full' | 'half' | 'third';
};

export type ListSpec = {
  key: string;
  label: string;
  kind: 'list';
  /** penanda item di markdown: "### <itemLabel>" */
  itemLabel: string;
  hint?: string;
  fields: LeafSpec[];
  /** nilai item baru saat tombol "Tambah" ditekan */
  create: () => Record<string, unknown>;
};

export type FieldSpec = LeafSpec | ListSpec;

export function isListSpec(field: FieldSpec): field is ListSpec {
  return field.kind === 'list';
}

/**
 * Pilihan ikon/bunga — dipakai banyak block, jadi disediakan sekali di sini.
 * Bersumber dari design/glyphs (data murni), bukan dari komponen SVG-nya,
 * supaya berkas ini tetap aman diimpor dari Server Action.
 */
export const glyphOptions: readonly SelectOption[] = GLYPH_NAMES.map((name) => ({
  value: name,
  label: GLYPH_LABEL[name],
}));

/* ── Definisi block ────────────────────────────────────────── */

export type BlockDef<S extends z.ZodTypeAny = z.ZodTypeAny> = {
  /** nama yang tampil di editor */
  label: string;
  /** satu kalimat penjelas — dipakai di template markdown & tombol tambah */
  note: string;
  schema: S;
  /** varian layout; varian pertama adalah bawaan */
  variants: readonly string[];
  /** naskah awal supaya editor tidak menyambut user dengan form kosong */
  starter: z.input<S>;
  fields: FieldSpec[];
  /** block yang hanya boleh muncul sekali dalam satu surat */
  unique?: boolean;
  /** dikelompokkan di tombol "tambah section" */
  group: BlockGroup;
};

export type BlockGroup = 'dasar' | 'nikahan' | 'interaksi' | 'perayaan';

export const GROUP_LABEL: Record<BlockGroup, string> = {
  dasar: 'Dasar',
  nikahan: 'Nikahan',
  interaksi: 'Interaksi',
  perayaan: 'Perayaan',
};

/** Identitas fungsi: menjaga inferensi tipe schema tetap utuh saat dideklarasikan. */
export function defineBlock<S extends z.ZodTypeAny>(def: BlockDef<S>): BlockDef<S> {
  return def;
}
