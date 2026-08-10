import { z } from 'zod';
import { defineBlock, richText, text } from './kit';

/**
 * Satu kalimat yang berdiri sendiri. Jeda di antara bagian yang padat —
 * dipakai valentine, permintaan maaf, maupun undangan (ayat/petikan).
 */
export const quoteBlock = defineBlock({
  label: 'Kutipan',
  note: 'Satu kutipan atau ayat yang berdiri sendiri.',
  group: 'dasar',
  variants: ['centered', 'bordered', 'large'],
  schema: z.object({
    text: richText(600).default(''),
    source: text(120).default(''),
    translation: richText(600).default(''),
  }),
  starter: {
    text:
      'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya.',
    source: 'QS. Ar-Rum: 21',
    translation: '',
  },
  fields: [
    { key: 'text', label: 'Kutipan', kind: 'longtext', rows: 4 },
    { key: 'translation', label: 'Terjemahan', kind: 'longtext', rows: 3, hint: 'boleh kosong' },
    { key: 'source', label: 'Sumber', kind: 'text' },
  ],
});
