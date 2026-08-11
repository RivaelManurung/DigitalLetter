'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FilePlus2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { createTemplate } from '@/lib/actions/templates';
import type { OccasionRow } from '@/lib/occasion-list';
import type { TemplateRow } from '@/lib/template-types';
import { cn } from '@/lib/utils';
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

type Start =
  | { kind: 'blank' }
  | { kind: 'occasion'; id: string; label: string }
  | { kind: 'template'; id: string; label: string };

/**
 * Membuat template baru, lalu langsung membuka editornya.
 *
 * Titik mulai hanya menentukan isi awal — semuanya tetap bisa diubah di
 * editor, jadi pilihan di sini tidak mengunci apa pun.
 */
export function NewTemplateDialog({
  occasions,
  templates,
}: {
  occasions: OccasionRow[];
  templates: TemplateRow[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const [label, setLabel] = useState('');
  const [from, setFrom] = useState<Start>({ kind: 'blank' });

  function submit(event: React.FormEvent) {
    event.preventDefault();

    start(async () => {
      const result = await createTemplate({
        label,
        from: from.kind,
        source: from.kind === 'blank' ? undefined : from.id,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success('Template dibuat');
      setOpen(false);
      setLabel('');
      setFrom({ kind: 'blank' });
      router.push(`/dashboard/templates/${result.data!.id}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus size={14} />
        Template baru
      </DialogTrigger>

      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Template baru</DialogTitle>
            <DialogDescription>
              Pilih titik mulainya. Semua section bisa ditambah, dihapus, dan
              disusun ulang di editor setelah ini.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-1.5">
            <Label htmlFor="tpl-new-label">Nama template</Label>
            <Input
              id="tpl-new-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Undangan Nikahan Adat"
              required
              autoFocus
            />
          </div>

          <Separator />

          <div className="grid gap-2">
            <Label>Mulai dari</Label>

            <Choice
              active={from.kind === 'blank'}
              title="Kosong"
              note="Hanya pembuka & hero — susun sendiri dari nol"
              onClick={() => setFrom({ kind: 'blank' })}
            />

            <p className="pt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              Salin acara bawaan
            </p>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {occasions.map((row) => (
                <Choice
                  key={row.id}
                  active={from.kind === 'occasion' && from.id === row.id}
                  title={row.label}
                  note={`${row.sectionCount} section`}
                  onClick={() =>
                    setFrom({ kind: 'occasion', id: row.id, label: row.label })
                  }
                />
              ))}
            </div>

            {templates.length > 0 && (
              <>
                <p className="pt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  Salin template buatanmu
                </p>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {templates.map((row) => (
                    <Choice
                      key={row.id}
                      active={from.kind === 'template' && from.id === row.id}
                      title={row.label}
                      note={`${row.sections.length} section`}
                      onClick={() =>
                        setFrom({ kind: 'template', id: row.id, label: row.label })
                      }
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={pending || !label.trim()}>
              {pending ? (
                'Membuat…'
              ) : (
                <>
                  <FilePlus2 size={14} />
                  Buat &amp; susun
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Choice({
  active,
  title,
  note,
  onClick,
}: {
  active: boolean;
  title: string;
  note: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-lg border px-3 py-2 text-left text-xs transition-colors',
        active
          ? 'border-primary bg-muted font-medium'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
      )}
    >
      <span className="line-clamp-1">{title}</span>
      <span className="mt-0.5 block text-[10px] opacity-70">{note}</span>
    </button>
  );
}
