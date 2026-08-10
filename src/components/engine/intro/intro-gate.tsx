'use client';

import { useEffect, useState } from 'react';
import { GiftBox } from './gift-box';
import styles from './intro.module.css';

type Props = {
  variant: string;
  hint: string;
  label: string;
  onOpen: () => void;
};

/**
 * Gerbang pembuka. Selain sebagai dramaturgi, ini juga menyelesaikan masalah
 * teknis nyata: browser memblokir autoplay audio sampai ada interaksi
 * pengguna. Satu ketukan di sini memberi izin itu sekaligus membuka surat.
 */
export function IntroGate({ variant, hint, label, onOpen }: Props) {
  const [opening, setOpening] = useState(false);
  const [gone, setGone] = useState(false);

  function open() {
    if (opening) return;
    setOpening(true);
    onOpen();
  }

  useEffect(() => {
    if (!opening) return;
    const timer = setTimeout(() => setGone(true), 2200);
    return () => clearTimeout(timer);
  }, [opening]);

  useEffect(() => {
    document.body.style.overflow = gone ? '' : 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [gone]);

  if (gone) return null;

  return (
    <div className={`intro-gate ${opening ? 'is-opening' : ''}`}>
      <button
        type="button"
        className="intro-trigger"
        onClick={open}
        aria-label={label || 'Buka surat'}
      >
        {variant === 'envelope' && <Envelope opening={opening} />}
        {variant === 'curtain' && <Curtain opening={opening} />}
        {variant !== 'envelope' && variant !== 'curtain' && (
          <GiftBox opening={opening} />
        )}

        {label && (
          <p
            className="display"
            style={{ fontSize: 'var(--text-lg)', marginTop: 'var(--space-lg)' }}
          >
            {label}
          </p>
        )}
        {!opening && hint && <p className="intro-hint">{hint}</p>}
      </button>
    </div>
  );
}

function Envelope({ opening }: { opening: boolean }) {
  return (
    <div className={`${styles.envelope} ${opening ? styles.envOpen : ''}`}>
      <div className={styles.envBody} />
      <span className={styles.envLetter} />
      <span className={styles.envFlap} />
      <span className={styles.envSeal} />
    </div>
  );
}

function Curtain({ opening }: { opening: boolean }) {
  return (
    <>
      <div className={`${styles.curtain} ${opening ? styles.curtainOpen : ''}`}>
        <div className={`${styles.curtainPanel} ${styles.curtainLeft}`} />
        <div className={`${styles.curtainPanel} ${styles.curtainRight}`} />
      </div>
      <div className={`${opening ? styles.curtainOpen : ''}`}>
        <div className={styles.curtainMark} />
      </div>
    </>
  );
}
