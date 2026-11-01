import type { SectionContent } from '@/design/schemas';
import type { DesignSpec } from '@/design/types';
import { Reveal } from '../engine/reveal';
import styles from './hero.module.css';

type Props = {
  content: SectionContent<'hero'>;
  design: DesignSpec;
  variant: string;
};

export function HeroSection({ content, design, variant }: Props) {
  const reveal = design.motion.reveal;

  if (variant === 'split') return <HeroSplit content={content} reveal={reveal} />;
  if (variant === 'editorial')
    return <HeroEditorial content={content} reveal={reveal} />;
  return <HeroCentered content={content} reveal={reveal} />;
}

type VariantProps = {
  content: SectionContent<'hero'>;
  reveal: DesignSpec['motion']['reveal'];
};

function HeroCentered({ content, reveal }: VariantProps) {
  return (
    <section className={`section ${styles.hero} ${styles.centered}`}>
      <div className="center-stack">
        <Reveal kind={reveal} index={0}>
          <p className="eyebrow">{content.eyebrow}</p>
        </Reveal>

        <Reveal kind={reveal} index={1}>
          <h1 className={`display ${styles.title}`}>
            {content.titleTop}
            <br />
            <em>{content.titleBottom}</em>
          </h1>
        </Reveal>

        {content.subtitle && (
          <Reveal kind={reveal} index={2}>
            <p className={`body-text ${styles.subtitle}`}>{content.subtitle}</p>
          </Reveal>
        )}

        {content.scrollLabel && <ScrollCue label={content.scrollLabel} />}
      </div>
    </section>
  );
}

function HeroSplit({ content, reveal }: VariantProps) {
  return (
    <section className={`section ${styles.hero} ${styles.split}`}>
      <div className={styles.splitGrid}>
        <div className={styles.splitText}>
          <Reveal kind={reveal} index={0}>
            <p className="eyebrow">{content.eyebrow}</p>
          </Reveal>
          <Reveal kind={reveal} index={1}>
            <h1 className={`display ${styles.title}`}>
              {content.titleTop} <em>{content.titleBottom}</em>
            </h1>
          </Reveal>
          {content.subtitle && (
            <Reveal kind={reveal} index={2}>
              <p className="body-text">{content.subtitle}</p>
            </Reveal>
          )}
          {content.scrollLabel && (
            <ScrollCue label={content.scrollLabel} align="start" />
          )}
        </div>

      </div>
    </section>
  );
}

function HeroEditorial({ content, reveal }: VariantProps) {
  return (
    <section className={`section ${styles.hero} ${styles.editorial}`}>
      <div className={styles.editorialGrid}>
        <Reveal kind={reveal} index={0} className={styles.rule}>
          <span className={styles.ruleNumber}>01</span>
          <span className={styles.ruleLine} />
        </Reveal>

        <Reveal kind={reveal} index={1}>
          <h1 className={`display ${styles.titleEditorial}`}>
            {content.titleTop}
            <br />
            <em>{content.titleBottom}</em>
          </h1>
        </Reveal>

        <div className={styles.editorialAside}>
          <Reveal kind={reveal} index={2}>
            <p className="eyebrow">{content.eyebrow}</p>
          </Reveal>
          {content.subtitle && (
            <Reveal kind={reveal} index={3}>
              <p className="body-text">{content.subtitle}</p>
            </Reveal>
          )}
        </div>

        {content.scrollLabel && (
          <ScrollCue label={content.scrollLabel} align="start" />
        )}
      </div>
    </section>
  );
}

function ScrollCue({ label, align = 'center' }: { label: string; align?: 'center' | 'start' }) {
  return (
    <div className={styles.scrollCue} data-align={align}>
      <span>{label}</span>
      <span className={styles.scrollArrow} aria-hidden="true">↓</span>
    </div>
  );
}
