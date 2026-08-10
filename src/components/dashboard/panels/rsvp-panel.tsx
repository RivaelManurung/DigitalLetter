'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteRsvp, listRsvp, type RsvpSummary } from '@/lib/actions/rsvp';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/surface';

const ATTENDANCE_LABEL: Record<'yes' | 'no' | 'maybe', string> = {
  yes: 'Hadir',
  no: 'Tidak hadir',
  maybe: 'Ragu',
};

/**
 * Daftar konfirmasi kehadiran. Sengaja dimuat di klien saat dibuka, bukan
 * ikut render halaman editor — jawaban bisa masuk kapan saja dan editor
 * tidak perlu ikut memuat ulang setiap kali.
 */
export function RsvpPanel({ letterId }: { letterId: string }) {
  const [data, setData] = useState<RsvpSummary | null>(null);
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  const load = useCallback(() => {
    start(async () => {
      const result = await listRsvp(letterId);
      if (result.ok) {
        setData(result.data!);
        setError('');
      } else {
        setError(result.error);
      }
    });
  }, [letterId]);

  useEffect(load, [load]);

  function handleDelete(id: string) {
    if (!confirm('Hapus konfirmasi ini?')) return;

    start(async () => {
      const result = await deleteRsvp(id);
      if (!result.ok) toast.error(result.error);
      else load();
    });
  }

  return (
    <Card>
      <CardHeader
        title="Konfirmasi kehadiran"
        description="Jawaban tamu dari section RSVP di halaman surat."
        action={
          <Button variant="ghost" size="sm" onClick={load} disabled={pending}>
            <RefreshCw size={13} />
            Muat ulang
          </Button>
        }
      />

      <div className="grid gap-3 p-3">
        {error && <p className="text-xs text-danger">{error}</p>}

        {!data && !error && (
          <p className="text-xs text-muted-foreground">Memuat…</p>
        )}

        {data && data.total === 0 && (
          <p className="text-xs text-muted-foreground">
            Belum ada konfirmasi masuk.
          </p>
        )}

        {data && data.total > 0 && (
          <>
            <div className="grid grid-cols-4 gap-2">
              <Stat label="Total" value={data.total} />
              <Stat label="Hadir" value={data.yes} />
              <Stat label="Tidak" value={data.no} />
              <Stat label="Tamu" value={data.guests} />
            </div>

            <ul className="grid gap-1.5">
              {data.entries.map((entry) => (
                <li
                  key={entry.id}
                  className="grid gap-1 rounded-lg border border-border p-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="grid gap-0.5">
                      <span className="text-sm font-medium">{entry.name}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {ATTENDANCE_LABEL[entry.attendance]}
                        {entry.attendance === 'yes' && ` · ${entry.guests} tamu`}
                        {' · '}
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      aria-label={`Hapus konfirmasi ${entry.name}`}
                      className="rounded p-1 text-muted-foreground hover:text-danger"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {entry.message && (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {entry.message}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid gap-0.5 rounded-lg border border-border p-2 text-center">
      <span className="text-base font-semibold tabular-nums">{value}</span>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
