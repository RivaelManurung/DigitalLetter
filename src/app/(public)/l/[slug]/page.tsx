import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fontPairHref } from '@/design/fonts';
import { LetterView } from '@/components/letter/letter-view';
import { ViewTracker } from '@/components/letter/view-tracker';
import { getLetterBundleBySlug, getLetterMeta } from '@/lib/queries';
import { serverEnv } from '@/lib/env';
import '@/styles/letter.css';

type Params = { params: Promise<{ slug: string }> };

/** Halaman surat di-cache; Server Action memanggil revalidate saat konten berubah. */
export const revalidate = 3600;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const meta = await getLetterMeta(slug);

  if (!meta || meta.status !== 'published') {
    return { title: 'Surat tidak ditemukan' };
  }

  const title = meta.title || `Untuk ${meta.recipientName}`;
  const url = `${serverEnv.siteUrl}/l/${slug}`;

  return {
    title,
    description: `Sebuah surat untuk ${meta.recipientName || 'kamu'}.`,
    openGraph: {
      title,
      description: `Sebuah surat untuk ${meta.recipientName || 'kamu'}.`,
      url,
      type: 'article',
      images: [{ url: `${serverEnv.siteUrl}/api/og/${slug}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      images: [`${serverEnv.siteUrl}/api/og/${slug}`],
    },
    robots: { index: false, follow: false },
  };
}

export default async function LetterPage({ params }: Params) {
  const { slug } = await params;
  const bundle = await getLetterBundleBySlug(slug, { publishedOnly: true });

  if (!bundle) notFound();

  return (
    <>
      {/* Font dimuat per-surat karena tiap desain memakai pasangan berbeda */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={fontPairHref(bundle.design.fontPair)} />

      <ViewTracker slug={slug} />
      <LetterView letter={bundle} />
    </>
  );
}
