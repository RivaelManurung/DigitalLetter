import type { BlockRegistry } from '@/design/blocks/resolve';
import { isCustomType, parseWith, resolveVariantWith } from '@/design/blocks/resolve';
import type { DesignSpec, MediaRecord, SectionRecord } from '@/design/types';
import { CustomSection } from '../sections/custom';
import { BLOCK_RENDERERS } from './block-renderers';

type Props = {
  section: SectionRecord;
  design: DesignSpec;
  media: MediaRecord[];
  letterId: string;
  registry: BlockRegistry;
};

/**
 * Menghubungkan satu SectionRecord ke komponennya.
 *
 * Block bawaan punya komponennya sendiri di BLOCK_RENDERERS. Block bikinan
 * sendiri semuanya dirender CustomSection, yang menyusun tampilan dari spec
 * field-nya. Tipe yang tidak dikenal menghasilkan null, bukan galat — surat
 * lama dengan block yang sudah dihapus tetap bisa dibuka.
 */
export function SectionRenderer({ section, design, media, letterId, registry }: Props) {
  const block = registry.get(section.type);
  if (!block) return null;

  const variant = resolveVariantWith(
    registry,
    section.type,
    section.variant,
    design.variants[section.type as keyof typeof design.variants],
  );

  const content = parseWith(registry, section.type, section.content);

  if (isCustomType(section.type)) {
    return (
      <CustomSection
        content={content}
        design={design}
        variant={variant}
        media={media}
        fields={block.fields}
      />
    );
  }

  const Renderer = BLOCK_RENDERERS[section.type as keyof typeof BLOCK_RENDERERS];
  if (!Renderer) return null;

  return (
    <Renderer
      content={content}
      design={design}
      variant={variant}
      media={media}
      letterId={letterId}
    />
  );
}
