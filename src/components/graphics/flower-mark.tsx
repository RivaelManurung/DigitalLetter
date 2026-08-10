import styles from './graphics.module.css';

/**
 * Bunga utama sebagai SVG, bukan emoji.
 * Emoji dirender berbeda di Android/iOS/Windows dan warnanya tidak bisa
 * dikendalikan. SVG mengambil warna dari token tema, jadi ikut berubah
 * saat palet diganti di dashboard.
 */
export function FlowerMark({ size = 120 }: { size?: number }) {
  const petals = [0, 60, 120, 180, 240, 300];

  return (
    <svg
      className={styles.flowerMark}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-hidden="true"
    >
      <g className={styles.flowerSpin}>
        {/*
          Rotasi dipasang di <g>, bukan di <ellipse>. Kalau di ellipse,
          CSS transform dari animasi akan menimpa atribut transform SVG
          dan semua kelopak menumpuk di satu posisi.
        */}
        {petals.map((angle, i) => (
          <g key={angle} transform={`rotate(${angle} 50 50)`}>
            <ellipse
              cx="50"
              cy="31"
              rx="11.5"
              ry="21"
              fill={i % 2 === 0 ? 'var(--c-accent-soft)' : 'var(--c-accent)'}
              opacity={0.88}
              className={styles.petal}
              style={{ animationDelay: `${i * 120}ms` }}
            />
          </g>
        ))}
        <circle cx="50" cy="50" r="9.5" fill="var(--c-text)" opacity="0.9" />
        <circle cx="50" cy="50" r="4" fill="var(--c-accent)" />
      </g>
    </svg>
  );
}
