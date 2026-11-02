/**
 * Kontrak desain — satu "desain" adalah DATA, bukan kode.
 *
 * Pemisahan yang dipegang seluruh aplikasi:
 *   ENGINE  (kode)  → nyawa: intro, kelopak, breathing bg, reveal, musik, timing
 *   DESIGN  (data)  → kulit: warna, font, varian layout, partikel, intensitas
 *
 * Menambah desain baru = membuat objek DesignSpec. Tidak menyentuh kode.
 */

/**
 * Daftar section berasal dari registry block (design/blocks). Berkas ini
 * hanya meneruskannya supaya kode lama yang mengimpor dari '@/design/types'
 * tetap jalan — sumber kebenarannya tetap satu.
 */
export {
  SECTION_TYPES,
  SECTION_VARIANTS,
  DEFAULT_VARIANTS,
  SECTION_LABEL,
  isSectionType,
} from './blocks';
export type { SectionType } from './blocks';

import type { SectionType as SectionTypeRef } from './blocks';

/** Slot warna. Semua CSS membaca ini — nol warna hardcoded di komponen. */
export type Palette = {
  bgDeep: string;
  bgMid: string;
  bgSoft: string;
  accent: string;
  accentSoft: string;
  text: string;
  textMuted: string;
  glass: string;
  glow: string;
};

export type SurfaceKind = 'aurora' | 'gradient' | 'mesh' | 'grain' | 'solid';
export const REVEAL_KINDS = [
  'fade-up', 'fade', 'blur-in', 'glow', 'iris', 'unfold', 'drop', 'ink', 'pop', 'rise', 'petal',
] as const;
export type RevealKind = (typeof REVEAL_KINDS)[number];

/** Lapisan suasana yang bergerak di atas latar, khas per tema. */
export const AMBIENT_KINDS = [
  'none', 'candle', 'shooting-stars', 'spotlight', 'sunrays', 'fireflies', 'fairy-lights', 'frost',
] as const;
export type AmbientKind = (typeof AMBIENT_KINDS)[number];

/** Cara judul besar muncul huruf demi huruf. */
export const TITLE_ANIMS = ['none', 'cascade', 'flicker', 'twinkle', 'type', 'rise'] as const;
export type TitleAnim = (typeof TITLE_ANIMS)[number];
export type ParticleKind =
  | 'sakura'
  | 'rose'
  | 'dust'
  | 'snow'
  | 'snowflake'
  | 'heart'
  | 'star'
  | 'none';

export type DesignSpec = {
  /** id preset asal, untuk menandai "preset + override" */
  preset: string;
  name: string;
  palette: Palette;
  /** id dari FONT_PAIRS */
  fontPair: string;
  surface: {
    kind: SurfaceKind;
    /** 0–1 */
    vignette: number;
    /** 0–1 */
    grain: number;
    /** ilustrasi latar (path /image/... atau https); kosong = gradien saja */
    image?: string;
    /** 0–1, lapisan warna latar di atas ilustrasi supaya teks tetap terbaca */
    imageOverlay?: number;
  };
  motion: {
    /** pengali durasi animasi, 0.5 = dua kali lebih cepat */
    speed: number;
    reveal: RevealKind;
    parallax: boolean;
    ambient?: AmbientKind;
    title?: TitleAnim;
    /** ketukan di layar memercikkan partikel tema */
    tapBurst?: boolean;
  };
  particles: {
    kind: ParticleKind;
    /** 0–1 */
    density: number;
  };
  /** Musik latar sintetis bawaan; dipakai bila surat tidak punya audio unggahan. */
  music?: { track: string };
  shape: {
    /** px */
    radius: number;
    /** px */
    glassBlur: number;
  };
  /**
   * Varian layout bawaan per tipe section. Parsial: block yang tidak
   * disebut memakai varian pertama yang dideklarasikan block itu sendiri,
   * jadi menambah block baru tidak membuat preset lama tidak valid.
   */
  variants: Partial<Record<SectionTypeRef, string>>;
};

/**
 * Tipe section: salah satu block bawaan, atau block bikinan sendiri dengan
 * awalan "c:". Bentuk `string & {}` menjaga autocomplete block bawaan tetap
 * muncul, tanpa menutup pintu bagi tipe custom.
 */
export type AnySectionType = SectionTypeRef | (string & {});

/**
 * Penyesuaian tampilan milik SATU section.
 *
 * Semua field opsional dan semuanya berarti "timpa desain surat". Field yang
 * tidak diisi tidak menghasilkan CSS apa pun, jadi section tanpa style sama
 * sekali berperilaku persis seperti sebelum fitur ini ada — inilah yang
 * membuat surat lama tetap tampil sama.
 */
export type SectionStyle = {
  /* — warna — */
  /** latar khusus section; kosong = ikut latar surat */
  bg?: string;
  /** gambar latar (url); ditumpuk di atas `bg` */
  bgImage?: string;
  /** 0–1, gelap-kan gambar latar supaya teks tetap terbaca */
  bgOverlay?: number;
  text?: string;
  textMuted?: string;
  accent?: string;

  /* — tipografi — */
  /** id dari FONT_PAIRS; kosong = ikut font surat */
  fontPair?: string;
  /** pengali ukuran judul, 1 = normal */
  titleScale?: number;
  /** pengali ukuran teks isi, 1 = normal */
  bodyScale?: number;
  /** em, jarak antar huruf pada judul */
  titleTracking?: number;

  /* — jarak & tata letak — */
  /** rem, padding atas & bawah; kosong = ikut --space-section */
  padTop?: number;
  padBottom?: number;
  /** px, lebar maksimum isi section */
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';

  /* — animasi & efek — */
  reveal?: RevealKind;
  /** pengali kecepatan animasi khusus section ini */
  speed?: number;
  /** 0–1; menimpa kerapatan partikel surat pada section ini */
  particleDensity?: number;
};

/** Satu section di dalam surat. `content` divalidasi oleh schema per tipe. */
export type SectionRecord = {
  id: string;
  type: AnySectionType;
  order: number;
  enabled: boolean;
  /**
   * Varian khusus section ini; menimpa design.variants[type].
   * String kosong berarti "ikut varian bawaan desain".
   */
  variant: string;
  content: Record<string, unknown>;
  /** Penyesuaian tampilan khusus section ini. Kosong = ikut desain surat. */
  style?: SectionStyle;
};

export type MediaRecord = {
  id: string;
  kind: 'photo' | 'audio';
  path: string;
  url: string;
  caption: string | null;
  order: number;
  meta: Record<string, unknown>;
};

/** Block bikinan sendiri, dibawa apa adanya dari database. */
export type CustomBlockRecord = {
  slug: string;
  label: string;
  note: string;
  layout: string;
  spec: unknown;
  starter: unknown;
};

export type LetterBundle = {
  id: string;
  slug: string;
  recipientName: string;
  design: DesignSpec;
  sections: SectionRecord[];
  media: MediaRecord[];
  /** definisi block bikinan sendiri yang dipakai surat ini */
  customBlocks?: CustomBlockRecord[];
};
