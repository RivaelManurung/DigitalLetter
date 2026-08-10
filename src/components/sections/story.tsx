import Image from 'next/image';
import type { BlockContent } from '@/design/blocks';
import type { DesignSpec, MediaRecord } from '@/design/types';
import { renderLite } from '@/lib/utils';
import { Reveal } from '../engine/reveal';
import styles from './story.module.css';

type Props = {
  content: BlockContent<'story'>;
  design: DesignSpec;
  variant: string;
  media: MediaRecord[];
};

export function StorySection({ content, design, variant, media }: Props) {
  const reveal = design.motion.reveal;
  if (!content.items.length) return null;

  const layout =
    variant === 'alternating'
      ? styles.alternating
      : variant === 'cards'
        ? styles.cards
        : styles.timeline;

  return (
    <section className="section">
      <div className="section-inner">
        <Reveal kind={reveal} className={styles.header}>
          {content.eyebrow && <p className="eyebrow">{content.eyebrow}</p>}
          {content.title && <h2 className={`display ${styles.title}`}>{content.title}</h2>}
          {content.note && <p className={`body-text ${styles.note}`}>{content.note}</p>}
        </Reveal>

        <ol className={`${styles.items} ${layout}`}>
          {content.items.map((item, i) => {
            const photo = media.find((m) => m.id === item.photoId && m.kind === 'photo');

            return (
              <Reveal as="li" kind={reveal} index={i} key={i} className={styles.item}>
                {photo && (
                  <div className={styles.photo}>
                    <Image
                      src={photo.url}
                      alt={item.title || photo.caption || ''}
                      fill
                      sizes="(max-width: 720px) 90vw, 340px"
                      className={styles.photoImg}
                    />
                  </div>
                )}

                <div className={styles.body}>
                  {item.date && <span className={styles.date}>{item.date}</span>}
                  {item.title && <h3 className={styles.itemTitle}>{item.title}</h3>}
                  {item.body && (
                    <p
                      className="body-text"
                      dangerouslySetInnerHTML={{ __html: renderLite(item.body) }}
                    />
                  )}
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
