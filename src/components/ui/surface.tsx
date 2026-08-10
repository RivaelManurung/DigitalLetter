import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Badge as ShadBadge } from './badge';
import { Card as ShadCard } from './card';

/**
 * Lapisan tipis di atas komponen shadcn — lihat catatan di ui/field.tsx.
 * API lama (`<CardHeader title description action />`) dipertahankan supaya
 * panel editor tidak perlu ditulis ulang.
 */

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return <ShadCard className={cn('gap-0 py-0', className)} {...props} />;
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
    <div className="flex items-start justify-between gap-4 border-b px-4 py-3">
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
  if (tone === 'success') return <ShadBadge>{children}</ShadBadge>;

  return (
    <ShadBadge
      variant="secondary"
      className={cn(
        tone === 'warn' &&
          'bg-amber-500/12 text-amber-700 dark:text-amber-400',
      )}
    >
      {children}
    </ShadBadge>
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
    <div className="grid place-items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
      <div className="grid gap-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="mx-auto max-w-sm text-xs text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
