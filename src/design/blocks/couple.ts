import { z } from 'zod';
import { defineBlock, richText, text } from './kit';

/**
 * Mempelai. Dipakai undangan nikahan sebagai perkenalan kedua pihak,
 * lengkap dengan bin/binti dan orang tua — bagian yang selalu ada di
 * undangan Indonesia.
 */
export const coupleBlock = defineBlock({
  label: 'Mempelai',
  note: 'Perkenalan kedua mempelai beserta orang tua.',
  group: 'nikahan',
  variants: ['facing', 'stacked', 'ornate'],
  schema: z.object({
    eyebrow: text(80).default('bismillahirrahmanirrahim'),
    title: text(120).default('Assalamualaikum Wr. Wb.'),
    intro: richText(600).default(''),
    brideName: text(80).default(''),
    brideFull: text(120).default(''),
    brideParents: text(200).default(''),
    brideOrder: text(60).default(''),
    bridePhotoId: text(80).default(''),
    groomName: text(80).default(''),
    groomFull: text(120).default(''),
    groomParents: text(200).default(''),
    groomOrder: text(60).default(''),
    groomPhotoId: text(80).default(''),
    /** ditampilkan di antara kedua nama */
    separator: text(16).default('&'),
  }),
  starter: {
    eyebrow: 'bismillahirrahmanirrahim',
    title: 'Assalamualaikum Wr. Wb.',
    intro:
      'Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami:',
    brideName: 'Sarah',
    brideFull: 'Sarah Amalia, S.Pd.',
    brideParents: 'Putri dari Bapak Ahmad Suryana & Ibu Siti Rahayu',
    brideOrder: 'Putri pertama',
    bridePhotoId: '',
    groomName: 'Rizky',
    groomFull: 'Rizky Pratama, S.T.',
    groomParents: 'Putra dari Bapak Bambang Wijaya & Ibu Dewi Lestari',
    groomOrder: 'Putra kedua',
    groomPhotoId: '',
    separator: '&',
  },
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
    { key: 'title', label: 'Judul', kind: 'text' },
    { key: 'intro', label: 'Kalimat pembuka', kind: 'longtext', rows: 3 },
    { key: 'brideName', label: 'Nama panggilan mempelai wanita', kind: 'text', span: 'half' },
    { key: 'brideFull', label: 'Nama lengkap wanita', kind: 'text', span: 'half' },
    { key: 'brideOrder', label: 'Anak ke-', kind: 'text', span: 'half', hint: 'mis. Putri pertama' },
    { key: 'brideParents', label: 'Orang tua wanita', kind: 'text' },
    {
      key: 'bridePhotoId',
      label: 'Foto wanita',
      kind: 'photo',
      hint: 'Pilih satu dari foto yang diunggah di tab Media',
    },
    { key: 'groomName', label: 'Nama panggilan mempelai pria', kind: 'text', span: 'half' },
    { key: 'groomFull', label: 'Nama lengkap pria', kind: 'text', span: 'half' },
    { key: 'groomOrder', label: 'Anak ke-', kind: 'text', span: 'half', hint: 'mis. Putra kedua' },
    { key: 'groomParents', label: 'Orang tua pria', kind: 'text' },
    {
      key: 'groomPhotoId',
      label: 'Foto pria',
      kind: 'photo',
      hint: 'Pilih satu dari foto yang diunggah di tab Media',
    },
    { key: 'separator', label: 'Pemisah nama', kind: 'text', span: 'third' },
  ],
});
