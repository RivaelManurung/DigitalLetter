import { listTemplates } from '@/lib/actions/templates';
import { listOccasions } from '@/lib/occasion-list';
import { PageHeader } from '@/components/dashboard/page-header';
import { TemplateManager } from '@/components/dashboard/templates/template-manager';

export const metadata = { title: 'Template · Digital Letter' };

export default async function TemplatesPage() {
  const templates = await listTemplates();
  const occasions = listOccasions();

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Template"
        description="Cetakan untuk surat baru. Mengubah template tidak mengubah surat yang sudah dibuat darinya."
      />

      <TemplateManager templates={templates} occasions={occasions} />
    </div>
  );
}
