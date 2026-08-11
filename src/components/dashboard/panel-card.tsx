import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

/**
 * Panel dengan kepala tipis bergaris — bentuk dasar semua kotak di
 * dashboard. Judulnya kecil dan huruf besar, supaya isinya yang menonjol.
 */
export function PanelCard({
  title,
  meta,
  action,
  className,
  children,
}: {
  title: string;
  /** teks kanan atas, mis. jumlah data */
  meta?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={cn('gap-0 overflow-hidden py-0 shadow-xs', className)}>
      <div className="flex h-11 items-center justify-between gap-3 border-b bg-muted/40 px-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>

        {action ?? (meta && <span className="text-[11px] text-muted-foreground">{meta}</span>)}
      </div>

      <div className="p-4">{children}</div>
    </Card>
  );
}
