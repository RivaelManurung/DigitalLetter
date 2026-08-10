import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';
import './globals.css';

/**
 * Geist dipasang sebagai custom property, bukan langsung sebagai kelas —
 * `--font-sans` di globals.css merujuknya lalu menambahkan fallback sistem,
 * jadi teks tidak pernah jatuh ke serif bawaan saat font masih dimuat.
 */
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Digital Letter',
    template: '%s · Digital Letter',
  },
  description: 'Surat digital yang bisa dikustom sepenuhnya.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={cn('h-full antialiased', geist.variable)}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
