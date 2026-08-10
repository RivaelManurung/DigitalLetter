'use client';

import { useState, useTransition } from 'react';
import type { BlockContent } from '@/design/blocks';
import type { DesignSpec } from '@/design/types';
import { submitRsvp } from '@/lib/actions/rsvp';
import { renderLite } from '@/lib/utils';
import { Reveal } from '../engine/reveal';
import styles from './rsvp.module.css';

type Props = {
  content: BlockContent<'rsvp'>;
  design: DesignSpec;
  variant: string;
  letterId: string;
};

type Attendance = 'yes' | 'no' | 'maybe';

export function RsvpSection({ content, design, variant, letterId }: Props) {
  const reveal = design.motion.reveal;

  const [name, setName] = useState('');
  const [attendance, setAttendance] = useState<Attendance>('yes');
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  // Di preview dashboard belum ada surat terbit — kirimannya akan ditolak
  // server, jadi formulir sengaja dinonaktifkan supaya tidak membingungkan.
  const isPreview = !letterId;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nama wajib diisi.');
      return;
    }

    start(async () => {
      const result = await submitRsvp({
        letterId,
        name,
        attendance,
        guests,
        message,
      });

      if (result.ok) setSent(true);
      else setError(result.error);
    });
  }

  const options: { value: Attendance; label: string }[] = [
    { value: 'yes', label: content.yesLabel },
    { value: 'no', label: content.noLabel },
    { value: 'maybe', label: content.maybeLabel },
  ].filter((option) => option.label) as { value: Attendance; label: string }[];

  const layout =
    variant === 'inline' ? styles.inline : variant === 'minimal' ? styles.minimal : styles.card;

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

        <Reveal kind={reveal} index={1} className={`${styles.shell} ${layout}`}>
          {sent ? (
            <div className={styles.thanks} role="status">
              <h3 className={`display ${styles.thanksTitle}`}>{content.thanksTitle}</h3>
              {content.thanksBody && (
                <p
                  className="body-text"
                  dangerouslySetInnerHTML={{ __html: renderLite(content.thanksBody) }}
                />
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <label className={styles.field}>
                <span className={styles.label}>{content.nameLabel}</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  required
                  className={styles.input}
                />
              </label>

              <fieldset className={styles.field}>
                <legend className={styles.label}>{content.attendanceLabel}</legend>
                <div className={styles.choices}>
                  {options.map((option) => (
                    <label
                      key={option.value}
                      className={styles.choice}
                      data-active={attendance === option.value}
                    >
                      <input
                        type="radio"
                        name="attendance"
                        value={option.value}
                        checked={attendance === option.value}
                        onChange={() => setAttendance(option.value)}
                        className={styles.radio}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              {content.showGuestCount && attendance === 'yes' && (
                <label className={styles.field}>
                  <span className={styles.label}>{content.guestLabel}</span>
                  <input
                    type="number"
                    min={1}
                    max={content.maxGuests}
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value) || 1)}
                    className={styles.input}
                  />
                </label>
              )}

              {content.showMessage && (
                <label className={styles.field}>
                  <span className={styles.label}>{content.messageLabel}</span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={600}
                    rows={3}
                    className={styles.textarea}
                  />
                </label>
              )}

              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending || isPreview}
                className={styles.submit}
              >
                {pending ? 'Mengirim…' : content.submitLabel}
              </button>

              {isPreview && (
                <p className={styles.hint}>
                  Formulir aktif setelah surat diterbitkan.
                </p>
              )}
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
