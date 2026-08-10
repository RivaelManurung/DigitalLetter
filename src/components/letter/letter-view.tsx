'use client';

import { useState } from 'react';
import { parseSectionContent } from '@/design/schemas';
import { designToCssVars } from '@/design/tokens';
import type { LetterBundle } from '@/design/types';
import { IntroGate } from '../engine/intro/intro-gate';
import { MusicPlayer } from '../engine/music-player';
import { ParticleField } from '../engine/particle-field';
import { SurfaceLayer } from '../engine/surface-layer';
import { SectionRenderer } from './section-renderer';

type Props = {
  letter: LetterBundle;
  /** true saat dirender di dalam iframe preview dashboard */
  preview?: boolean;
};

/**
 * Perakit halaman surat. Menerima data, memasang token desain sebagai CSS
 * custom property, lalu merangkai section sesuai urutannya.
 *
 * Semua "feel" (partikel, surface, intro, musik) dipasang di sini — jadi
 * desain apa pun yang dipilih otomatis mewarisinya.
 */
export function LetterView({ letter, preview = false }: Props) {
  const { design, sections, media } = letter;

  const introSection = sections.find((s) => s.type === 'intro' && s.enabled);
  const flowSections = sections
    .filter((s) => s.enabled && s.type !== 'intro')
    .sort((a, b) => a.order - b.order);

  const audio = media.filter((m) => m.kind === 'audio');

  // Di preview, gerbang intro dilewati supaya editor tidak perlu diklik terus.
  const [opened, setOpened] = useState(preview || !introSection);

  const introContent = introSection
    ? parseSectionContent('intro', introSection.content)
    : null;

  return (
    <div
      className="letter-root"
      data-preview={preview ? 'true' : undefined}
      style={designToCssVars(design)}
    >
      {/* Satu pembungkus untuk semua lapisan latar. Di halaman asli ia
          `display: contents` (anak-anaknya tetap fixed); di preview ia jadi
          panggung sticky setinggi panel. */}
      <div className="stage-layers" aria-hidden="true">
        <SurfaceLayer design={design} />

        <ParticleField
          kind={design.particles.kind}
          density={design.particles.density}
          speed={1 / design.motion.speed}
        />
      </div>

      {introSection && introContent && !preview && (
        <IntroGate
          variant={design.variants.intro}
          hint={introContent.hint}
          label={introContent.label}
          onOpen={() => setOpened(true)}
        />
      )}

      <main>
        {flowSections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            design={design}
            media={media}
          />
        ))}
      </main>

      {audio.length > 0 && !preview && (
        <MusicPlayer tracks={audio} unlocked={opened} />
      )}
    </div>
  );
}
