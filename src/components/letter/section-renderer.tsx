import { parseSectionContent } from '@/design/schemas';
import type { DesignSpec, MediaRecord, SectionRecord } from '@/design/types';
import { FinaleSection } from '../sections/finale';
import { GallerySection } from '../sections/gallery';
import { GardenSection } from '../sections/garden';
import { HeroSection } from '../sections/hero';
import { LetterSection } from '../sections/letter';
import { ReasonsSection } from '../sections/reasons';

type Props = {
  section: SectionRecord;
  design: DesignSpec;
  media: MediaRecord[];
};

/**
 * Satu-satunya tempat yang memetakan tipe section → komponen.
 * Menambah tipe baru cukup: schema Zod + komponen + satu case di sini.
 *
 * `intro` sengaja tidak ada di sini — ia dirender oleh IntroGate di shell,
 * karena posisinya melapisi seluruh halaman, bukan mengalir dalam dokumen.
 */
export function SectionRenderer({ section, design, media }: Props) {
  const variant = design.variants[section.type] ?? 'default';

  switch (section.type) {
    case 'hero':
      return (
        <HeroSection
          content={parseSectionContent('hero', section.content)}
          design={design}
          variant={variant}
        />
      );

    case 'letter':
      return (
        <LetterSection
          content={parseSectionContent('letter', section.content)}
          design={design}
          variant={variant}
        />
      );

    case 'reasons':
      return (
        <ReasonsSection
          content={parseSectionContent('reasons', section.content)}
          design={design}
          variant={variant}
        />
      );

    case 'garden':
      return (
        <GardenSection
          content={parseSectionContent('garden', section.content)}
          design={design}
          variant={variant}
        />
      );

    case 'gallery':
      return (
        <GallerySection
          content={parseSectionContent('gallery', section.content)}
          design={design}
          media={media}
          variant={variant}
        />
      );

    case 'finale':
      return (
        <FinaleSection
          content={parseSectionContent('finale', section.content)}
          design={design}
          variant={variant}
        />
      );

    case 'intro':
    default:
      return null;
  }
}
