'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, LayoutTemplate, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { duplicateLetter, saveLetterAsTemplate } from '@/lib/actions/templates';
import { slugify } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';

type Props = {
  letterId: string;
  title: string;
  recipientName: string;
};

type Mode = 'duplicate' | 'template' | null;

/**
 * Dua jalan memakai ulang surat yang sudah jadi:
 *   Duplikat  → salinan utuh untuk client berikutnya
 *   Template  → cetakan yang muncul di dialog "Surat baru"
 *
 * Keduanya tidak menyalin foto: id media hanya sah di surat asalnya.
 */
export function LetterActions({ letterId, title, recipientName }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(null);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const [name, setName] = useState('');
  const [recipient, setRecipient] = useState('');
  const [slug, setSlug] = useState('');

  function begin(next: Mode) {
    setOpen(false);
    setMode(next);
    setName(next === 'duplicate' ? `${title} (salinan)` : title);
    setRecipient(recipientName);
    setSlug('');
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();

    start(async () => {
      if (mode === 'duplicate') {
        const result = await duplicateLetter({
          letterId,
          title: name,
          recipientName: recipient,
          slug: slug || undefined,
        });

        if (!result.ok) {
          toast.error(result.error);
          return;
        }

        toast.success('Surat diduplikat');
        setMode(null);
        router.refresh();
        router.push(`/dashboard/${result.data!.id}`);
        return;
      }

      const result = await saveLetterAsTemplate({
        letterId,
        label: name,
        includeContent: true,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success('Template disimpan');
      setMode(null);
      router.refresh();
    });
  }

  const effectiveSlug = slug || slugify(recipient || name);

  return (
    <>
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen((v) => !v)}
          aria-label="Aksi lain"
          aria-expanded={open}
        >
          <MoreHorizontal size={14} />
        </Button>

        {open && (
          <>
            {/* Klik di luar menutup menu. */}
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 z-20 mt-1 grid w-52 gap-0.5 rounded-lg border border-border bg-background p-1 shadow-lg">
              <MenuItem onClick={() => begin('duplicate')}>
                <Copy size={13} />
                Duplikat surat
              </MenuItem>
              <MenuItem onClick={() => begin('template')}>
                <LayoutTemplate size={13} />
                Simpan jadi template
              </MenuItem>
            </div>
          </>
        )}
      </div>

      {mode && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={mode === 'duplicate' ? 'Duplikat surat' : 'Simpan jadi template'}
          onClick={(e) => e.target === e.currentTarget && setMode(null)}
        >
          <form
            onSubmit={submit}
            className="grid w-full max-w-md gap-4 rounded-xl border border-border bg-background p-5"
          >
            <div className="grid gap-1">
              <h2 className="text-sm font-semibold">
                {mode === 'duplicate' ? 'Duplikat surat' : 'Simpan jadi template'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {mode === 'duplicate'
                  ? 'Salinan berisi semua section & desainnya, dimulai sebagai draf. Foto tidak ikut tersalin.'
                  : 'Template muncul di dialog "Surat baru". Mengubah template nanti tidak mengubah surat yang sudah ada.'}
              </p>
            </div>

            <Field label={mode === 'duplicate' ? 'Judul surat baru' : 'Nama template'}>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </Field>

            {mode === 'duplicate' && (
              <>
                <Field label="Nama penerima">
                  <Input
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </Field>

                <Field
                  label="Slug"
                  hint={
                    effectiveSlug
                      ? `Tautan: /l/${effectiveSlug}`
                      : 'Dibuat otomatis dari nama penerima'
                  }
                >
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    placeholder={slugify(recipient || name)}
                  />
                </Field>
              </>
            )}

            <div className="mt-1 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setMode(null)}>
                Batal
              </Button>
              <Button type="submit" disabled={pending || !name.trim()}>
                {pending ? 'Memproses…' : mode === 'duplicate' ? 'Duplikat' : 'Simpan'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function MenuItem({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-muted"
    >
      {children}
    </button>
  );
}
