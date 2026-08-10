'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Music, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { MediaRecord } from '@/design/types';
import { attachMedia, deleteMedia, requestUpload, updateMedia } from '@/lib/actions/media';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { Card, CardHeader, EmptyState } from '@/components/ui/surface';

type Props = {
  letterId: string;
  media: MediaRecord[];
  onChange: (media: MediaRecord[]) => void;
};

export function MediaPanel({ letterId, media, onChange }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const photos = media.filter((m) => m.kind === 'photo');
  const tracks = media.filter((m) => m.kind === 'audio');

  /**
   * Alur upload: minta signed URL → unggah langsung ke Supabase →
   * catat hasilnya. File besar tidak pernah melewati server kita.
   */
  async function upload(file: File, kind: 'photo' | 'audio') {
    setBusy(true);
    try {
      const signed = await requestUpload({
        letterId,
        kind,
        mime: file.type,
        size: file.size,
      });

      if (!signed.ok) {
        toast.error(signed.error);
        return;
      }

      const response = await fetch(signed.data!.signedUrl, {
        method: 'PUT',
        headers: { 'content-type': file.type },
        body: file,
      });

      if (!response.ok) {
        toast.error('Upload gagal. Coba lagi.');
        return;
      }

      const attached = await attachMedia({
        letterId,
        kind,
        storagePath: signed.data!.storagePath,
        caption: null,
        meta:
          kind === 'audio'
            ? { title: file.name.replace(/\.[^.]+$/, ''), artist: '' }
            : {},
      });

      if (!attached.ok) {
        toast.error(attached.error);
        return;
      }

      toast.success(kind === 'photo' ? 'Foto diunggah' : 'Lagu diunggah');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: MediaRecord) {
    if (!confirm('Hapus media ini?')) return;
    onChange(media.filter((m) => m.id !== item.id));

    const result = await deleteMedia(item.id);
    if (!result.ok) {
      onChange(media);
      toast.error(result.error);
    } else {
      router.refresh();
    }
  }

  function patchLocal(id: string, patch: Partial<MediaRecord>) {
    onChange(media.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  return (
    <div className="grid gap-3">
      <Card>
        <CardHeader
          title="Foto"
          description="JPG, PNG, WebP, atau AVIF. Maksimal 5 MB per file."
          action={<UploadButton accept="image/*" disabled={busy} onFile={(f) => upload(f, 'photo')} />}
        />
        <div className="p-3">
          {photos.length === 0 ? (
            <EmptyState
              title="Belum ada foto"
              description="Unggah foto untuk dipakai di section Galeri."
            />
          ) : (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {photos.map((photo) => (
                <li key={photo.id} className="grid gap-1.5">
                  <div className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.caption ?? ''}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => remove(photo)}
                      aria-label="Hapus foto"
                      className="absolute right-1.5 top-1.5 rounded-md bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <Input
                    value={photo.caption ?? ''}
                    placeholder="Caption"
                    className="h-7 text-xs"
                    onChange={(e) => patchLocal(photo.id, { caption: e.target.value })}
                    onBlur={(e) =>
                      void updateMedia({ id: photo.id, caption: e.target.value })
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Musik"
          description="MP3, OGG, atau WAV. Maksimal 12 MB per file."
          action={<UploadButton accept="audio/*" disabled={busy} onFile={(f) => upload(f, 'audio')} />}
        />
        <div className="p-3">
          {tracks.length === 0 ? (
            <EmptyState
              title="Belum ada musik"
              description="Lagu mulai berputar otomatis setelah penerima membuka surat."
            />
          ) : (
            <ul className="grid gap-2">
              {tracks.map((track) => {
                const meta = track.meta as {
                  title?: string;
                  artist?: string;
                  startTime?: number;
                  endTime?: number;
                };
                return (
                  <li key={track.id} className="grid gap-2 rounded-lg border border-border p-2.5">
                    <div className="flex items-center gap-2">
                      <Music size={14} className="shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate text-xs">
                        {meta.title || 'Tanpa judul'}
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(track)}
                        aria-label="Hapus lagu"
                        className="rounded p-1 text-muted-foreground hover:text-danger"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Judul">
                        <Input
                          className="h-7 text-xs"
                          value={meta.title ?? ''}
                          onChange={(e) =>
                            patchLocal(track.id, {
                              meta: { ...track.meta, title: e.target.value },
                            })
                          }
                          onBlur={() => void updateMedia({ id: track.id, meta: track.meta })}
                        />
                      </Field>
                      <Field label="Artis">
                        <Input
                          className="h-7 text-xs"
                          value={meta.artist ?? ''}
                          onChange={(e) =>
                            patchLocal(track.id, {
                              meta: { ...track.meta, artist: e.target.value },
                            })
                          }
                          onBlur={() => void updateMedia({ id: track.id, meta: track.meta })}
                        />
                      </Field>
                    </div>

                    {/* Titik loop: lagu sering punya intro panjang atau ekor
                        yang tidak cocok diulang. Ini memotongnya tanpa
                        mengedit file audio. */}
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Mulai (detik)" hint="Kosong = dari awal">
                        <Input
                          type="number"
                          min={0}
                          step={0.5}
                          className="h-7 text-xs"
                          value={meta.startTime ?? ''}
                          onChange={(e) =>
                            patchLocal(track.id, {
                              meta: {
                                ...track.meta,
                                startTime: e.target.value ? Number(e.target.value) : undefined,
                              },
                            })
                          }
                          onBlur={() => void updateMedia({ id: track.id, meta: track.meta })}
                        />
                      </Field>
                      <Field label="Ulang di (detik)" hint="Kosong = sampai habis">
                        <Input
                          type="number"
                          min={0}
                          step={0.5}
                          className="h-7 text-xs"
                          value={meta.endTime ?? ''}
                          onChange={(e) =>
                            patchLocal(track.id, {
                              meta: {
                                ...track.meta,
                                endTime: e.target.value ? Number(e.target.value) : undefined,
                              },
                            })
                          }
                          onBlur={() => void updateMedia({ id: track.id, meta: track.meta })}
                        />
                      </Field>
                    </div>

                    <audio controls src={track.url} className="w-full" preload="none" />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}

function UploadButton({
  accept,
  disabled,
  onFile,
}: {
  accept: string;
  disabled: boolean;
  onFile: (file: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button variant="outline" size="sm" disabled={disabled} onClick={() => ref.current?.click()}>
        <Upload size={13} />
        {disabled ? 'Mengunggah…' : 'Unggah'}
      </Button>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
    </>
  );
}
