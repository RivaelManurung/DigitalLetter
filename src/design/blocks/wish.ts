import { z } from 'zod';
import { defineBlock, richText, text } from './kit';

export const wishItemSchema = z.object({
  text: text(200).default(''),
});

/**
 * Ucapan & harapan. Angka ulang tahun ditulis sebagai teks, bukan angka,
 * supaya "17" dan "Sweet 17" sama-sama bisa dipakai.
 */
export const wishBlock = defineBlock({
  label: 'Harapan',
  note: 'Ucapan besar dengan daftar harapan. Cocok untuk ulang tahun.',
  group: 'perayaan',
  variants: ['spotlight', 'cards', 'list'],
  schema: z.object({
    eyebrow: text(80).default(''),
    bigText: text(40).default(''),
    title: text(160).default('Selamat Ulang Tahun!'),
    body: richText(800).default(''),
    itemsTitle: text(120).default('Semoga di tahun ini'),
    items: z.array(wishItemSchema).max(20).default([]),
    signature: text(120).default(''),
  }),
  starter: {
    eyebrow: 'hari istimewa',
    bigText: '22',
    title: 'Selamat Ulang Tahun!',
    body:
      'Semoga umurmu berkah, hatimu selalu lapang, dan setiap langkahmu tahun ini membawamu lebih dekat ke hal-hal yang kamu impikan.',
    itemsTitle: 'Semoga di tahun ini',
    items: [
      { text: 'Sehat selalu, lahir dan batin.' },
      { text: 'Dimudahkan setiap urusan dan rezekinya.' },
      { text: 'Dikelilingi orang-orang yang tulus menyayangimu.' },
      { text: 'Berani mengejar hal yang selama ini kamu tunda.' },
    ],
    signature: '— Dari yang selalu mendoakanmu',
  },
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
    {
      key: 'bigText',
      label: 'Angka besar',
      kind: 'text',
      span: 'third',
      hint: 'mis. 22 — kosongkan kalau tidak perlu',
    },
    { key: 'title', label: 'Judul', kind: 'text' },
    { key: 'body', label: 'Isi ucapan', kind: 'longtext', rows: 5 },
    { key: 'itemsTitle', label: 'Judul daftar harapan', kind: 'text' },
    {
      key: 'items',
      label: 'Harapan',
      kind: 'list',
      itemLabel: 'harapan',
      hint: 'maksimal 20',
      create: () => ({ text: '' }),
      fields: [{ key: 'text', label: 'Harapan', kind: 'text' }],
    },
    { key: 'signature', label: 'Tanda tangan', kind: 'text' },
  ],
});
