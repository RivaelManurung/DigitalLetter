'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, ExternalLink, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteLetter, setPublishState, updateLetterMeta } from '@/lib/actions/letter';
import { formatDate, slugify } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { Badge, Card, CardHeader } from '@/components/ui/surface';
import type { LetterMeta } from '../editor-shell';

export function PublishPanel({ meta }: { meta: LetterMeta }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const [title, setTitle] = useState(meta.title);
  const [recipient, setRecipient] = useState(meta.recipientName);
  const [slug, setSlug] = useState(meta.slug);
  const [opensAt, setOpensAt] = useState(meta.opensAt?.slice(0, 16) ?? '');
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const url =
    typeof window === 'undefined' ? `/l/${slug}` : `${window.location.origin}/l/${slug}`;

  function saveMeta() {
    start(async () => {
      const result = await updateLetterMeta({
        id: meta.id,
        title,
        recipientName: recipient,
        slug,
        opensAt: opensAt ? new Date(opensAt).toISOString() : null,
      });

      if (!result.ok) toast.error(result.error);
      else {
        toast.success('Detail disimpan');
        router.refresh();
      }
    });
  }

  function togglePublish() {
    start(async () => {
      const result = await setPublishState({
        id: meta.id,
        publish: meta.status !== 'published',
        password: password || undefined,
      });

      if (!result.ok) toast.error(result.error);
      else {
        toast.success(meta.status === 'published' ? 'Surat ditarik' : 'Surat terbit');
        setPassword('');
        router.refresh();
      }
    });
  }

  function clearPassword() {
    start(async () => {
      const result = await setPublishState({
        id: meta.id,
        publish: meta.status === 'published',
        clearPassword: true,
      });
      if (!result.ok) toast.error(result.error);
      else {
        toast.success('Password dihapus');
        router.refresh();
      }
    });
  }

  function removeLetter() {
    if (!confirm(`Hapus surat "${meta.title}"? Semua section dan media ikut terhapus.`)) {
      return;
    }

    start(async () => {
      const result = await deleteLetter(meta.id);
      if (!result.ok) toast.error(result.error);
      else {
        toast.success('Surat dihapus');
        router.push('/dashboard');
      }
    });
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="grid gap-3">
      <Card>
        <CardHeader
          title="Status"
          action={
            <Badge tone={meta.status === 'published' ? 'success' : 'muted'}>
              {meta.status === 'published' ? 'Terbit' : 'Draf'}
            </Badge>
          }
        />
        <div className="grid gap-3 p-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2">
            <span className="flex-1 truncate font-mono text-xs">{url}</span>
            <button
              type="button"
              onClick={copyLink}
              aria-label="Salin tautan"
              className="rounded p-1 text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              aria-label="Buka tautan"
              className="rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <ExternalLink size={13} />
            </a>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye size={12} />
              {meta.viewCount} kali dibuka
            </span>
            {meta.publishedAt && <span>Terbit {formatDate(meta.publishedAt)}</span>}
          </div>

          <Button onClick={togglePublish} disabled={pending}>
            {meta.status === 'published' ? 'Tarik kembali jadi draf' : 'Terbitkan sekarang'}
          </Button>

          {meta.status !== 'published' && (
            <p className="text-[11px] text-muted-foreground">
              Selama masih draf, tautan mengembalikan 404 — aman untuk dikerjakan.
            </p>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Detail" />
        <div className="grid gap-3 p-3">
          <Field label="Judul">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Nama penerima">
            <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} />
          </Field>
          <Field label="Slug" hint={`Tautan: /l/${slug}`}>
            <Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
          </Field>
          <Field
            label="Bisa dibuka mulai"
            hint="Kosongkan agar bisa dibuka kapan saja setelah terbit."
          >
            <Input
              type="datetime-local"
              value={opensAt}
              onChange={(e) => setOpensAt(e.target.value)}
            />
          </Field>

          <Button variant="subtle" onClick={saveMeta} disabled={pending}>
            Simpan detail
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Proteksi"
          description={
            meta.hasPassword
              ? 'Surat ini terkunci password.'
              : 'Opsional. Penerima harus memasukkan password sebelum surat terbuka.'
          }
        />
        <div className="grid gap-3 p-3">
          <Field label="Password baru">
            <Input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kosongkan untuk tidak mengubah"
            />
          </Field>

          <div className="flex gap-2">
            <Button
              variant="subtle"
              className="flex-1"
              disabled={pending || !password}
              onClick={togglePublish}
            >
              Pasang password
            </Button>
            {meta.hasPassword && (
              <Button variant="outline" onClick={clearPassword} disabled={pending}>
                Hapus
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Zona bahaya" />
        <div className="p-3">
          <Button variant="danger" onClick={removeLetter} disabled={pending}>
            <Trash2 size={13} />
            Hapus surat ini
          </Button>
        </div>
      </Card>
    </div>
  );
}
