'use client';

import { ChevronDown, ChevronUp, List, Plus, Trash2 } from 'lucide-react';
import {
  CUSTOM_FIELD_KINDS,
  CUSTOM_FIELD_LABEL,
  type CustomFieldKind,
} from '@/design/blocks/custom';
import { cn, slugify } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

/** Bungkus label + input yang seragam di seluruh penyusun field. */
function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Bentuk longgar saat disunting — divalidasi ketat di Server Action. */
export type DraftLeaf = {
  key: string;
  label: string;
  kind: CustomFieldKind;
  hint?: string;
  options?: string[];
  useGlyphs?: boolean;
  rows?: number;
  min?: number;
  max?: number;
  span?: 'full' | 'half' | 'third';
  starter?: string;
};

export type DraftList = {
  key: string;
  label: string;
  kind: 'list';
  itemLabel: string;
  hint?: string;
  max?: number;
  fields: DraftLeaf[];
};

export type DraftField = DraftLeaf | DraftList;

export function isDraftList(field: DraftField): field is DraftList {
  return field.kind === 'list';
}

/**
 * Penyusun field. Kunci (`key`) dibuat otomatis dari labelnya — itu nama
 * yang dipakai di database dan template markdown, jadi user tidak perlu
 * memikirkannya, tapi tetap bisa diubah kalau sudah terlanjur dipakai.
 */
export function FieldBuilder({
  fields,
  onChange,
}: {
  fields: DraftField[];
  onChange: (fields: DraftField[]) => void;
}) {
  function update(index: number, next: DraftField) {
    onChange(fields.map((field, i) => (i === index ? next : field)));
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function addLeaf() {
    onChange([
      ...fields,
      { key: '', label: '', kind: 'text', span: 'full', starter: '' },
    ]);
  }

  function addList() {
    onChange([
      ...fields,
      {
        key: '',
        label: '',
        kind: 'list',
        itemLabel: 'item',
        max: 20,
        fields: [{ key: 'nama', label: 'Nama', kind: 'text', span: 'full', starter: '' }],
      },
    ]);
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Field ({fields.length})
        </span>
        <div className="flex gap-1.5">
          <Button type="button" variant="outline" size="sm" onClick={addLeaf}>
            <Plus size={12} />
            Field
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={addList}>
            <List size={12} />
            Daftar
          </Button>
        </div>
      </div>

      {fields.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          Belum ada field. Section ini baru punya Eyebrow & Judul.
        </p>
      )}

      <ul className="grid gap-2">
        {fields.map((field, index) => (
          <li key={index} className="grid gap-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {isDraftList(field) ? 'Daftar berulang' : 'Field'}
              </span>

              <div className="flex gap-0.5">
                <IconButton
                  label="Naikkan"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                >
                  <ChevronUp size={13} />
                </IconButton>
                <IconButton
                  label="Turunkan"
                  onClick={() => move(index, 1)}
                  disabled={index === fields.length - 1}
                >
                  <ChevronDown size={13} />
                </IconButton>
                <IconButton
                  label="Hapus"
                  danger
                  onClick={() => onChange(fields.filter((_, i) => i !== index))}
                >
                  <Trash2 size={13} />
                </IconButton>
              </div>
            </div>

            {isDraftList(field) ? (
              <ListEditor field={field} onChange={(next) => update(index, next)} />
            ) : (
              <LeafEditor field={field} onChange={(next) => update(index, next)} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LeafEditor({
  field,
  onChange,
  compact,
}: {
  field: DraftLeaf;
  onChange: (field: DraftLeaf) => void;
  compact?: boolean;
}) {
  /** Kunci mengikuti label sampai user mengubahnya sendiri. */
  function setLabel(label: string) {
    const auto = keyFromLabel(field.label);
    const keyFollows = !field.key || field.key === auto;
    onChange({ ...field, label, key: keyFollows ? keyFromLabel(label) : field.key });
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Row label="Nama field">
          <Input
            value={field.label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Nama sponsor"
          />
        </Row>

        <Row label="Jenis isian">
          <Select
            value={field.kind}
            onValueChange={(v) => onChange({ ...field, kind: v as CustomFieldKind })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CUSTOM_FIELD_KINDS.map((kind) => (
                <SelectItem key={kind} value={kind}>
                  {CUSTOM_FIELD_LABEL[kind]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
      </div>

      {field.kind === 'select' && (
        <>
          <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
            <Label className="cursor-pointer text-xs font-normal">
              Pakai daftar ikon bawaan (mawar, hati, bintang, …)
            </Label>
            <Switch
              checked={field.useGlyphs ?? false}
              onCheckedChange={(v) => onChange({ ...field, useGlyphs: v })}
            />
          </div>

          {!field.useGlyphs && (
            <Row label="Pilihan" hint="Satu pilihan per baris">
              <Textarea
                rows={3}
                value={(field.options ?? []).join('\n')}
                onChange={(e) =>
                  onChange({ ...field, options: e.target.value.split('\n') })
                }
                placeholder={'Emas\nPerak\nPerunggu'}
              />
            </Row>
          )}
        </>
      )}

      {field.kind === 'number' && (
        <div className="grid grid-cols-2 gap-3">
          <Row label="Minimal">
            <Input
              type="number"
              value={field.min ?? 0}
              onChange={(e) => onChange({ ...field, min: Number(e.target.value) || 0 })}
            />
          </Row>
          <Row label="Maksimal">
            <Input
              type="number"
              value={field.max ?? 9999}
              onChange={(e) => onChange({ ...field, max: Number(e.target.value) || 0 })}
            />
          </Row>
        </div>
      )}

      {!compact && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Row label="Nilai awal" hint="Terisi otomatis saat section ditambahkan">
            <Input
              value={field.starter ?? ''}
              onChange={(e) => onChange({ ...field, starter: e.target.value })}
              placeholder={starterPlaceholder(field.kind)}
            />
          </Row>

          <Row label="Lebar">
            <Select
              value={field.span ?? 'full'}
              onValueChange={(v) =>
                onChange({ ...field, span: v as DraftLeaf['span'] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Satu baris penuh</SelectItem>
                <SelectItem value="half">Setengah</SelectItem>
                <SelectItem value="third">Sepertiga</SelectItem>
              </SelectContent>
            </Select>
          </Row>
        </div>
      )}

      <Row label="Petunjuk" hint="Teks kecil di bawah isian — boleh kosong">
        <Input
          value={field.hint ?? ''}
          onChange={(e) => onChange({ ...field, hint: e.target.value })}
        />
      </Row>

      <p className="text-[10px] text-muted-foreground">
        Kunci:{' '}
        <code className="rounded bg-muted px-1 py-0.5">{field.key || '—'}</code>
      </p>
    </div>
  );
}

function ListEditor({
  field,
  onChange,
}: {
  field: DraftList;
  onChange: (field: DraftList) => void;
}) {
  function setLabel(label: string) {
    const auto = keyFromLabel(field.label);
    const keyFollows = !field.key || field.key === auto;
    onChange({
      ...field,
      label,
      key: keyFollows ? keyFromLabel(label) : field.key,
      itemLabel: field.itemLabel || slugify(label) || 'item',
    });
  }

  return (
    <div className="grid gap-2">
      <div className="grid gap-3 sm:grid-cols-2">
        <Row label="Nama daftar">
          <Input
            value={field.label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Sponsor"
          />
        </Row>
        <Row label="Maksimal item">
          <Input
            type="number"
            min={1}
            max={60}
            value={field.max ?? 20}
            onChange={(e) => onChange({ ...field, max: Number(e.target.value) || 20 })}
          />
        </Row>
      </div>

      <div className="grid gap-1.5 rounded-lg bg-muted/50 p-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">
            Isi tiap item ({field.fields.length})
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onChange({
                ...field,
                fields: [
                  ...field.fields,
                  { key: '', label: '', kind: 'text', span: 'full', starter: '' },
                ],
              })
            }
          >
            <Plus size={11} />
            Tambah
          </Button>
        </div>

        <ul className="grid gap-1.5">
          {field.fields.map((leaf, i) => (
            <li key={i} className="grid gap-2 rounded-md border border-border bg-background p-2">
              <div className="flex justify-end">
                <IconButton
                  label="Hapus"
                  danger
                  onClick={() =>
                    onChange({
                      ...field,
                      fields: field.fields.filter((_, index) => index !== i),
                    })
                  }
                >
                  <Trash2 size={12} />
                </IconButton>
              </div>

              <LeafEditor
                field={leaf}
                compact
                onChange={(next) =>
                  onChange({
                    ...field,
                    fields: field.fields.map((f, index) => (index === i ? next : f)),
                  })
                }
              />
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Kunci: <code>{field.key || '—'}</code>
      </p>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'rounded p-1 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30',
        danger && 'hover:text-danger',
      )}
    >
      {children}
    </button>
  );
}

/** "Nama Sponsor" → "namaSponsor". Kunci harus aman dipakai sebagai key JSON. */
function keyFromLabel(label: string): string {
  const parts = slugify(label).split('-').filter(Boolean);
  if (!parts.length) return '';
  return (
    parts[0] +
    parts
      .slice(1)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join('')
  );
}

function starterPlaceholder(kind: CustomFieldKind): string {
  switch (kind) {
    case 'datetime':
      return '2026-11-21T08:00';
    case 'switch':
      return 'true';
    case 'number':
      return '0';
    case 'photo':
    case 'photos':
      return 'dipilih di editor';
    default:
      return '';
  }
}
