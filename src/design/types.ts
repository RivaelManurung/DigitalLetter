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
export type RevealKind = 'fade-up' | 'fade' | 'blur-in';
export type ParticleKind = 'sakura' | 'rose' | 'dust' | 'none';

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
  };
  motion: {
    /** pengali durasi animasi, 0.5 = dua kali lebih cepat */
    speed: number;
    reveal: RevealKind;
    parallax: boolean;
  };
  particles: {
    kind: ParticleKind;
    /** 0–1 */
    density: number;
  };
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

/** Satu section di dalam surat. `content` divalidasi oleh schema per tipe. */
export type SectionRecord = {
  id: string;
  type: SectionTypeRef;
  order: number;
  enabled: boolean;
  /**
   * Varian khusus section ini; menimpa design.variants[type].
   * String kosong berarti "ikut varian bawaan desain".
   */
  variant: string;
  content: Record<string, unknown>;
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

export type LetterBundle = {
  id: string;
  slug: string;
  recipientName: string;
  design: DesignSpec;
  sections: SectionRecord[];
  media: MediaRecord[];
};
