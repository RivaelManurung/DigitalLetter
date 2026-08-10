import { notFound } from 'next/navigation';
import { DESIGN_PRESETS } from '@/design/presets';
import { fontPairHref } from '@/design/fonts';
import { SECTION_TYPES, type LetterBundle } from '@/design/types';
import { starterContent } from '@/lib/defaults';
import { LetterView } from '@/components/letter/letter-view';
import '@/styles/letter.css';

type Params = { params: Promise<{ preset: string }> };

/**
 * Galeri preset — merender surat contoh langsung dari data preset,
 * tanpa menyentuh database. Berguna untuk membandingkan desain sebelum
 * memilih, dan untuk mengecek engine tanpa perlu setup Supabase.
 */

export function generateStaticParams() {
  return Object.keys(DESIGN_PRESETS).map((preset) => ({ preset }));
}

export default async function PresetPreviewPage({ params }: Params) {
  const { preset } = await params;
  const design = DESIGN_PRESETS[preset];
  if (!design) notFound();

  const bundle: LetterBundle = {
    id: `preview-${preset}`,
    slug: preset,
    recipientName: '',
    design,
    sections: SECTION_TYPES.map((type, index) => ({
      id: `${preset}-${type}`,
      type,
      order: index,
      // galeri butuh media; contoh ini tidak punya, jadi dimatikan
      enabled: type !== 'gallery',
      content: starterContent(type),
    })),
    media: [],
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={fontPairHref(design.fontPair)} />
      <LetterView letter={bundle} />
    </>
  );
}
