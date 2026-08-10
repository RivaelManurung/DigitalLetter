import type { BlockContent } from '@/design/blocks';
import type { DesignSpec } from '@/design/types';
import { Reveal } from '../engine/reveal';
import { IconGlyph } from '../graphics/icon-glyph';
import styles from './itinerary.module.css';

type Props = {
  content: BlockContent<'itinerary'>;
  design: DesignSpec;
  variant: string;
};

export function ItinerarySection({ content, design, variant }: Props) {
  const reveal = design.motion.reveal;
  if (!content.items.length) return null;

  const layout =
    variant === 'list' ? styles.list : variant === 'cards' ? styles.cards : styles.timeline;

  return (
    <section className="section">
      <div className="section-inner">
        <Reveal kind={reveal} className={styles.header}>
          {content.eyebrow && <p className="eyebrow">{content.eyebrow}</p>}
          {content.title && <h2 className={`display ${styles.title}`}>{content.title}</h2>}
          {content.note && <p className={`body-text ${styles.note}`}>{content.note}</p>}
        </Reveal>

        <ol className={`${styles.items} ${layout}`}>
          {content.items.map((item, i) => (
            <Reveal as="li" kind={reveal} index={i} key={i} className={styles.item}>
              <span className={styles.marker} aria-hidden="true">
                <IconGlyph name={item.icon} size={22} />
              </span>

              <div className={styles.body}>
                {item.time && <span className={styles.time}>{item.time}</span>}
                {item.title && <h3 className={styles.itemTitle}>{item.title}</h3>}
                {item.detail && <p className={styles.detail}>{item.detail}</p>}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
