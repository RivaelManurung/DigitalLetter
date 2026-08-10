import { BLOCKS, type SectionType } from './index';
import {
  compileCustomBlock,
  isCustomType,
  slugOfCustomType,
  type CustomBlockRecord,
} from './custom';
import type { BlockDef } from './kit';

/**
 * Registry gabungan: block bawaan (kode) + block bikinan sendiri (database).
 *
 * Block bawaan selalu tersedia tanpa query. Block bikinan sendiri harus
 * dibawa masuk sebagai daftar `CustomBlockRecord` — dari Server Component
 * yang sudah memuatnya, atau dari props di klien. Tidak ada query di dalam
 * berkas ini, supaya tetap aman dipakai di klien maupun server.
 */

export type BlockRegistry = {
  get(type: string): BlockDef | null;
  has(type: string): boolean;
  types(): string[];
  /** hanya block bikinan sendiri, untuk daftar di dashboard */
  customTypes(): string[];
};

/** Registry tanpa block custom — dipakai saat daftar custom belum dimuat. */
export const BUILTIN_REGISTRY: BlockRegistry = createRegistry([]);

export function createRegistry(customs: CustomBlockRecord[]): BlockRegistry {
  const compiled = new Map<string, BlockDef>();

  for (const row of customs) {
    try {
      compiled.set(`c:${row.slug}`, compileCustomBlock(row));
    } catch {
      // Satu block cacat tidak boleh menjatuhkan editor — lewati saja.
    }
  }

  return {
    get(type) {
      if (isCustomType(type)) return compiled.get(type) ?? null;
      return (BLOCKS as Record<string, BlockDef>)[type] ?? null;
    },
    has(type) {
      return isCustomType(type)
        ? compiled.has(type)
        : type in (BLOCKS as Record<string, unknown>);
    },
    types() {
      return [...(Object.keys(BLOCKS) as string[]), ...compiled.keys()];
    },
    customTypes() {
      return [...compiled.keys()];
    },
  };
}

/**
 * Parse konten lewat registry. Tipe yang tidak dikenal (block custom yang
 * sudah dihapus) menghasilkan objek kosong, bukan galat — surat lama tetap
 * bisa dibuka dan sectionnya tinggal dihapus manual.
 */
export function parseWith(
  registry: BlockRegistry,
  type: string,
  raw: unknown,
): Record<string, unknown> {
  const block = registry.get(type);
  if (!block) return {};

  const result = block.schema.safeParse(raw ?? {});
  if (result.success) return result.data as Record<string, unknown>;
  return block.schema.parse({}) as Record<string, unknown>;
}

/** Varian yang berlaku, dengan block custom ikut diperhitungkan. */
export function resolveVariantWith(
  registry: BlockRegistry,
  type: string,
  sectionVariant: string | undefined,
  designVariant: string | undefined,
): string {
  const block = registry.get(type);
  if (!block) return '';

  const allowed = block.variants as readonly string[];
  if (sectionVariant && allowed.includes(sectionVariant)) return sectionVariant;
  if (designVariant && allowed.includes(designVariant)) return designVariant;
  return allowed[0] ?? '';
}

export function starterWith(
  registry: BlockRegistry,
  type: string,
): Record<string, unknown> {
  const block = registry.get(type);
  if (!block) return {};
  return block.schema.parse(block.starter) as Record<string, unknown>;
}

export { isCustomType, slugOfCustomType };
export type { CustomBlockRecord, SectionType };
