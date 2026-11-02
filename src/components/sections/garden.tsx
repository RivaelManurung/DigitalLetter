import type { SectionContent } from '@/design/schemas';
import type { DesignSpec } from '@/design/types';
import { STICKERS } from '@/design/theme-images';
import { Reveal } from '../engine/reveal';
import { IconGlyph } from '../graphics/icon-glyph';
import styles from './garden.module.css';

type Props = {
  content: SectionContent<'garden'>;
  design: DesignSpec;
  variant: string;
};

/** Posisi tiap bunga per varian — dihitung dari indeks, bukan ditulis manual. */
function placement(variant: string, i: number, total: number) {
  if (variant === 'arc') {
    // setengah lingkaran: bunga tengah paling tinggi
    const t = total === 1 ? 0.5 : i / (total - 1);
    const lift = Math.sin(t * Math.PI) * 74;
    return { transform: `translateY(${-lift}px)`, height: `${190 + lift}px` };
  }

  if (variant === 'scatter') {
    // sebaran deterministik — sama di server dan client, tidak ada hydration mismatch
    const jitter = ((i * 37) % 11) - 5;
    const depth = ((i * 53) % 7) * 8;
    return { transform: `translateY(${jitter * 4 - depth * 0.4}px)`, height: `${170 + depth * 3}px` };
  }

  return { height: '190px' };
}

export function GardenSection({ content, design, variant }: Props) {
  const reveal = design.motion.reveal;
  const flowers = content.flowers;
  if (!flowers.length) return null;

  return (
    <section className="section">
      <div className="section-inner">
        <Reveal kind={reveal} className={styles.header}>
          {content.eyebrow && <p className="eyebrow">{content.eyebrow}</p>}
          {content.title && (
            <h2 className={`display ${styles.title}`}>{content.title}</h2>
          )}
        </Reveal>

        <ul className={`${styles.garden} ${styles[variant] ?? styles.row}`}>
          {flowers.map((flower, i) => (
            <Reveal
              as="li"
              kind={reveal}
              index={i}
              key={i}
              className={styles.stalk}
            >
              <div
                className={styles.stalkInner}
                style={placement(variant, i, flowers.length)}
              >
                <span className={styles.bloom}>
                  {STICKERS[flower.flower] ? (
                    <img
                      className={styles.sticker}
                      src={STICKERS[flower.flower]}
                      alt=""
                      loading="lazy"
                      draggable={false}
                    />
                  ) : (
                    <IconGlyph name={flower.flower} size={46} />
                  )}
                </span>
                <span className={styles.stem} aria-hidden="true" />
                <span className={`glass ${styles.tooltip}`}>
                  <strong>{flower.name}</strong>
                  <span>{flower.meaning}</span>
                </span>
              </div>
            </Reveal>
          ))}
        </ul>

        {content.note && <p className={styles.note}>{content.note}</p>}
      </div>
    </section>
  );
}
