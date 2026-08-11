import type { BlockRegistry } from '@/design/blocks/resolve';
import { isCustomType, parseWith, resolveVariantWith } from '@/design/blocks/resolve';
import type { DesignSpec, MediaRecord, SectionRecord } from '@/design/types';
import { CustomSection } from '../sections/custom';
import { BLOCK_RENDERERS } from './block-renderers';
import { SectionShell } from './section-shell';

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

  // Section boleh memilih gaya reveal sendiri. Komponen membacanya dari
  // `design.motion.reveal`, jadi penyesuaiannya dititipkan lewat salinan
  // design — bukan dengan menambah prop ke 20 komponen section.
  const scoped = scopeDesign(design, section.style);

  const body = isCustomType(section.type) ? (
    <CustomSection
      content={content}
      design={scoped}
      variant={variant}
      media={media}
      fields={block.fields}
    />
  ) : (
    renderBlock()
  );

  function renderBlock() {
    const Renderer = BLOCK_RENDERERS[section.type as keyof typeof BLOCK_RENDERERS];
    if (!Renderer) return null;

    return (
      <Renderer
        content={content}
        design={scoped}
        variant={variant}
        media={media}
        letterId={letterId}
      />
    );
  }

  if (!body) return null;

  return <SectionShell style={section.style}>{body}</SectionShell>;
}

/** Salinan design dengan penyesuaian milik section — tanpa mengubah aslinya. */
function scopeDesign(design: DesignSpec, style: SectionRecord['style']): DesignSpec {
  if (!style?.reveal && typeof style?.particleDensity !== 'number') return design;

  return {
    ...design,
    motion: { ...design.motion, reveal: style.reveal ?? design.motion.reveal },
    particles: {
      ...design.particles,
      density: style.particleDensity ?? design.particles.density,
    },
  };
}
