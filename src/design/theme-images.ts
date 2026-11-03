/** Ilustrasi latar bawaan di public/image. Data murni — aman diimpor dari server. */
export const THEME_IMAGES = [
  { src: '/image/natal-bg.webp', label: 'Ruang tamu Natal' },
  { src: '/image/berdua-bg.webp', label: 'Kota bersalju' },
  { src: '/image/candy-cane-bg.webp', label: 'Pagi Natal' },
  { src: '/image/dark-romantic-bg.webp', label: 'Taman malam' },
  { src: '/image/golden-hour-bg.webp', label: 'Padang senja' },
  { src: '/image/midnight-ink-bg.webp', label: 'Danau tengah malam' },
  { src: '/image/blush-paper-bg.webp', label: 'Kertas bunga' },
  { src: '/image/velvet-noir-bg.webp', label: 'Tirai beludru' },
  { src: '/image/sage-morning-bg.webp', label: 'Kebun pagi' },
  { src: '/image/berdua-hero.webp', label: 'Berdua di salju' },
  { src: '/image/rose-gold-bg.webp', label: 'Makan malam lilin' },
  { src: '/image/starlit-bg.webp', label: 'Langit berbintang' },
  { src: '/image/intro-tirai.webp', label: 'Tirai panggung' },
  { src: '/image/champagne-bg.webp', label: 'Bersulang sampanye' },
  { src: '/image/newyear-bg.webp', label: 'Kembang api kota' },
  { src: '/image/gingerbread-bg.webp', label: 'Desa kue jahe (kartun)' },
  { src: '/image/northpole-bg.webp', label: 'Kereta Sinterklas' },
] as const;

export const GIFT_IMAGES = [
  '/image/gifts/gift-1.webp',
  '/image/gifts/gift-2.webp',
  '/image/gifts/gift-3.webp',
] as const;

export const FROST_IMAGE = '/image/berdua-embun.webp';
export const INTRO_IMAGES = {
  envelope: '/image/intro/envelope.webp',
  seal: '/image/intro/seal.webp',
  giftBox: '/image/intro/gift-box.webp',
  giftLid: '/image/intro/gift-lid.webp',
} as const;

/** Sticker ilustrasi per nama glyph; glyph tanpa sticker tetap digambar vektor. */
export const STICKERS: Partial<Record<string, string>> = {
  rose: '/image/stickers/rose.webp',
  sakura: '/image/stickers/sakura.webp',
  lotus: '/image/stickers/lotus.webp',
  tulip: '/image/stickers/tulip.webp',
  sunflower: '/image/stickers/sunflower.webp',
  hibiscus: '/image/stickers/hibiscus.webp',
  leaf: '/image/stickers/leaf.webp',
  heart: '/image/stickers/heart.webp',
};

export const PARTICLE_SPRITES = {
  sakura: ['/image/particles/sakura-1.webp', '/image/particles/sakura-2.webp', '/image/particles/sakura-3.webp'],
  rose: ['/image/particles/rose-1.webp', '/image/particles/rose-2.webp', '/image/particles/rose-3.webp'],
  toys: [
    '/image/particles/toy-gingerbread.webp',
    '/image/particles/toy-candy-cane.webp',
    '/image/particles/toy-ornament.webp',
    '/image/particles/toy-cocoa.webp',
    '/image/particles/toy-gift.webp',
    '/image/particles/toy-mitten.webp',
    '/image/particles/toy-snowman.webp',
    '/image/particles/toy-tree.webp',
  ],
  heart: ['/image/particles/heart-1.webp', '/image/particles/heart-2.webp', '/image/particles/heart-3.webp'],
} as const;

export const CHAT_WALLPAPERS = { natal: '/image/natal-chat.webp' } as const;
