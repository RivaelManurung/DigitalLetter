import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="grid max-w-md gap-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Digital Letter</h1>
        <p className="text-sm text-muted-foreground">
          Surat digital yang bisa dikustom sepenuhnya — konten, desain, dan
          musiknya diatur dari dashboard, bukan dari kode.
        </p>
        <Link href="/dashboard" className={buttonVariants({ size: 'lg' })}>
          Buka dashboard
        </Link>
      </div>
    </main>
  );
}
