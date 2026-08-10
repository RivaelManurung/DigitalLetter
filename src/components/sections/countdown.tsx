'use client';

import { useSyncExternalStore } from 'react';
import type { BlockContent } from '@/design/blocks';
import type { DesignSpec } from '@/design/types';
import { parseLocalDateTime } from '@/lib/utils';
import { Reveal } from '../engine/reveal';
import styles from './countdown.module.css';

/**
 * Satu detak bersama untuk semua countdown di halaman. Nilainya di-cache
 * supaya getSnapshot mengembalikan referensi yang sama sampai detik berganti
 * — kalau tidak, React menganggap store berubah tiap render.
 */
let cachedNow: number | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribeToTick(onChange: () => void): () => void {
  listeners.add(onChange);

  if (!timer) {
    cachedNow = Date.now();
    timer = setInterval(() => {
      cachedNow = Date.now();
      for (const listener of listeners) listener();
    }, 1000);
  }

  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
      cachedNow = null;
    }
  };
}

/**
 * Dipanggil juga sebelum subscribe pertama, jadi ia yang mengisi cache —
 * tanpa ini render klien pertama menampilkan placeholder selama satu detik.
 * Nilainya dibulatkan ke detik supaya stabil antar panggilan dalam render
 * yang sama.
 */
function getNow(): number | null {
  if (cachedNow === null) cachedNow = Date.now();
  return cachedNow;
}

/** Di server tidak ada jam yang boleh dipercaya — placeholder dulu. */
function getServerNow(): number | null {
  return null;
}

type Props = {
  content: BlockContent<'countdown'>;
  design: DesignSpec;
  variant: string;
};

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function remainingFrom(target: Date, now: number): Remaining | null {
  const diff = target.getTime() - now;
  if (diff <= 0) return null;

  const seconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  };
}

export function CountdownSection({ content, design, variant }: Props) {
  const reveal = design.motion.reveal;
  const target = parseLocalDateTime(content.targetAt);

  /**
   * Jam perangkat tidak boleh dibaca saat render server — hasilnya beda
   * dengan klien dan hidrasi gagal. useSyncExternalStore menyelesaikan ini
   * tepat: snapshot server selalu null (placeholder), klien berlangganan
   * detak per detik.
   */
  const now = useSyncExternalStore(subscribeToTick, getNow, getServerNow);

  if (!target) return null;

  const ready = now !== null;
  const remaining = ready ? remainingFrom(target, now) : null;

  const units: { value: number; label: string }[] = remaining
    ? [
        { value: remaining.days, label: 'Hari' },
        { value: remaining.hours, label: 'Jam' },
        { value: remaining.minutes, label: 'Menit' },
        ...(content.showSeconds ? [{ value: remaining.seconds, label: 'Detik' }] : []),
      ]
    : [];

  const layout =
    variant === 'minimal' ? styles.minimal : variant === 'ring' ? styles.ring : styles.boxes;

  return (
    <section className="section">
      <div className="section-inner">
        <Reveal kind={reveal} className={styles.header}>
          {content.eyebrow && <p className="eyebrow">{content.eyebrow}</p>}
          {content.title && <h2 className={`display ${styles.title}`}>{content.title}</h2>}
        </Reveal>

        <Reveal kind={reveal} index={1} className={styles.stage}>
          {!ready ? (
            <p className={styles.placeholder} aria-hidden="true">
              &nbsp;
            </p>
          ) : remaining ? (
            <ul className={`${styles.units} ${layout}`}>
              {units.map((unit) => (
                <li key={unit.label} className={styles.unit}>
                  <span className={styles.value}>
                    {String(unit.value).padStart(2, '0')}
                  </span>
                  <span className={styles.label}>{unit.label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`body-text ${styles.passed}`}>{content.passedLabel}</p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
