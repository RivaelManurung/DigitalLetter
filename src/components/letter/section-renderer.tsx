import { parseSectionContent, resolveVariant } from '@/design/blocks';
import type { DesignSpec, MediaRecord, SectionRecord } from '@/design/types';
import { BLOCK_RENDERERS } from './block-renderers';

type Props = {
  section: SectionRecord;
  design: DesignSpec;
  media: MediaRecord[];
  letterId: string;
};

/**
 * Menghubungkan satu SectionRecord ke komponennya. Tipe yang tidak punya
 * renderer (mis. `intro`, yang dirender IntroGate di shell) menghasilkan null,
 * bukan galat — surat lama dengan tipe yang sudah dihapus tetap bisa dibuka.
 */
export function SectionRenderer({ section, design, media, letterId }: Props) {
  const Renderer = BLOCK_RENDERERS[section.type];
  if (!Renderer) return null;

  // Varian per-section menang atas varian bawaan desain.
  const variant = resolveVariant(
    section.type,
    section.variant,
    design.variants[section.type],
  );

  return (
    <Renderer
      content={parseSectionContent(section.type, section.content)}
      design={design}
      variant={variant}
      media={media}
      letterId={letterId}
    />
  );
}
