import type { BlockContent } from '@/design/blocks';
import type { DesignSpec } from '@/design/types';
import { renderLite } from '@/lib/utils';
import { Reveal } from '../engine/reveal';
import { IconGlyph } from '../graphics/icon-glyph';
import styles from './wish.module.css';

type Props = {
  content: BlockContent<'wish'>;
  design: DesignSpec;
  variant: string;
};

export function WishSection({ content, design, variant }: Props) {
  const reveal = design.motion.reveal;

  const layout =
    variant === 'cards' ? styles.cards : variant === 'list' ? styles.list : styles.spotlight;

  return (
    <section className="section">
      <div className="section-inner">
        <Reveal kind={reveal} className={styles.header}>
          {content.eyebrow && <p className="eyebrow">{content.eyebrow}</p>}

          {content.bigText && (
            <span className={styles.big} aria-hidden="true">
              {content.bigText}
            </span>
          )}

          {content.title && <h2 className={`display ${styles.title}`}>{content.title}</h2>}

          {content.body && (
            <p
              className={`body-text ${styles.body}`}
              dangerouslySetInnerHTML={{ __html: renderLite(content.body) }}
            />
          )}
        </Reveal>

        {content.items.length > 0 && (
          <div className={styles.wishes}>
            {content.itemsTitle && (
              <Reveal kind={reveal} index={1}>
                <h3 className={styles.wishesTitle}>{content.itemsTitle}</h3>
              </Reveal>
            )}

            <ul className={`${styles.items} ${layout}`}>
              {content.items.map((item, i) => (
                <Reveal as="li" kind={reveal} index={i + 2} key={i} className={styles.item}>
                  <span className={styles.mark} aria-hidden="true">
                    <IconGlyph name="sparkle" size={18} />
                  </span>
                  <span className={styles.itemText}>{item.text}</span>
                </Reveal>
              ))}
            </ul>
          </div>
        )}

        {content.signature && (
          <Reveal kind={reveal} index={content.items.length + 2}>
            <p className={styles.signature}>{content.signature}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
