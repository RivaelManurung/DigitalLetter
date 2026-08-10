'use client';

import { Check } from 'lucide-react';
import { PRESET_LIST } from '@/design/presets';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  onChange: (id: string) => void;
};

/** Preset dipilih lewat swatch, bukan nama — warna lebih cepat dibaca mata. */
export function PresetPicker({ value, onChange }: Props) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {PRESET_LIST.map((preset) => {
        const active = preset.id === value;
        return (
          <li key={preset.id}>
            <button
              type="button"
              onClick={() => onChange(preset.id)}
              aria-pressed={active}
              className={cn(
                'group relative w-full overflow-hidden rounded-lg border text-left transition-colors',
                active ? 'border-foreground' : 'border-border hover:border-ring',
              )}
            >
              <span
                className="block h-11 w-full"
                style={{
                  background: `linear-gradient(120deg, ${preset.swatch[0]}, ${preset.swatch[1]} 55%, ${preset.swatch[2]})`,
                }}
              />
              <span className="flex items-center justify-between gap-2 px-2.5 py-1.5">
                <span className="truncate text-[11px] font-medium">{preset.name}</span>
                {active && <Check size={12} className="shrink-0" />}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
