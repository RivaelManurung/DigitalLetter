import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { letter } from '@/db/schema';
import { getLetterBundleById } from '@/lib/queries';
import { EditorShell } from '@/components/dashboard/editor-shell';

type Params = { params: Promise<{ id: string }> };

export default async function EditorPage({ params }: Params) {
  const { id } = await params;

  const [row] = await db
    .select({
      id: letter.id,
      slug: letter.slug,
      title: letter.title,
      recipientName: letter.recipientName,
      status: letter.status,
      viewCount: letter.viewCount,
      publishedAt: letter.publishedAt,
      opensAt: letter.opensAt,
      hasPassword: letter.passwordHash,
    })
    .from(letter)
    .where(eq(letter.id, id))
    .limit(1);

  if (!row) notFound();

  const bundle = await getLetterBundleById(id);
  if (!bundle) notFound();

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
        hasPassword: Boolean(row.hasPassword),
      }}
      bundle={bundle}
    />
  );
}
