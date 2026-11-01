'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { BlockContent } from '@/design/blocks';
import type { DesignSpec, MediaRecord } from '@/design/types';
import { renderLite } from '@/lib/utils';
import { GIFT_IMAGES } from '@/design/theme-images';
import { Reveal } from '../engine/reveal';
import styles from './unwrap.module.css';

type Props = {
  content: BlockContent<'unwrap'>;
  design: DesignSpec;
  variant: string;
  media: MediaRecord[];
};

/** selaras dengan durasi animasi tutup kado di unwrap.module.css */
const OPEN_MS = 820;
const SPARKS = 10;

type State = 'closed' | 'opening' | 'open';

export function UnwrapSection({ content, design, variant, media }: Props) {
  const reveal = design.motion.reveal;
  const [states, setStates] = useState<State[]>(() => content.items.map(() => 'closed'));
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  if (!content.items.length) return null;

  const set = (i: number, s: State) =>
    setStates((prev) => prev.map((v, j) => (j === i ? s : v)));

  function open(i: number) {
    if (states[i] !== 'closed') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    navigator.vibrate?.(25);
    if (reduce) return set(i, 'open');
    set(i, 'opening');
    timers.current.push(window.setTimeout(() => set(i, 'open'), OPEN_MS * design.motion.speed));
  }

  const allOpen = states.length > 0 && states.every((s) => s === 'open');

  return (
    <section className="section">
      <div className="section-inner">
        <Reveal kind={reveal} className={styles.header}>
          {content.eyebrow && <p className="eyebrow">{content.eyebrow}</p>}
          {content.title && <h2 className={`display ${styles.title}`}>{content.title}</h2>}
          {content.hint && !allOpen && <p className={styles.hint}>{content.hint}</p>}
        </Reveal>

        <ul className={`${styles.items} ${variant === 'grid' ? styles.grid : styles.pile}`}>
          {content.items.map((item, i) => {
            const state = states[i] ?? 'closed';
            const photo = media.find((m) => m.id === item.photoId && m.kind === 'photo');

            return (
              <li key={i} className={styles.slot}>
                {state === 'open' ? (
                  <article className={styles.card} aria-live="polite">
                    {photo && (
                      <div className={styles.frame}>
                        <Image
                          src={photo.url}
                          alt={item.title || photo.caption || ''}
                          fill
                          sizes="(max-width: 720px) 80vw, 260px"
                          className={styles.image}
                        />
                      </div>
                    )}
                    {item.title && <h3 className={styles.cardTitle}>{item.title}</h3>}
                    {item.body && (
                      <p
                        className={styles.cardBody}
                        dangerouslySetInnerHTML={{ __html: renderLite(item.body) }}
                      />
                    )}
                  </article>
                ) : (
                  <button
                    type="button"
                    className={styles.gift}
                    data-state={state}
                    onClick={() => open(i)}
                    aria-label={`Buka kado ${item.tag || i + 1}`}
                  >
                    <Image
                      src={GIFT_IMAGES[i % GIFT_IMAGES.length]}
                      alt=""
                      width={420}
                      height={330}
                      sizes="(max-width: 720px) 45vw, 200px"
                      className={styles.giftImage}
                      draggable={false}
                    />
                    {item.tag && <span className={styles.tag}>{item.tag}</span>}
                    {state === 'opening' && (
                      <span className={styles.burst} aria-hidden="true">
                        {Array.from({ length: SPARKS }, (_, k) => (
                          <span
                            key={k}
                            style={{ '--a': `${(360 / SPARKS) * k}deg` } as CSSProperties}
                          />
                        ))}
                      </span>
                    )}
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {allOpen && content.doneNote && (
          <p className={`body-text ${styles.done}`} aria-live="polite">
            {content.doneNote}
          </p>
        )}
      </div>
    </section>
  );
}
