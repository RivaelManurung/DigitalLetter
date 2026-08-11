'use client';

import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

/**
 * Kendali kecil untuk panel Design section.
 *
 * Semua kendali di sini sepakat pada satu hal: `undefined` berarti "ikut
 * desain surat", bukan nol. Karena itu setiap kendali punya tombol reset —
 * tanpa itu, nilai yang sudah disentuh tidak akan pernah bisa dikembalikan
 * ke bawaan.
 */

function Row({
  label,
  hint,
  onReset,
  active,
  children,
}: {
  label: string;
  hint?: string;
  onReset: () => void;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs text-muted-foreground">{label}</Label>

        {active && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw size={10} />
            bawaan
          </button>
        )}
      </div>

      {children}
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Pemilih warna: kotak warna + kolom hex, supaya bisa tempel kode warna. */
export function ColorField({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value: string | undefined;
  /** warna yang sedang berlaku dari desain surat — dipakai sebagai contoh */
  fallback: string;
  onChange: (value: string | undefined) => void;
}) {
  const active = Boolean(value);

  return (
    <Row label={label} active={active} onReset={() => onChange(undefined)}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || fallback}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="h-8 w-10 shrink-0 cursor-pointer rounded-md border bg-background p-1"
        />
        <input
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder={fallback}
          spellCheck={false}
          className={cn(
            'h-8 w-full rounded-md border bg-background px-2 font-mono text-xs outline-none',
            'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
            !active && 'text-muted-foreground',
          )}
        />
      </div>
    </Row>
  );
}

/** Penggeser angka dengan nilai tampil di kanan label. */
export function SliderField({
  label,
  value,
  fallback,
  min,
  max,
  step,
  suffix = '',
  onChange,
}: {
  label: string;
  value: number | undefined;
  fallback: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number | undefined) => void;
}) {
  const active = typeof value === 'number';
  const shown = active ? value : fallback;

  return (
    <Row
      label={label}
      active={active}
      onReset={() => onChange(undefined)}
      hint={undefined}
    >
      <div className="flex items-center gap-2.5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={shown}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
        />
        <span
          className={cn(
            'w-14 shrink-0 text-right font-mono text-[11px] tabular-nums',
            active ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {round(shown)}
          {suffix}
        </span>
      </div>
    </Row>
  );
}

/** Pilihan singkat berbentuk deretan tombol — lebih cepat daripada dropdown. */
export function ChoiceField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | undefined;
  options: { value: T; label: string }[];
  onChange: (value: T | undefined) => void;
}) {
  return (
    <Row label={label} active={Boolean(value)} onReset={() => onChange(undefined)}>
      <div className="flex flex-wrap gap-1">
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={value === option.value ? 'default' : 'outline'}
            size="xs"
            onClick={() =>
              onChange(value === option.value ? undefined : option.value)
            }
          >
            {option.label}
          </Button>
        ))}
      </div>
    </Row>
  );
}

/** Kolom teks bebas — dipakai untuk URL gambar latar. */
export function TextField({
  label,
  value,
  placeholder,
  hint,
  onChange,
}: {
  label: string;
  value: string | undefined;
  placeholder?: string;
  hint?: string;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <Row
      label={label}
      hint={hint}
      active={Boolean(value)}
      onReset={() => onChange(undefined)}
    >
      <input
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder={placeholder}
        spellCheck={false}
        className="h-8 w-full rounded-md border bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
    </Row>
  );
}

/** Kelompok kendali dengan judul kecil. */
export function StyleGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {title}
      </p>
      {children}
    </div>
  );
}

/** Angka pecahan ditampilkan seperlunya: 1.2 tetap 1.2, 120 tidak jadi 120.0 */
function round(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0$/, '');
}
