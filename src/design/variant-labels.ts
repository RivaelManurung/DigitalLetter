/**
 * Nama varian dalam Bahasa Indonesia untuk ditampilkan di editor.
 * Varian yang belum punya terjemahan tampil apa adanya — bukan galat,
 * jadi menambah varian baru tidak pernah membuat editor kosong.
 */
export const VARIANT_LABEL: Record<string, string> = {
  // umum
  centered: 'Terpusat',
  minimal: 'Minimal',
  cards: 'Kartu',
  list: 'Daftar',
  grid: 'Grid',
  timeline: 'Linimasa',
  split: 'Terbelah',
  stacked: 'Bertumpuk',
  alternating: 'Berselang',
  large: 'Besar',
  bordered: 'Berbingkai',

  // intro
  gift: 'Kotak kado',
  envelope: 'Amplop',
  curtain: 'Tirai',

  // hero
  editorial: 'Editorial',

  // letter
  glass: 'Kaca',
  paper: 'Kertas',

  // reasons
  bento: 'Bento',
  numbered: 'Bernomor',

  // garden
  row: 'Sebaris',
  arc: 'Melengkung',
  scatter: 'Tersebar',

  // gallery / memories
  masonry: 'Masonry',
  polaroid: 'Polaroid',
  stack: 'Tumpukan',

  // finale
  heart: 'Hati',
  starlit: 'Berbintang',

  // couple
  facing: 'Berhadapan',
  ornate: 'Berornamen',

  // countdown
  boxes: 'Kotak',
  ring: 'Lingkaran',

  // rsvp / question
  card: 'Kartu',
  inline: 'Menyatu',
  playful: 'Jenaka',

  // wish
  spotlight: 'Sorotan',
};

export function variantLabel(value: string): string {
  return VARIANT_LABEL[value] ?? value;
}
