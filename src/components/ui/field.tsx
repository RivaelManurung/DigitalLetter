import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

const base =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(base, 'h-9', className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea className={cn(base, 'min-h-24 resize-y leading-relaxed', className)} {...props} />
  );
}

export function Select({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <select className={cn(base, 'h-9 cursor-pointer', className)} {...props}>
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
      <label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      {error && <p className="text-[11px] text-danger">{error}</p>}
    </div>
  );
}

type SliderProps = ComponentProps<'input'> & { label: string; value: number; suffix?: string };

export function Slider({ label, value, suffix = '', className, ...props }: SliderProps) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="font-mono text-[11px] text-muted-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        value={value}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-foreground"
        {...props}
      />
    </div>
  );
}
