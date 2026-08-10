'use client';

import { useMemo, useState } from 'react';
import { FileText, Search, X } from 'lucide-react';
import type { LetterCard } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LetterCardItem } from './letter-card';

type Status = 'all' | 'published' | 'draft';
type Sort = 'updated' | 'views' | 'title';

/**
 * Pencarian, filter, dan urutan dijalankan di klien.
 *
 * Jumlah surat di aplikasi ini dihitung puluhan, bukan ribuan — memfilter
 * di memori jauh lebih responsif daripada bolak-balik ke server, dan
 * datanya memang sudah ada di halaman.
 */
export function LetterBrowser({ letters }: { letters: LetterCard[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status>('all');
  const [sort, setSort] = useState<Sort>('updated');

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
      ) : (
        <>
          <p className="text-[11px] text-muted-foreground">
            Menampilkan {visible.length} dari {letters.length} surat
          </p>

          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((row) => (
              <li key={row.id}>
                <LetterCardItem letter={row} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
