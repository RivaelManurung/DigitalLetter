'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { ChevronRight, LogOut, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { activeModule, isLinkActive } from './nav-config';
import { NavPanel } from './nav-panel';

type Props = {
  email: string;
  /** Server Action logout — dipanggil lewat <form>, bukan handler klien. */
  logout: () => Promise<void>;
};

/**
 * Header: jejak halaman di kiri, pencarian di tengah, akun di kanan.
 *
 * Pencarian membuka halaman Surat dengan kata kuncinya — di sanalah
 * penyaringan sebenarnya dilakukan, jadi tidak ada dua mesin pencari
 * yang harus dijaga tetap sama.
 */
export function TopBar({ email, logout }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const current = activeModule(pathname);
  const page = current.links.find((link) => isLinkActive(pathname, link));

  // Ctrl/⌘+K membuka pencarian dari mana pun.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setOpen(false);
    const q = query.trim();
    router.push(q ? `/dashboard/letters?q=${encodeURIComponent(q)}` : '/dashboard/letters');
    setQuery('');
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Buka navigasi"
              className="lg:hidden"
            />
          }
        >
          <Menu size={16} />
        </DialogTrigger>

        <DialogContent className="overflow-hidden p-0 sm:max-w-xs">
          <DialogHeader className="sr-only">
            <DialogTitle>Navigasi</DialogTitle>
            <DialogDescription>Pindah antar halaman dashboard</DialogDescription>
          </DialogHeader>
          <NavPanel onNavigate={() => setMenuOpen(false)} />
        </DialogContent>
      </Dialog>

      <nav
        aria-label="Jejak halaman"
        className="flex min-w-0 items-center gap-2 text-sm"
      >
        <span className="hidden text-muted-foreground sm:inline">{current.label}</span>
        <ChevronRight
          size={13}
          className="hidden shrink-0 text-muted-foreground/50 sm:inline"
        />
        <span className="truncate font-medium">{page?.label ?? 'Detail'}</span>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="w-9 justify-center bg-muted/40 px-0 font-normal text-muted-foreground shadow-none hover:bg-muted sm:w-64 sm:justify-start sm:px-2.5"
                aria-label="Cari surat"
              />
            }
          >
            <Search size={14} />
            <span className="hidden sm:inline">Cari surat…</span>
            <kbd className="ml-auto hidden items-center rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
              ⌘K
            </kbd>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <form onSubmit={submit} className="grid gap-4">
              <DialogHeader>
                <DialogTitle>Cari surat</DialogTitle>
                <DialogDescription>
                  Cari berdasarkan judul, slug, atau nama penerima.
                </DialogDescription>
              </DialogHeader>

              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nama client, judul surat…"
                  autoFocus
                  className="h-9 w-full rounded-lg border bg-background pl-8 pr-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              <Button type="submit" className="w-full">
                Cari
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Separator orientation="vertical" className="hidden h-5 sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                aria-label="Menu akun"
                className="gap-2 pl-1 pr-2"
              />
            }
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {email.slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden max-w-[160px] truncate font-normal text-muted-foreground sm:inline">
              {email}
            </span>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-60">
            <div className="flex items-center gap-2.5 px-1.5 py-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {email.slice(0, 1).toUpperCase()}
              </span>
              <div className="grid min-w-0 gap-0.5">
                <span className="truncate text-sm font-medium">
                  {email.split('@')[0]}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {email}
                </span>
              </div>
            </div>

            <DropdownMenuSeparator />
            <form action={logout}>
              <DropdownMenuItem
                variant="destructive"
                render={<button type="submit" className="w-full" />}
              >
                <LogOut size={13} />
                Keluar
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
