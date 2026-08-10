/**
 * Prompt siap tempel untuk pengguna yang ingin dibantu AI menulis suratnya.
 * Ditulis eksplisit soal batasan format karena satu heading yang berubah
 * membuat berkas gagal diimpor.
 */
export const AI_PROMPT = `Saya punya berkas template surat digital berformat markdown (terlampir).
Tolong tulis ulang isinya menjadi surat yang personal, hangat, dan mengalir.

Konteks yang bisa kamu pakai:
- Untuk siapa surat ini: (isi)
- Hubungan kami: (isi)
- Momen yang ingin disebut: (isi)
- Nada yang diinginkan: (mis. hangat, puitis, ringan, lucu)

Aturan format yang WAJIB dipatuhi:
1. Jangan ubah baris "## [tipe] ..." dan jangan ubah nama field sebelum tanda
   titik dua. Ubah hanya nilainya.
2. Teks panjang ditulis "field: >" lalu baris-baris berikutnya menjorok dua
   spasi. Baris kosong di dalam blok berarti paragraf baru.
3. Untuk menambah item daftar, salin seluruh blok "### alasan" atau
   "### bunga" beserta field-nya. Jangan mengarang nama blok baru.
4. Nilai "icon" dan "flower" hanya boleh dipilih dari yang sudah ada di
   berkas, jangan diganti dengan nama lain.
5. Jangan ubah nilai field "mediaIds".
6. Format teks yang didukung hanya **tebal**, *miring*, dan baris baru.

Balas dengan isi berkas markdown lengkap saja, tanpa penjelasan tambahan.`;
