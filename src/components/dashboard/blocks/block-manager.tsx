'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  CUSTOM_LAYOUTS,
  CUSTOM_LAYOUT_IDS,
  type CustomLayout,
} from '@/design/blocks/custom';
import {
  deleteCustomBlock,
  saveCustomBlock,
  type CustomBlockRow,
} from '@/lib/actions/blocks';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FieldBuilder, type DraftField } from './field-builder';

type Props = { initial: CustomBlockRow[] };

type Draft = {
  id?: string;
  label: string;
  note: string;
  layout: CustomLayout;
  fields: DraftField[];
};

const EMPTY: Draft = { label: '', note: '', layout: 'cards', fields: [] };

/**
 * Pengelola jenis section bikinan sendiri.
 *
 * Yang disimpan hanya daftar field-nya; schema Zod, form editor, dan
 * penulisan markdown dibangkitkan dari situ saat dipakai.
 */
export function BlockManager({ initial }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pending, start] = useTransition();

  function edit(row: CustomBlockRow) {
    const spec = (row.spec ?? {}) as { fields?: DraftField[] };
    setDraft({
      id: row.id,
      label: row.label,
      note: row.note,
      layout: (row.layout as CustomLayout) ?? 'cards',
      fields: spec.fields ?? [],
    });
  }

  function save() {
    if (!draft) return;

    start(async () => {
      const result = await saveCustomBlock({
        id: draft.id,
        label: draft.label,
        note: draft.note,
        layout: draft.layout,
        spec: { fields: draft.fields },
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(draft.id ? 'Section diperbarui' : 'Section dibuat');
      setDraft(null);
      router.refresh();
    });
  }

  function remove(row: CustomBlockRow) {
    if (!confirm(`Hapus jenis section "${row.label}"?`)) return;

    start(async () => {
      const result = await deleteCustomBlock(row.id);
      if (!result.ok) toast.error(result.error);
      else {
        toast.success('Jenis section dihapus');
        router.refresh();
      }
    });
  }

  if (draft) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {draft.id ? `Sunting: ${draft.label || 'Tanpa nama'}` : 'Jenis section baru'}
          </CardTitle>
          <CardDescription>
            Eyebrow &amp; Judul selalu ada. Field di bawah ini tambahannya.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="bm-label">Nama section</Label>
              <Input
                id="bm-label"
                value={draft.label}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                placeholder="Sponsor"
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground">
                Muncul di tombol “Tambah section”
              </p>
            </div>

            <div className="grid gap-1.5">
              <Label>Tata letak</Label>
              <Select
                value={draft.layout}
                onValueChange={(v) => setDraft({ ...draft, layout: v as CustomLayout })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOM_LAYOUT_IDS.map((id) => (
                    <SelectItem key={id} value={id}>
                      {CUSTOM_LAYOUTS[id].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="bm-note">Penjelasan singkat</Label>
            <Textarea
              id="bm-note"
              rows={2}
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              placeholder="Daftar sponsor acara."
            />
            <p className="text-[11px] text-muted-foreground">
              Tampil sebagai tooltip di editor
            </p>
          </div>

          <FieldBuilder
            fields={draft.fields}
            onChange={(fields) => setDraft({ ...draft, fields })}
          />

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Batal
            </Button>
            <Button onClick={save} disabled={pending || !draft.label.trim()}>
              {pending ? 'Menyimpan…' : 'Simpan'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="flex justify-end">
        <Button onClick={() => setDraft({ ...EMPTY })}>
          <Plus size={15} />
          Jenis section baru
        </Button>
      </div>

      {initial.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-xl border border-dashed px-6 py-16 text-center">
          <p className="text-sm font-medium">Belum ada jenis section buatanmu</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Bikin satu untuk hal yang belum tersedia — misalnya Sponsor, Menu
            Katering, atau Denah Lokasi.
          </p>
        </div>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {initial.map((row) => (
            <li key={row.id}>
              <Card className="h-full py-0 transition-colors hover:border-ring">
                <div className="flex h-full items-start justify-between gap-3 p-4">
                  <div className="grid min-w-0 gap-1">
                    <span className="truncate text-sm font-medium">{row.label}</span>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary">
                        {CUSTOM_LAYOUTS[(row.layout as CustomLayout) ?? 'cards']?.label}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {fieldCount(row.spec)} field
                      </span>
                      {row.usage > 0 && (
                        <span className="text-[11px] text-muted-foreground">
                          · dipakai di {row.usage} section
                        </span>
                      )}
                    </div>

                    {row.note && (
                      <span className="line-clamp-2 text-[11px] text-muted-foreground">
                        {row.note}
                      </span>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => edit(row)}
                      aria-label={`Sunting ${row.label}`}
                    >
                      <Pencil size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => remove(row)}
                      aria-label={`Hapus ${row.label}`}
                      className="hover:text-destructive"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function fieldCount(spec: unknown): number {
  const fields = (spec as { fields?: unknown[] })?.fields;
  return Array.isArray(fields) ? fields.length : 0;
}
