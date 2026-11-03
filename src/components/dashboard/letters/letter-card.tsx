import Link from 'next/link';
import { Eye, Layers, PenLine, Users } from 'lucide-react';
import type { LetterCard } from '@/lib/queries';
import { cn, formatRelative } from '@/lib/utils';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { LetterThumb } from '@/components/dashboard/letter-thumb';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LetterActions } from '@/app/(admin)/dashboard/letter-actions';

/**
 * Kartu surat. Pita warna di atas diambil dari palet desainnya sendiri —
 * jadi surat bisa dikenali sekilas tanpa membaca judulnya.
 */
export function LetterCardItem({
  letter,
  compact,
}: {
  letter: LetterCard;
  compact?: boolean;
}) {
  const published = letter.status === 'published';

  return (
    <Card className="overflow-hidden rounded-xl py-0 transition-colors hover:border-foreground/20">
      <LetterThumb design={letter.design} className="block h-28 w-full rounded-none border-0 border-b shadow-none" />

      <div className="grid gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="grid min-w-0 gap-0.5">
            <p className="truncate text-sm font-medium">{letter.title}</p>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              /l/{letter.slug}
            </p>
          </div>

          <StatusBadge status={published ? 'published' : 'draft'} />
        </div>

        <dl className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <Stat icon={Layers} value={`${letter.sectionCount} section`} />
          <Stat icon={Eye} value={`${letter.viewCount} dibuka`} />
          {letter.rsvpCount > 0 && (
            <Stat icon={Users} value={`${letter.rsvpCount} RSVP`} />
          )}
        </dl>

        <p className="text-[11px] text-muted-foreground">
          Diubah {formatRelative(letter.updatedAt)}
          {letter.recipientName && ` · untuk ${letter.recipientName}`}
        </p>

        <div className="flex gap-2">
          <Link
            href={`/dashboard/${letter.id}`}
            className={cn(buttonVariants({ variant: 'subtle', size: 'sm' }), 'flex-1')}
          >
            <PenLine size={13} />
            Sunting
          </Link>

          {published && !compact && (
            <a
              href={`/l/${letter.slug}`}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Lihat
            </a>
          )}

          <LetterActions
            letterId={letter.id}
            title={letter.title}
            recipientName={letter.recipientName ?? ''}
          />
        </div>
      </div>
    </Card>
  );
}

function Stat({ icon: Icon, value }: { icon: typeof Eye; value: string }) {
  return (
    <div className="flex items-center gap-1">
      <Icon size={12} />
      <span>{value}</span>
    </div>
  );
}
