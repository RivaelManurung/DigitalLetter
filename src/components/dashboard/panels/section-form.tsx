'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { isListSpec, type FieldSpec, type LeafSpec, type ListSpec } from '@/design/blocks';
import { parseWith, type BlockRegistry } from '@/design/blocks/resolve';
import type { MediaRecord, SectionRecord } from '@/design/types';
import { updateSectionContent } from '@/lib/actions/letter';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { cn } from '@/lib/utils';

type Props = {
  section: SectionRecord;
  media: MediaRecord[];
  registry: BlockRegistry;
  onLocalChange: (content: Record<string, unknown>) => void;
};

const SAVE_DEBOUNCE_MS = 700;

/**
 * Form dibangkitkan dari spec block — tidak ada cabang per tipe di sini.
 * Menambah field di sebuah block otomatis memunculkan input yang sesuai.
 *
 * Perubahan langsung tampil di preview (state lokal), lalu disimpan ke
 * database setelah user berhenti mengetik — bukan tiap ketukan tombol.
 */
export function SectionForm({ section, media, registry, onLocalChange }: Props) {
  const [content, setContent] = useState<Record<string, unknown>>(section.content);
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    if (timer.current) clearTimeout(timer.current);
    setSaving(true);

    timer.current = setTimeout(async () => {
      const result = await updateSectionContent({
        sectionId: section.id,
        type: section.type,
        content,
      });
      setSaving(false);
      if (!result.ok) toast.error(result.error);
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [content, section.id, section.type]);

  function set(key: string, value: unknown) {
    const next = { ...content, [key]: value };
    setContent(next);
    onLocalChange(next);
  }

  const fields = registry.get(section.type)?.fields ?? [];
  // Nilai lewat schema dulu supaya field yang baru ditambahkan ke sebuah
  // block tetap punya nilai awal, bukan undefined.
  const parsed = useMemo(
    () => parseWith(registry, section.type, content),
    [registry, section.type, content],
  );

  return (
    <div className="grid gap-3">
      {groupRows(fields).map((row, index) => (
        <div key={index} className={rowClass(row)}>
          {row.map((field) => (
            <FieldRenderer
              key={field.key}
              field={field}
              value={parsed[field.key]}
              media={media}
              onChange={(value) => set(field.key, value)}
            />
          ))}
        </div>
      ))}

      <p className="text-[11px] text-muted-foreground">
        {saving ? 'Menyimpan…' : 'Tersimpan otomatis'}
        {' · '}
        <span>
          Format: <code>**tebal**</code>, <code>*miring*</code>, baris baru
        </span>
      </p>
    </div>
  );
}

/* ── Tata letak ────────────────────────────────────────────────
 * Field bertanda span 'half'/'third' yang berurutan digabung jadi satu
 * baris grid. Field 'full' dan daftar selalu berdiri sendiri.
 */

function groupRows(fields: FieldSpec[]): FieldSpec[][] {
  const rows: FieldSpec[][] = [];
  let current: FieldSpec[] = [];

  const limit = (field: FieldSpec) =>
    !isListSpec(field) && field.span === 'third' ? 3 : 2;

  for (const field of fields) {
    const span = isListSpec(field) ? undefined : field.span;

    if (!span || span === 'full') {
      if (current.length) rows.push(current);
      current = [];
      rows.push([field]);
      continue;
    }

    const head = current[0];
    const sameSpan = head && !isListSpec(head) && head.span === span;

    if (sameSpan && current.length < limit(field)) {
      current.push(field);
      if (current.length === limit(field)) {
        rows.push(current);
        current = [];
      }
    } else {
      if (current.length) rows.push(current);
      current = [field];
    }
  }

  if (current.length) rows.push(current);
  return rows;
}

function rowClass(row: FieldSpec[]): string {
  if (row.length < 2) return 'grid gap-3';
  return row.length === 3 ? 'grid grid-cols-3 gap-2' : 'grid grid-cols-2 gap-2';
}

/* ── Satu field ────────────────────────────────────────────── */

function FieldRenderer({
  field,
  value,
  media,
  onChange,
}: {
  field: FieldSpec;
  value: unknown;
  media: MediaRecord[];
  onChange: (value: unknown) => void;
}) {
  if (isListSpec(field)) {
    return (
      <ListEditor
        spec={field}
        items={Array.isArray(value) ? (value as Record<string, unknown>[]) : []}
        media={media}
        onChange={onChange}
      />
    );
  }

  return <LeafField field={field} value={value} media={media} onChange={onChange} />;
}

function LeafField({
  field,
  value,
  media,
  onChange,
}: {
  field: LeafSpec;
  value: unknown;
  media: MediaRecord[];
  onChange: (value: unknown) => void;
}) {
  const photos = media.filter((m) => m.kind === 'photo');

  switch (field.kind) {
    case 'longtext':
      return (
        <Field label={field.label} hint={field.hint}>
          <Textarea
            rows={field.rows ?? 4}
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );

    case 'select':
      return (
        <Field label={field.label} hint={field.hint}>
          <Select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      );

    case 'number':
      return (
        <Field label={field.label} hint={field.hint}>
          <Input
            type="number"
            min={field.min}
            max={field.max}
            step={field.step ?? 1}
            value={Number.isFinite(Number(value)) ? Number(value) : ''}
            onChange={(e) => {
              const next = e.target.value === '' ? '' : Number(e.target.value);
              onChange(next === '' ? field.min ?? 0 : next);
            }}
          />
        </Field>
      );

    case 'switch':
      return (
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
          <span className="grid gap-0.5">
            <span className="text-xs font-medium">{field.label}</span>
            {field.hint && (
              <span className="text-[11px] text-muted-foreground">{field.hint}</span>
            )}
          </span>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 shrink-0 cursor-pointer accent-foreground"
          />
        </label>
      );

    case 'datetime':
      return (
        <Field label={field.label} hint={field.hint}>
          <Input
            type="datetime-local"
            value={toDatetimeLocal(value)}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );

    case 'photo':
      return (
        <Field
          label={field.label}
          hint={photos.length ? field.hint : 'Unggah foto dulu di tab Media.'}
        >
          <div className="flex flex-wrap gap-2">
            <PhotoChip
              active={!value}
              onClick={() => onChange('')}
              label="Tanpa foto"
            />
            {photos.map((photo) => (
              <PhotoThumb
                key={photo.id}
                photo={photo}
                active={value === photo.id}
                onClick={() => onChange(value === photo.id ? '' : photo.id)}
              />
            ))}
          </div>
        </Field>
      );

    case 'photos': {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <Field
          label={field.label}
          hint={
            photos.length
              ? 'Kosongkan semua untuk memakai seluruh foto yang diunggah.'
              : 'Unggah foto dulu di tab Media.'
          }
        >
          <div className="grid grid-cols-4 gap-2">
            {photos.map((photo) => (
              <PhotoThumb
                key={photo.id}
                photo={photo}
                active={selected.includes(photo.id)}
                square
                onClick={() =>
                  onChange(
                    selected.includes(photo.id)
                      ? selected.filter((id) => id !== photo.id)
                      : [...selected, photo.id],
                  )
                }
              />
            ))}
          </div>
        </Field>
      );
    }

    case 'text':
    default:
      return (
        <Field label={field.label} hint={field.hint}>
          <Input value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />
        </Field>
      );
  }
}

/**
 * <input type="datetime-local"> menolak nilai yang berdetik atau berzona.
 * Konten bisa berisi keduanya (mis. hasil impor markdown), jadi dipangkas
 * ke bentuk yang diterima: YYYY-MM-DDTHH:mm.
 */
function toDatetimeLocal(value: unknown): string {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  const match = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/.exec(raw);
  if (match) return `${match[1]}T${match[2]}`;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function PhotoThumb({
  photo,
  active,
  square,
  onClick,
}: {
  photo: MediaRecord;
  active: boolean;
  square?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'overflow-hidden rounded-md border-2 transition-colors',
        square ? 'aspect-square' : 'h-14 w-14',
        active ? 'border-foreground' : 'border-transparent opacity-60',
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt={photo.caption ?? ''}
        className="h-full w-full object-cover"
      />
    </button>
  );
}

function PhotoChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'h-14 rounded-md border-2 px-3 text-[11px] text-muted-foreground transition-colors',
        active ? 'border-foreground text-foreground' : 'border-border',
      )}
    >
      {label}
    </button>
  );
}

/** Editor daftar generik — dibangkitkan dari spec item. */
function ListEditor({
  spec,
  items,
  media,
  onChange,
}: {
  spec: ListSpec;
  items: Record<string, unknown>[];
  media: MediaRecord[];
  onChange: (items: Record<string, unknown>[]) => void;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {spec.label} ({items.length})
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...items, spec.create()])}
        >
          <Plus size={12} />
          Tambah
        </Button>
      </div>

      <ul className="grid gap-2">
        {items.map((item, index) => (
          <li key={index} className="grid gap-2 rounded-lg border border-border p-2.5">
            {groupRows(spec.fields).map((row, rowIndex) => (
              <div key={rowIndex} className={rowClass(row)}>
                {row.map((field) => (
                  <FieldRenderer
                    key={field.key}
                    field={field}
                    value={item[field.key]}
                    media={media}
                    onChange={(value) =>
                      onChange(
                        items.map((it, i) =>
                          i === index ? { ...it, [field.key]: value } : it,
                        ),
                      )
                    }
                  />
                ))}
              </div>
            ))}

            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="justify-self-end rounded p-1 text-muted-foreground hover:text-danger"
              aria-label={`Hapus ${spec.label} ${index + 1}`}
            >
              <Trash2 size={13} />
            </button>
          </li>
        ))}
      </ul>

      {spec.hint && <p className="text-[11px] text-muted-foreground">{spec.hint}</p>}
    </div>
  );
}
