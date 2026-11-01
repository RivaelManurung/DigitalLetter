'use client';

import { useState } from 'react';
import type { BlockContent } from '@/design/blocks';
import type { DesignSpec } from '@/design/types';
import { renderLite } from '@/lib/utils';
import { Reveal } from '../engine/reveal';
import styles from './question.module.css';

type Props = {
  content: BlockContent<'question'>;
  design: DesignSpec;
  variant: string;
};

/** Posisi acak tombol "tidak" saat menghindar, dalam persen relatif kotaknya. */
type Nudge = { x: number; y: number };

export function QuestionSection({ content, design, variant }: Props) {
  const reveal = design.motion.reveal;

  const [answer, setAnswer] = useState<'yes' | 'no' | null>(null);
  const [nudge, setNudge] = useState<Nudge>({ x: 0, y: 0 });
  const [dodges, setDodges] = useState(0);

  const behavior = content.noBehavior;

  function dodge() {
    if (behavior === 'normal') return;
    setDodges((n) => n + 1);
    // Digeser ke arah acak tapi tetap dalam jangkauan — bukan lari ke luar layar.
    setNudge({
      x: (Math.random() - 0.5) * 220,
      y: (Math.random() - 0.5) * 90,
    });
  }

  const noScale = behavior === 'shrink' ? Math.max(0.35, 1 - dodges * 0.12) : 1;

  const layout =
    variant === 'card' ? styles.card : variant === 'playful' ? styles.playful : styles.centered;

  if (answer === 'yes') {
    return (
      <section className="section">
        <div className="section-inner">
          <Reveal kind={reveal} className={styles.answer}>
            <p
              className={`body-text ${styles.answerText}`}
              dangerouslySetInnerHTML={{ __html: renderLite(content.yesResponse) }}
            />
          </Reveal>
        </div>
      </section>
    );
  }

  if (answer === 'no') {
    return (
      <section className="section">
        <div className="section-inner">
          <Reveal kind={reveal} className={styles.answer}>
            <p
              className={`body-text ${styles.answerText}`}
              dangerouslySetInnerHTML={{ __html: renderLite(content.noResponse) }}
            />
            <button
              type="button"
              onClick={() => setAnswer(null)}
              className={styles.again}
            >
              Kembali
            </button>
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="section-inner">
        <Reveal kind={reveal} className={`${styles.shell} ${layout}`}>
          {content.eyebrow && <p className="eyebrow">{content.eyebrow}</p>}
          {content.title && <h2 className={`display ${styles.title}`}>{content.title}</h2>}
          {content.body && (
            <p
              className={`body-text ${styles.body}`}
              dangerouslySetInnerHTML={{ __html: renderLite(content.body) }}
            />
          )}

          <div className={styles.buttons}>
            <button
              type="button"
              onClick={() => setAnswer('yes')}
              className={styles.yes}
            >
              {content.yesLabel}
            </button>

            <button
              type="button"
              onClick={() => (behavior === 'normal' ? setAnswer('no') : dodge())}
              onMouseEnter={behavior === 'dodge' ? dodge : undefined}
              onFocus={behavior === 'dodge' ? dodge : undefined}
              className={styles.no}
              style={{
                transform: `translate(${nudge.x}px, ${nudge.y}px) scale(${noScale})`,
              }}
            >
              {content.noLabel}
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
