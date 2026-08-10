'use client';

import { useState, useTransition } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, Eye, EyeOff, GripVertical, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { GROUP_LABEL, type BlockGroup } from '@/design/blocks';
import type { BlockRegistry } from '@/design/blocks/resolve';
import type { MediaRecord, SectionRecord } from '@/design/types';
import { variantLabel } from '@/design/variant-labels';
import {
  addSection,
  deleteSection,
  reorderSections,
  setSectionVariant,
  toggleSection,
} from '@/lib/actions/letter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, Select } from '@/components/ui/field';
import { Card } from '@/components/ui/surface';
import { MarkdownTools } from './markdown-tools';
import { SectionForm } from './section-form';

type Props = {
  letterId: string;
  slug: string;
  sections: SectionRecord[];
  media: MediaRecord[];
  registry: BlockRegistry;
  onChange: (sections: SectionRecord[]) => void;
};

export function ContentPanel({
  letterId,
  slug,
  sections,
  media,
  registry,
  onChange,
}: Props) {
  /** Nama section; tipe yang definisinya hilang tetap punya label. */
  const labelOf = (type: string) => registry.get(type)?.label ?? type;
  const variantsOf = (type: string) =>
    (registry.get(type)?.variants ?? []) as readonly string[];
  const [openId, setOpenId] = useState<string | null>(null);
  // Form section menyimpan draft lokal; setelah impor form itu harus
  // dipasang ulang agar isinya ikut berganti, bukan menahan nilai lama.
  const [revision, setRevision] = useState(0);
  const [, start] = useTransition();

  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sorted.findIndex((s) => s.id === active.id);
    const newIndex = sorted.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(sorted, oldIndex, newIndex).map((s, i) => ({
      ...s,
      order: i,
    }));

    onChange(next); // optimistis — preview ikut bergeser saat itu juga

    start(async () => {
      const result = await reorderSections({
        letterId,
        orderedIds: next.map((s) => s.id),
      });
      if (!result.ok) {
        onChange(sorted);
        toast.error(result.error);
      }
    });
  }

  function handleToggle(section: SectionRecord) {
    const next = sections.map((s) =>
      s.id === section.id ? { ...s, enabled: !s.enabled } : s,
    );
    onChange(next);

    start(async () => {
      const result = await toggleSection({
        sectionId: section.id,
        enabled: !section.enabled,
      });
      if (!result.ok) {
        onChange(sections);
        toast.error(result.error);
      }
    });
  }

  function handleDelete(section: SectionRecord) {
    if (!confirm(`Hapus section "${labelOf(section.type)}"? Isinya ikut hilang.`)) {
      return;
    }

    const next = sections.filter((s) => s.id !== section.id);
    onChange(next);

    start(async () => {
      const result = await deleteSection(section.id);
      if (!result.ok) {
        onChange(sections);
        toast.error(result.error);
      } else {
        toast.success('Section dihapus');
      }
    });
  }

  function handleAdd(type: string) {
    start(async () => {
      const result = await addSection({ letterId, type });
      if (!result.ok) toast.error(result.error);
      else toast.success(`Section ${labelOf(type)} ditambahkan`);
    });
  }

  function handleVariantChange(section: SectionRecord, variant: string) {
    const next = sections.map((s) => (s.id === section.id ? { ...s, variant } : s));
    onChange(next);

    start(async () => {
      const result = await setSectionVariant({ sectionId: section.id, variant });
      if (!result.ok) {
        onChange(sections);
        toast.error(result.error);
      }
    });
  }

  // Block boleh berulang — yang disembunyikan hanya block bertanda unique
  // yang sudah dipakai (mis. Pembuka, yang melapisi seluruh halaman).
  const available = registry
    .types()
    .filter((type) => {
      const block = registry.get(type);
      return block && (!block.unique || !sections.some((s) => s.type === type));
    });

  const grouped = available.reduce<Record<string, string[]>>((acc, type) => {
    const group = registry.get(type)?.group ?? 'dasar';
    (acc[group] ??= []).push(type);
    return acc;
  }, {});

  return (
    <div className="grid gap-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sorted.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <ul className="grid gap-2">
            {sorted.map((section) => (
              <SortableRow
                key={section.id}
                section={section}
                label={labelOf(section.type)}
                open={openId === section.id}
                onOpenToggle={() =>
                  setOpenId((id) => (id === section.id ? null : section.id))
                }
                onToggleEnabled={() => handleToggle(section)}
                onDelete={() => handleDelete(section)}
              >
                {variantsOf(section.type).length > 1 && (
                  <Field
                    label="Varian layout"
                    hint="Khusus section ini. Kosong = ikut varian bawaan desain."
                    className="mb-3"
                  >
                    <Select
                      value={section.variant}
                      onChange={(e) => handleVariantChange(section, e.target.value)}
                    >
                      <option value="">Ikut desain</option>
                      {variantsOf(section.type).map((variant) => (
                        <option key={variant} value={variant}>
                          {variantLabel(variant)}
                        </option>
                      ))}
                    </Select>
                  </Field>
                )}

                <SectionForm
                  key={`${section.id}-${revision}`}
                  section={section}
                  media={media}
                  registry={registry}
                  onLocalChange={(content) =>
                    onChange(
                      sections.map((s) =>
                        s.id === section.id ? { ...s, content } : s,
                      ),
                    )
                  }
                />
              </SortableRow>
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {available.length > 0 && (
        <Card className="grid gap-3 p-3">
          <p className="text-xs font-medium text-muted-foreground">Tambah section</p>

          {(Object.keys(grouped) as BlockGroup[]).map((group) => (
            <div key={group} className="grid gap-1.5">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {GROUP_LABEL[group]}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {grouped[group].map((type) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    title={registry.get(type)?.note}
                    onClick={() => handleAdd(type)}
                  >
                    <Plus size={12} />
                    {labelOf(type)}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}

      <MarkdownTools
        letterId={letterId}
        slug={slug}
        sections={sections}
        registry={registry}
        onImported={(next) => {
          onChange(next);
          setRevision((n) => n + 1);
        }}
      />
    </div>
  );
}

function SortableRow({
  section,
  label,
  open,
  onOpenToggle,
  onToggleEnabled,
  onDelete,
  children,
}: {
  section: SectionRecord;
  label: string;
  open: boolean;
  onOpenToggle: () => void;
  onToggleEnabled: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'rounded-xl border border-border bg-background',
        isDragging && 'z-10 opacity-80 shadow-lg',
        !section.enabled && 'opacity-55',
      )}
    >
      <div className="flex items-center gap-1 px-2 py-2">
        <button
          type="button"
          className="cursor-grab rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
          aria-label={`Ubah urutan ${label}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>

        <button
          type="button"
          onClick={onOpenToggle}
          aria-expanded={open}
          className="flex flex-1 items-center gap-2 rounded px-1 py-1 text-left text-sm font-medium hover:bg-muted"
        >
          <ChevronDown
            size={13}
            className={cn('text-muted-foreground transition-transform', open && 'rotate-180')}
          />
          {label}
        </button>

        <button
          type="button"
          onClick={onToggleEnabled}
          aria-label={section.enabled ? `Sembunyikan ${label}` : `Tampilkan ${label}`}
          className="rounded p-1.5 text-muted-foreground hover:bg-muted"
        >
          {section.enabled ? <Eye size={13} /> : <EyeOff size={13} />}
        </button>

        <button
          type="button"
          onClick={onDelete}
          aria-label={`Hapus ${label}`}
          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-danger"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {open && <div className="border-t border-border p-3">{children}</div>}
    </li>
  );
}
