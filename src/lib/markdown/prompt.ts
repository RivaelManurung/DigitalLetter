import { BLOCKS, SECTION_TYPES, isListSpec } from '@/design/blocks';

/**
 * Prompt siap tempel untuk pengguna yang ingin dibantu AI menulis suratnya.
 * Ditulis eksplisit soal batasan format karena satu heading yang berubah
 * membuat berkas gagal diimpor.
 *
 * Daftar blok dan nama field dibangkitkan dari registry, jadi menambah block
 * baru tidak meninggalkan petunjuk yang usang di sini.
 */

const itemLabels = SECTION_TYPES.flatMap((type) =>
  BLOCKS[type].fields.filter(isListSpec).map((field) => `"### ${field.itemLabel}"`),
);

const hasDateTime = SECTION_TYPES.some((type) =>
  BLOCKS[type].fields.some(
    (field) =>
      (!isListSpec(field) && field.kind === 'datetime') ||
      (isListSpec(field) && field.fields.some((leaf) => leaf.kind === 'datetime')),
  ),
);

const rules = [
  'Jangan ubah baris "## [tipe] ..." dan jangan ubah nama field sebelum tanda\n   titik dua. Ubah hanya nilainya.',
  'Teks panjang ditulis "field: >" lalu baris-baris berikutnya menjorok dua\n   spasi. Baris kosong di dalam blok berarti paragraf baru.',
  `Untuk menambah item daftar, salin seluruh blok ${itemLabels.join(', ')}\n   beserta field-nya. Jangan mengarang nama blok baru.`,
  'Nilai yang dibatasi pilihan (mis. "icon", "flower", "kind") hanya boleh\n   diambil dari daftar yang tercantum di komentar berkas.',
  'Jangan ubah nilai field "mediaIds", "photoId", "bridePhotoId", dan\n   "groomPhotoId" — itu id foto, bukan teks.',
  ...(hasDateTime
    ? ['Field tanggal ditulis persis "2026-11-21T08:00" (tahun-bulan-tanggalTjam:menit).']
    : []),
  'Field yang berisi true/false ditulis apa adanya: true atau false.',
  'Format teks yang didukung hanya **tebal**, *miring*, dan baris baru.',
];

export const AI_PROMPT = `Saya punya berkas template surat digital berformat markdown (terlampir).
Tolong tulis ulang isinya menjadi surat yang personal, hangat, dan mengalir.

Konteks yang bisa kamu pakai:
- Untuk siapa surat ini: (isi)
- Hubungan kami: (isi)
- Momen yang ingin disebut: (isi)
- Nada yang diinginkan: (mis. hangat, puitis, ringan, lucu)

Aturan format yang WAJIB dipatuhi:
${rules.map((rule, i) => `${i + 1}. ${rule}`).join('\n')}

Balas dengan isi berkas markdown lengkap saja, tanpa penjelasan tambahan.`;
