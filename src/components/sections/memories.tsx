import Image from 'next/image';
import type { BlockContent } from '@/design/blocks';
import type { DesignSpec, MediaRecord } from '@/design/types';
import { renderLite } from '@/lib/utils';
import { Reveal } from '../engine/reveal';
import styles from './memories.module.css';

type Props = {
  content: BlockContent<'memories'>;
  design: DesignSpec;
  variant: string;
  media: MediaRecord[];
};

export function MemoriesSection({ content, design, variant, media }: Props) {
  const reveal = design.motion.reveal;
  if (!content.items.length) return null;

  const layout =
    variant === 'alternating'
      ? styles.alternating
      : variant === 'stack'
        ? styles.stack
        : styles.polaroid;

  return (
    <section className="section">
      <div className="section-inner">
        <Reveal kind={reveal} className={styles.header}>
          {content.eyebrow && <p className="eyebrow">{content.eyebrow}</p>}
          {content.title && <h2 className={`display ${styles.title}`}>{content.title}</h2>}
          {content.note && <p className={`body-text ${styles.note}`}>{content.note}</p>}
        </Reveal>

        <ul className={`${styles.items} ${layout}`}>
          {content.items.map((item, i) => {
            const photo = media.find((m) => m.id === item.photoId && m.kind === 'photo');

            return (
              <Reveal as="li" kind={reveal} index={i} key={i} className={styles.item}>
                {photo && (
                  <div className={`${styles.frame} photo-develop`}>
                    <Image
                      src={photo.url}
                      alt={item.title || photo.caption || ''}
                      fill
                      sizes="(max-width: 720px) 88vw, 320px"
                      className={`${styles.image} photo-parallax`}
                    />
                  </div>
                )}

                <div className={styles.caption}>
                  {item.date && <span className={styles.date}>{item.date}</span>}
                  {item.title && <h3 className={styles.itemTitle}>{item.title}</h3>}
                  {item.body && (
                    <p
                      className={styles.text}
                      dangerouslySetInnerHTML={{ __html: renderLite(item.body) }}
                    />
                  )}
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
