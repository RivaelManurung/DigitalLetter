import Image from 'next/image';
import { MapPin } from 'lucide-react';
import type { FieldSpec, LeafSpec } from '@/design/blocks/kit';
import { isListSpec } from '@/design/blocks/kit';
import type { DesignSpec, MediaRecord } from '@/design/types';
import { formatEventDay, formatEventRange, renderLite } from '@/lib/utils';
import { Reveal } from '../engine/reveal';
import { IconGlyph } from '../graphics/icon-glyph';
import styles from './custom.module.css';

type Props = {
  content: Record<string, unknown>;
  design: DesignSpec;
  variant: string;
  media: MediaRecord[];
  /** spec field block ini — dibawa dari registry, bukan ditebak dari konten */
  fields: FieldSpec[];
};

/**
 * Perender tunggal untuk semua block bikinan sendiri.
 *
 * Tidak ada komponen per block: tampilan ditentukan oleh spec field-nya.
 * Field daftar jadi kumpulan kartu/baris; field biasa jadi baris keterangan.
 * Karena itu satu berkas ini melayani berapa pun jenis section yang dibuat
 * user, tanpa deploy ulang.
 */
export function CustomSection({ content, design, variant, media, fields }: Props) {
  const reveal = design.motion.reveal;

  const eyebrow = String(content.eyebrow ?? '');
  const title = String(content.title ?? '');

  // Field kepala (eyebrow/title) sudah dirender terpisah.
  const body = fields.filter((f) => f.key !== 'eyebrow' && f.key !== 'title');
  const lists = body.filter(isListSpec);
  const leaves = body.filter((f): f is LeafSpec => !isListSpec(f));

  const hasContent =
    title ||
    leaves.some((f) => hasValue(content[f.key])) ||
    lists.some((f) => (content[f.key] as unknown[] | undefined)?.length);

  if (!hasContent) return null;

  const layout = layoutClass(variant);

  return (
    <section className="section">
      <div className="section-inner">
        {(eyebrow || title) && (
          <Reveal kind={reveal} className={styles.header}>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2 className={`display ${styles.title}`}>{title}</h2>}
          </Reveal>
        )}

        {leaves.length > 0 && (
          <Reveal kind={reveal} index={1} className={styles.lead}>
            {leaves.map((field) => (
              <FieldValue
                key={field.key}
                field={field}
                value={content[field.key]}
                media={media}
                standalone
              />
            ))}
          </Reveal>
        )}

        {lists.map((list) => {
          const items = Array.isArray(content[list.key])
            ? (content[list.key] as Record<string, unknown>[])
            : [];
          if (!items.length) return null;

          return (
            <ul key={list.key} className={`${styles.items} ${layout}`}>
              {items.map((item, i) => (
                <Reveal
                  as="li"
                  kind={reveal}
                  index={i}
                  key={i}
                  className={`${styles.item} ${variant === 'cards' ? 'glass' : ''}`}
                >
                  {list.fields.map((field) => (
                    <FieldValue
                      key={field.key}
                      field={field}
                      value={item[field.key]}
                      media={media}
                    />
                  ))}
                </Reveal>
              ))}
            </ul>
          );
        })}
      </div>
    </section>
  );
}

function layoutClass(variant: string): string {
  switch (variant) {
    case 'list':
      return styles.list;
    case 'timeline':
      return styles.timeline;
    case 'spotlight':
      return styles.spotlight;
    case 'centered':
      return styles.centered;
    case 'large':
      return styles.large;
    case 'split':
      return styles.split;
    case 'stacked':
      return styles.stacked;
    case 'cards':
    default:
      return styles.cards;
  }
}

function hasValue(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'boolean') return value;
  return true;
}

/**
 * Satu nilai field. Bentuk tampilannya ditentukan `kind` — tanggal jadi
 * teks berformat, foto jadi gambar, ya/tidak jadi penanda, dan seterusnya.
 */
function FieldValue({
  field,
  value,
  media,
  standalone,
}: {
  field: LeafSpec;
  value: unknown;
  media: MediaRecord[];
  standalone?: boolean;
}) {
  if (!hasValue(value)) return null;

  switch (field.kind) {
    case 'photo': {
      const photo = media.find((m) => m.id === value && m.kind === 'photo');
      if (!photo) return null;
      return (
        <div className={styles.photo}>
          <Image
            src={photo.url}
            alt={photo.caption ?? field.label}
            fill
            sizes="(max-width: 720px) 88vw, 340px"
            className={styles.photoImg}
          />
        </div>
      );
    }

    case 'photos': {
      const ids = Array.isArray(value) ? (value as string[]) : [];
      const photos = ids
        .map((id) => media.find((m) => m.id === id && m.kind === 'photo'))
        .filter((m): m is MediaRecord => Boolean(m));
      if (!photos.length) return null;

      return (
        <div className={styles.photoGrid}>
          {photos.map((photo) => (
            <div key={photo.id} className={styles.photoCell}>
              <Image
                src={photo.url}
                alt={photo.caption ?? ''}
                fill
                sizes="(max-width: 720px) 45vw, 220px"
                className={styles.photoImg}
              />
            </div>
          ))}
        </div>
      );
    }

    case 'datetime': {
      const day = formatEventDay(String(value));
      const time = formatEventRange(String(value), '');
      if (!day) return null;
      return (
        <p className={styles.datetime}>
          <span className={styles.day}>{day}</span>
          {time && <span className={styles.time}>{time}</span>}
        </p>
      );
    }

    case 'switch':
      return value ? <span className={styles.badge}>{field.label}</span> : null;

    case 'longtext':
      return (
        <p
          className={standalone ? `body-text ${styles.lead}` : styles.text}
          dangerouslySetInnerHTML={{ __html: renderLite(String(value)) }}
        />
      );

    case 'select': {
      const raw = String(value);
      // Pilihan dari daftar ikon dirender sebagai gambar, bukan namanya.
      const isGlyph = field.options?.some((o) => o.value === raw && o.label !== raw);
      if (isGlyph) {
        return (
          <span className={styles.glyph}>
            <IconGlyph name={raw} size={30} />
          </span>
        );
      }
      return <span className={styles.tag}>{raw}</span>;
    }

    case 'number':
      return (
        <p className={styles.number}>
          <span className={styles.numberValue}>{String(value)}</span>
          <span className={styles.numberLabel}>{field.label}</span>
        </p>
      );

    case 'text':
    default: {
      const raw = String(value);
      // URL ditampilkan sebagai tautan, bukan teks panjang yang memotong tata letak.
      if (/^https?:\/\//i.test(raw)) {
        return (
          <a
            href={raw}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            <MapPin size={13} aria-hidden="true" />
            {field.label}
          </a>
        );
      }
      return <p className={standalone ? styles.leadText : styles.itemTitle}>{raw}</p>;
    }
  }
}
