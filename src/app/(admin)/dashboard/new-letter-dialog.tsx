'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { OCCASIONS, OCCASION_IDS, type OccasionId } from '@/design/occasions';
import { createLetter } from '@/lib/actions/letter';
import type { TemplateRow } from '@/lib/template-types';
import { cn, slugify } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { PresetPicker } from '@/components/dashboard/preset-picker';

/** Pilihan acara: occasion bawaan atau template bikinan sendiri. */
type Choice =
  | { kind: 'occasion'; id: OccasionId }
  | { kind: 'template'; id: string };

export function NewLetterDialog({ templates = [] }: { templates?: TemplateRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const [title, setTitle] = useState('');
  const [recipient, setRecipient] = useState('');
  const [slug, setSlug] = useState('');
  const [choice, setChoice] = useState<Choice>({ kind: 'occasion', id: 'love' });
  // Preset mengikuti pilihan acara sampai user memilih sendiri.
  const [preset, setPreset] = useState<string | null>(null);

  const selectedTemplate =
    choice.kind === 'template' ? templates.find((t) => t.id === choice.id) : undefined;

  const effectiveSlug = slug || slugify(recipient || title);
  const effectivePreset =
    preset ??
    (choice.kind === 'occasion'
      ? OCCASIONS[choice.id].preset
      : (selectedTemplate?.preset ?? 'dark-romantic'));

  const note =
    choice.kind === 'occasion'
      ? OCCASIONS[choice.id].note
      : (selectedTemplate?.note ?? 'Template buatanmu.');

  function submit(event: React.FormEvent) {
    event.preventDefault();

    start(async () => {
      const result = await createLetter({
        title,
        recipientName: recipient,
        slug: effectiveSlug || undefined,
        preset: effectivePreset,
        occasion: choice.kind === 'occasion' ? choice.id : 'love',
        templateId: choice.kind === 'template' ? choice.id : undefined,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success('Surat dibuat');
      setOpen(false);
      // refresh() sebelum push: tanpa ini, daftar surat yang sudah tersimpan
      // di router cache klien tetap menampilkan keadaan lama saat user
      // menekan tombol Back.
      router.refresh();
      router.push(`/dashboard/${result.data!.id}`);
    });
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus size={15} />
        Surat baru
      </Button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Buat surat baru"
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <form
        onSubmit={submit}
        className="grid w-full max-w-lg gap-4 rounded-xl border border-border bg-background p-5"
      >
        <div className="grid gap-1">
          <h2 className="text-sm font-semibold">Surat baru</h2>
          <p className="text-xs text-muted-foreground">
            Pilih acaranya — section awal beserta teksnya dibuatkan, tinggal disunting.
          </p>
        </div>

        <Field label="Acara" hint={note}>
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {OCCASION_IDS.map((id) => {
                const active = choice.kind === 'occasion' && choice.id === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setChoice({ kind: 'occasion', id })}
                    aria-pressed={active}
                    className={cn(
                      'rounded-lg border px-2.5 py-2 text-left text-xs transition-colors',
                      active
                        ? 'border-foreground bg-muted font-medium'
                        : 'border-border text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {OCCASIONS[id].label}
                    <span className="mt-0.5 block text-[10px] opacity-70">
                      {OCCASIONS[id].sections.length} section
                    </span>
                  </button>
                );
              })}
            </div>

            {templates.length > 0 && (
              <>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Template buatanmu
                </p>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {templates.map((template) => {
                    const active =
                      choice.kind === 'template' && choice.id === template.id;
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setChoice({ kind: 'template', id: template.id })}
                        aria-pressed={active}
                        className={cn(
                          'rounded-lg border px-2.5 py-2 text-left text-xs transition-colors',
                          active
                            ? 'border-foreground bg-muted font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted',
                        )}
                      >
                        {template.label}
                        <span className="mt-0.5 block text-[10px] opacity-70">
                          {template.sections.length} section
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </Field>

        <Field label="Judul" htmlFor="title">
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Surat untuk Bila"
            required
            autoFocus
          />
        </Field>

        <Field label="Nama penerima" htmlFor="recipient">
          <Input
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Bila"
          />
        </Field>

        <Field
          label="Slug"
          htmlFor="slug"
          hint={effectiveSlug ? `Tautan: /l/${effectiveSlug}` : 'Dibuat otomatis dari nama penerima'}
        >
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            placeholder={slugify(recipient || title) || 'untuk-bila'}
          />
        </Field>

        <Field
          label="Desain awal"
          hint={preset ? undefined : 'Mengikuti pilihan acara di atas'}
        >
          <PresetPicker value={effectivePreset} onChange={setPreset} />
        </Field>

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button type="submit" disabled={pending || !title.trim()}>
            {pending ? 'Membuat…' : 'Buat surat'}
          </Button>
        </div>
      </form>
    </div>
  );
}
