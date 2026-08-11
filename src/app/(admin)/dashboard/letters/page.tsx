import { listLetterCards } from '@/lib/queries';
import { listTemplates } from '@/lib/actions/templates';
import { PageHeader } from '@/components/dashboard/page-header';
import { LetterBrowser } from '@/components/dashboard/letters/letter-browser';
import { NewLetterDialog } from '../new-letter-dialog';

export const metadata = { title: 'Surat' };

export default async function LettersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ q }, cards, templates] = await Promise.all([
    searchParams,
    listLetterCards(),
    listTemplates(),
  ]);

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Surat"
        description="Semua surat client. Konten, desain, dan publikasi diatur per surat."
        action={<NewLetterDialog templates={templates} />}
      />

      <LetterBrowser letters={cards} initialQuery={q ?? ''} />
    </div>
  );
}
