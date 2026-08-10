import { z } from 'zod';
import {
  count,
  flag,
  glyphOptions,
  richText,
  text,
  type BlockDef,
  type FieldSpec,
  type LeafSpec,
  type ListSpec,
  type SelectOption,
} from './kit';

/**
 * Block bikinan sendiri — didefinisikan lewat dashboard, bukan lewat kode.
 *
 * Bentuknya sama persis dengan block bawaan (BlockDef), bedanya schema Zod
 * dan naskah awalnya DIBANGKITKAN dari daftar field yang disimpan di
 * database. Karena hasilnya BlockDef biasa, seluruh sistem yang sudah ada —
 * form editor, template markdown, varian layout, validasi Server Action —
 * bekerja tanpa tahu block itu bawaan atau bikinan sendiri.
 *
 * Tipe section-nya diberi awalan "c:" supaya tidak pernah bentrok dengan
 * block bawaan, sekarang maupun nanti.
 */

export const CUSTOM_PREFIX = 'c:';

export function isCustomType(type: string): boolean {
  return type.startsWith(CUSTOM_PREFIX);
}

export function customTypeOf(slug: string): string {
  return `${CUSTOM_PREFIX}${slug}`;
}

export function slugOfCustomType(type: string): string {
  return type.slice(CUSTOM_PREFIX.length);
}

/* ── Spec yang disimpan di database ────────────────────────── */

/** Jenis field yang boleh dipakai user. Sengaja terbatas — semuanya sudah
 *  punya input di form generator dan penulisan di template markdown. */
export const CUSTOM_FIELD_KINDS = [
  'text',
  'longtext',
  'select',
  'number',
  'switch',
  'datetime',
  'photo',
  'photos',
] as const;

export type CustomFieldKind = (typeof CUSTOM_FIELD_KINDS)[number];

export const CUSTOM_FIELD_LABEL: Record<CustomFieldKind, string> = {
  text: 'Teks singkat',
  longtext: 'Teks panjang',
  select: 'Pilihan',
  number: 'Angka',
  switch: 'Ya / Tidak',
  datetime: 'Tanggal & jam',
  photo: 'Satu foto',
  photos: 'Banyak foto',
};

/** Satu field di dalam block bikinan sendiri. */
const customFieldSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[a-z][a-zA-Z0-9]*$/, 'Kunci diawali huruf kecil, tanpa spasi'),
  label: z.string().trim().min(1).max(80),
  kind: z.enum(CUSTOM_FIELD_KINDS),
  hint: z.string().trim().max(160).default(''),
  /** khusus kind 'select' — satu pilihan per baris */
  options: z.array(z.string().trim().max(80)).max(40).default([]),
  /** khusus kind 'select' — pakai daftar ikon bawaan alih-alih options */
  useGlyphs: z.boolean().default(false),
  rows: z.number().int().min(1).max(20).default(3),
  min: z.number().default(0),
  max: z.number().default(9999),
  span: z.enum(['full', 'half', 'third']).default('full'),
  /** nilai awal, selalu disimpan sebagai teks lalu dikonversi saat dipakai */
  starter: z.string().max(2000).default(''),
});

export type CustomField = z.infer<typeof customFieldSchema>;

/** Field daftar: sekelompok field yang bisa diulang (mis. daftar sponsor). */
const customListSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[a-z][a-zA-Z0-9]*$/, 'Kunci diawali huruf kecil, tanpa spasi'),
  label: z.string().trim().min(1).max(80),
  kind: z.literal('list'),
  itemLabel: z.string().trim().min(1).max(40).default('item'),
  hint: z.string().trim().max(160).default(''),
  max: z.number().int().min(1).max(60).default(20),
  fields: z.array(customFieldSchema).min(1).max(12),
});

export type CustomList = z.infer<typeof customListSchema>;

export const customBlockSpecSchema = z.object({
  fields: z.array(z.union([customListSchema, customFieldSchema])).max(30).default([]),
});

export type CustomBlockSpec = z.infer<typeof customBlockSpecSchema>;

export type CustomFieldSpec = CustomField | CustomList;

export function isCustomList(field: CustomFieldSpec): field is CustomList {
  return field.kind === 'list';
}

/* ── Tata letak ────────────────────────────────────────────── */

/**
 * Pola tata letak yang bisa dipilih. Tiap pola punya varian sendiri, dan
 * semuanya dirender oleh satu komponen generik (sections/custom.tsx).
 */
export const CUSTOM_LAYOUTS = {
  cards: { label: 'Kartu', variants: ['cards', 'list', 'timeline'] },
  timeline: { label: 'Linimasa', variants: ['timeline', 'cards', 'list'] },
  spotlight: { label: 'Sorotan', variants: ['spotlight', 'centered', 'large'] },
  split: { label: 'Dua kolom', variants: ['split', 'stacked', 'cards'] },
} as const;

export type CustomLayout = keyof typeof CUSTOM_LAYOUTS;

export const CUSTOM_LAYOUT_IDS = Object.keys(CUSTOM_LAYOUTS) as CustomLayout[];

export function isCustomLayout(value: unknown): value is CustomLayout {
  return typeof value === 'string' && value in CUSTOM_LAYOUTS;
}

/* ── Kompilasi spec → BlockDef ─────────────────────────────── */

function leafZod(field: CustomField): z.ZodTypeAny {
  switch (field.kind) {
    case 'longtext':
      return richText(4000);
    case 'number':
      return count(field.min, field.max, clampNumber(field.starter, field.min, field.max));
    case 'switch':
      return flag(/^(true|1|ya|yes)$/i.test(field.starter.trim()));
    case 'photos':
      return z.array(z.string()).max(40).default([]);
    case 'select':
    case 'datetime':
    case 'photo':
    case 'text':
    default:
      return text(600);
  }
}

function clampNumber(raw: string, min: number, max: number): number {
  const parsed = Number(raw.trim());
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function optionsOf(field: CustomField): readonly SelectOption[] | undefined {
  if (field.kind !== 'select') return undefined;
  if (field.useGlyphs) return glyphOptions;
  return field.options
    .filter(Boolean)
    .map((option) => ({ value: option, label: option }));
}

function leafToSpec(field: CustomField): LeafSpec {
  return {
    key: field.key,
    label: field.label,
    kind: field.kind,
    hint: field.hint || undefined,
    options: optionsOf(field),
    rows: field.kind === 'longtext' ? field.rows : undefined,
    min: field.kind === 'number' ? field.min : undefined,
    max: field.kind === 'number' ? field.max : undefined,
    span: field.span,
  };
}

/** Nilai awal satu field, dalam bentuk yang diterima schema-nya. */
function leafStarter(field: CustomField): unknown {
  switch (field.kind) {
    case 'switch':
      return /^(true|1|ya|yes)$/i.test(field.starter.trim());
    case 'number':
      return clampNumber(field.starter, field.min, field.max);
    case 'photos':
      return [];
    default:
      return field.starter;
  }
}

export type CustomBlockRecord = {
  slug: string;
  label: string;
  note: string;
  layout: string;
  spec: unknown;
  starter: unknown;
};

/**
 * Mengubah satu baris custom_block menjadi BlockDef yang setara dengan block
 * bawaan. Spec rusak tidak melempar galat — field yang tidak valid dibuang,
 * supaya satu block cacat tidak menjatuhkan seluruh editor.
 */
export function compileCustomBlock(row: CustomBlockRecord): BlockDef {
  const parsedSpec = customBlockSpecSchema.safeParse(row.spec ?? {});
  const spec: CustomBlockSpec = parsedSpec.success ? parsedSpec.data : { fields: [] };

  const layout: CustomLayout = isCustomLayout(row.layout) ? row.layout : 'cards';

  const shape: Record<string, z.ZodTypeAny> = {};
  const fields: FieldSpec[] = [];
  const starter: Record<string, unknown> = {};

  // Judul & eyebrow selalu ada — tiap section butuh kepala yang konsisten.
  shape.eyebrow = text(80).default('');
  shape.title = text(160).default('');
  fields.push(
    { key: 'eyebrow', label: 'Eyebrow', kind: 'text', hint: 'Teks kecil di atas judul' },
    { key: 'title', label: 'Judul', kind: 'text' },
  );

  for (const field of spec.fields) {
    if (isCustomList(field)) {
      const itemShape: Record<string, z.ZodTypeAny> = {};
      const itemFields: LeafSpec[] = [];
      const itemStarter: Record<string, unknown> = {};

      for (const leaf of field.fields) {
        itemShape[leaf.key] = leafZod(leaf);
        itemFields.push(leafToSpec(leaf));
        itemStarter[leaf.key] = leafStarter(leaf);
      }

      shape[field.key] = z.array(z.object(itemShape)).max(field.max).default([]);
      fields.push({
        key: field.key,
        label: field.label,
        kind: 'list',
        itemLabel: field.itemLabel,
        hint: field.hint || undefined,
        fields: itemFields,
        create: () => ({ ...itemStarter }),
      } satisfies ListSpec);

      starter[field.key] = [];
      continue;
    }

    shape[field.key] = leafZod(field);
    fields.push(leafToSpec(field));
    starter[field.key] = leafStarter(field);
  }

  const schema = z.object(shape);

  // Naskah awal yang disimpan user menang atas nilai awal per field.
  const savedStarter =
    row.starter && typeof row.starter === 'object'
      ? (row.starter as Record<string, unknown>)
      : {};

  return {
    label: row.label,
    note: row.note,
    schema,
    variants: CUSTOM_LAYOUTS[layout].variants,
    starter: { ...starter, ...savedStarter },
    fields,
    group: 'custom',
  } as BlockDef;
}
