import { OCCASIONS, OCCASION_IDS, type OccasionId } from '@/design/occasions';

/**
 * Occasion bawaan dalam bentuk yang sama dengan template bikinan sendiri,
 * supaya UI bisa menampilkan keduanya berdampingan.
 *
 * Sengaja BUKAN di berkas 'use server': isinya murni data dari kode, tanpa
 * query — dan Server Action mewajibkan setiap ekspornya async.
 */

export type OccasionRow = {
  id: OccasionId;
  slug: OccasionId;
  label: string;
  note: string;
  preset: string;
  sectionCount: number;
  builtin: true;
};

export function listOccasions(): OccasionRow[] {
  return OCCASION_IDS.map((id) => ({
    id,
    slug: id,
    label: OCCASIONS[id].label,
    note: OCCASIONS[id].note,
    preset: OCCASIONS[id].preset,
    sectionCount: OCCASIONS[id].sections.length,
    builtin: true as const,
  }));
}
