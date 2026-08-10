import { listLetterCards } from '@/lib/queries';
import { listTemplates } from '@/lib/actions/templates';
import { PageHeader } from '@/components/dashboard/page-header';
import { LetterBrowser } from '@/components/dashboard/letters/letter-browser';
import { NewLetterDialog } from '../new-letter-dialog';

export const metadata = { title: 'Surat · Digital Letter' };

export default async function LettersPage() {
  const [cards, templates] = await Promise.all([listLetterCards(), listTemplates()]);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Surat"
        description="Semua surat client. Konten, desain, dan publikasi diatur per surat."
        action={<NewLetterDialog templates={templates} />}
      />

      <LetterBrowser letters={cards} />
    </div>
  );
}
