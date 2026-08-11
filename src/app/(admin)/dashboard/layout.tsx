import { redirect } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { logoutAction } from '@/lib/actions/auth';
import { getSession } from '@/lib/auth';
import { NavPanel } from '@/components/dashboard/nav/nav-panel';
import { TopBar } from '@/components/dashboard/nav/top-bar';

/**
 * Kerangka dashboard: satu sidebar navigasi, lalu area konten.
 *
 * Sidebar dibuat `sticky` setinggi layar, jadi hanya kolom konten yang
 * bergulir — daftar panjang tidak pernah membuat navigasi hilang.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <TooltipProvider>
      <div className="flex min-h-dvh">
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 overflow-y-auto border-r lg:block">
          <NavPanel />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-muted/30">
          <TopBar email={session.email} logout={logoutAction} />

          <main className="flex-1 px-4 py-6 lg:px-6 lg:py-8">
            <div className="mx-auto max-w-[1400px]">{children}</div>
          </main>
        </div>
      </div>

      <Toaster position="bottom-right" richColors closeButton />
    </TooltipProvider>
  );
}
