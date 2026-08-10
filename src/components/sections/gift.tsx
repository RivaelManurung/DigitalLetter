'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { BlockContent } from '@/design/blocks';
import type { DesignSpec } from '@/design/types';
import { renderLite } from '@/lib/utils';
import { Reveal } from '../engine/reveal';
import styles from './gift.module.css';

type Props = {
  content: BlockContent<'gift'>;
  design: DesignSpec;
  variant: string;
};

export function GiftSection({ content, design, variant }: Props) {
  const reveal = design.motion.reveal;
  const accounts = content.accounts.filter((a) => a.number || a.provider);

  if (!accounts.length && !content.address) return null;

  const layout =
    variant === 'list' ? styles.list : variant === 'envelope' ? styles.envelope : styles.cards;

  return (
    <section className="section">
      <div className="section-inner">
        <Reveal kind={reveal} className={styles.header}>
          {content.eyebrow && <p className="eyebrow">{content.eyebrow}</p>}
          {content.title && <h2 className={`display ${styles.title}`}>{content.title}</h2>}
          {content.note && (
            <p
              className={`body-text ${styles.note}`}
              dangerouslySetInnerHTML={{ __html: renderLite(content.note) }}
            />
          )}
        </Reveal>

        {accounts.length > 0 && (
          <ul className={`${styles.accounts} ${layout}`}>
            {accounts.map((account, i) => (
              <Reveal
                as="li"
                kind={reveal}
                index={i}
                key={i}
                className={`glass ${styles.account}`}
              >
                {account.provider && (
                  <span className={styles.provider}>{account.provider}</span>
                )}
                {account.number && <span className={styles.number}>{account.number}</span>}
                {account.holder && <span className={styles.holder}>a.n. {account.holder}</span>}

                {account.number && <CopyButton value={account.number} />}
              </Reveal>
            ))}
          </ul>
        )}

        {content.address && (
          <Reveal kind={reveal} index={accounts.length} className={styles.addressBox}>
            <span className={styles.addressLabel}>{content.addressLabel}</span>
            <p
              className={styles.address}
              dangerouslySetInnerHTML={{ __html: renderLite(content.address) }}
            />
            <CopyButton value={content.address} />
          </Reveal>
        )}
      </div>
    </section>
  );
}

/**
 * Menyalin ke papan klip. navigator.clipboard butuh konteks aman (https);
 * kalau ditolak, tombol tidak berpura-pura berhasil — teksnya tetap bisa
 * disorot dan disalin manual.
 */
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" onClick={copy} className={styles.copy}>
      {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
      {copied ? 'Tersalin' : 'Salin'}
    </button>
  );
}
