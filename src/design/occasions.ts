import type { SectionType } from './blocks';

/**
 * Occasion = susunan section awal untuk satu jenis acara, plus preset desain
 * yang cocok. Ini murni DATA: menambah occasion tidak menyentuh kode mana pun,
 * cukup menambah entri di sini.
 *
 * Yang dipilih user di dialog "Surat baru" menentukan section apa saja yang
 * dibuat — sisanya tetap bisa ditambah/dihapus manual di tab Konten.
 */

export type OccasionBlueprint = {
  label: string;
  /** satu kalimat di bawah nama, menjelaskan isinya */
  note: string;
  /** id preset dari design/presets */
  preset: string;
  /** urutan section yang dibuat untuk surat baru */
  sections: SectionType[];
};

export const OCCASIONS = {
  love: {
    label: 'Surat Cinta',
    note: 'Surat romantis dengan alasan, taman bunga, dan galeri foto.',
    preset: 'dark-romantic',
    sections: ['intro', 'hero', 'letter', 'reasons', 'garden', 'gallery', 'finale'],
  },

  wedding: {
    label: 'Undangan Nikahan',
    note: 'Mempelai, akad & resepsi, hitung mundur, rundown, amplop digital, dan RSVP.',
    preset: 'golden-hour',
    sections: [
      'intro',
      'hero',
      'quote',
      'couple',
      'event',
      'countdown',
      'itinerary',
      'story',
      'gallery',
      'gift',
      'rsvp',
      'finale',
    ],
  },

  confess: {
    label: 'Nembak / Confess',
    note: 'Pengakuan perasaan, alasan suka, kenangan, dan pertanyaan ya/tidak.',
    preset: 'midnight-ink',
    sections: ['intro', 'hero', 'letter', 'reasons', 'memories', 'question', 'finale'],
  },

  valentine: {
    label: 'Valentine',
    note: 'Kartu valentine dengan alasan cinta, kutipan, dan galeri.',
    preset: 'dark-romantic',
    sections: ['intro', 'hero', 'letter', 'reasons', 'quote', 'gallery', 'garden', 'finale'],
  },

  birthday: {
    label: 'Ulang Tahun',
    note: 'Ucapan, daftar harapan, hitung mundur, dan kenangan.',
    preset: 'golden-hour',
    sections: ['intro', 'hero', 'wish', 'memories', 'gallery', 'countdown', 'finale'],
  },

  apology: {
    label: 'Permintaan Maaf',
    note: 'Surat permintaan maaf dengan cerita dan janji perbaikan.',
    preset: 'midnight-ink',
    sections: ['intro', 'hero', 'letter', 'story', 'quote', 'finale'],
  },
} satisfies Record<string, OccasionBlueprint>;

export type OccasionId = keyof typeof OCCASIONS;

export const OCCASION_IDS = Object.keys(OCCASIONS) as OccasionId[];

export function isOccasionId(value: unknown): value is OccasionId {
  return typeof value === 'string' && value in OCCASIONS;
}
