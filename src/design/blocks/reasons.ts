import { z } from 'zod';
import { defineBlock, glyphOptions, richText, text } from './kit';

export const reasonItemSchema = z.object({
  icon: text(32).default('rose'),
  title: text(80).default(''),
  body: richText(400).default(''),
});

export const reasonsBlock = defineBlock({
  label: 'Alasan',
  note: 'Daftar alasan. Tambah blok "### alasan" untuk menambah item.',
  group: 'dasar',
  variants: ['grid', 'bento', 'numbered'],
  schema: z.object({
    eyebrow: text(80).default('a thousand reasons why'),
    title: text(120).default('Why I Love You'),
    items: z.array(reasonItemSchema).max(24).default([]),
  }),
  starter: {
    eyebrow: 'seribu alasan',
    title: 'Kenapa Aku Mencintaimu',
    items: [
      { icon: 'rose', title: 'Caramu tersenyum', body: 'Senyummu selalu datang lebih dulu dari kata-katamu, dan entah bagaimana selalu tiba tepat saat aku paling membutuhkannya.' },
      { icon: 'sparkle', title: 'Ketulusanmu', body: 'Kamu baik bahkan kepada orang yang tidak pernah tahu kamu sedang berbuat baik. Itu yang membuatku kagum setiap hari.' },
      { icon: 'sakura', title: 'Caramu peduli', body: 'Kamu ingat makanan yang tidak kusuka, lagu yang membuatku sedih, dan tanggal-tanggal kecil yang bahkan aku sendiri lupa.' },
      { icon: 'star', title: 'Tawamu', body: 'Tawamu lepas dan tidak dibuat-buat. Mendengarnya seperti diingatkan bahwa hidup tidak perlu selalu serius.' },
      { icon: 'hibiscus', title: 'Kekuatanmu', body: 'Kamu pernah melewati hari-hari berat tanpa banyak mengeluh, dan tetap punya ruang untuk menguatkan orang lain.' },
      { icon: 'heart', title: 'Kamu apa adanya', body: 'Versi dirimu yang rapi maupun yang berantakan, yang ceria maupun yang lelah. Semuanya sudah lebih dari cukup bagiku.' },
    ],
  },
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
    { key: 'title', label: 'Judul', kind: 'text' },
    {
      key: 'items',
      label: 'Alasan',
      kind: 'list',
      itemLabel: 'alasan',
      hint: 'maksimal 24 item',
      create: () => ({ icon: 'rose', title: '', body: '' }),
      fields: [
        { key: 'icon', label: 'Ikon', kind: 'select', options: glyphOptions, span: 'third' },
        { key: 'title', label: 'Judul', kind: 'text' },
        { key: 'body', label: 'Teks', kind: 'longtext', rows: 2 },
      ],
    },
  ],
});
