import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LogOut, Mail } from 'lucide-react';
import { Toaster } from 'sonner';
import { logoutAction } from '@/lib/actions/auth';
import { getSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold">
            <Mail size={16} className="text-muted-foreground" />
            Digital Letter
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:block">
              {session.email}
            </span>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut size={14} />
                Keluar
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-6">{children}</main>
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
