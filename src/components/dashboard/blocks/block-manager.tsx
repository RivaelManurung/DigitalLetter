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
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { Card, CardHeader, EmptyState } from '@/components/ui/surface';
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
        <CardHeader
          title={draft.id ? `Sunting: ${draft.label || 'Tanpa nama'}` : 'Jenis section baru'}
          description="Eyebrow & Judul selalu ada. Field di bawah ini tambahannya."
        />

        <div className="grid gap-3 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Nama section" hint="Muncul di tombol Tambah section">
              <Input
                value={draft.label}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                placeholder="Sponsor"
                autoFocus
              />
            </Field>

            <Field label="Tata letak">
              <Select
                value={draft.layout}
                onChange={(e) =>
                  setDraft({ ...draft, layout: e.target.value as CustomLayout })
                }
              >
                {CUSTOM_LAYOUT_IDS.map((id) => (
                  <option key={id} value={id}>
                    {CUSTOM_LAYOUTS[id].label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Penjelasan singkat" hint="Tampil sebagai tooltip di editor">
            <Textarea
              rows={2}
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              placeholder="Daftar sponsor acara."
            />
          </Field>

          <FieldBuilder
            fields={draft.fields}
            onChange={(fields) => setDraft({ ...draft, fields })}
          />

          <div className="mt-1 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Batal
            </Button>
            <Button onClick={save} disabled={pending || !draft.label.trim()}>
              {pending ? 'Menyimpan…' : 'Simpan'}
            </Button>
          </div>
        </div>
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
        <EmptyState
          title="Belum ada jenis section buatanmu"
          description="Bikin satu untuk hal yang belum tersedia — misalnya Sponsor, Menu Katering, atau Denah Lokasi."
        />
      ) : (
        <ul className="grid gap-2">
          {initial.map((row) => (
            <li
              key={row.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background p-3"
            >
              <div className="grid gap-0.5">
                <span className="text-sm font-medium">{row.label}</span>
                <span className="text-[11px] text-muted-foreground">
                  {CUSTOM_LAYOUTS[(row.layout as CustomLayout) ?? 'cards']?.label}
                  {' · '}
                  {fieldCount(row.spec)} field
                  {row.usage > 0 && ` · dipakai di ${row.usage} section`}
                </span>
                {row.note && (
                  <span className="text-[11px] text-muted-foreground">{row.note}</span>
                )}
              </div>

              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => edit(row)}
                  aria-label={`Sunting ${row.label}`}
                  className="rounded p-1.5 text-muted-foreground hover:bg-muted"
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(row)}
                  aria-label={`Hapus ${row.label}`}
                  className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-danger"
                >
                  <Trash2 size={13} />
                </button>
              </div>
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
