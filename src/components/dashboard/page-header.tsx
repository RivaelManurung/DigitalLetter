import type { ReactNode } from 'react';

/** Kepala halaman yang seragam di seluruh dashboard. */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 pb-1">
      <div className="grid gap-1.5">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
