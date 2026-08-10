import { z } from 'zod';
import { defineBlock, text } from './kit';

export const galleryBlock = defineBlock({
  label: 'Galeri',
  note: 'Foto diunggah di tab Media — di sini hanya pemilihannya.',
  group: 'dasar',
  variants: ['grid', 'masonry', 'polaroid'],
  schema: z.object({
    eyebrow: text(80).default('captured in time'),
    title: text(120).default('Your Beautiful Pictures'),
    /** id media (kind = photo) yang dipakai section ini, terurut */
    mediaIds: z.array(z.string()).max(24).default([]),
  }),
  starter: {
    eyebrow: 'terekam dalam waktu',
    title: 'Foto-Foto Indahmu',
    mediaIds: [],
  },
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
    { key: 'title', label: 'Judul', kind: 'text' },
    {
      key: 'mediaIds',
      label: 'Foto yang dipakai',
      kind: 'photos',
      hint: 'id dipisah koma; kosongkan untuk memakai semua foto',
    },
  ],
});
