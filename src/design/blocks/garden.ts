import { z } from 'zod';
import { defineBlock, glyphOptions, text } from './kit';

export const flowerItemSchema = z.object({
  flower: text(32).default('rose'),
  name: text(60).default(''),
  meaning: text(80).default(''),
});

export const gardenBlock = defineBlock({
  label: 'Taman',
  note: 'Taman bunga. Tambah blok "### bunga" untuk menambah item.',
  group: 'dasar',
  variants: ['row', 'arc', 'scatter'],
  schema: z.object({
    eyebrow: text(80).default('our secret garden'),
    title: text(120).default('A Garden Grown Just For You'),
    note: text(120).default('hover each flower to discover its meaning'),
    flowers: z.array(flowerItemSchema).max(12).default([]),
  }),
  starter: {
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
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
    { key: 'title', label: 'Judul', kind: 'text' },
    { key: 'note', label: 'Catatan bawah', kind: 'text' },
    {
      key: 'flowers',
      label: 'Bunga',
      kind: 'list',
      itemLabel: 'bunga',
      hint: 'maksimal 12 item',
      create: () => ({ flower: 'rose', name: '', meaning: '' }),
      fields: [
        { key: 'flower', label: 'Bentuk', kind: 'select', options: glyphOptions, span: 'third' },
        { key: 'name', label: 'Nama', kind: 'text', span: 'third' },
        { key: 'meaning', label: 'Makna', kind: 'text', span: 'third' },
      ],
    },
  ],
});
