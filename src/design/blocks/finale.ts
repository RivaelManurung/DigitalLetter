import { z } from 'zod';
import { defineBlock, richText, text } from './kit';

export const finaleBlock = defineBlock({
  label: 'Penutup',
  note: 'Bagian penutup surat.',
  group: 'dasar',
  variants: ['centered', 'heart', 'starlit'],
  schema: z.object({
    eyebrow: text(80).default('always & forever'),
    title: text(160).default('You Are Loved Beyond Words'),
    body: richText(1200).default(''),
    signature: text(120).default(''),
  }),
  starter: {
    eyebrow: 'selalu & selamanya',
    title: 'Kamu Dicintai Melebihi Kata',
    body:
      'Ke mana pun hidup membawa kita, ketahuilah bahwa di suatu tempat di semesta ini, ada taman yang mekar dengan setiap rasa yang pernah kusimpan untukmu. Kamu layak mendapatkan dunia.',
    signature: 'Dibuat dengan cinta, hanya untukmu',
  },
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
    { key: 'title', label: 'Judul', kind: 'text' },
    { key: 'body', label: 'Isi', kind: 'longtext', rows: 5 },
    { key: 'signature', label: 'Tanda tangan', kind: 'text' },
  ],
});
