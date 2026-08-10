'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteTemplate } from '@/lib/actions/templates';
import type { OccasionRow } from '@/lib/occasion-list';
import type { TemplateRow } from '@/lib/template-types';
import { Card, CardHeader, EmptyState } from '@/components/ui/surface';

type Props = {
  templates: TemplateRow[];
  occasions: OccasionRow[];
};

/**
 * Daftar template. Template bikinan sendiri dibuat lewat tombol "Simpan jadi
 * template" di kartu surat — bukan dari nol di sini, karena menyusun section
 * satu per satu jauh lebih mudah dilakukan di editor surat.
 */
export function TemplateManager({ templates, occasions }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function remove(row: TemplateRow) {
    if (!confirm(`Hapus template "${row.label}"? Surat yang sudah dibuat tidak terpengaruh.`)) {
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

  return (
    <div className="grid gap-3">
      <Card>
        <CardHeader
          title="Template buatanmu"
          description='Dibuat lewat menu "…" pada kartu surat → Simpan jadi template.'
        />

        <div className="p-3">
          {templates.length === 0 ? (
            <EmptyState
              title="Belum ada template buatanmu"
              description='Buka salah satu surat yang sudah jadi, klik menu "…" di kartunya, lalu pilih "Simpan jadi template".'
            />
          ) : (
            <ul className="grid gap-2">
              {templates.map((row) => (
                <li
                  key={row.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="grid gap-0.5">
                    <span className="text-sm font-medium">{row.label}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {row.sections.length} section
                      {row.design && ' · desain ikut tersimpan'}
                    </span>
                    {row.note && (
                      <span className="text-[11px] text-muted-foreground">{row.note}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(row)}
                    disabled={pending}
                    aria-label={`Hapus ${row.label}`}
                    className="shrink-0 rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-danger disabled:opacity-40"
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Template bawaan"
          description="Selalu tersedia dan tidak bisa dihapus."
        />

        <ul className="grid gap-2 p-3">
          {occasions.map((row) => (
            <li
              key={row.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
            >
              <div className="grid gap-0.5">
                <span className="text-sm font-medium">{row.label}</span>
                <span className="text-[11px] text-muted-foreground">
                  {row.sectionCount} section · preset {row.preset}
                </span>
                <span className="text-[11px] text-muted-foreground">{row.note}</span>
              </div>

              <Lock size={13} className="mt-1 shrink-0 text-muted-foreground" />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
