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
      { icon: 'rose', title: 'Senyummu', body: 'Menerangi setiap ruangan, dan setiap sudut hatiku.' },
      { icon: 'sparkle', title: 'Jiwamu', body: 'Langka, tulus, dan lebih indah dari bunga mana pun.' },
      { icon: 'sakura', title: 'Kebaikanmu', body: 'Caramu mencintai dunia membuatku ingin jadi lebih baik.' },
      { icon: 'star', title: 'Tawamu', body: 'Suara terbaik di semesta. Melodi favoritku, selalu.' },
      { icon: 'hibiscus', title: 'Kekuatanmu', body: 'Kamu melewati semuanya dengan begitu anggun.' },
      { icon: 'heart', title: 'Kamu Apa Adanya', body: 'Setiap versi dirimu — kamu lebih dari cukup.' },
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
