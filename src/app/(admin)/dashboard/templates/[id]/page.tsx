import { notFound } from 'next/navigation';
import { getTemplateEditorData } from '@/lib/actions/templates';
import { TemplateEditorShell } from '@/components/dashboard/templates/template-editor-shell';

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const data = await getTemplateEditorData(id);
  return { title: data ? `${data.label} · Template` : 'Template' };
}

export default async function TemplateEditorPage({ params }: Params) {
  const { id } = await params;

  const data = await getTemplateEditorData(id);
  if (!data) notFound();

  return <TemplateEditorShell initial={data} />;
}
