import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

/**
 * Panel dengan kepala tipis bergaris — bentuk dasar semua kotak di
 * dashboard. Judulnya kecil dan huruf besar, supaya isinya yang menonjol.
 */
export function PanelCard({
  title,
  icon: Icon,
  meta,
  action,
  className,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  /** teks kanan atas, mis. jumlah data */
  meta?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={cn('gap-0 overflow-hidden rounded-xl py-0 shadow-xs', className)}>
      <div className="flex h-12 items-center justify-between gap-3 border-b px-5">
        <h2 className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          {Icon && (
            <span className="grid size-7 place-items-center rounded-md bg-primary/10 text-primary">
              <Icon size={14} />
            </span>
          )}
          {title}
        </h2>

        {action ?? (meta && <span className="text-[11px] text-muted-foreground">{meta}</span>)}
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </Card>
  );
}
