import type { BlockContent } from '@/design/blocks';
import type { DesignSpec } from '@/design/types';
import { renderLite } from '@/lib/utils';
import { Reveal } from '../engine/reveal';
import styles from './quote.module.css';

type Props = {
  content: BlockContent<'quote'>;
  design: DesignSpec;
  variant: string;
};

export function QuoteSection({ content, design, variant }: Props) {
  const reveal = design.motion.reveal;
  if (!content.text) return null;

  const tone =
    variant === 'bordered' ? styles.bordered : variant === 'large' ? styles.large : styles.centered;

  return (
    <section className="section">
      <div className="section-inner">
        <Reveal kind={reveal} className={`${styles.wrap} ${tone}`}>
          <blockquote className={styles.quote}>
            <p
              className={styles.text}
              dangerouslySetInnerHTML={{ __html: renderLite(content.text) }}
            />

            {content.translation && (
              <p
                className={styles.translation}
                dangerouslySetInnerHTML={{ __html: renderLite(content.translation) }}
              />
            )}

            {content.source && <cite className={styles.source}>{content.source}</cite>}
          </blockquote>
        </Reveal>
      </div>
    </section>
  );
}
