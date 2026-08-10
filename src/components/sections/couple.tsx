import Image from 'next/image';
import type { BlockContent } from '@/design/blocks';
import type { DesignSpec, MediaRecord } from '@/design/types';
import { renderLite } from '@/lib/utils';
import { Reveal } from '../engine/reveal';
import { FlowerMark } from '../graphics/flower-mark';
import styles from './couple.module.css';

type Props = {
  content: BlockContent<'couple'>;
  design: DesignSpec;
  variant: string;
  media: MediaRecord[];
};

type Person = {
  name: string;
  full: string;
  order: string;
  parents: string;
  photo: MediaRecord | undefined;
};

export function CoupleSection({ content, design, variant, media }: Props) {
  const reveal = design.motion.reveal;
  const photoOf = (id: string) => media.find((m) => m.id === id && m.kind === 'photo');

  const bride: Person = {
    name: content.brideName,
    full: content.brideFull,
    order: content.brideOrder,
    parents: content.brideParents,
    photo: photoOf(content.bridePhotoId),
  };

  const groom: Person = {
    name: content.groomName,
    full: content.groomFull,
    order: content.groomOrder,
    parents: content.groomParents,
    photo: photoOf(content.groomPhotoId),
  };

  if (!bride.name && !groom.name) return null;

  const layout =
    variant === 'stacked' ? styles.stacked : variant === 'ornate' ? styles.ornate : styles.facing;

  return (
    <section className="section">
      <div className="section-inner">
        <Reveal kind={reveal} className={styles.header}>
          {content.eyebrow && <p className="eyebrow">{content.eyebrow}</p>}
          {content.title && <h2 className={`display ${styles.title}`}>{content.title}</h2>}
          {content.intro && (
            <p
              className={`body-text ${styles.intro}`}
              dangerouslySetInnerHTML={{ __html: renderLite(content.intro) }}
            />
          )}
        </Reveal>

        <div className={`${styles.pair} ${layout}`}>
          <PersonCard person={bride} reveal={reveal} index={0} ornate={variant === 'ornate'} />

          <Reveal kind={reveal} index={1} className={styles.separator}>
            {variant === 'ornate' ? (
              <FlowerMark size={72} />
            ) : (
              <span className={styles.separatorMark}>{content.separator}</span>
            )}
          </Reveal>

          <PersonCard person={groom} reveal={reveal} index={2} ornate={variant === 'ornate'} />
        </div>
      </div>
    </section>
  );
}

function PersonCard({
  person,
  reveal,
  index,
  ornate,
}: {
  person: Person;
  reveal: DesignSpec['motion']['reveal'];
  index: number;
  ornate: boolean;
}) {
  if (!person.name && !person.full) return null;

  return (
    <Reveal kind={reveal} index={index} className={styles.person}>
      {person.photo && (
        <div className={`${styles.portrait} ${ornate ? styles.portraitOrnate : ''}`}>
          <Image
            src={person.photo.url}
            alt={person.full || person.name}
            fill
            sizes="(max-width: 720px) 60vw, 260px"
            className={styles.portraitImg}
          />
        </div>
      )}

      <h3 className={`display ${styles.name}`}>{person.name || person.full}</h3>
      {person.full && person.name && <p className={styles.fullName}>{person.full}</p>}
      {person.order && <p className={styles.order}>{person.order}</p>}
      {person.parents && <p className={styles.parents}>{person.parents}</p>}
    </Reveal>
  );
}
