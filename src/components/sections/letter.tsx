import type { SectionContent } from '@/design/schemas';
import type { DesignSpec } from '@/design/types';
import { INTRO_IMAGES } from '@/design/theme-images';
import { renderLite } from '@/lib/utils';
import { Reveal } from '../engine/reveal';
import styles from './letter.module.css';

type Props = {
  content: SectionContent<'letter'>;
  design: DesignSpec;
  variant: string;
};

export function LetterSection({ content, design, variant }: Props) {
  const reveal = design.motion.reveal;
  const body = `<p>${renderLite(content.body)}</p>`;

  const inner = (
    <>
      {content.label && <p className="eyebrow">{content.label}</p>}
      {content.title && (
        <h2 className={`display ${styles.title}`}>{content.title}</h2>
      )}
      <div
        className={`body-text ${styles.body}`}
        // renderLite meng-escape seluruh input lebih dulu, lalu hanya
        // mengizinkan <strong>, <em>, <br>, <p> — tidak ada jalan masuk HTML user.
        dangerouslySetInnerHTML={{ __html: body }}
      />
      {content.signature && (
        <p className={`signature ${styles.signature}`}>{content.signature}</p>
      )}
    </>
  );

  if (variant === 'paper') {
    return (
      <section className={`section ${styles.wrap}`}>
        <div className="section-inner">
          <Reveal kind={reveal} className={`${styles.card} ${styles.paper}`}>
            <span className={styles.paperFold} aria-hidden="true" />
            <img className={styles.paperSeal} src={INTRO_IMAGES.seal} alt="" loading="lazy" draggable={false} />
            {inner}
          </Reveal>
        </div>
      </section>
    );
  }

  if (variant === 'minimal') {
    return (
      <section className={`section ${styles.wrap}`}>
        <div className="section-inner">
          <Reveal kind={reveal} className={styles.minimal}>
            <span className={styles.minimalRule} aria-hidden="true" />
            {inner}
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section className={`section ${styles.wrap}`}>
      <div className="section-inner">
        <Reveal kind={reveal} className={`glass ${styles.card} ${styles.glassCard}`}>
          {inner}
        </Reveal>
      </div>
    </section>
  );
}
