import type { SectionContent } from '@/design/schemas';
import type { DesignSpec } from '@/design/types';
import { renderLite } from '@/lib/utils';
import { Reveal } from '../engine/reveal';
import styles from './reasons.module.css';

type Props = {
  content: SectionContent<'reasons'>;
  design: DesignSpec;
  variant: string;
};

/**
 * Tiga varian dari satu data yang sama. Ini inti sistem: mengganti varian
 * mengubah susunan secara menyeluruh tanpa menyentuh konten sama sekali.
 */
export function ReasonsSection({ content, design, variant }: Props) {
  const reveal = design.motion.reveal;
  if (!content.items.length) return null;

  const header = (
    <Reveal kind={reveal} className={styles.header}>
      {content.eyebrow && <p className="eyebrow">{content.eyebrow}</p>}
      {content.title && <h2 className={`display ${styles.title}`}>{content.title}</h2>}
    </Reveal>
  );

  if (variant === 'numbered') {
    return (
      <section className="section">
        <div className="section-inner">
          {header}
          <ol className={styles.numbered}>
            {content.items.map((item, i) => (
              <Reveal as="li" kind={reveal} index={i} key={i} className={styles.numberedItem}>
                <span className={styles.numberedIndex}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className={styles.numberedBody}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p
                    className="body-text"
                    dangerouslySetInnerHTML={{ __html: renderLite(item.body) }}
                  />
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  const gridClass = variant === 'bento' ? styles.bento : styles.grid;

  return (
    <section className="section">
      <div className="section-inner">
        {header}
        <ul className={gridClass}>
          {content.items.map((item, i) => (
            <Reveal
              as="li"
              kind={reveal}
              index={i}
              key={i}
              className={`glass ${styles.card}`}
            >
              <span className={styles.cardIndex} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p
                className="body-text"
                dangerouslySetInnerHTML={{ __html: renderLite(item.body) }}
              />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
