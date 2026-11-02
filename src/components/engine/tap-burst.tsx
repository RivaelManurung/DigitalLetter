'use client';

import { useEffect } from 'react';
import { PARTICLE_SPRITES } from '@/design/theme-images';
import type { ParticleKind } from '@/design/types';

type Props = { kind: ParticleKind };

const COUNT = 9;
const INTERACTIVE = 'button, a, input, textarea, select, label, canvas, [role="button"], [contenteditable]';

/**
 * Ketukan di area kosong memercikkan partikel tema dari titik sentuh.
 * Elemen dibuat langsung di DOM dan dihapus sendiri — tidak memicu render React.
 */
export function TapBurst({ kind }: Props) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const sprites: readonly string[] =
      kind in PARTICLE_SPRITES ? PARTICLE_SPRITES[kind as keyof typeof PARTICLE_SPRITES] : [];

    function onDown(e: PointerEvent) {
      const target = e.target as Element | null;
      if (!target || target.closest(INTERACTIVE) || target.closest('.intro-gate')) return;

      for (let i = 0; i < COUNT; i++) {
        const angle = (i / COUNT) * Math.PI * 2 + Math.random() * 0.6;
        const dist = 50 + Math.random() * 60;
        const el = document.createElement(sprites.length ? 'img' : 'span');
        el.className = 'tap-bit';
        if (el instanceof HTMLImageElement) {
          el.src = sprites[i % sprites.length];
          el.alt = '';
        } else {
          el.dataset.shape = kind === 'snow' || kind === 'snowflake' ? 'snow' : 'spark';
        }
        el.style.left = `${e.clientX}px`;
        el.style.top = `${e.clientY}px`;
        el.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
        el.style.setProperty('--ty', `${Math.sin(angle) * dist - 30}px`);
        el.style.setProperty('--rot', `${(Math.random() - 0.5) * 540}deg`);
        el.style.setProperty('--sz', `${14 + Math.random() * 12}px`);
        document.body.appendChild(el);
        el.addEventListener('animationend', () => el.remove(), { once: true });
      }
    }

    window.addEventListener('pointerdown', onDown, { passive: true });
    return () => window.removeEventListener('pointerdown', onDown);
  }, [kind]);

  return null;
}
