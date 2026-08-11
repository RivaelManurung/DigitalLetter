'use client';

import { useCallback, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Layers, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { createRegistry } from '@/design/blocks/resolve';
import type { DesignSpec, LetterBundle, SectionRecord } from '@/design/types';
import {
  saveTemplateDraft,
  type TemplateEditorData,
} from '@/lib/actions/templates';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { PanelCard } from '@/components/dashboard/panel-card';
import { DesignPanel } from '@/components/dashboard/panels/design-panel';
import { LivePreview } from '@/components/dashboard/live-preview';
import { TemplateContentPanel } from './template-content-panel';

type Tab = 'content' | 'design';

/**
 * Editor template — bentuknya sengaja sama dengan editor surat: susun
 * section di kiri, pratinjau langsung di kanan.
 *
 * Bedanya satu: template tidak punya baris di tabel `section`, jadi
 * seluruh susunannya dipegang sebagai state lalu disimpan sekaligus.
 * Karena itu section di sini memakai id semu (`t0`, `t1`, …) yang hanya
 * berlaku selama penyuntingan.
 */
export function TemplateEditorShell({ initial }: { initial: TemplateEditorData }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('content');
  const [pending, start] = useTransition();

  const [label, setLabel] = useState(initial.label);
  const [note, setNote] = useState(initial.note);
  const [design, setDesign] = useState<DesignSpec>(initial.design);
  const [sections, setSections] = useState<SectionRecord[]>(() =>
    initial.sections.map((item, index) => ({
      id: `t${index}`,
      type: item.type,
      order: index,
      enabled: item.enabled,
      variant: item.variant,
      content: item.content ?? {},
      style: item.style ?? {},
    })),
  );

  const [saved, setSaved] = useState(true);

  const registry = useMemo(
    () => createRegistry(initial.customBlocks),
    [initial.customBlocks],
  );

  const patchSections = useCallback((next: SectionRecord[]) => {
    setSections(next);
    setSaved(false);
  }, []);

  const patchDesign = useCallback((next: DesignSpec) => {
    setDesign(next);
    setSaved(false);
  }, []);

  /** Pratinjau memakai bentuk LetterBundle apa adanya. */
  const bundle: LetterBundle = useMemo(
    () => ({
      id: '',
      slug: 'template',
      recipientName: '',
      design,
      sections,
      media: [],
      customBlocks: initial.customBlocks,
    }),
    [design, sections, initial.customBlocks],
  );

  function save() {
    start(async () => {
      const result = await saveTemplateDraft({
        id: initial.id,
        label,
        note,
        design,
        sections: [...sections]
          .sort((a, b) => a.order - b.order)
          .map((s) => ({
            type: s.type,
            variant: s.variant,
            enabled: s.enabled,
            content: s.content,
            style: s.style,
          })),
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setSaved(true);
      toast.success('Template disimpan');
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard/templates"
            className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
            aria-label="Kembali ke daftar template"
          >
            <ArrowLeft size={15} />
          </Link>

          <div className="grid min-w-0 gap-0.5">
            <h1 className="truncate text-sm font-semibold">
              {label || 'Tanpa nama'}
            </h1>
            <p className="text-[11px] text-muted-foreground">
              {sections.length} section · {saved ? 'tersimpan' : 'ada perubahan'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
            <TabsList>
              <TabsTrigger value="content">
                <Layers size={13} />
                <span className="hidden sm:inline">Konten</span>
              </TabsTrigger>
              <TabsTrigger value="design">
                <Palette size={13} />
                <span className="hidden sm:inline">Desain</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={save} disabled={pending || saved}>
            {pending ? (
              'Menyimpan…'
            ) : saved ? (
              <>
                <Check size={14} />
                Tersimpan
              </>
            ) : (
              'Simpan'
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,470px)_minmax(0,1fr)]">
        <div className="grid min-w-0 gap-3">
          {tab === 'content' && (
            <>
              <PanelCard title="Identitas template">
                <div className="grid gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="tpl-label">Nama template</Label>
                    <Input
                      id="tpl-label"
                      value={label}
                      onChange={(e) => {
                        setLabel(e.target.value);
                        setSaved(false);
                      }}
                      placeholder="Undangan Nikahan Adat"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Muncul di dialog “Surat baru”
                    </p>
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="tpl-note">Penjelasan singkat</Label>
                    <Textarea
                      id="tpl-note"
                      rows={2}
                      value={note}
                      onChange={(e) => {
                        setNote(e.target.value);
                        setSaved(false);
                      }}
                      placeholder="Undangan lengkap dengan rundown dan amplop digital."
                    />
                  </div>
                </div>
              </PanelCard>

              <TemplateContentPanel
                sections={sections}
                registry={registry}
                design={design}
                onChange={patchSections}
              />
            </>
          )}

          {tab === 'design' && (
            <DesignPanel design={design} onChange={patchDesign} />
          )}
        </div>

        <LivePreview bundle={bundle} />
      </div>
    </div>
  );
}
