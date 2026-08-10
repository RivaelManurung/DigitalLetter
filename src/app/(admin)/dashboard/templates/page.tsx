import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { listTemplates } from '@/lib/actions/templates';
import { listOccasions } from '@/lib/occasion-list';
import { buttonVariants } from '@/components/ui/button';
import { TemplateManager } from '@/components/dashboard/templates/template-manager';

export const metadata = { title: 'Template' };

export default async function TemplatesPage() {
  const templates = await listTemplates();
  const occasions = listOccasions();

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="text-lg font-semibold">Template</h1>
          <p className="text-xs text-muted-foreground">
            Cetakan surat baru. Mengubah template tidak mengubah surat yang sudah
            dibuat darinya.
          </p>
        </div>

        <Link href="/dashboard" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          <ArrowLeft size={14} />
          Kembali
        </Link>
      </div>

      <TemplateManager templates={templates} occasions={occasions} />
    </div>
  );
}
