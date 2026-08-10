import { SECTION_SCHEMAS } from '@/design/schemas';
import type { SectionType } from '@/design/types';

/**
 * Isi awal surat baru. Editor tidak boleh menyambut user dengan halaman
 * kosong — lebih mudah menyunting kalimat yang sudah ada daripada memulai
 * dari nol.
 */

const STARTER: Record<SectionType, Record<string, unknown>> = {
  intro: {
    hint: 'ketuk untuk membuka',
    label: '',
  },
  hero: {
    eyebrow: 'sebuah surat yang mekar',
    titleTop: 'Untukmu,',
    titleBottom: 'Segalanya Bagiku',
    subtitle: 'Setiap kelopak menyimpan bisikan tentang betapa berartinya kamu.',
    scrollLabel: 'gulir untuk melanjutkan',
  },
  letter: {
    label: 'dari hatiku',
    title: 'Kamu adalah mimpi terliarku yang jadi nyata.',
    body:
      'Di dunia yang penuh hal biasa, kamu adalah yang luar biasa. Caramu tertawa, caramu peduli, caramu sekadar ada — semuanya mengisi setiap sudut duniaku dengan sesuatu yang tak pernah kutahu aku butuhkan.\n\nBunga-bunga ini tidak akan pernah cukup. Tidak ada kata yang cukup. Tapi semuanya membawa setiap rasa yang tak terucap, terselip di antara kelopaknya seperti surat-surat kecil yang menunggu ditemukan.',
    signature: '— Selalu milikmu',
  },
  reasons: {
    eyebrow: 'seribu alasan',
    title: 'Kenapa Aku Mencintaimu',
    items: [
      { icon: 'rose', title: 'Senyummu', body: 'Menerangi setiap ruangan, dan setiap sudut hatiku.' },
      { icon: 'sparkle', title: 'Jiwamu', body: 'Langka, tulus, dan lebih indah dari bunga mana pun.' },
      { icon: 'sakura', title: 'Kebaikanmu', body: 'Caramu mencintai dunia membuatku ingin jadi lebih baik.' },
      { icon: 'star', title: 'Tawamu', body: 'Suara terbaik di semesta. Melodi favoritku, selalu.' },
      { icon: 'hibiscus', title: 'Kekuatanmu', body: 'Kamu melewati semuanya dengan begitu anggun.' },
      { icon: 'heart', title: 'Kamu Apa Adanya', body: 'Setiap versi dirimu — kamu lebih dari cukup.' },
    ],
  },
  garden: {
    eyebrow: 'taman rahasia kita',
    title: 'Taman yang Tumbuh Hanya Untukmu',
    note: 'arahkan kursor ke tiap bunga untuk melihat maknanya',
    flowers: [
      { flower: 'rose', name: 'Mawar', meaning: 'Cinta Tanpa Akhir' },
      { flower: 'sakura', name: 'Sakura', meaning: 'Keindahan Lembut' },
      { flower: 'lotus', name: 'Teratai', meaning: 'Hati yang Murni' },
      { flower: 'hibiscus', name: 'Kembang Sepatu', meaning: 'Gairah yang Halus' },
      { flower: 'daisy', name: 'Daisy', meaning: 'Kesetiaan' },
      { flower: 'tulip', name: 'Tulip', meaning: 'Kebahagiaan Sempurna' },
      { flower: 'sunflower', name: 'Bunga Matahari', meaning: 'Hangat & Ceria' },
    ],
  },
  gallery: {
    eyebrow: 'terekam dalam waktu',
    title: 'Foto-Foto Indahmu',
    mediaIds: [],
  },
  finale: {
    eyebrow: 'selalu & selamanya',
    title: 'Kamu Dicintai Melebihi Kata',
    body:
      'Ke mana pun hidup membawa kita, ketahuilah bahwa di suatu tempat di semesta ini, ada taman yang mekar dengan setiap rasa yang pernah kusimpan untukmu. Kamu layak mendapatkan dunia.',
    signature: 'Dibuat dengan cinta, hanya untukmu',
  },
};

const DEFAULT_ORDER: SectionType[] = [
  'intro',
  'hero',
  'letter',
  'reasons',
  'garden',
  'gallery',
  'finale',
];

export function defaultSectionsFor(letterId: string, recipient: string) {
  return DEFAULT_ORDER.map((type, index) => {
    const starter = { ...STARTER[type] };

    if (type === 'intro' && recipient) {
      starter.label = `Untuk ${recipient}`;
    }

    return {
      letterId,
      type,
      order: index,
      enabled: true,
      content: SECTION_SCHEMAS[type].parse(starter) as Record<string, unknown>,
    };
  });
}

export function starterContent(type: SectionType): Record<string, unknown> {
  return SECTION_SCHEMAS[type].parse({ ...STARTER[type] }) as Record<string, unknown>;
}
