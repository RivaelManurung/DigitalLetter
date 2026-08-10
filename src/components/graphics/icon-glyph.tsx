import styles from './graphics.module.css';

/**
 * Set ikon untuk kartu "alasan" dan bunga di taman.
 * Dipilih lewat nama di content (`icon: "rose"`), bukan emoji mentah,
 * supaya bentuk dan warnanya konsisten di semua perangkat.
 */

export { GLYPH_NAMES, GLYPH_LABEL, type GlyphName } from '@/design/glyphs';

type Props = {
  name: string;
  size?: number;
  className?: string;
};

export function IconGlyph({ name, size = 40, className }: Props) {
  return (
    <svg
      className={`${styles.glyph} ${className ?? ''}`}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-hidden="true"
    >
      {renderGlyph(name)}
    </svg>
  );
}

function renderGlyph(name: string) {
  const accent = 'var(--c-accent)';
  const soft = 'var(--c-accent-soft)';
  const text = 'var(--c-text)';

  switch (name) {
    case 'sakura':
      return (
        <>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse
              key={a}
              cx="24"
              cy="13"
              rx="6"
              ry="10"
              fill={soft}
              transform={`rotate(${a} 24 24)`}
            />
          ))}
          <circle cx="24" cy="24" r="4" fill={accent} />
        </>
      );

    case 'lotus':
      return (
        <>
          {[-52, -26, 0, 26, 52].map((a, i) => (
            <ellipse
              key={a}
              cx="24"
              cy="18"
              rx={i === 2 ? 6 : 5}
              ry={i === 2 ? 15 : 13}
              fill={i % 2 === 0 ? soft : accent}
              transform={`rotate(${a} 24 32)`}
              opacity="0.92"
            />
          ))}
          <path d="M10 34 Q24 40 38 34" stroke={text} strokeWidth="1.5" fill="none" opacity="0.5" />
        </>
      );

    case 'tulip':
      return (
        <>
          <path
            d="M15 14 Q17 30 24 32 Q31 30 33 14 Q29 20 24 15 Q19 20 15 14Z"
            fill={accent}
          />
          <path d="M24 32 V42" stroke={soft} strokeWidth="2" />
          <path d="M24 37 Q17 34 15 39 Q21 41 24 37Z" fill={soft} opacity="0.7" />
        </>
      );

    case 'daisy':
      return (
        <>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <ellipse
              key={a}
              cx="24"
              cy="13"
              rx="3.4"
              ry="9"
              fill={text}
              opacity="0.85"
              transform={`rotate(${a} 24 24)`}
            />
          ))}
          <circle cx="24" cy="24" r="5.5" fill={accent} />
        </>
      );

    case 'sunflower':
      return (
        <>
          {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((a) => (
            <ellipse
              key={a}
              cx="24"
              cy="12"
              rx="3.6"
              ry="10"
              fill={soft}
              transform={`rotate(${a} 24 24)`}
            />
          ))}
          <circle cx="24" cy="24" r="7" fill={accent} />
          <circle cx="24" cy="24" r="3.4" fill={text} opacity="0.35" />
        </>
      );

    case 'hibiscus':
      return (
        <>
          {[0, 72, 144, 216, 288].map((a) => (
            <path
              key={a}
              d="M24 24 Q16 12 24 6 Q32 12 24 24Z"
              fill={accent}
              opacity="0.9"
              transform={`rotate(${a} 24 24)`}
            />
          ))}
          <path d="M24 24 V40" stroke={soft} strokeWidth="1.6" />
          <circle cx="24" cy="24" r="3" fill={text} />
        </>
      );

    case 'leaf':
      return (
        <>
          <path d="M12 36 Q12 12 36 12 Q36 36 12 36Z" fill={soft} opacity="0.9" />
          <path d="M12 36 Q24 24 36 12" stroke={text} strokeWidth="1.4" fill="none" opacity="0.55" />
        </>
      );

    case 'heart':
      return (
        <path
          d="M24 40 C10 30 6 22 10 16 C14 10 22 12 24 18 C26 12 34 10 38 16 C42 22 38 30 24 40Z"
          fill={accent}
        />
      );

    case 'sparkle':
      return (
        <>
          <path d="M24 6 L27 20 L41 24 L27 28 L24 42 L21 28 L7 24 L21 20Z" fill={soft} />
          <circle cx="24" cy="24" r="2.5" fill={text} opacity="0.8" />
        </>
      );

    case 'moon':
      return (
        <path
          d="M30 8 A17 17 0 1 0 30 40 A13 13 0 1 1 30 8Z"
          fill={soft}
        />
      );

    case 'star':
      return (
        <path
          d="M24 7 L28.4 19.2 L41 20.4 L31.4 28.6 L34.3 41 L24 34.3 L13.7 41 L16.6 28.6 L7 20.4 L19.6 19.2Z"
          fill={soft}
        />
      );

    case 'rose':
    default:
      return (
        <>
          <path
            d="M24 8 Q34 12 34 22 Q34 34 24 38 Q14 34 14 22 Q14 12 24 8Z"
            fill={accent}
          />
          <path
            d="M24 14 Q30 17 29 23 Q28 29 24 32 Q20 29 19 23 Q18 17 24 14Z"
            fill={soft}
            opacity="0.85"
          />
          <circle cx="24" cy="23" r="2.6" fill={text} opacity="0.7" />
        </>
      );
  }
}
