'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteTemplate } from '@/lib/actions/templates';
import type { OccasionRow } from '@/lib/occasion-list';
import type { TemplateRow } from '@/lib/template-types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
        <CardHeader>
          <CardTitle>Template buatanmu</CardTitle>
          <CardDescription>
            Dibuat lewat menu “…” pada kartu surat → Simpan jadi template.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {templates.length === 0 ? (
            <div className="grid place-items-center gap-2 rounded-lg border border-dashed px-6 py-12 text-center">
              <p className="text-sm font-medium">Belum ada template buatanmu</p>
              <p className="max-w-sm text-xs text-muted-foreground">
                Buka salah satu surat yang sudah jadi, klik menu “…” di kartunya,
                lalu pilih “Simpan jadi template”.
              </p>
            </div>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {templates.map((row) => (
                <li
                  key={row.id}
                  className="flex items-start justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="grid min-w-0 gap-1">
                    <span className="truncate text-sm font-medium">{row.label}</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary">{row.sections.length} section</Badge>
                      {row.design && (
                        <span className="text-[11px] text-muted-foreground">
                          desain ikut tersimpan
                        </span>
                      )}
                    </div>
                    {row.note && (
                      <span className="line-clamp-2 text-[11px] text-muted-foreground">
                        {row.note}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => remove(row)}
                    disabled={pending}
                    aria-label={`Hapus ${row.label}`}
                    className="shrink-0 hover:text-destructive"
                  >
                    <Trash2 size={13} />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Template bawaan</CardTitle>
          <CardDescription>Selalu tersedia dan tidak bisa dihapus.</CardDescription>
        </CardHeader>

        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {occasions.map((row) => (
              <li
                key={row.id}
                className="flex items-start justify-between gap-3 rounded-lg border p-3"
              >
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
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
