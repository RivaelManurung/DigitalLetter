/**
 * Nama ikon/bunga sebagai data murni — tanpa impor komponen atau CSS.
 * Dipakai oleh editor, template markdown, dan komponen SVG-nya, jadi harus
 * bisa diimpor dari mana saja termasuk Server Action.
 */

export const GLYPH_NAMES = [
  'rose',
  'sakura',
  'lotus',
  'tulip',
  'daisy',
  'sunflower',
  'hibiscus',
  'leaf',
  'heart',
  'sparkle',
  'moon',
  'star',
] as const;

export type GlyphName = (typeof GLYPH_NAMES)[number];

export const GLYPH_LABEL: Record<GlyphName, string> = {
  rose: 'Mawar',
  sakura: 'Sakura',
  lotus: 'Teratai',
  tulip: 'Tulip',
  daisy: 'Daisy',
  sunflower: 'Bunga Matahari',
  hibiscus: 'Kembang Sepatu',
  leaf: 'Daun',
  heart: 'Hati',
  sparkle: 'Kilau',
  moon: 'Bulan',
  star: 'Bintang',
};
