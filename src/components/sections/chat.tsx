'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { BlockContent } from '@/design/blocks';
import type { DesignSpec, MediaRecord } from '@/design/types';
import { Reveal, scrollRoot } from '../engine/reveal';
import { CHAT_WALLPAPERS } from '@/design/theme-images';
import styles from './chat.module.css';

type Props = {
  content: BlockContent<'chat'>;
  design: DesignSpec;
  variant: string;
  media: MediaRecord[];
};

/** jeda mengetik ~ panjang pesan, dibatasi supaya tidak membosankan */
const typingMs = (text: string) => Math.min(2200, Math.max(650, text.length * 38));
const REPLY_MS = 750;

export function ChatSection({ content, design, variant, media }: Props) {
  const reveal = design.motion.reveal;
  const messages = useMemo(() => content.messages.filter((m) => m.text), [content.messages]);
  const photo = media.find((m) => m.id === content.photoId && m.kind === 'photo');

  const rootRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [shown, setShown] = useState(0);
  const [run, setRun] = useState(0);

  // Mulai saat ponsel terlihat di layar, bukan saat halaman dimuat.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { root: scrollRoot(el), threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started || shown >= messages.length) return;
    const next = messages[shown];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wait = reduce
      ? 0
      : (next.from === 'aku' ? typingMs(next.text) : REPLY_MS) * design.motion.speed;
    const t = window.setTimeout(() => setShown((n) => n + 1), wait);
    return () => window.clearTimeout(t);
    // `run` memulai ulang urutan saat tombol "Putar ulang" ditekan
  }, [started, shown, messages, design.motion.speed, run]);

  const typing = started && shown < messages.length && messages[shown].from === 'aku';

  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTo({ top: thread.scrollHeight, behavior: 'smooth' });
  }, [shown, typing]);

  if (!messages.length) return null;

  const done = shown >= messages.length;
  const initial = (content.contactName || 'A').trim().charAt(0).toUpperCase();

  function replay() {
    setShown(0);
    setStarted(true);
    setRun((n) => n + 1);
  }

  return (
    <section className="section">
      <div className="section-inner">
        {(content.eyebrow || content.title) && (
          <Reveal kind={reveal} className={styles.header}>
            {content.eyebrow && <p className="eyebrow">{content.eyebrow}</p>}
            {content.title && <h2 className={`display ${styles.title}`}>{content.title}</h2>}
          </Reveal>
        )}

        <div
          ref={rootRef}
          className={`${styles.device} ${variant === 'plain' ? styles.plain : styles.phone}`}
        >
          <header className={styles.bar}>
            <span className={styles.avatar} aria-hidden="true">
              {photo ? (
                <Image src={photo.url} alt="" fill sizes="40px" className={styles.avatarImg} />
              ) : (
                initial
              )}
            </span>
            <span className={styles.who}>
              <span className={styles.name}>{content.contactName}</span>
              <span className={styles.status}>{typing ? 'sedang mengetik…' : content.contactStatus}</span>
            </span>
          </header>

          <div
            ref={threadRef}
            className={styles.thread}
            style={
              content.wallpaper
                ? { backgroundImage: `url(${CHAT_WALLPAPERS[content.wallpaper as keyof typeof CHAT_WALLPAPERS]})` }
                : undefined
            }
            role="log"
            aria-live="polite"
            onClick={() => !done && setShown(messages.length)}
          >
            {messages.slice(0, shown).map((m, i) => (
              <p
                key={`${run}-${i}`}
                className={`${styles.bubble} ${m.from === 'aku' ? styles.in : styles.out}`}
              >
                {m.text}
                {m.from === 'kamu' && (
                  <span className={styles.read} aria-label="dibaca">
                    ✓✓
                  </span>
                )}
              </p>
            ))}

            {typing && (
              <p className={`${styles.bubble} ${styles.in} ${styles.typing}`} aria-label="sedang mengetik">
                <span />
                <span />
                <span />
              </p>
            )}
          </div>

          <footer className={styles.foot}>
            {done ? (
              <button type="button" className={styles.replay} onClick={replay}>
                Putar ulang
              </button>
            ) : (
              <span className={styles.skipHint}>{started ? 'ketuk untuk mempercepat' : ''}</span>
            )}
          </footer>
        </div>
      </div>
    </section>
  );
}
