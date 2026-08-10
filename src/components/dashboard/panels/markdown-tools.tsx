'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Download, FileText, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { SectionRecord } from '@/design/types';
import { importSectionsMarkdown } from '@/lib/actions/letter';
import type { BlockRegistry } from '@/design/blocks/resolve';
import { markdownFileName, sectionsToMarkdown } from '@/lib/markdown/serialize';
import { AI_PROMPT } from '@/lib/markdown/prompt';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/surface';

type Props = {
  letterId: string;
  slug: string;
  sections: SectionRecord[];
  registry: BlockRegistry;
  onImported: (sections: SectionRecord[]) => void;
};

const MAX_BYTES = 200_000;

/**
 * Jembatan markdown: unduh isi surat sebagai template, sunting di mana saja
 * (termasuk dengan bantuan AI), lalu unggah kembali. Serialisasi dilakukan di
 * browser karena datanya sudah ada di state editor — tidak perlu round-trip.
 */
export function MarkdownTools({
  letterId,
  slug,
  sections,
  registry,
  onImported,
}: Props) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  function handleDownload() {
    const markdown = sectionsToMarkdown(sections, { registry });
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = markdownFileName(slug);
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Template diunduh');
  }

  async function handleCopyPrompt() {
    try {
      await navigator.clipboard.writeText(AI_PROMPT);
      toast.success('Prompt disalin — tempel ke AI bersama berkas .md');
    } catch {
      toast.error('Browser menolak akses clipboard. Salin manual dari berkas .md.');
    }
  }

  async function handleFile(file: File) {
    if (file.size > MAX_BYTES) {
      toast.error('Berkas terlalu besar (maksimal 200 KB).');
      return;
    }

    setBusy(true);
    setWarnings([]);

    try {
      const markdown = await file.text();
      const result = await importSectionsMarkdown({ letterId, markdown });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      const summary = result.data!;
      onImported(summary.sections);
      setWarnings(summary.warnings);
      router.refresh();

      const parts = [
        summary.updated ? `${summary.updated} section diperbarui` : null,
        summary.created ? `${summary.created} section baru` : null,
      ].filter(Boolean);

      toast.success(parts.join(' · ') || 'Tidak ada perubahan');
    } catch {
      toast.error('Berkas tidak bisa dibaca. Pastikan formatnya .md teks biasa.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="grid gap-2 p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <FileText size={12} />
        Template markdown
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Unduh seluruh isi surat sebagai satu berkas <code>.md</code>, sunting di
        mana saja atau minta bantuan AI, lalu unggah kembali. Section yang tidak
        ada di berkas tidak diubah.
      </p>

      <div className="flex flex-wrap gap-1.5">
        <Button variant="outline" size="sm" onClick={handleDownload} disabled={busy}>
          <Download size={12} />
          Unduh .md
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInput.current?.click()}
          disabled={busy}
        >
          <Upload size={12} />
          {busy ? 'Mengimpor…' : 'Impor .md'}
        </Button>

        <Button variant="ghost" size="sm" onClick={handleCopyPrompt} disabled={busy}>
          <Copy size={12} />
          Salin prompt AI
        </Button>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept=".md,.markdown,text/markdown,text/plain"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void handleFile(file);
        }}
      />

      {warnings.length > 0 && (
        <ul className="grid gap-1 rounded-lg bg-muted p-2 text-[11px] text-muted-foreground">
          {warnings.slice(0, 6).map((warning, index) => (
            <li key={index}>• {warning}</li>
          ))}
          {warnings.length > 6 && <li>• dan {warnings.length - 6} peringatan lain</li>}
        </ul>
      )}
    </Card>
  );
}
