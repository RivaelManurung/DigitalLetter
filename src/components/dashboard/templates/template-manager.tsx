'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Copy, LayoutTemplate, Lock, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createTemplate, deleteTemplate } from '@/lib/actions/templates';
import type { OccasionRow } from '@/lib/occasion-list';
import type { TemplateRow } from '@/lib/template-types';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PanelCard } from '@/components/dashboard/panel-card';
import { NewTemplateDialog } from './new-template-dialog';

type Props = {
  templates: TemplateRow[];
  occasions: OccasionRow[];
};

/**
 * Daftar template. Template bikinan sendiri bisa dibuat langsung di sini
 * lalu disusun di editornya — tidak lagi harus punya surat jadi dulu.
 */
export function TemplateManager({ templates, occasions }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function remove(row: TemplateRow) {
    if (
      !confirm(`Hapus template "${row.label}"? Surat yang sudah dibuat tidak terpengaruh.`)
    ) {
      return;
    }

    start(async () => {
      const result = await deleteTemplate(row.id);
      if (!result.ok) toast.error(result.error);
      else {
        toast.success('Template dihapus');
        router.refresh();
      }
    });
  }

  function duplicate(row: TemplateRow) {
    start(async () => {
      const result = await createTemplate({
        label: `${row.label} (salinan)`,
        note: row.note,
        from: 'template',
        source: row.id,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success('Template diduplikat');
      router.push(`/dashboard/templates/${result.data!.id}`);
    });
  }

  /** Bikin template baru langsung dari salah satu acara bawaan. */
  function forkOccasion(row: OccasionRow) {
    start(async () => {
      const result = await createTemplate({
        label: `${row.label} (custom)`,
        note: row.note,
        from: 'occasion',
        source: row.id,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success('Template dibuat — silakan disesuaikan');
      router.push(`/dashboard/templates/${result.data!.id}`);
    });
  }

  return (
    <div className="grid gap-4">
      <PanelCard
        title={`Template buatanmu · ${templates.length}`}
        action={<NewTemplateDialog occasions={occasions} templates={templates} />}
      >
        {templates.length === 0 ? (
          <div className="grid place-items-center gap-2 rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center">
            <span className="mb-1 grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
              <LayoutTemplate size={18} />
            </span>
            <p className="text-sm font-medium">Belum ada template buatanmu</p>
            <p className="max-w-md text-xs text-muted-foreground">
              Buat template baru, susun sectionnya seperti menyunting surat, lalu
              pakai berulang kali untuk client berikutnya.
            </p>
            <div className="mt-1">
              <NewTemplateDialog occasions={occasions} templates={templates} />
            </div>
          </div>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {templates.map((row) => (
              <li key={row.id}>
                <Card className="h-full gap-0 py-0 shadow-xs transition-shadow hover:shadow-md">
                  <div className="grid h-full gap-3 p-4">
                    <div className="grid min-w-0 gap-1">
                      <Link
                        href={`/dashboard/templates/${row.id}`}
                        className="truncate text-sm font-medium hover:underline"
                      >
                        {row.label}
                      </Link>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary">{row.sections.length} section</Badge>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {row.preset}
                        </span>
                      </div>

                      {row.note && (
                        <span className="line-clamp-2 text-[11px] text-muted-foreground">
                          {row.note}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto flex gap-1.5">
                      <Link
                        href={`/dashboard/templates/${row.id}`}
                        className={buttonVariants({ variant: 'subtle', size: 'sm' })}
                      >
                        <Pencil size={13} />
                        Sunting
                      </Link>

                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => duplicate(row)}
                        disabled={pending}
                        aria-label={`Duplikat ${row.label}`}
                      >
                        <Copy size={13} />
                      </Button>

                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => remove(row)}
                        disabled={pending}
                        aria-label={`Hapus ${row.label}`}
                        className="ml-auto hover:text-destructive"
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
      </PanelCard>

      <PanelCard
        title="Template bawaan"
        meta="Tidak bisa diubah — salin dulu"
      >
        <ul className="grid gap-2 sm:grid-cols-2">
          {occasions.map((row) => (
            <li key={row.id}>
              <Card className="h-full gap-0 bg-muted/30 py-0 shadow-none">
                <div className="grid h-full gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="grid min-w-0 gap-1">
                      <span className="truncate text-sm font-medium">{row.label}</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary">{row.sectionCount} section</Badge>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {row.preset}
                        </span>
                      </div>
                      <span className="line-clamp-2 text-[11px] text-muted-foreground">
                        {row.note}
                      </span>
                    </div>

                    <Lock size={13} className="mt-1 shrink-0 text-muted-foreground" />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-auto w-fit"
                    onClick={() => forkOccasion(row)}
                    disabled={pending}
                  >
                    <Plus size={13} />
                    Jadikan template sendiri
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </PanelCard>
    </div>
  );
}
