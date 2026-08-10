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
import { SECTION_TYPES, type MediaRecord, type SectionRecord, type SectionType } from '@/design/types';
import {
  addSection,
  deleteSection,
  reorderSections,
  toggleSection,
} from '@/lib/actions/letter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/surface';
import { SectionForm } from './section-form';

const SECTION_LABEL: Record<SectionType, string> = {
  intro: 'Pembuka',
  hero: 'Hero',
  letter: 'Surat',
  reasons: 'Alasan',
  garden: 'Taman',
  gallery: 'Galeri',
  finale: 'Penutup',
};

type Props = {
  letterId: string;
  sections: SectionRecord[];
  media: MediaRecord[];
  onChange: (sections: SectionRecord[]) => void;
};

export function ContentPanel({ letterId, sections, media, onChange }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
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
    if (!confirm(`Hapus section "${SECTION_LABEL[section.type]}"? Isinya ikut hilang.`)) {
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

  function handleAdd(type: SectionType) {
    start(async () => {
      const result = await addSection({ letterId, type });
      if (!result.ok) toast.error(result.error);
      else toast.success(`Section ${SECTION_LABEL[type]} ditambahkan`);
    });
  }

  const missing = SECTION_TYPES.filter(
    (type) => !sections.some((s) => s.type === type),
  );

  return (
    <div className="grid gap-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sorted.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <ul className="grid gap-2">
            {sorted.map((section) => (
              <SortableRow
                key={section.id}
                section={section}
                label={SECTION_LABEL[section.type]}
                open={openId === section.id}
                onOpenToggle={() =>
                  setOpenId((id) => (id === section.id ? null : section.id))
                }
                onToggleEnabled={() => handleToggle(section)}
                onDelete={() => handleDelete(section)}
              >
                <SectionForm
                  section={section}
                  media={media}
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

      {missing.length > 0 && (
        <Card className="grid gap-2 p-3">
          <p className="text-xs font-medium text-muted-foreground">Tambah section</p>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((type) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => handleAdd(type)}
              >
                <Plus size={12} />
                {SECTION_LABEL[type]}
              </Button>
            ))}
          </div>
        </Card>
      )}
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
