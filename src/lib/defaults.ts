import { BLOCKS, starterContent, type SectionType } from '@/design/blocks';
import { OCCASIONS, type OccasionId } from '@/design/occasions';

/**
 * Isi awal surat baru. Editor tidak boleh menyambut user dengan halaman
 * kosong — lebih mudah menyunting kalimat yang sudah ada daripada memulai
 * dari nol.
 *
 * Naskahnya tinggal di masing-masing block (design/blocks/*.ts), bukan di
 * sini, supaya satu block cukup disunting di satu tempat.
 */

export function defaultSectionsFor(
  letterId: string,
  recipient: string,
  occasion: OccasionId = 'love',
) {
  const blueprint = OCCASIONS[occasion] ?? OCCASIONS.love;

  return blueprint.sections.map((type, index) => {
    const content = starterContent(type);

    // Sapaan personal kalau nama penerima diisi
    if (type === 'intro' && recipient) {
      content.label = `Untuk ${recipient}`;
    }

    return {
      letterId,
      type,
      order: index,
      enabled: true,
      variant: '',
      content: BLOCKS[type].schema.parse(content) as Record<string, unknown>,
    };
  });
}

export { starterContent };
export type { SectionType };
