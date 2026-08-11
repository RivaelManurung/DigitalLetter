'use client';

import { useRef, useState } from 'react';
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
import { GROUP_LABEL, type BlockGroup } from '@/design/blocks';
import {
  parseWith,
  starterWith,
  type BlockRegistry,
} from '@/design/blocks/resolve';
import type { DesignSpec, SectionRecord, SectionStyle } from '@/design/types';
import { variantLabel } from '@/design/variant-labels';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PanelCard } from '@/components/dashboard/panel-card';
import { SectionStylePanel } from '@/components/dashboard/panels/section-style-panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateSectionForm } from './template-section-form';

type Props = {
  sections: SectionRecord[];
  registry: BlockRegistry;
  /** desain template — jadi nilai bawaan yang ditampilkan panel Design */
  design: DesignSpec;
  onChange: (sections: SectionRecord[]) => void;
};

/**
 * Penyusun section untuk template.
 *
 * Bedanya dengan panel konten surat: semua perubahan hanya mengubah state,
 * tidak ada Server Action per aksi. Penyimpanan dilakukan sekali lewat
 * tombol Simpan di kepala editor — template belum punya baris `section`
 * di database sampai saat itu.
 */
export function TemplateContentPanel({
  sections,
  registry,
  design,
  onChange,
}: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const nextId = useRef(sections.length);

  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const labelOf = (type: string) => registry.get(type)?.label ?? type;
  const variantsOf = (type: string) =>
    (registry.get(type)?.variants ?? []) as readonly string[];

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const from = sorted.findIndex((s) => s.id === active.id);
    const to = sorted.findIndex((s) => s.id === over.id);
    if (from < 0 || to < 0) return;

    onChange(arrayMove(sorted, from, to).map((s, i) => ({ ...s, order: i })));
  }

  function add(type: string) {
    const nextOrder = sections.length
      ? Math.max(...sections.map((s) => s.order)) + 1
      : 0;

    // Id semu, hanya berlaku selama penyuntingan — template tidak menyimpan
    // id section. Diambil dari penghitung, bukan Date.now(): nilai yang
    // berubah tiap render membuat React kehilangan jejak baris.
    const id = `t-${nextId.current++}`;

    onChange([
      ...sections,
      {
        id,
        type,
        order: nextOrder,
        enabled: true,
        variant: '',
        content: starterWith(registry, type),
        style: {},
      },
    ]);
  }

  function remove(section: SectionRecord) {
    if (sections.length <= 1) return;
    onChange(sections.filter((s) => s.id !== section.id));
  }

  function patch(id: string, partial: Partial<SectionRecord>) {
    onChange(sections.map((s) => (s.id === id ? { ...s, ...partial } : s)));
  }

  // Block bertanda unique hanya boleh sekali dalam satu template.
  const available = registry.types().filter((type) => {
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
      <PanelCard title={`Susunan section · ${sections.length}`}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sorted.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="grid gap-2">
              {sorted.map((section) => (
                <Row
                  key={section.id}
                  section={section}
                  label={labelOf(section.type)}
                  open={openId === section.id}
                  canDelete={sections.length > 1}
                  onOpenToggle={() =>
                    setOpenId((id) => (id === section.id ? null : section.id))
                  }
                  onToggleEnabled={() =>
                    patch(section.id, { enabled: !section.enabled })
                  }
                  onDelete={() => remove(section)}
                >
                  <Tabs defaultValue="konten">
                    <TabsList className="mb-3">
                      <TabsTrigger value="konten">Konten</TabsTrigger>
                      <TabsTrigger value="design">
                        Design
                        {countStyle(section.style) > 0 && (
                          <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 text-[10px] font-medium text-primary">
                            {countStyle(section.style)}
                          </span>
                        )}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="konten">
                      {variantsOf(section.type).length > 1 && (
                        <div className="mb-3 grid gap-1.5">
                          <Label className="text-xs text-muted-foreground">
                            Varian layout
                          </Label>
                          <Select
                            value={section.variant || '__default'}
                            onValueChange={(v) =>
                              patch(section.id, {
                                variant: !v || v === '__default' ? '' : String(v),
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__default">Ikut desain</SelectItem>
                              {variantsOf(section.type).map((variant) => (
                                <SelectItem key={variant} value={variant}>
                                  {variantLabel(variant)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <TemplateSectionForm
                        section={section}
                        registry={registry}
                        onChange={(content) =>
                          patch(section.id, {
                            content: parseWith(registry, section.type, content),
                          })
                        }
                      />
                    </TabsContent>

                    <TabsContent value="design">
                      <SectionStylePanel
                        style={section.style ?? {}}
                        design={design}
                        onChange={(style) => patch(section.id, { style })}
                      />
                    </TabsContent>
                  </Tabs>
                </Row>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </PanelCard>

      {available.length > 0 && (
        <PanelCard title="Tambah section">
          <div className="grid gap-3">
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
                      onClick={() => add(type)}
                    >
                      <Plus size={12} />
                      {labelOf(type)}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      )}
    </div>
  );
}

/** Jumlah penyesuaian tampilan — dipakai sebagai lencana di tab Design. */
function countStyle(style: SectionStyle | undefined): number {
  return style ? Object.keys(style).length : 0;
}

function Row({
  section,
  label,
  open,
  canDelete,
  onOpenToggle,
  onToggleEnabled,
  onDelete,
  children,
}: {
  section: SectionRecord;
  label: string;
  open: boolean;
  canDelete: boolean;
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
        'rounded-xl border bg-background',
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
            className={cn(
              'text-muted-foreground transition-transform',
              open && 'rotate-180',
            )}
          />
          {label}
        </button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleEnabled}
          aria-label={section.enabled ? `Sembunyikan ${label}` : `Tampilkan ${label}`}
        >
          {section.enabled ? <Eye size={13} /> : <EyeOff size={13} />}
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          disabled={!canDelete}
          aria-label={`Hapus ${label}`}
          className="hover:text-destructive"
        >
          <Trash2 size={13} />
        </Button>
      </div>

      {open && <div className="border-t p-3">{children}</div>}
    </li>
  );
}
