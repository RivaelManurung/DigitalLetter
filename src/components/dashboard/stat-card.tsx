import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

type Tone = 'neutral' | 'blue' | 'amber' | 'green' | 'rose';

const TONES: Record<Tone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
};

/**
 * Satu angka ringkasan: label kecil di atas, angka besar di bawahnya,
 * ikon beraksen di kanan. Angkanya yang harus terbaca lebih dulu.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  note,
  tone = 'neutral',
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  note?: string;
  tone?: Tone;
}) {
  return (
    <Card className="gap-0 py-0 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="grid gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <span className="font-heading text-3xl font-semibold leading-none tracking-tight tabular-nums">
            {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
          </span>
          {note && (
            <span className="text-[11px] leading-relaxed text-muted-foreground">
              {note}
            </span>
          )}
        </div>

        <span
          className={cn(
            'grid size-9 shrink-0 place-items-center rounded-lg',
            TONES[tone],
          )}
        >
          <Icon size={16} />
        </span>
      </div>
    </Card>
  );
}
