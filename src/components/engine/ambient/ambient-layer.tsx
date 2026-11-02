import type { CSSProperties } from 'react';
import type { AmbientKind } from '@/design/types';
import styles from './ambient.module.css';

type Props = { kind?: AmbientKind };

/** Pseudo-acak deterministik: sama di server dan client, jadi tanpa hydration mismatch. */
function rand(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

type Pt = [number, number];
function quad(a: Pt, c: Pt, b: Pt, u: number): Pt {
  const v = 1 - u;
  return [v * v * a[0] + 2 * v * u * c[0] + u * u * b[0], v * v * a[1] + 2 * v * u * c[1] + u * u * b[1]];
}
/** bohlam di sepanjang kabel: sama persis dengan path SVG `M-2 1 Q25 11 50 4 T102 2` */
const WIRE_BULBS: Pt[] = [
  ...[0.12, 0.3, 0.48, 0.66, 0.84].map((u) => quad([-2, 1], [25, 11], [50, 4], u)),
  ...[0.02, 0.2, 0.38, 0.56, 0.74, 0.92].map((u) => quad([50, 4], [75, -3], [102, 2], u)),
];

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

function vars(v: Record<string, string | number>): CSSProperties {
  return v as CSSProperties;
}

/**
 * Lapisan suasana di antara latar dan konten. Murni CSS: tidak ada RAF,
 * dan seluruhnya berhenti di prefers-reduced-motion.
 */
export function AmbientLayer({ kind = 'none' }: Props) {
  if (kind === 'none') return null;
  return (
    <div className={`${styles.layer} ${styles[camel(kind)]}`} aria-hidden="true">
      {RENDER[kind]()}
    </div>
  );
}

function camel(kind: string) {
  return kind.replace(/-(\w)/g, (_, c: string) => c.toUpperCase());
}

const RENDER: Record<Exclude<AmbientKind, 'none'>, () => React.ReactNode> = {
  candle: () => (
    <>
      {[
        { x: 8, y: 78, s: 46 },
        { x: 88, y: 70, s: 40 },
        { x: 30, y: 96, s: 54 },
        { x: 72, y: 100, s: 48 },
      ].map((p, i) => (
        <span
          key={`p${i}`}
          className={styles.pool}
          style={vars({ '--x': `${p.x}%`, '--y': `${p.y}%`, '--s': `${p.s}vmax`, '--d': `${-i * 1.7}s` })}
        />
      ))}
      {range(14).map((i) => (
        <span
          key={`e${i}`}
          className={styles.ember}
          style={vars({
            '--x': `${rand(i, 1) * 100}%`,
            '--dx': `${(rand(i, 2) - 0.5) * 80}px`,
            '--t': `${9 + rand(i, 3) * 9}s`,
            '--d': `${-rand(i, 4) * 18}s`,
            '--s': `${2 + rand(i, 5) * 2.5}px`,
          })}
        />
      ))}
    </>
  ),

  'shooting-stars': () => (
    <>
      {range(4).map((i) => (
        <span
          key={i}
          className={styles.meteor}
          style={vars({
            '--x': `${15 + rand(i, 1) * 80}%`,
            '--y': `${rand(i, 2) * 35}%`,
            '--t': `${9 + i * 3.5}s`,
            '--d': `${1.5 + i * 2.6}s`,
          })}
        />
      ))}
      <span className={styles.milky} />
    </>
  ),

  spotlight: () => (
    <>
      <span className={`${styles.beam} ${styles.beamLeft}`} />
      <span className={`${styles.beam} ${styles.beamRight}`} />
      <span className={styles.stageFloor} />
    </>
  ),

  sunrays: () => (
    <>
      <span className={styles.rays} />
      <span className={styles.haze} />
    </>
  ),

  fireflies: () =>
    range(16).map((i) => (
      <span
        key={i}
        className={styles.firefly}
        style={vars({
          '--x': `${rand(i, 1) * 100}%`,
          '--y': `${30 + rand(i, 2) * 65}%`,
          '--t': `${10 + rand(i, 3) * 10}s`,
          '--b': `${2.4 + rand(i, 4) * 2.4}s`,
          '--d': `${-rand(i, 5) * 20}s`,
          '--path': `wander${i % 3}`,
        })}
      />
    )),

  'fairy-lights': () => (
    <>
      <svg className={styles.wire} viewBox="0 0 100 12" preserveAspectRatio="none">
        <path d="M-2 1 Q 25 11 50 4 T 102 2" />
      </svg>
      {WIRE_BULBS.map(([x, y], i) => (
        <span
          key={i}
          className={styles.bulb}
          style={vars({
            '--x': `${x}%`,
            '--y': y,
            '--c': ['#ffd27a', '#ff8a7a', '#9fe0b8', '#ffe9b0'][i % 4],
            '--d': `${-((i * 0.37) % 3)}s`,
          })}
        />
      ))}
      {range(7).map((i) => (
        <span
          key={`b${i}`}
          className={styles.bokeh}
          style={vars({
            '--x': `${rand(i, 7) * 100}%`,
            '--y': `${20 + rand(i, 8) * 70}%`,
            '--s': `${40 + rand(i, 9) * 90}px`,
            '--t': `${14 + rand(i, 10) * 10}s`,
            '--d': `${-rand(i, 11) * 20}s`,
          })}
        />
      ))}
    </>
  ),

  frost: () => (
    <>
      <span className={styles.frostEdge} />
      {range(10).map((i) => {
        const corner = i % 4;
        const x = corner % 2 === 0 ? rand(i, 1) * 22 : 78 + rand(i, 1) * 22;
        const y = corner < 2 ? rand(i, 2) * 22 : 78 + rand(i, 2) * 22;
        return (
          <span
            key={i}
            className={styles.glint}
            style={vars({ '--x': `${x}%`, '--y': `${y}%`, '--t': `${4 + rand(i, 3) * 4}s`, '--d': `${-rand(i, 4) * 8}s` })}
          />
        );
      })}
    </>
  ),
  fireworks: () =>
    range(5).map((i) => (
      <span
        key={i}
        className={styles.firework}
        style={vars({
          '--x': `${10 + rand(i, 1) * 80}%`,
          '--y': `${8 + rand(i, 2) * 32}%`,
          '--r': `${70 + rand(i, 3) * 70}px`,
          '--t': `${5.5 + rand(i, 4) * 3}s`,
          '--d': `${i * 1.3}s`,
          '--c': FIREWORK_COLORS[i % FIREWORK_COLORS.length],
        })}
      >
        <span className={styles.rocket} />
        {range(14).map((k) => (
          <span key={k} className={styles.spark} style={vars({ '--a': `${(k * 360) / 14}deg` })} />
        ))}
      </span>
    )),

  champagne: () => (
    <>
      <span className={styles.toastGlow} />
      {range(22).map((i) => (
        <span
          key={i}
          className={styles.bubble}
          style={vars({
            '--x': `${rand(i, 1) * 100}%`,
            '--s': `${4 + rand(i, 2) * 9}px`,
            '--t': `${7 + rand(i, 3) * 8}s`,
            '--d': `${-rand(i, 4) * 15}s`,
            '--w': `${8 + rand(i, 5) * 18}px`,
          })}
        />
      ))}
    </>
  ),

  confetti: () =>
    range(26).map((i) => (
      <span
        key={i}
        className={styles.confetto}
        style={vars({
          '--x': `${rand(i, 1) * 100}%`,
          '--t': `${8 + rand(i, 2) * 8}s`,
          '--d': `${-rand(i, 3) * 16}s`,
          '--dx': `${(rand(i, 4) - 0.5) * 140}px`,
          '--c': CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          '--shape': i % 3 === 0 ? '50%' : '2px',
          '--h': i % 3 === 0 ? '8px' : '14px',
        })}
      />
    )),
};

const FIREWORK_COLORS = ['#ffd27a', '#ff8fa3', '#9fd8ff', '#fff3d6', '#c8a2ff'];
const CONFETTI_COLORS = ['#ff6b6b', '#ffd166', '#06d6a0', '#4cc9f0', '#f72585', '#ffffff'];
