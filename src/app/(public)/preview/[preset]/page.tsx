import { notFound } from 'next/navigation';
import { DESIGN_PRESETS } from '@/design/presets';
import { fontPairHref } from '@/design/fonts';
import { OCCASION_IDS, OCCASIONS, type OccasionId } from '@/design/occasions';
import type { LetterBundle } from '@/design/types';
import { defaultSectionsFor } from '@/lib/defaults';
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
    // Use the occasion built on this preset so the sample shows its own copy and art.
    sections: defaultSectionsFor(`preview-${preset}`, '', occasionFor(preset)).map((row) => ({
      id: `${preset}-${row.type}`,
      type: row.type,
      order: row.order,
      // galeri butuh media; contoh ini tidak punya, jadi dimatikan
      enabled: row.type !== 'gallery',
      variant: '',
      content: row.content,
      style: row.style,
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

function occasionFor(preset: string): OccasionId {
  return OCCASION_IDS.find((id) => OCCASIONS[id].preset === preset) ?? 'love';
}
