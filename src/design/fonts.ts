/**
 * Pasangan font yang sudah dikurasi — pagar desain.
 * Kombinasi apa pun yang dipilih user dijamin tetap serasi.
 */

export type FontPair = {
  id: string;
  label: string;
  display: string;
  script: string;
  body: string;
  /** query string untuk Google Fonts CSS2 */
  googleQuery: string;
};

export const FONT_PAIRS: FontPair[] = [
  {
    id: 'romantic-serif',
    label: 'Romantic Serif',
    display: 'Cormorant Garamond',
    script: 'Petit Formal Script',
    body: 'Jost',
    googleQuery:
      'family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Petit+Formal+Script&family=Jost:wght@200;300;400;500',
  },
  {
    id: 'editorial',
    label: 'Editorial',
    display: 'Playfair Display',
    script: 'Italiana',
    body: 'Inter',
    googleQuery:
      'family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Italiana&family=Inter:wght@300;400;500',
  },
  {
    id: 'modern-luxe',
    label: 'Modern Luxe',
    display: 'Marcellus',
    script: 'Parisienne',
    body: 'Karla',
    googleQuery:
      'family=Marcellus&family=Parisienne&family=Karla:wght@300;400;500',
  },
  {
    id: 'soft-humanist',
    label: 'Soft Humanist',
    display: 'Lora',
    script: 'Dancing Script',
    body: 'Nunito Sans',
    googleQuery:
      'family=Lora:ital,wght@0,400;0,600;1,400&family=Dancing+Script:wght@500&family=Nunito+Sans:wght@300;400;600',
  },
  {
    id: 'quiet-swiss',
    label: 'Quiet Swiss',
    display: 'Instrument Serif',
    script: 'Instrument Serif',
    body: 'DM Sans',
    googleQuery:
      'family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500',
  },
  {
    id: 'vintage-press',
    label: 'Vintage Press',
    display: 'Libre Baskerville',
    script: 'Pinyon Script',
    body: 'Cormorant',
    googleQuery:
      'family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Pinyon+Script&family=Cormorant:wght@300;400;500',
  },
  {
    id: 'airy-sans',
    label: 'Airy Sans',
    display: 'Fraunces',
    script: 'Caveat',
    body: 'Outfit',
    googleQuery:
      'family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Caveat:wght@500&family=Outfit:wght@200;300;400',
  },
  {
    id: 'nocturne',
    label: 'Nocturne',
    display: 'Bodoni Moda',
    script: 'Great Vibes',
    body: 'Manrope',
    googleQuery:
      'family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400&family=Great+Vibes&family=Manrope:wght@200;300;400;500',
  },
];

export const DEFAULT_FONT_PAIR = FONT_PAIRS[0];

export function getFontPair(id: string): FontPair {
  return FONT_PAIRS.find((f) => f.id === id) ?? DEFAULT_FONT_PAIR;
}

/** URL stylesheet Google Fonts untuk satu pasangan. */
export function fontPairHref(id: string): string {
  // Caveat dimuat untuk semua pasangan: dipakai sebagai "tulisan tangan" (tanda tangan, keterangan foto).
  return `https://fonts.googleapis.com/css2?${getFontPair(id).googleQuery}&family=Caveat:wght@400;600&display=swap`;
}

/**
 * Semua pasangan font yang dipakai satu surat: font desainnya, ditambah font
 * yang dipilih sendiri oleh masing-masing section.
 *
 * Tanpa ini, section yang memilih font berbeda akan meminta keluarga font yang
 * stylesheet-nya tidak pernah dimuat, lalu diam-diam jatuh ke font fallback.
 */
export function usedFontPairIds(
  designFontPair: string,
  sections: { style?: { fontPair?: string } }[],
): string[] {
  const ids = new Set<string>([designFontPair]);
  for (const section of sections) {
    if (section.style?.fontPair) ids.add(section.style.fontPair);
  }
  return [...ids];
}
