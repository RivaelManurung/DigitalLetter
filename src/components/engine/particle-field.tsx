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
  snow: 'snow',
  snowflake: 'snowflake',
  heart: 'heart',
  star: 'star',
};

type Motion = {
  /** ukuran dasar + rentang oleh kedalaman (z), px */
  size: [number, number];
  /** kecepatan vertikal; negatif = naik */
  fall: [number, number];
  alpha: [number, number];
  /** ayunan horizontal */
  drift: number;
  twinkle?: boolean;
};

const MOTION: Record<PetalShape, Motion> = {
  sakura: { size: [9, 16], fall: [0.18, 0.73], alpha: [0.35, 0.45], drift: 0.35 },
  rose: { size: [9, 16], fall: [0.18, 0.73], alpha: [0.35, 0.45], drift: 0.35 },
  dust: { size: [2, 3], fall: [0.08, 0.25], alpha: [0.25, 0.45], drift: 0.35 },
  snow: { size: [1.6, 3.4], fall: [0.35, 0.9], alpha: [0.4, 0.5], drift: 0.6 },
  snowflake: { size: [7, 12], fall: [0.22, 0.6], alpha: [0.4, 0.5], drift: 0.5 },
  heart: { size: [8, 12], fall: [-0.3, -0.7], alpha: [0.3, 0.45], drift: 0.45 },
  star: { size: [3, 6], fall: [0.01, 0.04], alpha: [0.3, 0.6], drift: 0.1, twinkle: true },
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
    const motion = MOTION[shape];
    const rises = motion.fall[0] < 0;
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
      const edge = rises ? height + 40 + Math.random() * 120 : -40 - Math.random() * 120;
      p.y = initial ? Math.random() * height : edge;
      p.size = motion.size[0] + z * motion.size[1];
      p.vy = motion.fall[0] + z * (motion.fall[1] - motion.fall[0]);
      p.vx = (Math.random() - 0.5) * 0.28;
      p.rot = Math.random() * Math.PI * 2;
      p.vrot = (Math.random() - 0.5) * 0.018;
      p.sway = Math.random() * Math.PI * 2;
      p.swaySpeed = 0.006 + Math.random() * 0.012;
      p.alpha = motion.alpha[0] + z * motion.alpha[1];
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
        p.x += (p.vx + Math.sin(p.sway) * motion.drift * p.z) * dt * speed;
        p.y += p.vy * dt * speed;
        p.rot += p.vrot * dt * speed;

        if (rises ? p.y < -60 : p.y > height + 60) spawn(p, false);
        if (p.x < -80) p.x = width + 60;
        if (p.x > width + 80) p.x = -60;

        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rot);
        ctx!.globalAlpha = motion.twinkle
          ? p.alpha * (0.35 + 0.65 * Math.abs(Math.sin(p.sway * 4)))
          : p.alpha;
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

    // Di preview, canvas mengikuti panel — ukurannya bisa berubah tanpa
    // window ikut resize (mis. saat beralih desktop/ponsel).
    const sizeObserver = new ResizeObserver(onResize);
    sizeObserver.observe(canvas);

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
      sizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      observer.disconnect();
    };
  }, [kind, density, speed]);

  if (kind === 'none') return null;

  return <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />;
}
