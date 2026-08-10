import { z } from 'zod';
import { defineBlock, richText, text } from './kit';

export const giftAccountSchema = z.object({
  kind: text(20).default('bank'),
  provider: text(60).default(''),
  number: text(60).default(''),
  holder: text(80).default(''),
});

/**
 * Amplop digital. Nomor rekening ditampilkan dengan tombol salin —
 * bukan tautan pembayaran, supaya tidak ada uang yang lewat aplikasi ini.
 */
export const giftBlock = defineBlock({
  label: 'Amplop Digital',
  note: 'Rekening & alamat kirim hadiah. Tambah blok "### rekening" untuk menambah.',
  group: 'nikahan',
  variants: ['cards', 'list', 'envelope'],
  schema: z.object({
    eyebrow: text(80).default(''),
    title: text(120).default('Amplop Digital'),
    note: richText(400).default(''),
    accounts: z.array(giftAccountSchema).max(6).default([]),
    address: richText(300).default(''),
    addressLabel: text(80).default('Kirim hadiah ke'),
  }),
  starter: {
    eyebrow: 'tanda kasih',
    title: 'Amplop Digital',
    note:
      'Doa restu Bapak/Ibu sudah lebih dari cukup bagi kami. Namun bila berkenan memberi tanda kasih, kami sediakan kanal berikut.',
    accounts: [
      { kind: 'bank', provider: 'BCA', number: '1234567890', holder: 'Sarah Amalia' },
      { kind: 'ewallet', provider: 'GoPay', number: '081234567890', holder: 'Rizky Pratama' },
    ],
    address: 'Jl. Melati No. 12, Bandung, Jawa Barat 40123',
    addressLabel: 'Kirim hadiah ke',
  },
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
    { key: 'title', label: 'Judul', kind: 'text' },
    { key: 'note', label: 'Catatan', kind: 'longtext', rows: 3 },
    {
      key: 'accounts',
      label: 'Rekening',
      kind: 'list',
      itemLabel: 'rekening',
      hint: 'maksimal 6',
      create: () => ({ kind: 'bank', provider: '', number: '', holder: '' }),
      fields: [
        {
          key: 'kind',
          label: 'Jenis',
          kind: 'select',
          span: 'third',
          options: [
            { value: 'bank', label: 'Bank' },
            { value: 'ewallet', label: 'E-Wallet' },
            { value: 'other', label: 'Lainnya' },
          ],
        },
        { key: 'provider', label: 'Nama bank / dompet', kind: 'text', span: 'third' },
        { key: 'number', label: 'Nomor', kind: 'text', span: 'third' },
        { key: 'holder', label: 'Atas nama', kind: 'text' },
      ],
    },
    { key: 'addressLabel', label: 'Label alamat', kind: 'text', span: 'half' },
    { key: 'address', label: 'Alamat kirim hadiah', kind: 'longtext', rows: 2 },
  ],
});
