import { z } from 'zod';
import { defineBlock, richText, text } from './kit';

/**
 * Pertanyaan dengan dua tombol — inti dari surat "nembak".
 *
 * Tombol "tidak" punya tiga perilaku (`noBehavior`) supaya penulis bisa
 * memilih nada: menghindar (bercanda), pindah acak (menggoda), atau
 * benar-benar bisa ditekan (jujur). Jawaban dicatat lewat block RSVP bila
 * penulis ingin tahu hasilnya — block ini sendiri tidak menyimpan apa pun
 * ke server, hanya menampilkan respons di layar.
 */
export const questionBlock = defineBlock({
  label: 'Pertanyaan',
  note: 'Pertanyaan dengan tombol ya/tidak. Cocok untuk nembak atau ajakan.',
  group: 'interaksi',
  variants: ['centered', 'card', 'playful'],
  schema: z.object({
    eyebrow: text(80).default(''),
    title: text(200).default('Maukah kamu jadi pacarku?'),
    body: richText(600).default(''),
    yesLabel: text(60).default('Mau!'),
    noLabel: text(60).default('Nggak'),
    /** dodge = menghindar · shrink = mengecil · normal = bisa ditekan */
    noBehavior: text(20).default('dodge'),
    yesResponse: richText(600).default(''),
    noResponse: richText(600).default(''),
  }),
  starter: {
    eyebrow: 'ada yang mau kutanyakan',
    title: 'Maukah kamu jadi pacarku?',
    body: 'Aku sudah lama memendam ini. Tidak ada cara yang lebih baik selain bertanya langsung.',
    yesLabel: 'Mau!',
    noLabel: 'Nggak',
    noBehavior: 'dodge',
    yesResponse:
      'Terima kasih sudah bilang iya. Aku janji akan menjagamu sebaik-baiknya. 💛',
    noResponse: 'Tidak apa-apa. Terima kasih sudah jujur — aku tetap menghargaimu.',
  },
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
    { key: 'title', label: 'Pertanyaan', kind: 'text' },
    { key: 'body', label: 'Penjelasan', kind: 'longtext', rows: 3 },
    { key: 'yesLabel', label: 'Teks tombol "ya"', kind: 'text', span: 'half' },
    { key: 'noLabel', label: 'Teks tombol "tidak"', kind: 'text', span: 'half' },
    {
      key: 'noBehavior',
      label: 'Perilaku tombol "tidak"',
      kind: 'select',
      options: [
        { value: 'dodge', label: 'Menghindari kursor' },
        { value: 'shrink', label: 'Mengecil tiap ditekan' },
        { value: 'normal', label: 'Biasa — bisa ditekan' },
      ],
    },
    { key: 'yesResponse', label: 'Balasan kalau "ya"', kind: 'longtext', rows: 3 },
    {
      key: 'noResponse',
      label: 'Balasan kalau "tidak"',
      kind: 'longtext',
      rows: 2,
      hint: 'Hanya tampil kalau perilaku tombol "biasa"',
    },
  ],
});
