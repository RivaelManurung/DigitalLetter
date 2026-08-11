import type { CSSProperties } from 'react';
import { getFontPair } from './fonts';
import type { DesignSpec, SectionStyle } from './types';

/**
 * Menerjemahkan DesignSpec menjadi CSS custom properties.
 *
 * Ini satu-satunya jembatan antara data desain dan tampilan. Seluruh CSS
 * section & engine partikel membaca variabel ini — jadi mengganti satu nilai
 * mengubah seluruh halaman, termasuk warna kelopak di canvas.
 */
export function designToCssVars(design: DesignSpec): CSSProperties {
  const { palette: c, surface, motion, shape, particles } = design;
  const font = getFontPair(design.fontPair);

  return {
    '--c-bg-deep': c.bgDeep,
    '--c-bg-mid': c.bgMid,
    '--c-bg-soft': c.bgSoft,
    '--c-accent': c.accent,
    '--c-accent-soft': c.accentSoft,
    '--c-text': c.text,
    '--c-text-muted': c.textMuted,
    '--c-glass': c.glass,
    '--c-glow': c.glow,

    '--ff-display': `'${font.display}', serif`,
    '--ff-script': `'${font.script}', cursive`,
    '--ff-body': `'${font.body}', sans-serif`,

    '--surface-vignette': String(surface.vignette),
    '--surface-grain': String(surface.grain),

    '--motion-speed': String(motion.speed),
    '--dur-fast': `calc(180ms * var(--motion-speed))`,
    '--dur-normal': `calc(420ms * var(--motion-speed))`,
    '--dur-slow': `calc(900ms * var(--motion-speed))`,
    '--ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',

    '--radius': `${shape.radius}px`,
    '--radius-sm': `${Math.round(shape.radius * 0.5)}px`,
    '--glass-blur': `${shape.glassBlur}px`,

    '--particle-density': String(particles.density),
  } as CSSProperties;
}

/**
 * Menerjemahkan SectionStyle menjadi CSS custom properties untuk SATU section.
 *
 * Memakai nama variabel yang sama dengan `designToCssVars`. Karena variabel
 * CSS mewaris, menuliskannya ulang di pembungkus section membuat seluruh isi
 * section ikut berubah — tanpa satu pun komponen section perlu tahu soal ini.
 *
 * Hanya field yang benar-benar diisi yang menghasilkan variabel. Section tanpa
 * style menghasilkan objek kosong, jadi desain surat tetap berlaku utuh.
 */
export function sectionStyleToCssVars(style: SectionStyle | undefined): CSSProperties {
  if (!style) return {};

  const vars: Record<string, string> = {};

  if (style.text) vars['--c-text'] = style.text;
  if (style.textMuted) vars['--c-text-muted'] = style.textMuted;
  if (style.accent) {
    vars['--c-accent'] = style.accent;
    vars['--c-accent-soft'] = style.accent;
  }

  if (style.fontPair) {
    const font = getFontPair(style.fontPair);
    vars['--ff-display'] = `'${font.display}', serif`;
    vars['--ff-script'] = `'${font.script}', cursive`;
    vars['--ff-body'] = `'${font.body}', sans-serif`;
  }

  // Skala tipografi ditulis ulang sebagai kelipatan nilai dasarnya, jadi
  // sifat responsif clamp() di SCALE_CSS tidak hilang.
  if (isScale(style.titleScale)) {
    const s = style.titleScale;
    vars['--text-hero'] = `calc(clamp(2.80rem, 1.60rem + 5.20vw, 6.40rem) * ${s})`;
    vars['--text-2xl'] = `calc(clamp(2.00rem, 1.50rem + 2.20vw, 3.20rem) * ${s})`;
    vars['--text-xl'] = `calc(clamp(1.50rem, 1.25rem + 1.10vw, 2.10rem) * ${s})`;
  }

  if (isScale(style.bodyScale)) {
    const s = style.bodyScale;
    vars['--text-base'] = `calc(clamp(1.00rem, 0.94rem + 0.30vw, 1.13rem) * ${s})`;
    vars['--text-lg'] = `calc(clamp(1.20rem, 1.08rem + 0.55vw, 1.45rem) * ${s})`;
    vars['--text-sm'] = `calc(clamp(0.84rem, 0.80rem + 0.18vw, 0.94rem) * ${s})`;
  }

  if (typeof style.titleTracking === 'number') {
    vars['--section-tracking'] = `${style.titleTracking}em`;
  }

  if (typeof style.padTop === 'number') vars['--section-pad-top'] = `${style.padTop}rem`;
  if (typeof style.padBottom === 'number') {
    vars['--section-pad-bottom'] = `${style.padBottom}rem`;
  }
  if (typeof style.maxWidth === 'number') {
    vars['--section-max-width'] = `${style.maxWidth}px`;
  }

  if (typeof style.speed === 'number' && style.speed > 0) {
    vars['--motion-speed'] = String(style.speed);
  }

  if (typeof style.bgOverlay === 'number') {
    vars['--section-overlay'] = String(style.bgOverlay);
  }

  return vars as CSSProperties;
}

/** Pengali ukuran hanya berlaku kalau benar-benar mengubah sesuatu. */
function isScale(value: number | undefined): value is number {
  return typeof value === 'number' && value > 0 && value !== 1;
}

/** Skala tipografi & spacing — sama untuk semua desain. Ini pagar desainnya. */
export const SCALE_CSS = `
  --text-xs:    clamp(0.72rem, 0.70rem + 0.10vw, 0.80rem);
  --text-sm:    clamp(0.84rem, 0.80rem + 0.18vw, 0.94rem);
  --text-base:  clamp(1.00rem, 0.94rem + 0.30vw, 1.13rem);
  --text-lg:    clamp(1.20rem, 1.08rem + 0.55vw, 1.45rem);
  --text-xl:    clamp(1.50rem, 1.25rem + 1.10vw, 2.10rem);
  --text-2xl:   clamp(2.00rem, 1.50rem + 2.20vw, 3.20rem);
  --text-hero:  clamp(2.80rem, 1.60rem + 5.20vw, 6.40rem);

  --space-xs:   0.5rem;
  --space-sm:   1rem;
  --space-md:   1.75rem;
  --space-lg:   3rem;
  --space-xl:   5rem;
  --space-section: clamp(4rem, 3rem + 5vw, 9rem);

  --measure: 62ch;
`;

/** Background per surface.kind — dibaca oleh <SurfaceLayer />. */
export function surfaceBackground(kind: DesignSpec['surface']['kind']): string {
  switch (kind) {
    case 'aurora':
      return `linear-gradient(160deg,
        var(--c-bg-deep) 0%, var(--c-bg-mid) 18%, var(--c-bg-soft) 34%,
        var(--c-bg-mid) 52%, var(--c-bg-soft) 68%, var(--c-bg-mid) 84%,
        var(--c-bg-deep) 100%)`;
    case 'mesh':
      return `radial-gradient(ellipse 70% 50% at 15% 10%, var(--c-bg-soft) 0%, transparent 60%),
              radial-gradient(ellipse 60% 45% at 85% 25%, var(--c-bg-mid) 0%, transparent 55%),
              radial-gradient(ellipse 65% 50% at 50% 90%, var(--c-bg-soft) 0%, transparent 60%),
              var(--c-bg-deep)`;
    case 'gradient':
      return `linear-gradient(175deg, var(--c-bg-deep) 0%, var(--c-bg-mid) 50%, var(--c-bg-soft) 100%)`;
    case 'grain':
      return `var(--c-bg-deep)`;
    case 'solid':
    default:
      return `var(--c-bg-deep)`;
  }
}
