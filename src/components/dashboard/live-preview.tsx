'use client';

import { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import type { LetterBundle } from '@/design/types';
import { fontPairHref, usedFontPairIds } from '@/design/fonts';
import { LetterView } from '@/components/letter/letter-view';
import { cn } from '@/lib/utils';
import '@/styles/letter.css';

/**
 * Preview dirender langsung (bukan iframe) supaya perubahan state tampil
 * seketika tanpa postMessage. Isolasi visual dijaga oleh `.letter-root`
 * yang membawa seluruh tokennya sendiri — CSS dashboard tidak bocor
 * ke dalam, dan sebaliknya.
 */
/** Tinggi panel preview — dipakai bersama sebagai `--preview-vh` supaya
 *  section setinggi-layar ikut menyesuaikan panel, bukan viewport browser. */
const PREVIEW_HEIGHT = '74dvh';

export function LivePreview({ bundle }: { bundle: LetterBundle }) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div
      className="grid min-w-0 gap-2 self-start lg:sticky lg:top-4"
      style={{ '--preview-vh': PREVIEW_HEIGHT } as React.CSSProperties}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">Pratinjau langsung</p>

        <div className="flex gap-1 rounded-lg border border-border p-1">
          {(
            [
              { id: 'desktop', icon: Monitor, label: 'Desktop' },
              { id: 'mobile', icon: Smartphone, label: 'Ponsel' },
            ] as const
          ).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setDevice(id)}
              aria-label={label}
              aria-pressed={device === id}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                device === id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* Font pasangan aktif dimuat di dokumen dashboard agar preview akurat —
          termasuk font yang dipilih sendiri oleh masing-masing section. */}
      {usedFontPairIds(bundle.design.fontPair, bundle.sections).map((id) => (
        <link key={id} rel="stylesheet" href={fontPairHref(id)} />
      ))}

      {/* Tinggi dipatok ke panel, bukan diregangkan mengikuti tinggi kolom
          editor — kalau diregangkan, sisa ruang muncul sebagai blok kosong. */}
      <div
        className="overflow-hidden rounded-xl border border-border bg-muted"
        style={{ height: PREVIEW_HEIGHT }}
      >
        <div
          className={cn(
            'mx-auto h-full overflow-y-auto overflow-x-hidden transition-[width] duration-300',
            device === 'mobile' ? 'w-[390px] max-w-full' : 'w-full',
          )}
        >
          <LetterView letter={bundle} preview />
        </div>
      </div>
    </div>
  );
}
