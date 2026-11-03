import Link from 'next/link';
import { ArrowRight, BarChart3, Blocks, Eye, LayoutTemplate, Mail, Users } from 'lucide-react';
import {
  getDashboardStats,
  listLetterCards,
  listRecentRsvp,
} from '@/lib/queries';
import { listTemplates } from '@/lib/actions/templates';
import { formatRelative } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { NewLetterDialog } from './new-letter-dialog';
import { StatCard } from '@/components/dashboard/stat-card';
import { PanelCard } from '@/components/dashboard/panel-card';
import { StatusBars } from '@/components/dashboard/status-bars';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { LetterThumb } from '@/components/dashboard/letter-thumb';
import { ThemeGallery } from '@/components/dashboard/theme-gallery';
import { PageHeader } from '@/components/dashboard/page-header';

export const metadata = { title: 'Ikhtisar' };

export default async function DashboardPage() {
  const [stats, cards, recent, templates] = await Promise.all([
    getDashboardStats(),
    listLetterCards(),
    listRecentRsvp(6),
    listTemplates(),
  ]);

  const latest = cards.slice(0, 6);

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Ikhtisar"
        description={
          stats.published > 0
            ? `${stats.published.toLocaleString('id-ID')} surat terbit, dibuka ${stats.views.toLocaleString('id-ID')} kali.`
            : 'Belum ada surat yang terbit.'
        }
        action={<NewLetterDialog templates={templates} />}
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          icon={Mail}
          tone="blue"
          label="Surat"
          href="/dashboard/letters"
          linkLabel="Lihat semua surat"
          value={stats.total}
          note={`${stats.published} terbit · ${stats.draft} draf`}
        />
        <StatCard
          icon={Eye}
          tone="green"
          label="Dibuka"
          href="/dashboard/letters"
          linkLabel="Lihat per surat"
          value={stats.views}
          note="Akumulasi semua surat"
        />
        <StatCard
          icon={Users}
          tone="amber"
          label="Konfirmasi"
          href="/dashboard/letters"
          linkLabel="Lihat surat"
          value={stats.rsvpTotal}
          note={
            stats.rsvpTotal > 0
              ? `${stats.rsvpYes} menyatakan hadir`
              : 'Belum ada yang mengisi'
          }
        />
        <StatCard
          icon={Blocks}
          tone="rose"
          label="Kustomisasi"
          href="/dashboard/templates"
          linkLabel="Kelola template"
          value={stats.customBlocks + stats.templates}
          note={`${stats.customBlocks} jenis section · ${stats.templates} template`}
        />
      </div>

      <ThemeGallery />

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelCard
          title="Surat per status"
          icon={BarChart3}
          meta={`${cards.length} total`}
          className="min-h-[220px]"
        >
          {cards.length === 0 ? (
            <EmptyNote>Belum ada surat.</EmptyNote>
          ) : (
            <StatusBars
              total={cards.length}
              rows={[
                { label: 'Terbit', value: stats.published },
                { label: 'Draf', value: stats.draft },
              ]}
            />
          )}
        </PanelCard>

        <PanelCard
          title="Konfirmasi terbaru"
          icon={Users}
          meta={stats.rsvpTotal > 0 ? `${stats.rsvpTotal} masuk` : undefined}
          className="min-h-[220px]"
        >
          {recent.length === 0 ? (
            <EmptyNote>
              Belum ada konfirmasi. Tambahkan section RSVP ke undangan, lalu
              terbitkan suratnya.
            </EmptyNote>
          ) : (
            <ul className="grid gap-2.5">
              {recent.map((row) => (
                <li key={row.id} className="flex items-start justify-between gap-3">
                  <div className="grid min-w-0 gap-0.5">
                    <span className="truncate text-sm font-medium">{row.name}</span>
                    <Link
                      href={`/dashboard/${row.letterId}`}
                      className="truncate text-[11px] text-muted-foreground hover:underline"
                    >
                      {row.letterTitle} · {formatRelative(row.createdAt)}
                    </Link>
                  </div>

                  <Badge
                    variant={row.attendance === 'yes' ? 'success' : row.attendance === 'no' ? 'destructive' : 'warning'}
                    className="shrink-0"
                  >
                    {row.attendance === 'yes'
                      ? 'Hadir'
                      : row.attendance === 'no'
                        ? 'Tidak'
                        : 'Ragu'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </PanelCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelCard
          title="Surat terbaru"
          icon={Mail}
          action={
            <Link
              href="/dashboard/letters"
              className={buttonVariants({ variant: 'ghost', size: 'xs' })}
            >
              Lihat semua
              <ArrowRight size={12} />
            </Link>
          }
        >
          {latest.length === 0 ? (
            <EmptyNote>Belum ada surat.</EmptyNote>
          ) : (
            <ul className="-mx-2 grid gap-1">
              {latest.map((row) => (
                <li key={row.id}>
                  <Link
                    href={`/dashboard/${row.id}`}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/70"
                  >
                    <LetterThumb design={row.design} className="size-11" />
                    <span className="grid min-w-0 flex-1 gap-0.5">
                      <span className="truncate text-sm font-medium">{row.title}</span>
                      <span className="truncate text-[11px] text-muted-foreground">
                        {row.recipientName ? `Untuk ${row.recipientName} · ` : ''}
                        {formatRelative(row.updatedAt)}
                      </span>
                    </span>
                    <span className="hidden items-center gap-1 text-xs tabular-nums text-muted-foreground sm:flex">
                      <Eye size={13} />
                      {row.viewCount}
                    </span>
                    <StatusBadge status={row.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </PanelCard>

        <PanelCard title="Kustomisasi"
          icon={Blocks}>
          <div className="grid gap-2">
            <Shortcut
              href="/dashboard/blocks"
              icon={Blocks}
              title="Jenis Section"
              note={
                stats.customBlocks > 0
                  ? `${stats.customBlocks} jenis section buatanmu`
                  : 'Belum ada — bikin yang pertama'
              }
            />
            <Shortcut
              href="/dashboard/templates"
              icon={LayoutTemplate}
              title="Template"
              note={
                stats.templates > 0
                  ? `${stats.templates} template + 6 bawaan`
                  : '6 template bawaan siap pakai'
              }
            />
          </div>
        </PanelCard>
      </div>
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-full place-items-center px-4 py-8 text-center">
      <p className="max-w-xs text-xs text-muted-foreground">{children}</p>
    </div>
  );
}

function Shortcut({
  href,
  icon: Icon,
  title,
  note,
}: {
  href: string;
  icon: typeof Blocks;
  title: string;
  note: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/60"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted">
          <Icon size={16} />
        </span>
        <div className="grid gap-0.5">
          <span className="text-sm font-medium">{title}</span>
          <span className="text-[11px] text-muted-foreground">{note}</span>
        </div>
      </div>

      <ArrowRight
        size={15}
        className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
