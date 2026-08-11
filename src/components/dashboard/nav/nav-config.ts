import {
  Blocks,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutTemplate,
  Mail,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';

/**
 * Navigasi dua tingkat.
 *
 * RAIL (kolom ikon)  → modul besar
 * PANEL (kolom kedua) → halaman di dalam modul yang sedang aktif
 *
 * Satu sumber kebenaran: rail, panel, judul header, dan penanda halaman
 * aktif semuanya dibaca dari sini.
 */

export type NavLink = {
  href: string;
  label: string;
  note?: string;
  /** cocok persis, bukan awalan — dipakai halaman indeks modul */
  exact?: boolean;
};

export type NavModule = {
  id: string;
  label: string;
  icon: LucideIcon;
  /** awalan rute yang menandai modul ini sedang aktif */
  match: string[];
  links: NavLink[];
};

export const NAV_MODULES: NavModule[] = [
  {
    id: 'beranda',
    label: 'Beranda',
    icon: LayoutDashboard,
    match: ['/dashboard'],
    links: [
      { href: '/dashboard', label: 'Ikhtisar', note: 'Ringkasan & aktivitas', exact: true },
      { href: '/dashboard/letters', label: 'Surat', note: 'Semua surat client' },
    ],
  },
  {
    id: 'kustomisasi',
    label: 'Kustomisasi',
    icon: Blocks,
    match: ['/dashboard/blocks', '/dashboard/templates'],
    links: [
      { href: '/dashboard/blocks', label: 'Jenis Section', note: 'Section buatanmu' },
      { href: '/dashboard/templates', label: 'Template', note: 'Cetakan surat baru' },
    ],
  },
];

/** Ikon yang dipakai di kartu & tabel — dikumpulkan agar impornya satu pintu. */
export const NAV_ICONS = {
  letters: Mail,
  sections: FileText,
  templates: LayoutTemplate,
  media: ImageIcon,
  clients: Users,
  settings: Settings,
};

/** Modul yang sedang aktif berdasarkan pathname. */
export function activeModule(pathname: string): NavModule {
  // Cocokkan yang paling spesifik dulu supaya /dashboard/blocks tidak
  // tertangkap oleh /dashboard.
  const ranked = [...NAV_MODULES].sort(
    (a, b) => longest(b.match) - longest(a.match),
  );

  for (const mod of ranked) {
    if (mod.match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
      return mod;
    }
  }

  return NAV_MODULES[0];
}

function longest(list: string[]): number {
  return list.reduce((max, item) => Math.max(max, item.length), 0);
}

export function isLinkActive(pathname: string, link: NavLink): boolean {
  return link.exact
    ? pathname === link.href
    : pathname === link.href || pathname.startsWith(`${link.href}/`);
}
