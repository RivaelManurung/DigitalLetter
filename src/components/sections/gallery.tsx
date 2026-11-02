import Image from 'next/image';
import type { SectionContent } from '@/design/schemas';
import type { DesignSpec, MediaRecord } from '@/design/types';
import { Reveal } from '../engine/reveal';
import styles from './gallery.module.css';

type Props = {
  content: SectionContent<'gallery'>;
  design: DesignSpec;
  media: MediaRecord[];
  variant: string;
};

export function GallerySection({ content, design, media, variant }: Props) {
  const reveal = design.motion.reveal;

  const photos = content.mediaIds.length
    ? content.mediaIds
        .map((id) => media.find((m) => m.id === id))
        .filter((m): m is MediaRecord => Boolean(m))
    : media.filter((m) => m.kind === 'photo');

  if (!photos.length) return null;

  const layout = styles[variant] ?? styles.grid;

  return (
    <section className="section">
      <div className="section-inner">
        <Reveal kind={reveal} className={styles.header}>
          {content.eyebrow && <p className="eyebrow">{content.eyebrow}</p>}
          {content.title && (
            <h2 className={`display ${styles.title}`}>{content.title}</h2>
          )}
        </Reveal>

        <ul className={`${styles.gallery} ${layout}`}>
          {photos.map((photo, i) => (
            <Reveal
              as="li"
              kind={reveal}
              index={i}
              key={photo.id}
              className={`${styles.item} hover-lift`}
            >
              <figure className={styles.figure}>
                <div className={`${styles.frame} photo-develop`}>
                  <Image
                    src={photo.url}
                    alt={photo.caption ?? `Foto ${i + 1}`}
                    fill
                    sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 30vw"
                    className={styles.img}
                    // hanya foto pertama yang prioritas — sisanya lazy
                    priority={i === 0}
                  />
                </div>
                {photo.caption && (
                  <figcaption className={styles.caption}>{photo.caption}</figcaption>
                )}
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
