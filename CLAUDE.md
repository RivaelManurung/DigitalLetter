@AGENTS.md

## Jebakan

- **ETIMEDOUT acak ke Supabase pooler.** Node 22 mencoba tiap alamat IP hanya
  250 ms (`autoSelectFamilyAttemptTimeout`). Pooler `aws-0-ap-south-1` dari
  Indonesia butuh 230–390 ms, jadi query gagal secara acak dengan
  `AggregateError [ETIMEDOUT]`. `src/db/index.ts` menaikkan batasnya ke 3 detik;
  skrip yang membuat koneksi sendiri (mis. `scripts/seed.ts`) perlu hal yang sama.
- **Pesan error Server Action** selalu lewat `actionErrorMessage`
  (`src/lib/action-error.ts`) supaya SQL dan parameter tidak tampil di toast.
