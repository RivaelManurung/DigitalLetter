'use client';

import { useEffect, useRef } from 'react';
import type { ParticleKind } from '@/design/types';
import { detectTier, particleBudget } from './device-tier';
import { drawPetal, type PetalShape } from './petal-shapes';

type Props = {
  kind: ParticleKind;
  density: number;
  speed: number;
};

type Particle = {
  x: number;
  y: number;
  z: number; // 0–1, kedalaman → ukuran, opasitas, dan kecepatan
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  size: number;
  sway: number;
  swaySpeed: number;
  alpha: number;
};

const SHAPE_FOR: Record<Exclude<ParticleKind, 'none'>, PetalShape> = {
  sakura: 'sakura',
  rose: 'rose',
  dust: 'dust',
};

/**
 * Satu canvas, satu RAF, pool tetap — tidak ada alokasi per frame.
 * Warna diambil dari CSS custom property, jadi mengganti palet di dashboard
 * langsung mengubah warna kelopak tanpa me-mount ulang komponen.
 */
export function ParticleField({ kind, density, speed }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (kind === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const shape = SHAPE_FOR[kind];
    const tier = detectTier();
    const count = particleBudget(tier, density);

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;

    // Warna dibaca sekali per resize/observe, bukan tiap frame (getComputedStyle mahal)
    let colorMain = '#e8698a';
    let colorSoft = '#f4a7bb';

    function readColors() {
      const styles = getComputedStyle(canvas!);
      colorMain = styles.getPropertyValue('--c-accent').trim() || colorMain;
      colorSoft = styles.getPropertyValue('--c-accent-soft').trim() || colorSoft;
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, tier === 'low' ? 1 : 2);
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(p: Particle, initial: boolean) {
      const z = Math.random();
      p.z = z;
      p.x = Math.random() * (width + 120) - 60;
      p.y = initial ? Math.random() * height : -40 - Math.random() * 120;
      p.size = (shape === 'dust' ? 2 : 9) + z * (shape === 'dust' ? 3 : 16);
      p.vy = (0.18 + z * 0.55) * (shape === 'dust' ? 0.45 : 1);
      p.vx = (Math.random() - 0.5) * 0.28;
      p.rot = Math.random() * Math.PI * 2;
      p.vrot = (Math.random() - 0.5) * 0.018;
      p.sway = Math.random() * Math.PI * 2;
      p.swaySpeed = 0.006 + Math.random() * 0.012;
      p.alpha = (shape === 'dust' ? 0.25 : 0.35) + z * 0.45;
    }

    const pool: Particle[] = Array.from({ length: count }, () => {
      const p: Particle = {
        x: 0, y: 0, z: 0, vx: 0, vy: 0, rot: 0,
        vrot: 0, size: 0, sway: 0, swaySpeed: 0, alpha: 0,
      };
      return p;
    });

    resize();
    readColors();
    pool.forEach((p) => spawn(p, true));

    let last = performance.now();

    function frame(now: number) {
      if (!running) return;

      // Normalisasi ke 60fps supaya kecepatan sama di layar 120Hz
      const dt = Math.min((now - last) / 16.667, 3);
      last = now;

      ctx!.clearRect(0, 0, width, height);

      for (const p of pool) {
        p.sway += p.swaySpeed * dt;
        p.x += (p.vx + Math.sin(p.sway) * 0.35 * p.z) * dt * speed;
        p.y += p.vy * dt * speed;
        p.rot += p.vrot * dt * speed;

        if (p.y > height + 60) spawn(p, false);
        if (p.x < -80) p.x = width + 60;
        if (p.x > width + 80) p.x = -60;

        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rot);
        ctx!.globalAlpha = p.alpha;
        drawPetal(ctx!, shape, p.size, p.z > 0.55 ? colorSoft : colorMain);
        ctx!.restore();
      }

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    const onResize = () => {
      resize();
      readColors();
    };
    window.addEventListener('resize', onResize, { passive: true });

    // Berhenti total saat tab tidak terlihat — jangan buang baterai
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Palet bisa berubah live dari dashboard → ikut baca ulang
    const observer = new MutationObserver(readColors);
    const host = canvas.closest('.letter-root');
    if (host) observer.observe(host, { attributes: true, attributeFilter: ['style'] });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      observer.disconnect();
    };
  }, [kind, density, speed]);

  if (kind === 'none') return null;

  return <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />;
}
