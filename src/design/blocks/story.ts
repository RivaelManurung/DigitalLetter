import { z } from 'zod';
import { defineBlock, richText, text } from './kit';

export const storyItemSchema = z.object({
  date: text(60).default(''),
  title: text(80).default(''),
  body: richText(500).default(''),
  photoId: text(80).default(''),
});

/**
 * Perjalanan cerita. Dipakai nikahan ("love story") maupun ulang tahun
 * atau permintaan maaf — urutan waktu yang sama, isi yang berbeda.
 */
export const storyBlock = defineBlock({
  label: 'Cerita',
  note: 'Linimasa perjalanan. Tambah blok "### cerita" untuk menambah babak.',
  group: 'nikahan',
  variants: ['timeline', 'alternating', 'cards'],
  schema: z.object({
    eyebrow: text(80).default(''),
    title: text(120).default('Perjalanan Kami'),
    note: text(200).default(''),
    items: z.array(storyItemSchema).max(16).default([]),
  }),
  starter: {
    eyebrow: 'love story',
    title: 'Perjalanan Kami',
    note: '',
    items: [
      {
        date: 'Maret 2019',
        title: 'Pertama Bertemu',
        body: 'Dipertemukan di sebuah acara kampus. Obrolan singkat yang ternyata jadi awal segalanya.',
        photoId: '',
      },
      {
        date: 'Agustus 2021',
        title: 'Mulai Bersama',
        body: 'Memutuskan untuk melangkah berdua, dengan segala suka dan dukanya.',
        photoId: '',
      },
      {
        date: 'Desember 2025',
        title: 'Lamaran',
        body: 'Bertemu keluarga, meminta restu, dan menetapkan tanggal yang dinanti.',
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
      label: 'Babak',
      kind: 'list',
      itemLabel: 'cerita',
      hint: 'maksimal 16',
      create: () => ({ date: '', title: '', body: '', photoId: '' }),
      fields: [
        { key: 'date', label: 'Waktu', kind: 'text', span: 'half', hint: 'mis. Maret 2019' },
        { key: 'title', label: 'Judul', kind: 'text', span: 'half' },
        { key: 'body', label: 'Cerita', kind: 'longtext', rows: 3 },
        { key: 'photoId', label: 'Foto', kind: 'photo', hint: 'boleh kosong' },
      ],
    },
  ],
});
