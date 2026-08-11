'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FileText, LayoutGrid, List, Search, X } from 'lucide-react';
import type { LetterCard } from '@/lib/queries';
import { cn, formatRelative } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LetterActions } from '@/app/(admin)/dashboard/letter-actions';
import { LetterCardItem } from './letter-card';

type Status = 'all' | 'published' | 'draft';
type Sort = 'updated' | 'views' | 'title';
type View = 'table' | 'grid';

/**
 * Pencarian, filter, dan urutan dijalankan di klien.
 *
 * Jumlah surat di aplikasi ini dihitung puluhan, bukan ribuan — memfilter
 * di memori jauh lebih responsif daripada bolak-balik ke server, dan
 * datanya memang sudah ada di halaman.
 */
export function LetterBrowser({
  letters,
  initialQuery = '',
}: {
  letters: LetterCard[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<Status>('all');
  const [sort, setSort] = useState<Sort>('updated');
  const [view, setView] = useState<View>('table');

  const counts = useMemo(
    () => ({
      all: letters.length,
      published: letters.filter((l) => l.status === 'published').length,
      draft: letters.filter((l) => l.status !== 'published').length,
    }),
    [letters],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtered = letters.filter((row) => {
      if (status === 'published' && row.status !== 'published') return false;
      if (status === 'draft' && row.status === 'published') return false;
      if (!needle) return true;

      return (
        row.title.toLowerCase().includes(needle) ||
        row.slug.toLowerCase().includes(needle) ||
        (row.recipientName ?? '').toLowerCase().includes(needle)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sort === 'views') return b.viewCount - a.viewCount;
      if (sort === 'title') return a.title.localeCompare(b.title, 'id');
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [letters, query, status, sort]);

  if (letters.length === 0) {
    return (
      <div className="grid place-items-center gap-2 rounded-xl border border-dashed px-6 py-16 text-center">
        <FileText size={22} className="text-muted-foreground" />
        <p className="text-sm font-medium">Belum ada surat</p>
        <p className="max-w-sm text-xs text-muted-foreground">
          Buat surat pertama. Kamu akan langsung mendapat isi awal yang tinggal
          disunting, plus desain preset sebagai titik mulai.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Tabs value={status} onValueChange={(v) => setStatus(v as Status)}>
          <TabsList>
            <TabsTrigger value="all">Semua ({counts.all})</TabsTrigger>
            <TabsTrigger value="published">Terbit ({counts.published})</TabsTrigger>
            <TabsTrigger value="draft">Draf ({counts.draft})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative min-w-[180px] flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul, slug, atau nama penerima…"
            className="pl-8"
            aria-label="Cari surat"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setQuery('')}
              aria-label="Bersihkan pencarian"
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
            >
              <X size={12} />
            </Button>
          )}
        </div>

        <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
          <SelectTrigger className="w-[150px]" aria-label="Urutkan">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Terakhir diubah</SelectItem>
            <SelectItem value="views">Paling banyak dibuka</SelectItem>
            <SelectItem value="title">Judul A–Z</SelectItem>
          </SelectContent>
        </Select>

        <Tabs value={view} onValueChange={(v) => setView(v as View)}>
          <TabsList>
            <TabsTrigger value="table" aria-label="Tampilan tabel">
              <List size={13} />
            </TabsTrigger>
            <TabsTrigger value="grid" aria-label="Tampilan kartu">
              <LayoutGrid size={13} />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {visible.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-xl border border-dashed px-6 py-14 text-center">
          <Search size={20} className="text-muted-foreground" />
          <p className="text-sm font-medium">Tidak ada yang cocok</p>
          <p className="text-xs text-muted-foreground">
            Coba kata kunci lain atau ubah filternya.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-1"
            onClick={() => {
              setQuery('');
              setStatus('all');
            }}
          >
            Bersihkan filter
          </Button>
        </div>
      ) : view === 'grid' ? (
        <>
          <Count shown={visible.length} total={letters.length} />
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((row) => (
              <li key={row.id}>
                <LetterCardItem letter={row} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <Count shown={visible.length} total={letters.length} />
          <Card className="gap-0 overflow-hidden py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Surat</TableHead>
                  <TableHead className="hidden md:table-cell">Penerima</TableHead>
                  <TableHead className="text-right">Section</TableHead>
                  <TableHead className="text-right">Dibuka</TableHead>
                  <TableHead className="hidden text-right lg:table-cell">
                    Diubah
                  </TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {visible.map((row) => {
                  const palette = row.design?.palette;

                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <span
                            aria-hidden="true"
                            className="size-7 shrink-0 rounded-md border"
                            style={{
                              background: palette
                                ? `linear-gradient(135deg, ${palette.bgDeep}, ${palette.accent})`
                                : 'var(--muted)',
                            }}
                          />
                          <Link
                            href={`/dashboard/${row.id}`}
                            className="grid min-w-0 gap-0.5 hover:underline"
                          >
                            <span className="truncate font-medium">{row.title}</span>
                            <span className="truncate font-mono text-[11px] text-muted-foreground">
                              /l/{row.slug}
                            </span>
                          </Link>
                        </div>
                      </TableCell>

                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {row.recipientName || '—'}
                      </TableCell>

                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {row.sectionCount}
                      </TableCell>

                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {row.viewCount}
                        {row.rsvpCount > 0 && (
                          <span className="ml-1.5 text-[11px]">
                            · {row.rsvpCount} RSVP
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="hidden whitespace-nowrap text-right text-[11px] text-muted-foreground lg:table-cell">
                        {formatRelative(row.updatedAt)}
                      </TableCell>

                      <TableCell className="text-right">
                        <Badge
                          variant={row.status === 'published' ? 'default' : 'secondary'}
                        >
                          {row.status === 'published' ? 'Terbit' : 'Draf'}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <LetterActions
                          letterId={row.id}
                          title={row.title}
                          recipientName={row.recipientName ?? ''}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}

function Count({ shown, total }: { shown: number; total: number }) {
  return (
    <p className={cn('text-[11px] text-muted-foreground')}>
      Menampilkan {shown} dari {total} surat
    </p>
  );
}
