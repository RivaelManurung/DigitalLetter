import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Digital Letter',
  description: 'Surat digital yang bisa dikustom sepenuhnya.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
