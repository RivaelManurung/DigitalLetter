import { z } from 'zod';
import { defineBlock, flag, text } from './kit';

/**
 * Hitung mundur ke satu tanggal. Dipakai undangan nikahan maupun ulang
 * tahun — karena itu labelnya netral, bukan khusus nikahan.
 */
export const countdownBlock = defineBlock({
  label: 'Hitung Mundur',
  note: 'Hitung mundur menuju tanggal acara.',
  group: 'perayaan',
  variants: ['boxes', 'minimal', 'ring'],
  schema: z.object({
    eyebrow: text(80).default(''),
    title: text(120).default('Menuju Hari Bahagia'),
    /** ISO 8601 lokal, mis. 2026-11-21T08:00 */
    targetAt: text(40).default(''),
    /** teks yang tampil setelah tanggal lewat */
    passedLabel: text(160).default('Hari yang dinanti telah tiba.'),
    showSeconds: flag(true),
  }),
  starter: {
    eyebrow: 'hitung mundur',
    title: 'Menuju Hari Bahagia',
    targetAt: '2026-11-21T08:00',
    passedLabel: 'Hari yang dinanti telah tiba.',
    showSeconds: true,
  },
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
    { key: 'title', label: 'Judul', kind: 'text' },
    { key: 'targetAt', label: 'Tanggal tujuan', kind: 'datetime' },
    { key: 'passedLabel', label: 'Teks setelah lewat', kind: 'text' },
    { key: 'showSeconds', label: 'Tampilkan detik', kind: 'switch' },
  ],
});
