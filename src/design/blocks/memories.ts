import { z } from 'zod';
import { defineBlock, richText, text } from './kit';

export const memoryItemSchema = z.object({
  title: text(80).default(''),
  body: richText(400).default(''),
  photoId: text(80).default(''),
  date: text(60).default(''),
});

/**
 * Kenangan berpasangan foto. Bedanya dengan Galeri: di sini tiap foto punya
 * cerita sendiri, bukan sekadar kumpulan gambar.
 */
export const memoriesBlock = defineBlock({
  label: 'Kenangan',
  note: 'Foto beserta ceritanya. Tambah blok "### kenangan" untuk menambah.',
  group: 'perayaan',
  variants: ['polaroid', 'alternating', 'stack'],
  schema: z.object({
    eyebrow: text(80).default(''),
    title: text(120).default('Kenangan Kita'),
    note: text(200).default(''),
    items: z.array(memoryItemSchema).max(16).default([]),
  }),
  starter: {
    eyebrow: 'yang tak terlupakan',
    title: 'Kenangan Kita',
    note: '',
    items: [
      {
        title: 'Hari pertama',
        date: '',
        body: 'Aku masih ingat baju yang kamu pakai dan kalimat pertama yang kamu ucapkan. Waktu itu rasanya biasa saja, ternyata itu awal dari hampir semua hal baik dalam hidupku.',
        photoId: '',
      },
      {
        title: 'Perjalanan itu',
        date: '',
        body: 'Tanpa rencana dan tanpa persiapan. Kita tersesat dua kali dan kehujanan sekali, tapi sampai sekarang itu masih jadi salah satu hari favoritku.',
        photoId: '',
      },
    ],
  },
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
    { key: 'title', label: 'Judul', kind: 'text' },
    { key: 'note', label: 'Catatan', kind: 'text' },
    {
      key: 'items',
      label: 'Kenangan',
      kind: 'list',
      itemLabel: 'kenangan',
      hint: 'maksimal 16',
      create: () => ({ title: '', body: '', photoId: '', date: '' }),
      fields: [
        { key: 'title', label: 'Judul', kind: 'text', span: 'half' },
        { key: 'date', label: 'Waktu', kind: 'text', span: 'half', hint: 'boleh kosong' },
        { key: 'body', label: 'Cerita', kind: 'longtext', rows: 3 },
        { key: 'photoId', label: 'Foto', kind: 'photo' },
      ],
    },
  ],
});
