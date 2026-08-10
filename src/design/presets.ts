import type { DesignSpec } from './types';

/**
 * Preset = desain matang hasil kurasi. Titik mulai, bukan penjara —
 * user memilih satu lalu boleh menimpa token mana pun (preset + override).
 */

export const DESIGN_PRESETS: Record<string, DesignSpec> = {
  'dark-romantic': {
    preset: 'dark-romantic',
    name: 'Dark Romantic',
    palette: {
      bgDeep: '#0e0208',
      bgMid: '#1a0510',
      bgSoft: '#2e0a1e',
      accent: '#e8698a',
      accentSoft: '#f4a7bb',
      text: '#ffdceb',
      textMuted: '#c896aa',
      glass: 'rgba(255,255,255,0.07)',
      glow: 'rgba(232,105,138,0.35)',
    },
    fontPair: 'romantic-serif',
    surface: { kind: 'aurora', vignette: 0.65, grain: 0.25 },
    motion: { speed: 1, reveal: 'fade-up', parallax: true },
    particles: { kind: 'sakura', density: 0.7 },
    shape: { radius: 24, glassBlur: 18 },
    variants: {
      intro: 'gift',
      hero: 'centered',
      letter: 'glass',
      reasons: 'grid',
      garden: 'row',
      gallery: 'grid',
      finale: 'centered',
    },
  },

  'golden-hour': {
    preset: 'golden-hour',
    name: 'Golden Hour',
    palette: {
      bgDeep: '#fdf6ee',
      bgMid: '#f7e8d8',
      bgSoft: '#f0d9c2',
      accent: '#c8873f',
      accentSoft: '#e0b483',
      text: '#3d2a1c',
      textMuted: '#8a6b52',
      glass: 'rgba(255,255,255,0.55)',
      glow: 'rgba(200,135,63,0.28)',
    },
    fontPair: 'modern-luxe',
    surface: { kind: 'gradient', vignette: 0.25, grain: 0.35 },
    motion: { speed: 1.1, reveal: 'fade-up', parallax: true },
    particles: { kind: 'dust', density: 0.5 },
    shape: { radius: 20, glassBlur: 14 },
    variants: {
      intro: 'envelope',
      hero: 'split',
      letter: 'paper',
      reasons: 'bento',
      garden: 'arc',
      gallery: 'polaroid',
      finale: 'heart',
    },
  },

  'midnight-ink': {
    preset: 'midnight-ink',
    name: 'Midnight Ink',
    palette: {
      bgDeep: '#07080f',
      bgMid: '#0d1020',
      bgSoft: '#161a33',
      accent: '#8ea2ff',
      accentSoft: '#c0cbff',
      text: '#e8ecff',
      textMuted: '#98a0c4',
      glass: 'rgba(255,255,255,0.06)',
      glow: 'rgba(142,162,255,0.32)',
    },
    fontPair: 'nocturne',
    surface: { kind: 'mesh', vignette: 0.7, grain: 0.2 },
    motion: { speed: 0.85, reveal: 'blur-in', parallax: true },
    particles: { kind: 'dust', density: 0.85 },
    shape: { radius: 8, glassBlur: 22 },
    variants: {
      intro: 'curtain',
      hero: 'editorial',
      letter: 'minimal',
      reasons: 'numbered',
      garden: 'scatter',
      gallery: 'masonry',
      finale: 'starlit',
    },
  },

  'blush-paper': {
    preset: 'blush-paper',
    name: 'Blush Paper',
    palette: {
      bgDeep: '#fff9fb',
      bgMid: '#fdeef3',
      bgSoft: '#f8dde6',
      accent: '#d4607f',
      accentSoft: '#eda8bd',
      text: '#4a2535',
      textMuted: '#95697a',
      glass: 'rgba(255,255,255,0.65)',
      glow: 'rgba(212,96,127,0.2)',
    },
    fontPair: 'vintage-press',
    surface: { kind: 'grain', vignette: 0.2, grain: 0.55 },
    motion: { speed: 1.15, reveal: 'fade', parallax: false },
    particles: { kind: 'sakura', density: 0.45 },
    shape: { radius: 4, glassBlur: 10 },
    variants: {
      intro: 'envelope',
      hero: 'editorial',
      letter: 'paper',
      reasons: 'numbered',
      garden: 'row',
      gallery: 'polaroid',
      finale: 'centered',
    },
  },

  'velvet-noir': {
    preset: 'velvet-noir',
    name: 'Velvet Noir',
    palette: {
      bgDeep: '#0a0505',
      bgMid: '#170808',
      bgSoft: '#2b0d0d',
      accent: '#c0392b',
      accentSoft: '#e88b7d',
      text: '#f5e6e2',
      textMuted: '#b08a84',
      glass: 'rgba(255,255,255,0.05)',
      glow: 'rgba(192,57,43,0.4)',
    },
    fontPair: 'editorial',
    surface: { kind: 'aurora', vignette: 0.8, grain: 0.3 },
    motion: { speed: 0.9, reveal: 'fade-up', parallax: true },
    particles: { kind: 'rose', density: 0.6 },
    shape: { radius: 2, glassBlur: 16 },
    variants: {
      intro: 'curtain',
      hero: 'split',
      letter: 'minimal',
      reasons: 'bento',
      garden: 'arc',
      gallery: 'masonry',
      finale: 'heart',
    },
  },

  'sage-morning': {
    preset: 'sage-morning',
    name: 'Sage Morning',
    palette: {
      bgDeep: '#f4f7f2',
      bgMid: '#e6efe4',
      bgSoft: '#d3e2d0',
      accent: '#5c8a6a',
      accentSoft: '#9dc0a6',
      text: '#25352a',
      textMuted: '#6b8272',
      glass: 'rgba(255,255,255,0.6)',
      glow: 'rgba(92,138,106,0.22)',
    },
    fontPair: 'soft-humanist',
    surface: { kind: 'gradient', vignette: 0.15, grain: 0.4 },
    motion: { speed: 1.2, reveal: 'fade', parallax: false },
    particles: { kind: 'dust', density: 0.35 },
    shape: { radius: 28, glassBlur: 12 },
    variants: {
      intro: 'gift',
      hero: 'centered',
      letter: 'glass',
      reasons: 'grid',
      garden: 'scatter',
      gallery: 'grid',
      finale: 'starlit',
    },
  },
};

export const DEFAULT_PRESET = 'dark-romantic';

export function getPreset(id: string): DesignSpec {
  return DESIGN_PRESETS[id] ?? DESIGN_PRESETS[DEFAULT_PRESET];
}

export const PRESET_LIST = Object.values(DESIGN_PRESETS).map((p) => ({
  id: p.preset,
  name: p.name,
  swatch: [p.palette.bgDeep, p.palette.bgSoft, p.palette.accent, p.palette.text],
}));
