# Digital Letter

Surat digital yang bisa dikustom sepenuhnya dari dashboard — konten, desain,
foto, dan musiknya diatur tanpa menyentuh kode.

## Gagasan intinya

Pemisahan yang dipegang seluruh aplikasi:

```
ENGINE  (kode, dibangun sekali)   → nyawa
  intro kado · hujan kelopak · latar bernapas · scroll reveal
  glass & kedalaman · musik · timing & easing

DESIGN  (data, tak terbatas)      → kulit
  warna · font · varian layout · jenis partikel · intensitas
```

Konsekuensinya: **setiap desain baru otomatis mewarisi feel-nya.** Membuat
desain berarti mengubah data, bukan menulis komponen.

Ruang kombinasinya: 3 varian × 7 section = **2.187 susunan layout**, dikali
8 pasangan font, 5 jenis latar, 4 jenis partikel, dan palet tak terbatas.

## Stack

| Lapisan | Pilihan |
|---|---|
| App | Next.js 16 (App Router) · React 19 · TypeScript |
| UI dashboard | Tailwind v4 + komponen bergaya shadcn |
| Database | Postgres (Supabase) via Drizzle ORM |
| Storage | Supabase Storage (upload langsung dari browser) |
| Auth | Sesi JWT httpOnly, single-user admin |
| Validasi | Zod — dipakai di client dan server |

Tidak ada backend terpisah. Server Actions dan Route Handlers hidup di dalam
Next.js yang sama.

## Setup

### 1. Supabase

Buat project di [supabase.com](https://supabase.com), lalu:

- **Database → Connection string** → pilih tab **Transaction pooler**, bukan
  *Direct connection*

  > Direct connection (`db.<ref>.supabase.co:5432`) hanya beralamat **IPv6**.
  > Di jaringan tanpa rute IPv6 — banyak ISP rumahan di Indonesia termasuk —
  > koneksinya gagal dengan `ENETUNREACH`. Pooler beralamat IPv4 dan memang
  > yang benar untuk runtime serverless.
  >
  > Perhatikan username ikut berubah: dari `postgres` menjadi
  > `postgres.<project-ref>`. Ini yang paling sering terlewat dan memunculkan
  > error "password authentication failed" padahal password-nya benar.

- **Project Settings → API** → salin Project URL
- **Project Settings → API Keys → Secret keys** → salin key `sb_secret_…`
- **Storage → New bucket** → nama `letter-media`, centang **Public**

### 2. Environment

```bash
cp .env.example .env.local
```

Isi seluruh nilainya. Untuk `AUTH_SECRET`:

```bash
openssl rand -base64 48
```

### 3. Database & akun admin

```bash
npm install
npm run db:migrate   # buat tabel di Supabase (non-interaktif)
npm run db:seed      # buat akun admin dari ADMIN_EMAIL / ADMIN_PASSWORD
```

### 4. Jalankan

```bash
npm run dev
```

- `/login` — masuk sebagai admin
- `/dashboard` — kelola surat
- `/preview/dark-romantic` — galeri preset, jalan tanpa database
- `/l/<slug>` — surat yang dilihat penerima

## Alur pemakaian

1. **Surat baru** → pilih preset → dapat 7 section berisi teks awal
2. **Konten** → sunting teks, tambah/hapus item, geser urutan section
3. **Desain** → ganti preset, warna, font, varian layout, partikel
4. **Media** → unggah foto & lagu, atur caption dan titik loop
5. **Terbitkan** → slug, password opsional, tanggal buka, lalu bagikan tautan

Preview di sebelah kanan memperbarui diri seketika untuk setiap perubahan.

## Mengambil palet dari gambar

Tab **Desain → Warna → Dari gambar**. Unggah desain Canva, foto, atau poster —
warna dominannya diekstrak dengan analisis piksel di browser (tanpa AI, tanpa
panggilan jaringan) lalu dipetakan ke slot palet dengan kontras yang dijaga.

## Struktur

```
src/
  design/       kontrak desain — types, presets, tokens, schema Zod
  db/           schema Drizzle
  lib/
    actions/    Server Actions (letter, media, auth)
    queries.ts  query untuk Server Component
    palette.ts  ekstraksi warna dari gambar
    storage.ts  signed upload Supabase
  components/
    engine/     nyawa: partikel, surface, intro, reveal, musik
    graphics/   bunga & ikon SVG (bukan emoji — ikut warna tema)
    sections/   7 section × 3 varian
    letter/     perakit halaman surat
    dashboard/  editor, panel, live preview
    ui/         primitives
  styles/
    letter.css  CSS engine — nol warna hardcoded
```

## Menambah varian layout baru

1. Tambahkan namanya ke `SECTION_VARIANTS` di `src/design/types.ts`
2. Tangani nama itu di komponen section terkait
3. Selesai — varian langsung muncul di dropdown dashboard dan bisa dipakai
   semua desain

## Menambah tipe section baru

1. Tulis schema Zod di `src/design/schemas.ts`
2. Buat komponennya di `src/components/sections/`
3. Daftarkan di `SECTION_TYPES` dan `section-renderer.tsx`
4. Tambahkan isi awalnya di `src/lib/defaults.ts`

Tidak perlu migration database — konten disimpan sebagai JSONB.

## Catatan keamanan

- Setiap Server Action memanggil `requireAdmin()` sendiri; proxy/middleware
  hanya lapisan pertama, bukan satu-satunya
- Teks surat di-escape penuh sebelum diberi format ringan — tidak ada jalan
  masuk HTML dari input
- File diunggah langsung ke Supabase lewat signed URL; MIME dan ukuran
  divalidasi di server
- Surat berstatus draf mengembalikan 404, bukan halaman kosong
- Key rahasia Supabase (`sb_secret_…`) hanya dipakai di file bertanda
  `server-only`, tidak pernah masuk bundle browser. Publishable key tidak
  dibutuhkan sama sekali — tidak ada supabase-js yang jalan di client

## Skrip

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan mode pengembangan |
| `npm run build` | Build produksi |
| `npm run typecheck` | Cek tipe tanpa emit |
| `npm run lint` | ESLint |
| `npm run db:generate` | Buat file migration SQL dari perubahan schema |
| `npm run db:migrate` | **Terapkan migration ke database** — pakai ini |
| `npm run db:push` | Sinkron langsung tanpa migration (lihat catatan) |
| `npm run db:seed` | Buat/perbarui akun admin |
| `npm run db:studio` | Buka Drizzle Studio |

> **Catatan soal `db:push`.** Pada drizzle-kit 0.31.10 perintah ini gagal saat
> menarik schema dari Postgres (`TypeError: Cannot read properties of undefined
> (reading 'replace')` di pemeriksaan CHECK constraint) dan tidak jadi mengubah
> apa pun. Alurnya: `db:generate` → `db:migrate`. Berkas migration yang
> tergenerate di `drizzle/` adalah sumber kebenarannya.
# DigitalLetter
