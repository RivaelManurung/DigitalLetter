'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_MODULES, isLinkActive } from './nav-config';

/**
 * Satu-satunya sidebar dashboard.
 *
 * Semua modul ditampilkan sekaligus sebagai grup, dengan halaman-halamannya
 * sebagai item di bawahnya — tidak ada kolom ikon terpisah, jadi seluruh peta
 * navigasi terbaca dalam satu kolom.
 */
export function NavPanel({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex h-14 shrink-0 items-center gap-2.5 px-4 transition-opacity hover:opacity-80"
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
          <Mail size={14} />
        </span>
        <span className="grid gap-0.5 leading-none">
          <span className="truncate text-sm font-semibold tracking-tight">
            Digital Letter
          </span>
          <span className="truncate text-[10px] text-muted-foreground">
            Panel admin
          </span>
        </span>
      </Link>

      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {NAV_MODULES.map((mod) => {
          const Icon = mod.icon;

          return (
            <nav key={mod.id} aria-label={mod.label} className="grid gap-0.5">
              <div className="flex items-center gap-2 px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                <Icon size={12} />
                <span>{mod.label}</span>
              </div>

              {mod.links.map((link) => {
                const active = isLinkActive(pathname, link);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group relative grid gap-0.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                      active
                        ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                        : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground',
                    )}
                  >
                    {/* Penanda tipis di tepi kiri — lebih tenang daripada
                        mewarnai seluruh baris. */}
                    <span
                      aria-hidden
                      className={cn(
                        'absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-primary transition-opacity',
                        active ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span className="truncate">{link.label}</span>
                    {link.note && (
                      <span className="truncate text-[11px] font-normal text-muted-foreground/80">
                        {link.note}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          );
        })}
      </div>
    </div>
  );
}
