import { z } from 'zod';
import { defineBlock, richText, text } from './kit';

export const heroBlock = defineBlock({
  label: 'Hero',
  note: 'Sampul surat. Judul dipecah dua baris.',
  group: 'dasar',
  variants: ['centered', 'split', 'editorial'],
  schema: z.object({
    eyebrow: text(80).default('a love letter in bloom'),
    titleTop: text(80).default('For You,'),
    titleBottom: text(80).default('My Everything'),
    subtitle: richText(240).default(''),
    scrollLabel: text(40).default('scroll to discover'),
  }),
  starter: {
    eyebrow: 'sebuah surat yang mekar',
    titleTop: 'Untukmu,',
    titleBottom: 'Segalanya Bagiku',
    subtitle: 'Setiap kelopak menyimpan bisikan tentang betapa berartinya kamu.',
    scrollLabel: 'gulir untuk melanjutkan',
  },
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
    { key: 'titleTop', label: 'Judul baris 1', kind: 'text', span: 'half' },
    {
      key: 'titleBottom',
      label: 'Judul baris 2',
      kind: 'text',
      hint: 'Ditampilkan miring & beraksen',
      span: 'half',
    },
    { key: 'subtitle', label: 'Subjudul', kind: 'longtext' },
    { key: 'scrollLabel', label: 'Teks scroll', kind: 'text' },
  ],
});
