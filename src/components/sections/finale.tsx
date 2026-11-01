import type { SectionContent } from '@/design/schemas';
import type { DesignSpec } from '@/design/types';
import { renderLite } from '@/lib/utils';
import { Reveal } from '../engine/reveal';
import styles from './finale.module.css';

type Props = {
  content: SectionContent<'finale'>;
  design: DesignSpec;
  variant: string;
};

export function FinaleSection({ content, design, variant }: Props) {
  const reveal = design.motion.reveal;

  const text = (
    <>
      {content.eyebrow && <p className="eyebrow">{content.eyebrow}</p>}
      {content.title && (
        <h2 className={`display ${styles.title}`}>{content.title}</h2>
      )}
      {content.body && (
        <p
          className={`body-text ${styles.body}`}
          dangerouslySetInnerHTML={{ __html: renderLite(content.body) }}
        />
      )}
    </>
  );

  return (
    <section className={`section ${styles.finale} ${styles[variant] ?? ''}`}>
      {variant === 'starlit' && <Starfield />}

      <div className={`section-inner ${styles.inner}`}>
        <Reveal kind={reveal} index={1} className={styles.textStack}>
          {text}
        </Reveal>

        {content.signature && (
          <Reveal kind={reveal} index={3}>
            <p className={`signature ${styles.signature} ${variant === 'heart' ? styles.signatureBig : ''}`}>
              {content.signature}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/** Bintang dengan posisi deterministik — server dan client menghasilkan hasil sama. */
function Starfield() {
  const stars = Array.from({ length: 46 }, (_, i) => ({
    left: ((i * 73) % 100) + ((i % 3) - 1) * 0.4,
    top: ((i * 41) % 100),
    size: 1 + ((i * 17) % 3),
    delay: ((i * 29) % 40) / 10,
  }));

  return (
    <div className={styles.starfield} aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
