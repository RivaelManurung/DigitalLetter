import type { AmbientKind, RevealKind, TitleAnim } from './types';

export const REVEAL_LABEL: Record<RevealKind, string> = {
  'fade-up': 'Naik & memudar',
  fade: 'Memudar',
  'blur-in': 'Dari buram',
  glow: 'Menyala seperti lilin',
  iris: 'Lingkaran sorot panggung',
  unfold: 'Terbuka seperti kertas',
  drop: 'Jatuh & memantul',
  ink: 'Tersapu seperti tinta',
  pop: 'Meletup',
  rise: 'Naik perlahan',
  petal: 'Melayang seperti kelopak',
  jelly: 'Kenyal seperti kartun',
};

export const AMBIENT_LABEL: Record<AmbientKind, string> = {
  none: 'Tanpa suasana',
  candle: 'Cahaya lilin & bara',
  'shooting-stars': 'Bintang jatuh',
  spotlight: 'Lampu sorot panggung',
  sunrays: 'Berkas sinar matahari',
  fireflies: 'Kunang-kunang',
  'fairy-lights': 'Lampu tumbler',
  frost: 'Embun beku di tepi layar',
  fireworks: 'Kembang api',
  champagne: 'Gelembung sampanye',
  confetti: 'Hujan konfeti',
};

export const TITLE_LABEL: Record<TitleAnim, string> = {
  none: 'Tanpa animasi huruf',
  cascade: 'Huruf berjatuhan',
  flicker: 'Huruf menyala bergantian',
  twinkle: 'Huruf berkelip',
  type: 'Diketik',
  rise: 'Naik dari balik garis',
};
