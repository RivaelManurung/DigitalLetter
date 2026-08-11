/**
 * Batang perbandingan sederhana — satu baris per status, dengan angka
 * "n/total" di kanan. Dipakai untuk sebaran yang jumlah kategorinya sedikit,
 * di mana grafik penuh justru berlebihan.
 */
export function StatusBars({
  rows,
  total,
}: {
  rows: { label: string; value: number }[];
  total: number;
}) {
  const safeTotal = Math.max(total, 1);

  return (
    <ul className="grid gap-3.5">
      {rows.map((row) => {
        const pct = Math.round((row.value / safeTotal) * 100);

        return (
          <li key={row.label} className="grid gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs font-medium">{row.label}</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                <span className="font-medium text-foreground">{row.value}</span>
                <span className="mx-1 text-muted-foreground/60">/</span>
                {total}
                <span className="ml-2 text-muted-foreground/70">{pct}%</span>
              </span>
            </div>

            <div
              className="h-2 overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label={`${row.label}: ${row.value} dari ${total}`}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
