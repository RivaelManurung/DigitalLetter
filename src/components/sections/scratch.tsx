'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { BlockContent } from '@/design/blocks';
import type { DesignSpec, MediaRecord } from '@/design/types';
import { renderLite } from '@/lib/utils';
import { FROST_IMAGE } from '@/design/theme-images';
import { Reveal } from '../engine/reveal';
import styles from './scratch.module.css';

type Props = {
  content: BlockContent<'scratch'>;
  design: DesignSpec;
  variant: string;
  media: MediaRecord[];
};

const BRUSH = 42;
const REVEAL_AT = 0.5;
/** cek luas terhapus tiap N gerakan — getImageData mahal kalau tiap frame */
const CHECK_EVERY = 10;

export function ScratchSection({ content, design, variant, media }: Props) {
  const reveal = design.motion.reveal;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [touched, setTouched] = useState(false);
  const photo = media.find((m) => m.id === content.photoId && m.kind === 'photo');
  const foil = variant === 'foil';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let painted = false;
    let moves = 0;
    let last: { x: number; y: number } | null = null;
    let frost: HTMLImageElement | null = null;

    const paint = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintCover(ctx, w, h, foil, content.hint, canvas, frost);
      painted = true;
    };

    const frostReady = foil
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          const img = new window.Image();
          img.onload = () => {
            frost = img;
            resolve();
          };
          // gagal muat → tetap pakai embun gambar-canvas
          img.onerror = () => resolve();
          img.src = FROST_IMAGE;
        });
    let alive = true;
    void Promise.all([document.fonts.ready, frostReady]).then(() => alive && paint());
    const observer = new ResizeObserver(() => {
      if (moves === 0) paint();
    });
    observer.observe(canvas);

    const point = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const stroke = (e: PointerEvent) => {
      if (!painted) return;
      const p = point(e);
      ctx.globalCompositeOperation = 'destination-out';
      // harus opak penuh, kalau tidak gosokan hanya menipiskan embun
      ctx.strokeStyle = '#000';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = BRUSH;
      ctx.beginPath();
      ctx.moveTo(last?.x ?? p.x, last?.y ?? p.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
      last = p;

      if (++moves % CHECK_EVERY === 0 && clearedRatio(ctx, canvas) >= REVEAL_AT) {
        setRevealed(true);
        navigator.vibrate?.([20, 40, 20]);
      }
    };

    const down = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      last = null;
      setTouched(true);
      stroke(e);
    };
    const move = (e: PointerEvent) => {
      if (canvas.hasPointerCapture(e.pointerId)) stroke(e);
    };
    const up = () => {
      last = null;
    };

    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    return () => {
      alive = false;
      observer.disconnect();
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
    };
  }, [foil, content.hint, revealed]);

  return (
    <section className="section">
      <div className="section-inner">
        <Reveal kind={reveal} className={styles.header}>
          {content.eyebrow && <p className="eyebrow">{content.eyebrow}</p>}
          {content.title && <h2 className={`display ${styles.title}`}>{content.title}</h2>}
        </Reveal>

        <Reveal kind={reveal} index={1}>
          <div className={`${styles.window} ${foil ? styles.foil : styles.frost}`}>
            <div className={styles.hidden}>
              {photo && (
                <Image
                  src={photo.url}
                  alt={photo.caption || content.title || ''}
                  fill
                  sizes="(max-width: 720px) 90vw, 420px"
                  className={styles.image}
                />
              )}
              {content.message && (
                <p
                  className={`${styles.message} ${photo ? styles.onPhoto : ''}`}
                  aria-live="polite"
                  dangerouslySetInnerHTML={{ __html: renderLite(content.message) }}
                />
              )}
            </div>

            <canvas
              ref={canvasRef}
              className={`${styles.cover} ${revealed ? styles.gone : ''}`}
              aria-hidden="true"
            />
            {!foil && !revealed && <span className={styles.mullion} aria-hidden="true" />}
          </div>
        </Reveal>

        {!revealed && (
          <button type="button" className={styles.skip} onClick={() => setRevealed(true)}>
            {touched ? 'Buka semuanya' : 'Lihat tanpa menggosok'}
          </button>
        )}
      </div>
    </section>
  );
}

function paintCover(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  foil: boolean,
  hint: string,
  host: HTMLElement,
  frost: HTMLImageElement | null,
) {
  const css = getComputedStyle(host);
  const accent = css.getPropertyValue('--c-accent').trim() || '#d4a94a';
  const soft = css.getPropertyValue('--c-accent-soft').trim() || '#f3e6c0';
  const script = css.getPropertyValue('--ff-script').trim() || 'cursive';

  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, w, h);

  const g = ctx.createLinearGradient(0, 0, w, h);
  if (foil) {
    g.addColorStop(0, accent);
    g.addColorStop(0.45, soft);
    g.addColorStop(0.55, accent);
    g.addColorStop(1, soft);
  } else {
    g.addColorStop(0, '#ecf2f8');
    g.addColorStop(1, '#d0dce8');
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  if (frost) {
    // object-fit: cover
    const scale = Math.max(w / frost.width, h / frost.height);
    const dw = frost.width * scale;
    const dh = frost.height * scale;
    ctx.drawImage(frost, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }

  // Butiran: kilau untuk foil, titik embun untuk kaca
  const grains = frost ? 0 : Math.round((w * h) / 90);
  for (let i = 0; i < grains; i++) {
    ctx.fillStyle = foil
      ? `rgba(255,255,255,${Math.random() * 0.35})`
      : `rgba(255,255,255,${0.2 + Math.random() * 0.5})`;
    const r = foil ? 0.8 : 0.6 + Math.random() * 1.6;
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, r, 0, Math.PI * 2);
    ctx.fill();
  }

  if (!foil && !frost) {
    // tetesan embun yang meleleh ke bawah
    for (let i = 0; i < 7; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h * 0.5;
      const len = 30 + Math.random() * 90;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,0.16)';
      ctx.lineWidth = 1.5 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 6, y + len);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  if (hint) {
    ctx.font = `${Math.round(Math.min(w, 420) / 8)}px ${script}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // halo terang di belakang huruf supaya terbaca di atas pola es yang ramai
    ctx.shadowColor = foil ? 'rgba(255,240,200,0.9)' : 'rgba(255,255,255,0.95)';
    ctx.shadowBlur = 14;
    ctx.fillStyle = foil ? 'rgba(60,40,10,0.75)' : 'rgba(25,45,75,0.85)';
    ctx.fillText(hint, w / 2, h / 2);
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
  }
}

function clearedRatio(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): number {
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  const stride = 16;
  let clear = 0;
  let total = 0;
  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      total++;
      if (data[(y * width + x) * 4 + 3] < 64) clear++;
    }
  }
  return total ? clear / total : 0;
}
