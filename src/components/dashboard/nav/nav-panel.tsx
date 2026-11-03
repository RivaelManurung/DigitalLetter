'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEFAULT_PRESET, PRESET_LIST } from '@/design/presets';
import { NAV_MODULES, isLinkActive } from './nav-config';

/** The only dashboard sidebar: every module as a group, its pages as items. */
export function NavPanel({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex h-14 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4 transition-opacity hover:opacity-80"
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <Mail size={14} />
        </span>
        <span className="truncate text-sm font-semibold tracking-tight">Digital Letter</span>
      </Link>

      <div className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
        {NAV_MODULES.map((mod) => (
          <nav key={mod.id} aria-label={mod.label} className="grid gap-0.5">
            <div className="px-2.5 pb-1 text-[11px] font-medium text-sidebar-foreground/45">{mod.label}</div>

            {mod.links.map((link) => {
              const active = isLinkActive(pathname, link);
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors',
                    active
                      ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground ring-1 ring-sidebar-border'
                      : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                  )}
                >
                  <Icon size={15} className={cn('shrink-0', active && 'text-sidebar-primary')} />
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        ))}
      </div>

      <div className="border-t border-sidebar-border p-3">
        <a
          href={`/preview/${DEFAULT_PRESET}`}
          target="_blank"
          rel="noreferrer"
          className="flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          <Palette size={15} className="shrink-0" />
          <span className="truncate">Galeri tema</span>
          <span className="ml-auto text-[11px] tabular-nums">{PRESET_LIST.length}</span>
        </a>
      </div>
    </div>
  );
}
