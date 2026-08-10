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
    title: 'Kamu adalah mimpi terliarku yang jadi nyata.',
    body:
      'Di dunia yang penuh hal biasa, kamu adalah yang luar biasa. Caramu tertawa, caramu peduli, caramu sekadar ada — semuanya mengisi setiap sudut duniaku dengan sesuatu yang tak pernah kutahu aku butuhkan.\n\nBunga-bunga ini tidak akan pernah cukup. Tidak ada kata yang cukup. Tapi semuanya membawa setiap rasa yang tak terucap, terselip di antara kelopaknya seperti surat-surat kecil yang menunggu ditemukan.',
    signature: '— Selalu milikmu',
  },
  fields: [
    { key: 'label', label: 'Label', kind: 'text' },
    { key: 'title', label: 'Judul', kind: 'text' },
    { key: 'body', label: 'Isi surat', kind: 'longtext', rows: 9 },
    { key: 'signature', label: 'Tanda tangan', kind: 'text' },
  ],
});
