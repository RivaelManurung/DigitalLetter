import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Input as ShadInput } from './input';
import { Textarea as ShadTextarea } from './textarea';
import { Label } from './label';

/**
 * Lapisan tipis di atas komponen shadcn.
 *
 * Panel editor surat memakai API lama (`<Field label>`, `<Select>` dengan
 * `<option>`) di banyak tempat. Berkas ini menjaga API itu tetap jalan
 * sambil memakai tampilan shadcn di baliknya — jadi tidak ada panel yang
 * perlu ditulis ulang, dan tampilannya tetap seragam.
 */

export function Input(props: ComponentProps<'input'>) {
  return <ShadInput {...props} />;
}

export function Textarea(props: ComponentProps<'textarea'>) {
  return <ShadTextarea {...props} />;
}

/**
 * Select native. Sengaja BUKAN Select shadcn: yang ini menerima `<option>`
 * sebagai children dan `onChange` ala DOM, persis seperti pemakaian di panel
 * editor. Gaya visualnya disamakan dengan Input.
 */
export function Select({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <select
      data-slot="select-native"
      className={cn(
        'flex h-8 w-full min-w-0 cursor-pointer appearance-none rounded-lg border border-input bg-background bg-clip-padding px-2.5 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
        'dark:bg-input/30',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
};

export function Field({ label, hint, error, htmlFor, children, className }: FieldProps) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      <Label htmlFor={htmlFor} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint && !error && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

type SliderProps = ComponentProps<'input'> & {
  label: string;
  value: number;
  suffix?: string;
};

export function Slider({ label, value, suffix = '', className, ...props }: SliderProps) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        value={value}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
        {...props}
      />
    </div>
  );
}
