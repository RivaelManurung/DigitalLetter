import type { SectionContent } from '@/design/schemas';
import type { DesignSpec } from '@/design/types';
import { renderLite } from '@/lib/utils';
import { Reveal } from '../engine/reveal';
import { IconGlyph } from '../graphics/icon-glyph';
import styles from './finale.module.css';

type Props = {
  content: SectionContent<'finale'>;
  design: DesignSpec;
  variant: string;
};

const CROWN = ['sakura', 'hibiscus', 'rose', 'sakura', 'tulip'];

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
        {variant !== 'starlit' && (
          <Reveal kind={reveal} className={styles.crown}>
            {CROWN.map((name, i) => (
              <span key={i} style={{ animationDelay: `${i * 220}ms` }}>
                <IconGlyph name={name} size={30} />
              </span>
            ))}
          </Reveal>
        )}

        <Reveal kind={reveal} index={1} className={styles.textStack}>
          {text}
        </Reveal>

        {variant === 'heart' && (
          <Reveal kind={reveal} index={2} className={styles.heart}>
            <IconGlyph name="heart" size={72} />
          </Reveal>
        )}

        {content.signature && (
          <Reveal kind={reveal} index={3}>
            <p className={`signature ${styles.signature}`}>{content.signature}</p>
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
