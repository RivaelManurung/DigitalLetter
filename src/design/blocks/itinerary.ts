import { z } from 'zod';
import { defineBlock, glyphOptions, text } from './kit';

export const itineraryItemSchema = z.object({
  time: text(30).default(''),
  title: text(80).default(''),
  detail: text(200).default(''),
  icon: text(32).default('sparkle'),
});

/** Rundown acara per jam — pelengkap block Acara yang hanya menyebut waktu mulai. */
export const itineraryBlock = defineBlock({
  label: 'Rundown',
  note: 'Susunan acara per jam. Tambah blok "### agenda" untuk menambah.',
  group: 'nikahan',
  variants: ['timeline', 'list', 'cards'],
  schema: z.object({
    eyebrow: text(80).default(''),
    title: text(120).default('Susunan Acara'),
    note: text(200).default(''),
    items: z.array(itineraryItemSchema).max(20).default([]),
  }),
  starter: {
    eyebrow: 'rundown',
    title: 'Susunan Acara',
    note: '',
    items: [
      { time: '08.00', title: 'Akad Nikah', detail: 'Prosesi ijab kabul', icon: 'lotus' },
      { time: '10.00', title: 'Sesi Foto', detail: 'Foto keluarga & kerabat', icon: 'sparkle' },
      { time: '11.00', title: 'Resepsi', detail: 'Ramah tamah & santap siang', icon: 'rose' },
      { time: '14.00', title: 'Penutup', detail: 'Acara selesai', icon: 'heart' },
    ],
  },
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
    { key: 'title', label: 'Judul', kind: 'text' },
    { key: 'note', label: 'Catatan', kind: 'text' },
    {
      key: 'items',
      label: 'Agenda',
      kind: 'list',
      itemLabel: 'agenda',
      hint: 'maksimal 20',
      create: () => ({ time: '', title: '', detail: '', icon: 'sparkle' }),
      fields: [
        { key: 'time', label: 'Jam', kind: 'text', span: 'third', hint: 'mis. 08.00' },
        { key: 'icon', label: 'Ikon', kind: 'select', options: glyphOptions, span: 'third' },
        { key: 'title', label: 'Judul', kind: 'text', span: 'third' },
        { key: 'detail', label: 'Keterangan', kind: 'text' },
      ],
    },
  ],
});
