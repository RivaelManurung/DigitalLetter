import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/** Satu angka ringkasan. Angka besar dulu, konteksnya menyusul di bawah. */
export function StatCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  note?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 py-1">
        <div className="grid gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          <span className="text-2xl font-semibold tabular-nums leading-none">
            {value}
          </span>
          {note && <span className="text-[11px] text-muted-foreground">{note}</span>}
        </div>

        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
          <Icon size={15} />
        </span>
      </CardContent>
    </Card>
  );
}
