import type { SectionType } from './blocks';
import type { SectionStyle } from './types';

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
  /** naskah awal yang menimpa starter block (per field); sisanya tetap bawaan */
  content?: Partial<Record<SectionType, Record<string, unknown>>>;
  /** tampilan awal per section, mis. foto latar hero */
  style?: Partial<Record<SectionType, SectionStyle>>;
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

  christmas: {
    label: 'Natal',
    note: 'Dibuka dengan chat tengah malam, lalu tumpukan kado yang dibuka satu per satu, surat, dan hitung mundur.',
    preset: 'christmas-eve',
    sections: ['intro', 'hero', 'chat', 'unwrap', 'letter', 'reasons', 'countdown', 'gallery', 'finale'],
    content: {
      hero: {
        eyebrow: 'selamat natal',
        titleTop: 'Natal Ini,',
        titleBottom: 'Kamu Kadonya',
        subtitle: 'Di antara lampu-lampu dan salju yang turun, ada satu hal yang paling kusyukuri: kamu.',
      },
      letter: {
        label: 'surat natal',
        title: 'Natal terhangat adalah yang ada kamu di dalamnya.',
        body:
          'Setiap lampu yang menyala tahun ini mengingatkanku padamu. Hangatnya cokelat panas, riuhnya lagu-lagu Natal, semuanya terasa lebih indah karena kita menjalaninya bersama.\n\nTerima kasih sudah jadi rumah paling nyaman di musim yang dingin. Semoga Natal ini membawa damai, tawa, dan semua yang kamu harapkan.',
        signature: '— Dengan sepenuh hati',
      },
      reasons: {
        eyebrow: 'hadiah kecil',
        title: 'Yang Kusyukuri Tahun Ini',
        items: [
          { icon: 'star', title: 'Kehadiranmu', body: 'Bintang paling terang di malam-malam yang panjang.' },
          { icon: 'heart', title: 'Kehangatanmu', body: 'Pelukan yang mengusir dingin dari musim apa pun.' },
          { icon: 'sparkle', title: 'Tawamu', body: 'Lebih merdu dari lonceng Natal manapun.' },
          { icon: 'leaf', title: 'Kesabaranmu', body: 'Kamu menemaniku bahkan saat aku sulit ditemani.' },
        ],
      },
      countdown: {
        eyebrow: 'sebentar lagi',
        title: 'Menuju Malam Natal',
        targetAt: '2026-12-24T18:00',
        passedLabel: 'Selamat Natal! 🎄',
      },
      memories: { eyebrow: 'tahun yang indah', title: 'Kenangan Tahun Ini' },
      finale: {
        eyebrow: 'selamat natal',
        title: 'Merry Christmas, Sayang',
        body: 'Semoga tahun depan kita masih menyalakan lampu pohon yang sama, di rumah yang sama, bersama.',
        signature: 'Dengan cinta, dari aku',
      },
    },
  },

  'christmas-couple': {
    label: 'Natal Berdua',
    note: 'Untuk pasangan: gosok jendela berembun untuk melihat fotomu, surat, kenangan, dan pertanyaan manis di akhir.',
    preset: 'winter-frost',
    style: { hero: { bgImage: '/image/berdua-hero.webp', bgOverlay: 0.6 } },
    sections: ['intro', 'hero', 'scratch', 'letter', 'memories', 'quote', 'question', 'finale'],
    content: {
      hero: {
        eyebrow: 'natal berdua',
        titleTop: 'Dinginnya Salju,',
        titleBottom: 'Hangatnya Kamu',
        subtitle: 'Natal kali ini kuhabiskan dengan satu keinginan: kamu di sampingku.',
      },
      letter: {
        label: 'untuk kekasihku',
        title: 'Di luar dingin, di dekatmu selalu hangat.',
        body:
          'Aku tidak butuh pohon yang paling besar atau kado yang paling mahal. Cukup duduk di sebelahmu, berbagi selimut, dan mendengarkan lagu Natal sambil memandang salju.\n\nTerima kasih sudah memilih bersamaku, di musim ini dan musim-musim berikutnya.',
        signature: '— Milikmu, selalu',
      },
      quote: {
        text: 'Aku ingin tahun-tahun berikutnya juga Natal berdua, denganmu.',
        source: 'Janjiku untukmu',
        translation: '',
      },
      question: {
        eyebrow: 'satu pertanyaan kecil',
        title: 'Maukah kamu merayakan Natal berikutnya bersamaku?',
        body: 'Dan yang sesudahnya. Dan yang sesudahnya lagi.',
        yesLabel: 'Mau, dong!',
        yesResponse: 'Yeay! Sudah kucatat di kalender. Jangan kabur ya. 🎄💛',
      },
      finale: {
        eyebrow: 'selamat natal',
        title: 'Terima Kasih Sudah Jadi Kadoku',
        body: 'Salju akan mencair, lampu akan dipadamkan, tapi perasaanku padamu tetap menyala.',
        signature: 'Dari yang selalu mencintaimu',
      },
    },
  },

  anniversary: {
    label: 'Anniversary',
    note: 'Perjalanan berdua dengan langit berbintang, cerita, kenangan, dan surat penutup.',
    preset: 'starlit-couple',
    sections: ['intro', 'hero', 'story', 'memories', 'letter', 'gallery', 'finale'],
    content: {
      hero: {
        eyebrow: 'anniversary',
        titleTop: 'Bersamamu,',
        titleBottom: 'Setiap Hari Istimewa',
        subtitle: 'Satu lagi tahun yang kita lewati berdua, dan aku masih jatuh cinta padamu.',
      },
      story: { eyebrow: 'perjalanan kita', title: 'Dari Awal Sampai Hari Ini' },
      letter: {
        label: 'di hari kita',
        title: 'Terima kasih sudah bertahan bersamaku.',
        body:
          'Ada hari-hari yang mudah dan ada yang berat, tapi kita selalu memilih untuk saling menggenggam. Itu yang paling kubanggakan dari kita.\n\nSelamat anniversary. Semoga kita terus tumbuh, berdua.',
        signature: '— Kekasihmu',
      },
      finale: {
        eyebrow: 'selamanya, ya?',
        title: 'Aku Pilih Kamu, Lagi dan Lagi',
        body: 'Di bawah langit yang sama, aku ingin menua bersamamu.',
        signature: 'Selamat anniversary',
      },
    },
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
