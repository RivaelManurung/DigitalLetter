import { MapPin } from 'lucide-react';
import type { BlockContent } from '@/design/blocks';
import type { DesignSpec } from '@/design/types';
import { formatEventDay, formatEventRange, renderLite } from '@/lib/utils';
import { Reveal } from '../engine/reveal';
import styles from './event.module.css';

type Props = {
  content: BlockContent<'event'>;
  design: DesignSpec;
  variant: string;
};

export function EventSection({ content, design, variant }: Props) {
  const reveal = design.motion.reveal;
  if (!content.events.length) return null;

  const layout =
    variant === 'timeline' ? styles.timeline : variant === 'split' ? styles.split : styles.cards;

  return (
    <section className="section">
      <div className="section-inner">
        <Reveal kind={reveal} className={styles.header}>
          {content.eyebrow && <p className="eyebrow">{content.eyebrow}</p>}
          {content.title && <h2 className={`display ${styles.title}`}>{content.title}</h2>}
          {content.note && (
            <p
              className={`body-text ${styles.note}`}
              dangerouslySetInnerHTML={{ __html: renderLite(content.note) }}
            />
          )}
        </Reveal>

        <ul className={`${styles.list} ${layout}`}>
          {content.events.map((event, i) => {
            const day = formatEventDay(event.startsAt);
            const time = formatEventRange(event.startsAt, event.endsAt);

            return (
              <Reveal
                as="li"
                kind={reveal}
                index={i}
                key={i}
                className={`glass ${styles.card}`}
              >
                {event.name && <h3 className={styles.name}>{event.name}</h3>}

                {day && <p className={styles.day}>{day}</p>}
                {time && <p className={styles.time}>{time}</p>}

                {event.venue && <p className={styles.venue}>{event.venue}</p>}
                {event.address && (
                  <p
                    className={styles.address}
                    dangerouslySetInnerHTML={{ __html: renderLite(event.address) }}
                  />
                )}
                {event.note && <p className={styles.note}>{event.note}</p>}

                {event.mapUrl && (
                  <a
                    href={event.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapLink}
                  >
                    <MapPin size={13} aria-hidden="true" />
                    Lihat lokasi
                  </a>
                )}
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
