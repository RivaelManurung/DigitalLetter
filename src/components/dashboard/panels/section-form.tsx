'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { parseSectionContent } from '@/design/schemas';
import { GLYPH_NAMES, GLYPH_LABEL } from '@/components/graphics/icon-glyph';
import type { MediaRecord, SectionRecord } from '@/design/types';
import { updateSectionContent } from '@/lib/actions/letter';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/field';

type Props = {
  section: SectionRecord;
  media: MediaRecord[];
  onLocalChange: (content: Record<string, unknown>) => void;
};

const SAVE_DEBOUNCE_MS = 700;

/**
 * Form dibangun dari bentuk konten tiap tipe. Perubahan langsung tampil di
 * preview (state lokal), lalu disimpan ke database setelah user berhenti
 * mengetik — bukan tiap ketukan tombol.
 */
export function SectionForm({ section, media, onLocalChange }: Props) {
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

  return (
    <div className="grid gap-3">
      {renderFields(section, content, set, media)}

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

function renderFields(
  section: SectionRecord,
  content: Record<string, unknown>,
  set: (key: string, value: unknown) => void,
  media: MediaRecord[],
) {
  const str = (key: string) => String(content[key] ?? '');

  switch (section.type) {
    case 'intro':
      return (
        <>
          <Field label="Teks ajakan">
            <Input value={str('hint')} onChange={(e) => set('hint', e.target.value)} />
          </Field>
          <Field label="Label di atas kado" hint="Kosongkan kalau tidak perlu">
            <Input value={str('label')} onChange={(e) => set('label', e.target.value)} />
          </Field>
        </>
      );

    case 'hero':
      return (
        <>
          <Field label="Eyebrow">
            <Input value={str('eyebrow')} onChange={(e) => set('eyebrow', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Judul baris 1">
              <Input value={str('titleTop')} onChange={(e) => set('titleTop', e.target.value)} />
            </Field>
            <Field label="Judul baris 2" hint="Ditampilkan miring & beraksen">
              <Input
                value={str('titleBottom')}
                onChange={(e) => set('titleBottom', e.target.value)}
              />
            </Field>
          </div>
          <Field label="Subjudul">
            <Textarea value={str('subtitle')} onChange={(e) => set('subtitle', e.target.value)} />
          </Field>
          <Field label="Teks scroll">
            <Input
              value={str('scrollLabel')}
              onChange={(e) => set('scrollLabel', e.target.value)}
            />
          </Field>
        </>
      );

    case 'letter':
      return (
        <>
          <Field label="Label">
            <Input value={str('label')} onChange={(e) => set('label', e.target.value)} />
          </Field>
          <Field label="Judul">
            <Input value={str('title')} onChange={(e) => set('title', e.target.value)} />
          </Field>
          <Field label="Isi surat">
            <Textarea
              rows={9}
              value={str('body')}
              onChange={(e) => set('body', e.target.value)}
            />
          </Field>
          <Field label="Tanda tangan">
            <Input value={str('signature')} onChange={(e) => set('signature', e.target.value)} />
          </Field>
        </>
      );

    case 'reasons': {
      const parsed = parseSectionContent('reasons', content);
      return (
        <>
          <Field label="Eyebrow">
            <Input value={str('eyebrow')} onChange={(e) => set('eyebrow', e.target.value)} />
          </Field>
          <Field label="Judul">
            <Input value={str('title')} onChange={(e) => set('title', e.target.value)} />
          </Field>

          <ArrayEditor
            label="Alasan"
            items={parsed.items}
            onChange={(items) => set('items', items)}
            create={() => ({ icon: 'rose', title: '', body: '' })}
            render={(item, update) => (
              <>
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <Field label="Ikon">
                    <Select
                      value={item.icon}
                      onChange={(e) => update({ ...item, icon: e.target.value })}
                    >
                      {GLYPH_NAMES.map((name) => (
                        <option key={name} value={name}>
                          {GLYPH_LABEL[name]}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Judul">
                    <Input
                      value={item.title}
                      onChange={(e) => update({ ...item, title: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Teks">
                  <Textarea
                    rows={2}
                    value={item.body}
                    onChange={(e) => update({ ...item, body: e.target.value })}
                  />
                </Field>
              </>
            )}
          />
        </>
      );
    }

    case 'garden': {
      const parsed = parseSectionContent('garden', content);
      return (
        <>
          <Field label="Eyebrow">
            <Input value={str('eyebrow')} onChange={(e) => set('eyebrow', e.target.value)} />
          </Field>
          <Field label="Judul">
            <Input value={str('title')} onChange={(e) => set('title', e.target.value)} />
          </Field>
          <Field label="Catatan bawah">
            <Input value={str('note')} onChange={(e) => set('note', e.target.value)} />
          </Field>

          <ArrayEditor
            label="Bunga"
            items={parsed.flowers}
            onChange={(flowers) => set('flowers', flowers)}
            create={() => ({ flower: 'rose', name: '', meaning: '' })}
            render={(item, update) => (
              <div className="grid grid-cols-3 gap-2">
                <Field label="Bentuk">
                  <Select
                    value={item.flower}
                    onChange={(e) => update({ ...item, flower: e.target.value })}
                  >
                    {GLYPH_NAMES.map((name) => (
                      <option key={name} value={name}>
                        {GLYPH_LABEL[name]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Nama">
                  <Input
                    value={item.name}
                    onChange={(e) => update({ ...item, name: e.target.value })}
                  />
                </Field>
                <Field label="Makna">
                  <Input
                    value={item.meaning}
                    onChange={(e) => update({ ...item, meaning: e.target.value })}
                  />
                </Field>
              </div>
            )}
          />
        </>
      );
    }

    case 'gallery': {
      const parsed = parseSectionContent('gallery', content);
      const photos = media.filter((m) => m.kind === 'photo');
      const selected = parsed.mediaIds;

      return (
        <>
          <Field label="Eyebrow">
            <Input value={str('eyebrow')} onChange={(e) => set('eyebrow', e.target.value)} />
          </Field>
          <Field label="Judul">
            <Input value={str('title')} onChange={(e) => set('title', e.target.value)} />
          </Field>

          <Field
            label="Foto yang dipakai"
            hint={
              photos.length
                ? 'Kosongkan semua untuk memakai seluruh foto yang diunggah.'
                : 'Unggah foto dulu di tab Media.'
            }
          >
            <div className="grid grid-cols-4 gap-2">
              {photos.map((photo) => {
                const active = selected.includes(photo.id);
                return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() =>
                      set(
                        'mediaIds',
                        active
                          ? selected.filter((id) => id !== photo.id)
                          : [...selected, photo.id],
                      )
                    }
                    aria-pressed={active}
                    className={`aspect-square overflow-hidden rounded-md border-2 transition-colors ${
                      active ? 'border-foreground' : 'border-transparent opacity-60'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.caption ?? ''}
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </Field>
        </>
      );
    }

    case 'finale':
      return (
        <>
          <Field label="Eyebrow">
            <Input value={str('eyebrow')} onChange={(e) => set('eyebrow', e.target.value)} />
          </Field>
          <Field label="Judul">
            <Input value={str('title')} onChange={(e) => set('title', e.target.value)} />
          </Field>
          <Field label="Isi">
            <Textarea rows={5} value={str('body')} onChange={(e) => set('body', e.target.value)} />
          </Field>
          <Field label="Tanda tangan">
            <Input value={str('signature')} onChange={(e) => set('signature', e.target.value)} />
          </Field>
        </>
      );

    default:
      return null;
  }
}

/** Editor daftar generik — dipakai untuk "alasan" dan "bunga". */
function ArrayEditor<T>({
  label,
  items,
  onChange,
  create,
  render,
}: {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  render: (item: T, update: (next: T) => void) => React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {label} ({items.length})
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...items, create()])}
        >
          <Plus size={12} />
          Tambah
        </Button>
      </div>

      <ul className="grid gap-2">
        {items.map((item, index) => (
          <li key={index} className="grid gap-2 rounded-lg border border-border p-2.5">
            {render(item, (next) =>
              onChange(items.map((it, i) => (i === index ? next : it))),
            )}
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="justify-self-end rounded p-1 text-muted-foreground hover:text-danger"
              aria-label={`Hapus ${label} ${index + 1}`}
            >
              <Trash2 size={13} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
