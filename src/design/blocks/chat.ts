import { z } from 'zod';
import { defineBlock, text } from './kit';

export const chatMessageSchema = z.object({
  from: z.enum(['aku', 'kamu']).default('aku'),
  text: text(400).default(''),
});

/** Percakapan yang "diketik" satu per satu di layar ponsel saat discroll. */
export const chatBlock = defineBlock({
  label: 'Chat',
  note: 'Percakapan ala aplikasi chat, muncul satu per satu dengan animasi mengetik.',
  group: 'interaksi',
  variants: ['phone', 'plain'],
  schema: z.object({
    eyebrow: text(80).default(''),
    title: text(120).default(''),
    contactName: text(40).default('Aku'),
    contactStatus: text(40).default('online'),
    photoId: text(80).default(''),
    wallpaper: z.enum(['', 'natal']).default(''),
    messages: z.array(chatMessageSchema).min(1).max(30).default([]),
  }),
  starter: {
    eyebrow: '24 desember, 23.58',
    title: '',
    contactName: 'Aku',
    contactStatus: 'online',
    photoId: '',
    wallpaper: 'natal',
    messages: [
      { from: 'aku', text: 'Kamu udah tidur?' },
      { from: 'kamu', text: 'Belum, kenapa?' },
      { from: 'aku', text: 'Dua menit lagi Natal.' },
      { from: 'aku', text: 'Aku cuma mau jadi orang pertama yang bilang…' },
      { from: 'kamu', text: 'Bilang apa? 👀' },
      { from: 'aku', text: 'Selamat Natal, sayang. Scroll ke bawah ya, ada yang mau kukasih 🎁' },
    ],
  },
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', kind: 'text', hint: 'mis. tanggal & jam' },
    { key: 'title', label: 'Judul', kind: 'text', hint: 'boleh kosong' },
    { key: 'contactName', label: 'Nama kontak', kind: 'text', span: 'half' },
    { key: 'contactStatus', label: 'Status', kind: 'text', span: 'half' },
    { key: 'photoId', label: 'Foto profil', kind: 'photo', span: 'half' },
    {
      key: 'wallpaper',
      label: 'Wallpaper chat',
      kind: 'select',
      span: 'half',
      options: [
        { value: '', label: 'Polos' },
        { value: 'natal', label: 'Natal (bintang & cemara)' },
      ],
    },
    {
      key: 'messages',
      label: 'Pesan',
      kind: 'list',
      itemLabel: 'pesan',
      hint: '"aku" = pengirim surat (kiri), "kamu" = penerima (kanan)',
      create: () => ({ from: 'aku', text: '' }),
      fields: [
        {
          key: 'from',
          label: 'Dari',
          kind: 'select',
          span: 'third',
          options: [
            { value: 'aku', label: 'Aku' },
            { value: 'kamu', label: 'Kamu' },
          ],
        },
        { key: 'text', label: 'Pesan', kind: 'longtext', rows: 2 },
      ],
    },
  ],
});
