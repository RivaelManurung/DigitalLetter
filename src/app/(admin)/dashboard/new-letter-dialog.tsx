'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PRESET_LIST } from '@/design/presets';
import { createLetter } from '@/lib/actions/letter';
import { slugify } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { PresetPicker } from '@/components/dashboard/preset-picker';

export function NewLetterDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const [title, setTitle] = useState('');
  const [recipient, setRecipient] = useState('');
  const [slug, setSlug] = useState('');
  const [preset, setPreset] = useState(PRESET_LIST[0].id);

  const effectiveSlug = slug || slugify(recipient || title);

  function submit(event: React.FormEvent) {
    event.preventDefault();

    start(async () => {
      const result = await createLetter({
        title,
        recipientName: recipient,
        slug: effectiveSlug || undefined,
        preset,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success('Surat dibuat');
      setOpen(false);
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
            Kamu akan mendapat 7 section berisi teks awal yang tinggal disunting.
          </p>
        </div>

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

        <Field label="Desain awal">
          <PresetPicker value={preset} onChange={setPreset} />
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
