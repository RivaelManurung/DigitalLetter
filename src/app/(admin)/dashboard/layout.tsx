import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LogOut, Mail } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { logoutAction } from '@/lib/actions/auth';
import { getSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarNav } from '@/components/dashboard/nav/sidebar-nav';
import { MobileNav } from '@/components/dashboard/nav/mobile-nav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1500px] items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2">
            <div className="lg:hidden">
              <MobileNav />
            </div>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm font-semibold"
            >
              <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
                <Mail size={14} />
              </span>
              Digital Letter
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:block">
              {session.email}
            </span>
            <Separator orientation="vertical" className="hidden h-5 sm:block" />
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut size={14} />
                Keluar
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px] gap-6 px-4 py-6">
        {/* Sidebar sticky; di layar sempit digantikan MobileNav di header. */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-20">
            <SidebarNav />
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
