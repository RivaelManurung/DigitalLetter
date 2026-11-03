import { Palette } from 'lucide-react';
import { DESIGN_PRESETS } from '@/design/presets';
import { PanelCard } from './panel-card';

/** Presets that ship with art, shown as a scrollable strip linking to their live preview. */
export function ThemeGallery() {
  const themes = Object.values(DESIGN_PRESETS).filter((p) => p.surface.image);

  return (
    <PanelCard title="Galeri tema" icon={Palette} meta={`${Object.keys(DESIGN_PRESETS).length} tema siap pakai`}>
      <ul className="-mx-5 -my-1 flex snap-x gap-3 overflow-x-auto px-5 py-1 pb-2">
        {themes.map((t) => (
          <li key={t.preset} className="snap-start">
            <a
              href={`/preview/${t.preset}`}
              target="_blank"
              rel="noreferrer"
              className="group relative block h-36 w-52 overflow-hidden rounded-xl border transition-colors hover:border-foreground/30"
            >
              <span
                aria-hidden
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${JSON.stringify(t.surface.image)})`, backgroundColor: t.palette.bgDeep }}
              />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <span className="absolute inset-x-3 bottom-3 grid gap-1.5 text-white">
                <span className="text-sm font-semibold">{t.name}</span>
                <span className="flex gap-1">
                  {[t.palette.bgDeep, t.palette.bgSoft, t.palette.accent, t.palette.text].map((c) => (
                    <span key={c} className="size-3 rounded-full ring-1 ring-white/40" style={{ background: c }} />
                  ))}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}
