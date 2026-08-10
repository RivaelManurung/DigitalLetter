import { parseSectionContent } from '@/design/schemas';
import type { SectionRecord, SectionType } from '@/design/types';
import { SECTION_SPECS, isListField, type FieldSpec, type LeafField } from './fields';

/**
 * Section → markdown. Format sengaja dibuat jelas dan berulang supaya mudah
 * diedit manusia maupun AI: satu section satu heading "## [tipe]", satu field
 * satu baris "key: value", teks panjang pakai ">" lalu menjorok dua spasi.
 */

const INDENT = '  ';
const LINE_MAX = 90;

export const TEMPLATE_VERSION = 1;

const GUIDE = [
  `<!-- Digital Letter — template konten v${TEMPLATE_VERSION} -->`,
  '',
  '> **Cara pakai.** Ubah teks di bawah lalu unggah kembali lewat tombol',
  '> "Impor .md" di tab Konten. Bagian yang tidak ada di berkas ini tidak',
  '> akan diubah.',
  '>',
  '> **Aturan yang tidak boleh dilanggar:**',
  '> 1. Jangan ubah baris `## [tipe]` dan nama field sebelum tanda titik dua.',
  '> 2. Teks panjang ditulis dengan `field: >` lalu baris berikutnya menjorok',
  '>    dua spasi. Baris kosong di dalamnya menjadi paragraf baru.',
  '> 3. Untuk menambah item daftar, salin seluruh blok `### ...` beserta',
  '>    field-nya.',
  '> 4. Format teks yang didukung: `**tebal**`, `*miring*`, dan baris baru.',
  '',
].join('\n');

type Options = {
  /** panduan penggunaan di bagian atas berkas */
  guide?: boolean;
};

export function sectionsToMarkdown(
  sections: SectionRecord[],
  options: Options = {},
): string {
  const ordered = [...sections].sort((a, b) => a.order - b.order);
  const blocks = ordered.map((section) => sectionBlock(section));
  const head = options.guide === false ? '' : `${GUIDE}\n`;
  return `${head}${blocks.join('\n')}`.trimEnd() + '\n';
}

function sectionBlock(section: SectionRecord): string {
  const spec = SECTION_SPECS[section.type];
  const content = parseSectionContent(section.type, section.content) as Record<
    string,
    unknown
  >;

  const lines: string[] = [
    `## [${section.type}] ${spec.label}`,
    `<!-- ${spec.note} -->`,
  ];

  if (!section.enabled) {
    lines.push('<!-- section ini sedang disembunyikan di editor -->');
  }

  lines.push('');

  for (const field of spec.fields) {
    if (isListField(field)) {
      const items = Array.isArray(content[field.key])
        ? (content[field.key] as Record<string, unknown>[])
        : [];
      lines.push(`<!-- ${field.label}${field.hint ? ` — ${field.hint}` : ''} -->`);
      for (const leaf of field.fields) {
        if (leaf.options) {
          lines.push(`<!-- ${leaf.key}: pilih salah satu — ${leaf.options.join(', ')} -->`);
        }
      }
      for (const item of items) {
        lines.push('', `### ${field.itemLabel}`);
        for (const leaf of field.fields) {
          lines.push(...leafLines(leaf, item[leaf.key]));
        }
      }
      lines.push('');
      continue;
    }

    lines.push(...leafLines(field, content[field.key]));
  }

  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n')}\n`;
}

function leafLines(field: LeafField, raw: unknown): string[] {
  const hint = field.hint ? [`<!-- ${field.label} — ${field.hint} -->`] : [];

  if (field.kind === 'ids') {
    const ids = Array.isArray(raw) ? raw.map(String) : [];
    return [...hint, ids.length ? `${field.key}: ${ids.join(', ')}` : `${field.key}:`];
  }

  const value = typeof raw === 'string' ? raw : raw == null ? '' : String(raw);

  if (field.kind === 'block' || value.includes('\n') || value.length > LINE_MAX) {
    if (!value) return [...hint, `${field.key}: >`];
    const body = value
      .split('\n')
      .map((line) => (line.trim() ? `${INDENT}${line}` : ''))
      .join('\n');
    return [...hint, `${field.key}: >`, body];
  }

  return [...hint, `${field.key}: ${value}`];
}

export function markdownFileName(slug: string): string {
  const safe = slug.replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'surat';
  return `surat-${safe}.md`;
}

/** Daftar tipe yang dikenali — dipakai pesan galat parser. */
export const KNOWN_TYPES: SectionType[] = Object.keys(SECTION_SPECS) as SectionType[];

export type { FieldSpec };
