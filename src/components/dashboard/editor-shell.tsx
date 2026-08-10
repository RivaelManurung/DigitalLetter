'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Image as ImageIcon, Layers, Palette, Send } from 'lucide-react';
import { createRegistry } from '@/design/blocks/resolve';
import type { DesignSpec, LetterBundle, SectionRecord } from '@/design/types';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { ContentPanel } from './panels/content-panel';
import { DesignPanel } from './panels/design-panel';
import { MediaPanel } from './panels/media-panel';
import { PublishPanel } from './panels/publish-panel';
import { RsvpPanel } from './panels/rsvp-panel';
import { LivePreview } from './live-preview';

export type LetterMeta = {
  id: string;
  slug: string;
  title: string;
  recipientName: string;
  status: 'draft' | 'published';
  viewCount: number;
  publishedAt: string | null;
  opensAt: string | null;
  hasPassword: boolean;
};

type Tab = 'content' | 'design' | 'media' | 'publish';

const TABS: { id: Tab; label: string; icon: typeof Layers }[] = [
  { id: 'content', label: 'Konten', icon: Layers },
  { id: 'design', label: 'Desain', icon: Palette },
  { id: 'media', label: 'Media', icon: ImageIcon },
  { id: 'publish', label: 'Terbitkan', icon: Send },
];

/**
 * Editor kiri, preview kanan. Preview memakai state lokal — perubahan
 * tampil seketika tanpa menunggu simpan ke database. Penyimpanan berjalan
 * di belakang lewat Server Action.
 */
export function EditorShell({
  meta,
  bundle: initialBundle,
}: {
  meta: LetterMeta;
  bundle: LetterBundle;
}) {
  const [tab, setTab] = useState<Tab>('content');
  const [bundle, setBundle] = useState(initialBundle);

  // Registry gabungan: block bawaan + block bikinan sendiri yang ikut
  // dibawa di bundle. Dipakai form editor maupun preview.
  const registry = useMemo(
    () => createRegistry(initialBundle.customBlocks ?? []),
    [initialBundle.customBlocks],
  );

  const patchDesign = useCallback((design: DesignSpec) => {
    setBundle((prev) => ({ ...prev, design }));
  }, []);

  const patchSections = useCallback((sections: SectionRecord[]) => {
    setBundle((prev) => ({ ...prev, sections }));
  }, []);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: 'ghost', size: 'icon' })}
            aria-label="Kembali ke daftar surat"
          >
            <ArrowLeft size={15} />
          </Link>
          <div className="grid gap-0.5">
            <h1 className="text-sm font-semibold">{meta.title}</h1>
            <p className="text-xs text-muted-foreground">/l/{meta.slug}</p>
          </div>
        </div>

        <nav className="flex gap-1 rounded-lg border border-border p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                tab === id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,470px)_minmax(0,1fr)]">
        <div className="min-w-0">
          {tab === 'content' && (
            <ContentPanel
              letterId={meta.id}
              slug={meta.slug}
              sections={bundle.sections}
              media={bundle.media}
              registry={registry}
              onChange={patchSections}
            />
          )}
          {tab === 'design' && (
            <DesignPanel letterId={meta.id} design={bundle.design} onChange={patchDesign} />
          )}
          {tab === 'media' && (
            <MediaPanel
              letterId={meta.id}
              media={bundle.media}
              onChange={(media) => setBundle((prev) => ({ ...prev, media }))}
            />
          )}
          {tab === 'publish' && (
            <div className="grid gap-3">
              <PublishPanel meta={meta} />
              {/* Daftar jawaban hanya relevan kalau suratnya memang meminta. */}
              {bundle.sections.some((s) => s.type === 'rsvp') && (
                <RsvpPanel letterId={meta.id} />
              )}
            </div>
          )}
        </div>

        <LivePreview bundle={bundle} />
      </div>
    </div>
  );
}
