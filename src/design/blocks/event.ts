import { z } from 'zod';
import { defineBlock, richText, text } from './kit';

export const eventItemSchema = z.object({
  name: text(80).default(''),
  /** ISO 8601 lokal, mis. 2026-11-21T09:00 */
  startsAt: text(40).default(''),
  endsAt: text(40).default(''),
  venue: text(120).default(''),
  address: richText(300).default(''),
  mapUrl: text(500).default(''),
  note: text(160).default(''),
});

/**
 * Akad & resepsi. Satu block memuat beberapa acara sekaligus karena
 * undangan hampir selalu menyebut keduanya berdampingan.
 */
export const eventBlock = defineBlock({
  label: 'Acara',
  note: 'Waktu & tempat acara. Tambah blok "### acara" untuk akad/resepsi.',
  group: 'nikahan',
  variants: ['cards', 'timeline', 'split'],
  schema: z.object({
    eyebrow: text(80).default('save the date'),
    title: text(120).default('Waktu & Tempat'),
    note: text(200).default(''),
    events: z.array(eventItemSchema).max(6).default([]),
  }),
  starter: {
    eyebrow: 'catat tanggalnya',
    title: 'Waktu & Tempat',
    note: 'Merupakan suatu kehormatan bagi kami apabila Bapak/Ibu berkenan hadir.',
    events: [
      {
        name: 'Akad Nikah',
        startsAt: '2026-11-21T08:00',
        endsAt: '2026-11-21T10:00',
        venue: 'Masjid Agung Al-Azhar',
        address: 'Jl. Sisingamangaraja, Kebayoran Baru, Jakarta Selatan',
        mapUrl: '',
        note: 'Mohon hadir 15 menit sebelum acara dimulai.',
      },
      {
        name: 'Resepsi',
        startsAt: '2026-11-21T11:00',
        endsAt: '2026-11-21T14:00',
        venue: 'Balai Kartini, Ruby Room',
        address: 'Jl. Gatot Subroto Kav. 37, Jakarta Selatan',
        mapUrl: '',
        note: '',
      },
    ],
  },
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
    { key: 'title', label: 'Judul', kind: 'text' },
    { key: 'note', label: 'Catatan', kind: 'longtext', rows: 2 },
    {
      key: 'events',
      label: 'Acara',
      kind: 'list',
      itemLabel: 'acara',
      hint: 'maksimal 6 acara',
      create: () => ({
        name: '',
        startsAt: '',
        endsAt: '',
        venue: '',
        address: '',
        mapUrl: '',
        note: '',
      }),
      fields: [
        { key: 'name', label: 'Nama acara', kind: 'text' },
        { key: 'startsAt', label: 'Mulai', kind: 'datetime', span: 'half' },
        { key: 'endsAt', label: 'Selesai', kind: 'datetime', span: 'half', hint: 'boleh kosong' },
        { key: 'venue', label: 'Tempat', kind: 'text' },
        { key: 'address', label: 'Alamat', kind: 'longtext', rows: 2 },
        {
          key: 'mapUrl',
          label: 'Tautan peta',
          kind: 'text',
          hint: 'Google Maps — tombol "Lihat lokasi" muncul kalau diisi',
        },
        { key: 'note', label: 'Catatan', kind: 'text' },
      ],
    },
  ],
});
