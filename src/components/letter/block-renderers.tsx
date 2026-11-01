import type { ComponentType } from 'react';
import type { SectionType } from '@/design/blocks';
import type { DesignSpec, MediaRecord } from '@/design/types';

import { HeroSection } from '../sections/hero';
import { LetterSection } from '../sections/letter';
import { QuoteSection } from '../sections/quote';
import { ReasonsSection } from '../sections/reasons';
import { GardenSection } from '../sections/garden';
import { GallerySection } from '../sections/gallery';
import { FinaleSection } from '../sections/finale';
import { CoupleSection } from '../sections/couple';
import { EventSection } from '../sections/event';
import { CountdownSection } from '../sections/countdown';
import { ItinerarySection } from '../sections/itinerary';
import { StorySection } from '../sections/story';
import { GiftSection } from '../sections/gift';
import { RsvpSection } from '../sections/rsvp';
import { QuestionSection } from '../sections/question';
import { MemoriesSection } from '../sections/memories';
import { WishSection } from '../sections/wish';
import { ChatSection } from '../sections/chat';
import { UnwrapSection } from '../sections/unwrap';
import { ScratchSection } from '../sections/scratch';

/**
 * Peta tipe section → komponen. Bersama design/blocks/index.ts, ini
 * satu-satunya tempat yang perlu disunting saat menambah jenis section.
 *
 * `intro` sengaja tidak ada di sini — ia dirender oleh IntroGate di shell,
 * karena posisinya melapisi seluruh halaman, bukan mengalir dalam dokumen.
 */

export type BlockProps = {
  // Konten sudah lewat schema block-nya sendiri di SectionRenderer.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  design: DesignSpec;
  variant: string;
  media: MediaRecord[];
  letterId: string;
};

export const BLOCK_RENDERERS: Partial<Record<SectionType, ComponentType<BlockProps>>> = {
  hero: HeroSection,
  letter: LetterSection,
  quote: QuoteSection,
  reasons: ReasonsSection,
  garden: GardenSection,
  gallery: GallerySection,
  couple: CoupleSection,
  event: EventSection,
  countdown: CountdownSection,
  itinerary: ItinerarySection,
  story: StorySection,
  gift: GiftSection,
  rsvp: RsvpSection,
  question: QuestionSection,
  memories: MemoriesSection,
  wish: WishSection,
  chat: ChatSection,
  unwrap: UnwrapSection,
  scratch: ScratchSection,
  finale: FinaleSection,
};
