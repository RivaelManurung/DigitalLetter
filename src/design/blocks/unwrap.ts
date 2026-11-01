import { z } from 'zod';
import { defineBlock, richText, text } from './kit';

export const unwrapItemSchema = z.object({
  tag: text(40).default(''),
  title: text(80).default(''),
  body: richText(400).default(''),
  photoId: text(80).default(''),
});

/** Tumpukan kado yang dibuka satu per satu; isinya baru terlihat setelah diketuk. */
export const unwrapBlock = defineBlock({
  label: 'Tumpukan Kado',
  note: 'Kado yang dibuka satu per satu. Tiap kado berisi foto, kupon, atau pesan.',
  group: 'interaksi',
  variants: ['pile', 'grid'],
  schema: z.object({
    eyebrow: text(80).default(''),
    title: text(120).default('Kado Untukmu'),
    hint: text(80).default('ketuk kado untuk membukanya'),
    doneNote: text(200).default(''),
    items: z.array(unwrapItemSchema).min(1).max(9).default([]),
  }),
  starter: {
    eyebrow: 'di bawah pohon',
    title: 'Ada Kado Untukmu',
    hint: 'ketuk kado untuk membukanya',
    doneNote: 'Semua kado sudah terbuka. Tapi kado terbaikku tetap kamu.',
    items: [
      { tag: 'Buka dulu', title: 'Kupon Peluk', body: 'Berlaku kapan saja, tanpa batas waktu. Tukarkan langsung ke aku.', photoId: '' },
      { tag: 'Yang ini', title: 'Kencan Natal', body: 'Satu malam lihat lampu kota, cokelat panas, dan kamu pilih filmnya.', photoId: '' },
      { tag: 'Terakhir', title: 'Janji Kecil', body: 'Tahun depan, Natal kita rayakan berdua lagi.', photoId: '' },
    ],
  },
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
    { key: 'title', label: 'Judul', kind: 'text' },
    { key: 'hint', label: 'Teks ajakan', kind: 'text' },
    { key: 'doneNote', label: 'Pesan setelah semua terbuka', kind: 'text', hint: 'boleh kosong' },
    {
      key: 'items',
      label: 'Kado',
      kind: 'list',
      itemLabel: 'kado',
      hint: '1–9 kado',
      create: () => ({ tag: '', title: '', body: '', photoId: '' }),
      fields: [
        { key: 'tag', label: 'Label di kado', kind: 'text', span: 'half' },
        { key: 'title', label: 'Judul isi', kind: 'text', span: 'half' },
        { key: 'body', label: 'Isi', kind: 'longtext', rows: 3 },
        { key: 'photoId', label: 'Foto', kind: 'photo' },
      ],
    },
  ],
});
