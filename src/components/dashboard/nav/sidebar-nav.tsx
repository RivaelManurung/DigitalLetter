'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Blocks, LayoutDashboard, LayoutTemplate, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  {
    href: '/dashboard',
    label: 'Ikhtisar',
    icon: LayoutDashboard,
    note: 'Ringkasan & aktivitas',
    exact: true,
  },
  {
    href: '/dashboard/letters',
    label: 'Surat',
    icon: Mail,
    note: 'Semua surat client',
  },
  {
    href: '/dashboard/blocks',
    label: 'Jenis Section',
    icon: Blocks,
    note: 'Section buatanmu',
  },
  {
    href: '/dashboard/templates',
    label: 'Template',
    icon: LayoutTemplate,
    note: 'Cetakan surat baru',
  },
];

/**
 * Navigasi utama. Halaman editor surat (/dashboard/<id>) sengaja tidak
 * menandai menu mana pun sebagai aktif — ia layar kerja tersendiri, bukan
 * cabang dari salah satu menu.
 */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="grid gap-1">
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);

        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group flex items-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              active
                ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
            )}
          >
            <Icon size={16} className="mt-0.5 shrink-0" />
            <span className="grid gap-0.5">
              {link.label}
              <span className="text-[11px] font-normal opacity-70">{link.note}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
