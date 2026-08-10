import { notFound } from 'next/navigation';
import { getEditorData } from '@/lib/queries';
import { EditorShell } from '@/components/dashboard/editor-shell';

type Params = { params: Promise<{ id: string }> };

export default async function EditorPage({ params }: Params) {
  const { id } = await params;

  const data = await getEditorData(id);
  if (!data) notFound();

  const { row, bundle } = data;

  return (
    <EditorShell
      meta={{
        id: row.id,
        slug: row.slug,
        title: row.title,
        recipientName: row.recipientName,
        status: row.status,
        viewCount: row.viewCount,
        publishedAt: row.publishedAt?.toISOString() ?? null,
        opensAt: row.opensAt?.toISOString() ?? null,
        hasPassword: Boolean(row.passwordHash),
      }}
      bundle={bundle}
    />
  );
}
