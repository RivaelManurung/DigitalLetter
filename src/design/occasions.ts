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
    label: 'Undangan Pernikahan',
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
    label: 'Pernyataan Cinta',
    note: 'Pengakuan perasaan, alasan suka, kenangan, dan pertanyaan ya/tidak.',
    preset: 'midnight-ink',
    sections: ['intro', 'hero', 'letter', 'reasons', 'memories', 'question', 'finale'],
  },

  valentine: {
    label: 'Hari Valentine',
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
    label: 'Natal untuk Pasangan',
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
    label: 'Hari Jadi',
    note: 'Perjalanan berdua dengan langit berbintang, cerita, kenangan, dan surat penutup.',
    preset: 'starlit-couple',
    sections: ['intro', 'hero', 'story', 'memories', 'letter', 'garden', 'gallery', 'finale'],
    content: {
      hero: {
        eyebrow: 'anniversary',
        titleTop: 'Bersamamu,',
        titleBottom: 'Setiap Hari Istimewa',
        subtitle: 'Satu lagi tahun yang kita lewati berdua, dan aku masih jatuh cinta padamu.',
      },
      story: { eyebrow: 'perjalanan kita', title: 'Dari Awal Sampai Hari Ini' },
      garden: {
        eyebrow: 'seikat untukmu',
        title: 'Satu Bunga untuk Tiap Hal yang Kusyukuri',
        note: 'sentuh tiap bunga untuk membaca maknanya',
        flowers: [
          { flower: 'rose', name: 'Mawar', meaning: 'Cinta yang tidak pernah habis' },
          { flower: 'sakura', name: 'Sakura', meaning: 'Hari pertama kita bertemu' },
          { flower: 'sunflower', name: 'Bunga Matahari', meaning: 'Kamu yang selalu menghangatkan' },
          { flower: 'tulip', name: 'Tulip', meaning: 'Bahagia yang sederhana' },
          { flower: 'lotus', name: 'Teratai', meaning: 'Tetap tumbuh di masa sulit' },
        ],
      },
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

  'dinner-date': {
    label: 'Undangan Makan Malam',
    note: 'Ajakan makan malam berdua: surat, alasan, hitung mundur ke malamnya, dan pertanyaan "mau?" di akhir.',
    preset: 'rose-gold-couple',
    sections: ['intro', 'hero', 'letter', 'reasons', 'countdown', 'question', 'finale'],
    content: {
      hero: {
        eyebrow: 'satu malam untuk kita',
        titleTop: 'Lilin Sudah Menyala,',
        titleBottom: 'Tinggal Kamu',
        subtitle: 'Mawar sudah di meja, gelas sudah terisi. Kursi di depanku masih menunggumu.',
      },
      letter: {
        label: 'undangan kecil',
        title: 'Aku ingin satu malam yang pelan, hanya berdua.',
        body:
          'Belakangan kita sama-sama sibuk, sampai lupa rasanya duduk lama tanpa terburu-buru. Jadi aku menyiapkan satu malam: lampu temaram, makanan yang enak, dan obrolan yang tidak perlu cepat selesai.\n\nTidak usah bawa apa-apa. Cukup datang dengan senyummu yang biasa.',
        signature: '— Yang menunggumu di meja',
      },
      reasons: {
        eyebrow: 'kenapa malam ini',
        title: 'Alasan Aku Mengajakmu',
        items: [
          { icon: 'heart', title: 'Rindu', body: 'Bertemu setiap hari pun, aku tetap rindu ngobrol lama denganmu.' },
          { icon: 'sparkle', title: 'Tawamu', body: 'Aku ingin mendengarnya di bawah cahaya lilin.' },
          { icon: 'star', title: 'Terima kasih', body: 'Untuk semua hari yang kamu buat lebih ringan.' },
          { icon: 'leaf', title: 'Kita', body: 'Karena hubungan juga perlu dirayakan, bukan hanya dijalani.' },
        ],
      },
      countdown: {
        eyebrow: 'catat tanggalnya',
        title: 'Menuju Malam Kita',
        targetAt: '2026-11-14T19:00',
        passedLabel: 'Malamnya sudah tiba. Aku menunggumu. 🕯️',
      },
      question: {
        eyebrow: 'jadi, bagaimana?',
        title: 'Mau makan malam bersamaku?',
        body: 'Jam tujuh malam. Aku yang jemput.',
        yesLabel: 'Mau!',
        noLabel: 'Nanti dulu',
        noBehavior: 'dodge',
        yesResponse: 'Yeay! Pakai baju yang paling kamu suka, ya. Sampai ketemu malam itu. 🌹',
      },
      finale: {
        eyebrow: 'sampai jumpa',
        title: 'Kursi di Depanku Milikmu',
        body: 'Malam ini, dan malam-malam berikutnya.',
        signature: 'Dengan cinta, dari aku',
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
