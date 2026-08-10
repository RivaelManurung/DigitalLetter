import {
  BLOCKS,
  isListSpec,
  listFieldOf,
  type FieldSpec,
  type LeafSpec,
  type ListSpec,
  type SectionType,
} from '@/design/blocks';

/**
 * Adaptor tipis di atas registry block. Template markdown butuh pandangan
 * yang lebih kasar daripada form editor — hanya perlu tahu satu field ditulis
 * satu baris, blok menjorok, atau daftar id.
 *
 * Tidak ada salinan daftar field di sini: menambah field di sebuah block
 * otomatis ikut terbawa saat ekspor/impor.
 */

/** Bentuk penulisan di markdown, diturunkan dari kind form. */
export type FieldKind = 'line' | 'block' | 'ids';

export type LeafField = {
  key: string;
  label: string;
  kind: FieldKind;
  hint?: string;
  /** nilai yang boleh dipakai — dicantumkan di template supaya tidak dikarang */
  options?: readonly string[];
};

export type ListField = {
  key: string;
  label: string;
  kind: 'list';
  /** judul yang dipakai untuk penanda "### <itemLabel>" */
  itemLabel: string;
  fields: LeafField[];
  hint?: string;
};

export type MarkdownField = LeafField | ListField;

export type SectionSpec = {
  label: string;
  note: string;
  fields: MarkdownField[];
};

export function isListField(field: MarkdownField): field is ListField {
  return field.kind === 'list';
}

function leafToMarkdown(field: LeafSpec): LeafField {
  const kind: FieldKind =
    field.kind === 'longtext' ? 'block' : field.kind === 'photos' ? 'ids' : 'line';

  const hints = [field.hint];
  if (field.kind === 'datetime') hints.push('format: 2026-11-21T08:00');
  if (field.kind === 'switch') hints.push('isi: true atau false');
  if (field.kind === 'photo') hints.push('satu id foto; kosongkan bila tidak ada');
  if (field.kind === 'number') {
    const range = [field.min, field.max].every((n) => n !== undefined)
      ? `angka ${field.min}–${field.max}`
      : 'angka';
    hints.push(range);
  }

  return {
    key: field.key,
    label: field.label,
    kind,
    hint: hints.filter(Boolean).join(' · ') || undefined,
    options: field.options?.map((option) => option.value),
  };
}

function toMarkdownField(field: FieldSpec): MarkdownField {
  if (isListSpec(field)) {
    return {
      key: field.key,
      label: field.label,
      kind: 'list',
      itemLabel: field.itemLabel,
      hint: field.hint,
      fields: field.fields.map(leafToMarkdown),
    };
  }
  return leafToMarkdown(field);
}

export const SECTION_SPECS = Object.fromEntries(
  (Object.keys(BLOCKS) as SectionType[]).map((type) => [
    type,
    {
      label: BLOCKS[type].label,
      note: BLOCKS[type].note,
      fields: BLOCKS[type].fields.map(toMarkdownField),
    } satisfies SectionSpec,
  ]),
) as Record<SectionType, SectionSpec>;

/**
 * Spec markdown untuk sembarang block — bawaan maupun bikinan sendiri.
 * Bentuknya diturunkan dari BlockDef, jadi block custom ikut bisa
 * diekspor & diimpor lewat berkas .md tanpa perlakuan khusus.
 */
export function specOfBlock(block: {
  label: string;
  note: string;
  fields: FieldSpec[];
}): SectionSpec {
  return {
    label: block.label,
    note: block.note,
    fields: block.fields.map(toMarkdownField),
  };
}

/** Satu section paling banyak punya satu field daftar — dipakai parser. */
export function markdownListFieldOf(type: SectionType): ListField | null {
  const spec = listFieldOf(type);
  if (!spec) return null;
  return toMarkdownField(spec as ListSpec) as ListField;
}

/** Versi yang bekerja untuk block apa pun, termasuk bikinan sendiri. */
export function listFieldOfSpec(spec: SectionSpec): ListField | null {
  return (spec.fields.find(isListField) as ListField) ?? null;
}

export { markdownListFieldOf as listFieldOf };
