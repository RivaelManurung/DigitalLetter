'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, LayoutTemplate, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { duplicateLetter, saveLetterAsTemplate } from '@/lib/actions/templates';
import { slugify } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const [pending, start] = useTransition();

  const [name, setName] = useState('');
  const [recipient, setRecipient] = useState('');
  const [slug, setSlug] = useState('');

  function begin(next: Exclude<Mode, null>) {
    setName(next === 'duplicate' ? `${title} (salinan)` : title);
    setRecipient(recipientName);
    setSlug('');
    setMode(next);
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
  const isDuplicate = mode === 'duplicate';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="outline" size="icon-sm" aria-label="Aksi lain" />}
        >
          <MoreHorizontal size={14} />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={() => begin('duplicate')}>
            <Copy size={13} />
            Duplikat surat
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => begin('template')}>
            <LayoutTemplate size={13} />
            Simpan jadi template
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={mode !== null} onOpenChange={(open) => !open && setMode(null)}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={submit} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>
                {isDuplicate ? 'Duplikat surat' : 'Simpan jadi template'}
              </DialogTitle>
              <DialogDescription>
                {isDuplicate
                  ? 'Salinan berisi semua section & desainnya, dimulai sebagai draf. Foto tidak ikut tersalin.'
                  : 'Template muncul di dialog "Surat baru". Mengubah template nanti tidak mengubah surat yang sudah ada.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-1.5">
              <Label htmlFor="la-name">
                {isDuplicate ? 'Judul surat baru' : 'Nama template'}
              </Label>
              <Input
                id="la-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            {isDuplicate && (
              <>
                <div className="grid gap-1.5">
                  <Label htmlFor="la-recipient">Nama penerima</Label>
                  <Input
                    id="la-recipient"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="la-slug">Slug</Label>
                  <Input
                    id="la-slug"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    placeholder={slugify(recipient || name)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {effectiveSlug
                      ? `Tautan: /l/${effectiveSlug}`
                      : 'Dibuat otomatis dari nama penerima'}
                  </p>
                </div>
              </>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setMode(null)}>
                Batal
              </Button>
              <Button type="submit" disabled={pending || !name.trim()}>
                {pending ? 'Memproses…' : isDuplicate ? 'Duplikat' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
