import Link from 'next/link';
import { ArrowRight, Blocks, Eye, FileText, LayoutTemplate, Mail, Users } from 'lucide-react';
import {
  getDashboardStats,
  listLetterCards,
  listRecentRsvp,
} from '@/lib/queries';
import { listTemplates } from '@/lib/actions/templates';
import { formatRelative } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { NewLetterDialog } from './new-letter-dialog';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { LetterCardItem } from '@/components/dashboard/letters/letter-card';

export const metadata = { title: 'Ikhtisar · Digital Letter' };

export default async function DashboardPage() {
  const [stats, cards, recent, templates] = await Promise.all([
    getDashboardStats(),
    listLetterCards(),
    listRecentRsvp(5),
    listTemplates(),
  ]);

  const latest = cards.slice(0, 4);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Ikhtisar"
        description="Ringkasan seluruh surat, kunjungan, dan konfirmasi kehadiran."
        action={<NewLetterDialog templates={templates} />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Mail}
          label="Total surat"
          value={stats.total}
          note={`${stats.published} terbit · ${stats.draft} draf`}
        />
        <StatCard
          icon={Eye}
          label="Total dibuka"
          value={stats.views}
          note="Akumulasi semua surat"
        />
        <StatCard
          icon={Users}
          label="Konfirmasi kehadiran"
          value={stats.rsvpTotal}
          note={
            stats.rsvpTotal > 0
              ? `${stats.rsvpYes} menyatakan hadir`
              : 'Belum ada yang mengisi'
          }
        />
        <StatCard
          icon={Blocks}
          label="Kustomisasi"
          value={stats.customBlocks + stats.templates}
          note={`${stats.customBlocks} jenis section · ${stats.templates} template`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Surat terbaru</CardTitle>
            <CardDescription>Empat surat yang paling akhir disunting.</CardDescription>
            <Link
              href="/dashboard/letters"
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              Lihat semua
              <ArrowRight size={13} />
            </Link>
          </CardHeader>

          <CardContent>
            {latest.length === 0 ? (
              <EmptyBlock
                icon={FileText}
                title="Belum ada surat"
                note="Buat surat pertama — kamu langsung dapat isi awal yang tinggal disunting."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {latest.map((row) => (
                  <LetterCardItem key={row.id} letter={row} compact />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Konfirmasi terbaru</CardTitle>
            <CardDescription>Dari semua surat yang punya section RSVP.</CardDescription>
          </CardHeader>

          <CardContent>
            {recent.length === 0 ? (
              <EmptyBlock
                icon={Users}
                title="Belum ada konfirmasi"
                note="Tambahkan section RSVP ke undangan, lalu terbitkan suratnya."
              />
            ) : (
              <ul className="grid gap-3">
                {recent.map((row, i) => (
                  <li key={row.id} className="grid gap-1.5">
                    {i > 0 && <Separator className="mb-1.5" />}

                    <div className="flex items-start justify-between gap-2">
                      <div className="grid min-w-0 gap-0.5">
                        <span className="truncate text-sm font-medium">{row.name}</span>
                        <Link
                          href={`/dashboard/${row.letterId}`}
                          className="truncate text-[11px] text-muted-foreground hover:underline"
                        >
                          {row.letterTitle}
                        </Link>
                      </div>

                      <Badge
                        variant={row.attendance === 'yes' ? 'default' : 'secondary'}
                        className="shrink-0"
                      >
                        {row.attendance === 'yes'
                          ? 'Hadir'
                          : row.attendance === 'no'
                            ? 'Tidak'
                            : 'Ragu'}
                      </Badge>
                    </div>

                    {row.message && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {row.message}
                      </p>
                    )}

                    <span className="text-[11px] text-muted-foreground">
                      {formatRelative(row.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kustomisasi</CardTitle>
          <CardDescription>
            Bikin jenis section sendiri, atau simpan surat jadi cetakan untuk
            client berikutnya.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-3 sm:grid-cols-2">
          <ShortcutCard
            href="/dashboard/blocks"
            icon={Blocks}
            title="Jenis Section"
            note={
              stats.customBlocks > 0
                ? `${stats.customBlocks} jenis section buatanmu`
                : 'Belum ada — bikin yang pertama'
            }
          />
          <ShortcutCard
            href="/dashboard/templates"
            icon={LayoutTemplate}
            title="Template"
            note={
              stats.templates > 0
                ? `${stats.templates} template + 6 bawaan`
                : '6 template bawaan siap pakai'
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyBlock({
  icon: Icon,
  title,
  note,
}: {
  icon: typeof FileText;
  title: string;
  note: string;
}) {
  return (
    <div className="grid place-items-center gap-2 rounded-lg border border-dashed px-4 py-10 text-center">
      <Icon size={20} className="text-muted-foreground" />
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-xs text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

function ShortcutCard({
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
