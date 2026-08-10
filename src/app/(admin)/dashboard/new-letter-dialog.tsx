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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus size={15} />
        Surat baru
      </DialogTrigger>

      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Surat baru</DialogTitle>
            <DialogDescription>
              Pilih acaranya — section awal beserta teksnya dibuatkan, tinggal
              disunting.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label>Acara</Label>

            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {OCCASION_IDS.map((id) => (
                <ChoiceButton
                  key={id}
                  active={choice.kind === 'occasion' && choice.id === id}
                  label={OCCASIONS[id].label}
                  meta={`${OCCASIONS[id].sections.length} section`}
                  onClick={() => setChoice({ kind: 'occasion', id })}
                />
              ))}
            </div>

            {templates.length > 0 && (
              <>
                <div className="flex items-center gap-2 pt-1">
                  <Separator className="flex-1" />
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Template buatanmu
                  </span>
                  <Separator className="flex-1" />
                </div>

                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {templates.map((template) => (
                    <ChoiceButton
                      key={template.id}
                      active={choice.kind === 'template' && choice.id === template.id}
                      label={template.label}
                      meta={`${template.sections.length} section`}
                      onClick={() => setChoice({ kind: 'template', id: template.id })}
                    />
                  ))}
                </div>
              </>
            )}

            <p className="text-[11px] text-muted-foreground">{note}</p>
          </div>

          <Separator />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="nl-title">Judul</Label>
              <Input
                id="nl-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Surat untuk Bila"
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="nl-recipient">Nama penerima</Label>
              <Input
                id="nl-recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Bila"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="nl-slug">Slug</Label>
            <Input
              id="nl-slug"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder={slugify(recipient || title) || 'untuk-bila'}
            />
            <p className="text-[11px] text-muted-foreground">
              {effectiveSlug
                ? `Tautan: /l/${effectiveSlug}`
                : 'Dibuat otomatis dari nama penerima'}
            </p>
          </div>

          <div className="grid gap-1.5">
            <Label>Desain awal</Label>
            <PresetPicker value={effectivePreset} onChange={setPreset} />
            {!preset && (
              <p className="text-[11px] text-muted-foreground">
                Mengikuti pilihan acara di atas
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={pending || !title.trim()}>
              {pending ? 'Membuat…' : 'Buat surat'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ChoiceButton({
  active,
  label,
  meta,
  onClick,
}: {
  active: boolean;
  label: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-lg border px-2.5 py-2 text-left text-xs transition-colors',
        active
          ? 'border-primary bg-muted font-medium'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
      )}
    >
      <span className="line-clamp-1">{label}</span>
      <span className="mt-0.5 block text-[10px] opacity-70">{meta}</span>
    </button>
  );
}
