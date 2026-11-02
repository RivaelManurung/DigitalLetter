'use client';

import { useMemo, useState } from 'react';
import { parseSectionContent, resolveVariant } from '@/design/blocks';
import { createRegistry } from '@/design/blocks/resolve';
import { designToCssVars } from '@/design/tokens';
import type { LetterBundle, MediaRecord } from '@/design/types';
import { IntroGate } from '../engine/intro/intro-gate';
import { MusicPlayer } from '../engine/music-player';
import { SynthPlayer } from '../engine/synth-player';
import { getTrack, playlistFrom } from '@/design/music-tracks';
import { ParticleField } from '../engine/particle-field';
import { SurfaceLayer } from '../engine/surface-layer';
import { AmbientLayer } from '../engine/ambient/ambient-layer';
import { TapBurst } from '../engine/tap-burst';
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

  // Block bikinan sendiri ikut dibawa di bundle, jadi halaman surat tidak
  // perlu query tambahan — termasuk saat dirender di preview dashboard.
  const registry = useMemo(
    () => createRegistry(letter.customBlocks ?? []),
    [letter.customBlocks],
  );

  const introSection = sections.find((s) => s.type === 'intro' && s.enabled);
  const flowSections = sections
    .filter((s) => s.enabled && s.type !== 'intro')
    .sort((a, b) => a.order - b.order);

  const uploaded = media.filter((m) => m.kind === 'audio');
  // Lagu unggahan menang; kalau tidak ada, pakai rekaman bawaan pilihan desain.
  const audio: MediaRecord[] = uploaded.length
    ? uploaded
    : playlistFrom(design.music?.track ?? '').map((t, i) => ({
        id: `builtin-${t.id}`,
        kind: 'audio',
        path: t.src,
        url: t.src,
        caption: null,
        order: i,
        meta: { title: t.title, artist: t.artist },
      }));

  // Di preview, gerbang intro dilewati supaya editor tidak perlu diklik terus.
  const [opened, setOpened] = useState(preview || !introSection);

  const introContent = introSection
    ? parseSectionContent('intro', introSection.content)
    : null;

  return (
    <div
      className="letter-root"
      data-preview={preview ? 'true' : undefined}
      data-title={design.motion.title ?? 'none'}
      style={designToCssVars(design)}
    >
      {/* Satu pembungkus untuk semua lapisan latar. Di halaman asli ia
          `display: contents` (anak-anaknya tetap fixed); di preview ia jadi
          panggung sticky setinggi panel. */}
      <div className="stage-layers" aria-hidden="true">
        <SurfaceLayer design={design} />
        <AmbientLayer kind={design.motion.ambient} />

        <ParticleField
          kind={design.particles.kind}
          density={design.particles.density}
          speed={1 / design.motion.speed}
        />
      </div>

      {introSection && introContent && !preview && (
        <IntroGate
          variant={resolveVariant('intro', introSection.variant, design.variants.intro)}
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
            letterId={letter.id}
            registry={registry}
          />
        ))}
      </main>

      {!preview && <div className="scroll-thread" aria-hidden="true" />}

      {design.motion.tapBurst && !preview && <TapBurst kind={design.particles.kind} />}

      {audio.length > 0 && !preview && (
        <MusicPlayer tracks={audio} unlocked={opened} />
      )}

      {audio.length === 0 && !preview && getTrack(design.music?.track) && (
        <SynthPlayer trackId={design.music!.track} unlocked={opened} />
      )}
    </div>
  );
}
