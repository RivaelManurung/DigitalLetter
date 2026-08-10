import Link from 'next/link';
import { Eye, PenLine } from 'lucide-react';
import { listLetters } from '@/lib/queries';
import { formatDate } from '@/lib/utils';
import { Badge, Card, EmptyState } from '@/components/ui/surface';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NewLetterDialog } from './new-letter-dialog';

export default async function DashboardPage() {
  const letters = await listLetters();

  return (
    <div className="grid gap-5">
      <div className="flex items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Surat</h1>
          <p className="text-xs text-muted-foreground">
            {letters.length} surat · konten, desain, dan publikasi diatur per surat.
          </p>
        </div>
        <NewLetterDialog />
      </div>

      {letters.length === 0 ? (
        <EmptyState
          title="Belum ada surat"
          description="Buat surat pertama. Kamu akan langsung mendapat isi awal yang tinggal disunting, plus desain preset sebagai titik mulai."
          action={<NewLetterDialog />}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {letters.map((row) => {
            const swatch = row.design?.palette;
            return (
              <li key={row.id}>
                <Card className="overflow-hidden transition-colors hover:border-ring">
                  <div
                    className="h-20 w-full"
                    style={{
                      background: swatch
                        ? `linear-gradient(135deg, ${swatch.bgDeep}, ${swatch.bgSoft} 60%, ${swatch.accent})`
                        : 'var(--muted)',
                    }}
                  />

                  <div className="grid gap-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid min-w-0 gap-0.5">
                        <p className="truncate text-sm font-medium">{row.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          /l/{row.slug}
                        </p>
                      </div>
                      <Badge tone={row.status === 'published' ? 'success' : 'muted'}>
                        {row.status === 'published' ? 'Terbit' : 'Draf'}
                      </Badge>
                    </div>

                    <dl className="flex items-center gap-4 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye size={12} />
                        <span>{row.viewCount} dibuka</span>
                      </div>
                      <span>Diubah {formatDate(row.updatedAt)}</span>
                    </dl>

                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/${row.id}`}
                        className={cn(
                          buttonVariants({ variant: 'subtle', size: 'sm' }),
                          'flex-1',
                        )}
                      >
                        <PenLine size={13} />
                        Sunting
                      </Link>
                      {row.status === 'published' && (
                        <a
                          href={`/l/${row.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className={buttonVariants({ variant: 'outline', size: 'sm' })}
                        >
                          Lihat
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
