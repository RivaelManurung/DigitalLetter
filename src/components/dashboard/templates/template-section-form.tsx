'use client';

import { useMemo, useState } from 'react';
import { isListSpec, type FieldSpec } from '@/design/blocks';
import { parseWith, type BlockRegistry } from '@/design/blocks/resolve';
import type { SectionRecord } from '@/design/types';
import { SectionFields } from '@/components/dashboard/panels/section-form';

type Props = {
  section: SectionRecord;
  registry: BlockRegistry;
  onChange: (content: Record<string, unknown>) => void;
};

/**
 * Form isi section di editor template.
 *
 * Sama dengan form di editor surat, minus penyimpanan otomatis: template
 * disimpan sekaligus lewat tombol Simpan, jadi di sini perubahan hanya
 * diteruskan ke induknya.
 *
 * Field bertipe foto disembunyikan — id media hanya sah di satu surat, jadi
 * memilih foto di template tidak akan pernah tampil di surat turunannya.
 */
export function TemplateSectionForm({ section, registry, onChange }: Props) {
  const [content, setContent] = useState<Record<string, unknown>>(section.content);

  const fields = useMemo(() => {
    const all = registry.get(section.type)?.fields ?? [];
    return all.map(stripPhotoFields).filter(Boolean) as FieldSpec[];
  }, [registry, section.type]);

  const parsed = useMemo(
    () => parseWith(registry, section.type, content),
    [registry, section.type, content],
  );

  function set(key: string, value: unknown) {
    const next = { ...content, [key]: value };
    setContent(next);
    onChange(next);
  }

  return (
    <div className="grid gap-3">
      <SectionFields fields={fields} values={parsed} media={[]} onSet={set} />

      <p className="text-[11px] text-muted-foreground">
        Teks ini jadi isi awal setiap surat yang dibuat dari template.
        {' · '}
        Format: <code>**tebal**</code>, <code>*miring*</code>, baris baru
      </p>
    </div>
  );
}

/** Buang field foto, termasuk yang berada di dalam daftar berulang. */
function stripPhotoFields(field: FieldSpec): FieldSpec | null {
  if (isListSpec(field)) {
    const kept = field.fields.filter(
      (leaf) => leaf.kind !== 'photo' && leaf.kind !== 'photos',
    );
    return kept.length ? { ...field, fields: kept } : null;
  }

  return field.kind === 'photo' || field.kind === 'photos' ? null : field;
}
