import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { listCustomBlocks } from '@/lib/actions/blocks';
import { buttonVariants } from '@/components/ui/button';
import { BlockManager } from '@/components/dashboard/blocks/block-manager';

export const metadata = { title: 'Jenis Section' };

export default async function BlocksPage() {
  const blocks = await listCustomBlocks();

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="text-lg font-semibold">Jenis Section</h1>
          <p className="text-xs text-muted-foreground">
            Bikin jenis section sendiri. Setelah dibuat, ia muncul di tombol
            &ldquo;Tambah section&rdquo; pada semua surat.
          </p>
        </div>

        <Link href="/dashboard" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          <ArrowLeft size={14} />
          Kembali
        </Link>
      </div>

      <BlockManager initial={blocks} />
    </div>
  );
}
