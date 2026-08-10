/**
 * Uji round-trip template markdown: sections → markdown → parse → sections.
 * Dijalankan manual: npx tsx scripts/roundtrip-check.ts
 */
import { SECTION_TYPES, starterContent, BLOCKS } from '@/design/blocks';
import { createRegistry, parseWith, starterWith } from '@/design/blocks/resolve';
import { sectionsToMarkdown } from '@/lib/markdown/serialize';
import { parseLetterMarkdown } from '@/lib/markdown/parse';
import type { SectionRecord } from '@/design/types';

/**
 * Satu block bikinan sendiri ikut diuji — jalur inilah yang paling rawan,
 * karena schema-nya dibangkitkan saat jalan, bukan ditulis tangan.
 */
const CUSTOM = {
  slug: 'sponsor',
  label: 'Sponsor',
  note: 'Daftar sponsor acara.',
  layout: 'cards',
  spec: {
    fields: [
      { key: 'intro', label: 'Pengantar', kind: 'longtext', starter: 'Terima kasih kepada:' },
      { key: 'sejak', label: 'Sejak', kind: 'datetime', starter: '2026-01-05T09:30' },
      { key: 'tampil', label: 'Tampilkan logo', kind: 'switch', starter: 'true' },
      { key: 'jumlah', label: 'Jumlah', kind: 'number', min: 0, max: 99, starter: '7' },
      {
        key: 'daftar',
        label: 'Sponsor',
        kind: 'list',
        itemLabel: 'sponsor',
        max: 20,
        fields: [
          { key: 'nama', label: 'Nama', kind: 'text', starter: 'Kopi Nusantara' },
          { key: 'kelas', label: 'Kelas', kind: 'select', options: ['Emas', 'Perak'], starter: 'Emas' },
          { key: 'catatan', label: 'Catatan', kind: 'longtext', starter: 'Mitra utama.' },
        ],
      },
    ],
  },
  starter: {},
};

const registry = createRegistry([CUSTOM]);

const sections: SectionRecord[] = SECTION_TYPES.map((type, i) => ({
  id: `s-${i}`,
  type,
  order: i,
  enabled: true,
  variant: '',
  content: starterContent(type),
}));

// Block bikinan sendiri, dengan satu item di daftarnya.
const customStarter = starterWith(registry, 'c:sponsor');
sections.push({
  id: 'custom-1',
  type: 'c:sponsor',
  order: 200,
  enabled: true,
  variant: 'list',
  content: {
    ...customStarter,
    eyebrow: 'didukung oleh',
    title: 'Sponsor Kami',
    daftar: [
      { nama: 'Kopi Nusantara', kelas: 'Emas', catatan: 'Mitra utama.' },
      { nama: 'Batik Ayu', kelas: 'Perak', catatan: 'Penyedia seragam.' },
    ],
  },
});

// Block berulang — dua "Surat" dan dua "Galeri" dalam satu surat.
sections.push({
  id: 'letter-2',
  type: 'letter',
  order: 100,
  enabled: true,
  variant: 'paper',
  content: { ...starterContent('letter'), title: 'Surat Kedua', body: 'Isi surat kedua.' },
});
sections.push({
  id: 'gallery-2',
  type: 'gallery',
  order: 101,
  enabled: true,
  variant: '',
  content: { ...starterContent('gallery'), title: 'Galeri Kedua' },
});

const md = sectionsToMarkdown(sections, { registry });
const parsed = parseLetterMarkdown(md, registry);

console.log(`sections keluar : ${sections.length}`);
console.log(`sections terbaca: ${parsed.sections.length}`);
console.log(`peringatan      : ${parsed.warnings.length}`);
for (const w of parsed.warnings) console.log('  !', w);

const counts = new Map<string, number>();
let mismatches = 0;

for (const section of [...sections].sort((a, b) => a.order - b.order)) {
  const nth = (counts.get(section.type) ?? 0) + 1;
  counts.set(section.type, nth);

  const match = parsed.sections.find((p) => p.type === section.type && p.nth === nth);
  if (!match) {
    console.log(`HILANG: ${section.type}#${nth}`);
    mismatches += 1;
    continue;
  }

  // Impor menggabungkan ke konten yang ada, persis seperti Server Action.
  const before = parseWith(registry, section.type, section.content);
  const after = parseWith(registry, section.type, {
    ...section.content,
    ...match.content,
  });

  if (JSON.stringify(before) !== JSON.stringify(after)) {
    mismatches += 1;
    console.log(`\nBEDA ${section.type}#${nth}`);
    const b = before as Record<string, unknown>;
    const a = after as Record<string, unknown>;
    for (const key of Object.keys(b)) {
      const x = JSON.stringify(b[key]);
      const y = JSON.stringify(a[key]);
      if (x !== y) console.log(`  ${key}\n    keluar: ${x}\n    masuk : ${y}`);
    }
  }
}

const listBlocks = SECTION_TYPES.filter((t) => BLOCKS[t].fields.some((f) => f.kind === 'list'));

console.log(`\nblok        : ${SECTION_TYPES.length}`);
console.log(`punya daftar: ${listBlocks.length} (${listBlocks.join(', ')})`);
console.log(`BEDA        : ${mismatches}`);

if (mismatches > 0) process.exit(1);
