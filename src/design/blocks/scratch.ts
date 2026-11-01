import { z } from 'zod';
import { defineBlock, richText, text } from './kit';

/** Lapisan embun/foil yang digosok jari untuk menyingkap foto dan pesan. */
export const scratchBlock = defineBlock({
  label: 'Gosok & Temukan',
  note: 'Jendela berembun atau kartu gosok. Penerima menggosok layar untuk melihat isinya.',
  group: 'interaksi',
  variants: ['frost', 'foil'],
  schema: z.object({
    eyebrow: text(80).default(''),
    title: text(120).default(''),
    hint: text(60).default('gosok di sini'),
    photoId: text(80).default(''),
    message: richText(400).default(''),
  }),
  starter: {
    eyebrow: 'ada sesuatu di balik kaca',
    title: 'Hapus Embunnya',
    hint: 'gosok di sini',
    photoId: '',
    message: 'Aku di sini, di balik jendela, menunggu Natal bersamamu.',
  },
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
    { key: 'title', label: 'Judul', kind: 'text' },
    { key: 'hint', label: 'Tulisan di embun', kind: 'text' },
    { key: 'photoId', label: 'Foto tersembunyi', kind: 'photo', hint: 'boleh kosong — pesan saja juga bisa' },
    { key: 'message', label: 'Pesan tersembunyi', kind: 'longtext', rows: 3 },
  ],
});
