import { z } from 'zod';
import { defineBlock, text } from './kit';

export const introBlock = defineBlock({
  label: 'Pembuka',
  note: 'Layar kado sebelum surat terbuka.',
  group: 'dasar',
  // Melapisi seluruh halaman — dua pembuka berarti dua lapisan bertumpuk.
  unique: true,
  variants: ['gift', 'envelope', 'curtain'],
  schema: z.object({
    hint: text(60).default('tap to open'),
    label: text(80).default(''),
  }),
  starter: {
    hint: 'ketuk untuk membuka',
    label: '',
  },
  fields: [
    { key: 'hint', label: 'Teks ajakan', kind: 'text' },
    {
      key: 'label',
      label: 'Label di atas kado',
      kind: 'text',
      hint: 'Kosongkan kalau tidak perlu',
    },
  ],
});
