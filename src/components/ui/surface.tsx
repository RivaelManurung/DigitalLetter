import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-xl border border-border bg-background', className)}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
      <div className="grid gap-0.5">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Badge({
  tone = 'muted',
  children,
}: {
  tone?: 'muted' | 'success' | 'warn';
  children: ReactNode;
}) {
  const tones = {
    muted: 'bg-muted text-muted-foreground',
    success: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
    warn: 'bg-amber-500/12 text-amber-600 dark:text-amber-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
      <div className="grid gap-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="mx-auto max-w-sm text-xs text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
