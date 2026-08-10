import { GLYPH_NAMES } from '@/design/glyphs';
import type { SectionType } from '@/design/types';

/**
 * Metadata field per section — satu-satunya sumber kebenaran untuk template
 * markdown. Dipakai dua arah: menulis template (serialize) dan membacanya
 * kembali (parse). Menambah field di schema = tambahkan di sini juga, supaya
 * field itu ikut terbawa saat ekspor/impor.
 */

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

export type FieldSpec = LeafField | ListField;

export type SectionSpec = {
  label: string;
  note: string;
  fields: FieldSpec[];
};

export function isListField(field: FieldSpec): field is ListField {
  return field.kind === 'list';
}

export const SECTION_SPECS: Record<SectionType, SectionSpec> = {
  intro: {
    label: 'Pembuka',
    note: 'Layar kado sebelum surat terbuka.',
    fields: [
      { key: 'hint', label: 'Teks ajakan', kind: 'line' },
      { key: 'label', label: 'Label di atas kado', kind: 'line', hint: 'boleh kosong' },
    ],
  },
  hero: {
    label: 'Hero',
    note: 'Sampul surat. Judul dipecah dua baris.',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', kind: 'line' },
      { key: 'titleTop', label: 'Judul baris 1', kind: 'line' },
      { key: 'titleBottom', label: 'Judul baris 2', kind: 'line', hint: 'tampil miring & beraksen' },
      { key: 'subtitle', label: 'Subjudul', kind: 'block' },
      { key: 'scrollLabel', label: 'Teks scroll', kind: 'line' },
    ],
  },
  letter: {
    label: 'Surat',
    note: 'Isi surat utama. Pisahkan paragraf dengan satu baris kosong.',
    fields: [
      { key: 'label', label: 'Label', kind: 'line' },
      { key: 'title', label: 'Judul', kind: 'line' },
      { key: 'body', label: 'Isi surat', kind: 'block' },
      { key: 'signature', label: 'Tanda tangan', kind: 'line' },
    ],
  },
  reasons: {
    label: 'Alasan',
    note: 'Daftar alasan. Tambah blok "### alasan" untuk menambah item.',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', kind: 'line' },
      { key: 'title', label: 'Judul', kind: 'line' },
      {
        key: 'items',
        label: 'Alasan',
        kind: 'list',
        itemLabel: 'alasan',
        hint: 'maksimal 24 item',
        fields: [
          { key: 'icon', label: 'Ikon', kind: 'line', options: GLYPH_NAMES },
          { key: 'title', label: 'Judul', kind: 'line' },
          { key: 'body', label: 'Teks', kind: 'block' },
        ],
      },
    ],
  },
  garden: {
    label: 'Taman',
    note: 'Taman bunga. Tambah blok "### bunga" untuk menambah item.',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', kind: 'line' },
      { key: 'title', label: 'Judul', kind: 'line' },
      { key: 'note', label: 'Catatan bawah', kind: 'line' },
      {
        key: 'flowers',
        label: 'Bunga',
        kind: 'list',
        itemLabel: 'bunga',
        hint: 'maksimal 12 item',
        fields: [
          { key: 'flower', label: 'Bentuk', kind: 'line', options: GLYPH_NAMES },
          { key: 'name', label: 'Nama', kind: 'line' },
          { key: 'meaning', label: 'Makna', kind: 'line' },
        ],
      },
    ],
  },
  gallery: {
    label: 'Galeri',
    note: 'Foto diunggah di tab Media — di sini hanya pemilihannya.',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', kind: 'line' },
      { key: 'title', label: 'Judul', kind: 'line' },
      {
        key: 'mediaIds',
        label: 'Foto terpilih',
        kind: 'ids',
        hint: 'id dipisah koma; kosongkan untuk memakai semua foto',
      },
    ],
  },
  finale: {
    label: 'Penutup',
    note: 'Bagian penutup surat.',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', kind: 'line' },
      { key: 'title', label: 'Judul', kind: 'line' },
      { key: 'body', label: 'Isi', kind: 'block' },
      { key: 'signature', label: 'Tanda tangan', kind: 'line' },
    ],
  },
};

/** Satu section paling banyak punya satu field daftar — dipakai parser. */
export function listFieldOf(type: SectionType): ListField | null {
  return (SECTION_SPECS[type].fields.find(isListField) as ListField) ?? null;
}
