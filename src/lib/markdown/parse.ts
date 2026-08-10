import { isSectionType, type SectionType } from '@/design/blocks';
import { SECTION_SPECS, isListField, listFieldOf, type LeafField } from './fields';

/**
 * Markdown → konten section. Parser sengaja pemaaf: berkas yang diedit
 * manusia (atau AI) jarang rapi. Yang tidak dikenali dicatat sebagai
 * peringatan, bukan dilempar sebagai galat — supaya satu salah ketik tidak
 * membuang seluruh isi surat. Validasi ketat tetap dilakukan oleh schema Zod
 * di Server Action.
 */

export type ParsedSection = {
  type: SectionType;
  /** kemunculan ke-berapa untuk tipe ini (1-based) — block boleh berulang */
  nth: number;
  content: Record<string, unknown>;
};

export type ParseResult = {
  sections: ParsedSection[];
  warnings: string[];
};

const HEADING = /^##\s*\[([a-zA-Z]+)(?:#(\d+))?\]/;
const ITEM_HEADING = /^###\s+/;
const KEY_LINE = /^([A-Za-z][A-Za-z0-9_]*)\s*:[ \t]?(.*)$/;
const COMMENT = /^<!--/;
const BLOCK_MARKER = /^[>|]$/;

const MAX_LINES = 6000;

export function parseLetterMarkdown(input: string): ParseResult {
  const lines = input.replace(/\r\n?/g, '\n').split('\n');
  const warnings: string[] = [];

  if (lines.length > MAX_LINES) {
    return { sections: [], warnings: ['Berkas terlalu panjang untuk diproses.'] };
  }

  // Block boleh berulang, jadi hasilnya daftar terurut — bukan peta per tipe.
  const found: ParsedSection[] = [];
  const counts = new Map<SectionType, number>();

  let type: SectionType | null = null;
  let current: ParsedSection | null = null;
  let target: Record<string, unknown> | null = null;
  let inItem = false;
  let lastKey: string | null = null;
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();
    index += 1;

    if (!trimmed || COMMENT.test(trimmed)) continue;

    const heading = HEADING.exec(trimmed);
    if (heading) {
      const candidate = heading[1].toLowerCase();
      inItem = false;
      lastKey = null;

      if (!isSectionType(candidate)) {
        warnings.push(`Tipe section "${candidate}" tidak dikenal — dilewati.`);
        type = null;
        current = null;
        target = null;
        continue;
      }

      // Nomor eksplisit "[letter#2]" dihormati; tanpa nomor, urutan
      // kemunculan yang menentukan.
      const explicit = heading[2] ? Number(heading[2]) : 0;
      const nth = explicit || (counts.get(candidate) ?? 0) + 1;
      counts.set(candidate, Math.max(nth, counts.get(candidate) ?? 0));

      if (found.some((s) => s.type === candidate && s.nth === nth)) {
        warnings.push(
          `Section "${candidate}#${nth}" muncul lebih dari sekali — isian terakhir yang dipakai.`,
        );
      }

      type = candidate;
      target = {};
      current = { type: candidate, nth, content: target };
      found.push(current);
      continue;
    }

    if (!type || !target || !current) continue; // teks pengantar sebelum section pertama

    if (ITEM_HEADING.test(trimmed)) {
      const list = listFieldOf(type);
      lastKey = null;

      if (!list) {
        warnings.push(`Section "${type}" tidak punya daftar item — blok "###" dilewati.`);
        continue;
      }

      const bucket = (current.content[list.key] ??= []) as Record<string, unknown>[];
      const item: Record<string, unknown> = {};
      bucket.push(item);
      target = item;
      inItem = true;
      continue;
    }

    const keyed = KEY_LINE.exec(line);
    if (keyed) {
      const [, key, rawValue] = keyed;
      let field = fieldFor(type, inItem, key);

      // Field milik section bisa ditulis setelah blok daftar (mis. `address`
      // sesudah daftar rekening). Begitu ketemu key yang bukan milik item,
      // kembali ke tingkat section — kalau tidak, isinya hilang diam-diam.
      if (!field && inItem) {
        const own = fieldFor(type, false, key);
        if (own) {
          field = own;
          inItem = false;
          target = current.content;
        }
      }

      if (!field) {
        warnings.push(`Field "${key}" tidak dikenal di section "${type}" — diabaikan.`);
        lastKey = null;
        continue;
      }

      if (BLOCK_MARKER.test(rawValue.trim())) {
        const block = readBlock(lines, index);
        index = block.next;
        target[key] = coerce(field, block.value);
      } else {
        target[key] = coerce(field, rawValue.trim());
      }

      lastKey = key;
      continue;
    }

    // Baris lepas: dianggap lanjutan field terakhir, supaya teks multi-baris
    // yang ditulis tanpa penanda ">" tidak hilang diam-diam.
    if (lastKey && typeof target[lastKey] === 'string') {
      const current = target[lastKey] as string;
      target[lastKey] = current ? `${current}\n${trimmed}` : trimmed;
    }
  }

  const sections = found;

  if (!sections.length) {
    warnings.push(
      'Tidak ada section yang ditemukan. Pastikan berkas memakai format "## [tipe]".',
    );
  }

  return { sections, warnings };
}

/** Kumpulkan baris menjorok setelah penanda ">" lalu buang indentasinya. */
function readBlock(lines: string[], start: number): { value: string; next: number } {
  const collected: string[] = [];
  let cursor = start;

  while (cursor < lines.length) {
    const line = lines[cursor];
    if (line.trim() && !/^[ \t]/.test(line)) break;
    collected.push(line);
    cursor += 1;
  }

  while (collected.length && !collected[collected.length - 1].trim()) collected.pop();

  const indents = collected
    .filter((line) => line.trim())
    .map((line) => line.length - line.trimStart().length);
  const shift = indents.length ? Math.min(...indents) : 0;

  return {
    value: collected.map((line) => line.slice(shift).trimEnd()).join('\n'),
    next: cursor,
  };
}

/**
 * Field bernama sama bisa ada di dua tingkat (mis. `title` di section
 * "reasons" dan di tiap itemnya), jadi tingkat yang sedang aktif menentukan
 * field mana yang dipakai.
 */
function fieldFor(type: SectionType, inItem: boolean, key: string): LeafField | null {
  const spec = SECTION_SPECS[type];

  if (inItem) {
    const list = spec.fields.find(isListField);
    return list?.fields.find((field) => field.key === key) ?? null;
  }

  const own = spec.fields.find((field) => field.key === key && !isListField(field));
  return (own as LeafField) ?? null;
}

function coerce(field: LeafField, value: string): unknown {
  if (field.kind === 'ids') {
    return value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return value;
}
