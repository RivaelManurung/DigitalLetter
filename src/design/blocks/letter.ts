import { z } from 'zod';
import { defineBlock, richText, text } from './kit';

export const letterBlock = defineBlock({
  label: 'Surat',
  note: 'Isi surat utama. Pisahkan paragraf dengan satu baris kosong.',
  group: 'dasar',
  variants: ['glass', 'paper', 'minimal'],
  schema: z.object({
    label: text(80).default('from my heart'),
    title: text(160).default(''),
    /** markdown ringan: **tebal**, *miring*, baris baru */
    body: richText(2000).default(''),
    signature: text(120).default(''),
  }),
  starter: {
    label: 'dari hatiku',
    title: 'Ada banyak hal yang belum sempat kukatakan padamu.',
    body:
      'Aku sering memikirkan hidupku sebelum kamu ada. Semuanya berjalan, tapi terasa seperti menunggu sesuatu yang tidak kutahu namanya. Lalu kamu datang, dan pelan-pelan aku mengerti apa yang selama ini kutunggu.\n\nKamu tidak mengubah duniaku dengan hal-hal besar. Kamu mengubahnya lewat hal kecil: pesan selamat pagi yang tidak pernah absen, caramu mengingat cerita yang bahkan aku sendiri sudah lupa, dan tanganmu yang selalu mencari tanganku saat kita menyeberang jalan.\n\nSurat ini tidak akan pernah cukup untuk menjelaskan semuanya. Tapi setidaknya kamu tahu: di setiap hari yang kujalani, ada bagian dari diriku yang selalu bersyukur karena kamu ada.',
    signature: '— Selalu milikmu',
  },
  fields: [
    { key: 'label', label: 'Label', kind: 'text' },
    { key: 'title', label: 'Judul', kind: 'text' },
    { key: 'body', label: 'Isi surat', kind: 'longtext', rows: 9 },
    { key: 'signature', label: 'Tanda tangan', kind: 'text' },
  ],
});
