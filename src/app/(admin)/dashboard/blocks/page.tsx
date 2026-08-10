import { listCustomBlocks } from '@/lib/actions/blocks';
import { PageHeader } from '@/components/dashboard/page-header';
import { BlockManager } from '@/components/dashboard/blocks/block-manager';

export const metadata = { title: 'Jenis Section · Digital Letter' };

export default async function BlocksPage() {
  const blocks = await listCustomBlocks();

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Jenis Section"
        description="Bikin jenis section sendiri untuk hal yang belum tersedia. Setelah dibuat, ia muncul di tombol “Tambah section” pada semua surat."
      />

      <BlockManager initial={blocks} />
    </div>
  );
}
