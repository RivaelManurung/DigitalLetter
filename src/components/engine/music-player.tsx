'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Music, Pause, Play, SkipForward, Volume2, VolumeX } from 'lucide-react';
import type { MediaRecord } from '@/design/types';
import styles from './music-player.module.css';

type Props = {
  tracks: MediaRecord[];
  /** dinyalakan oleh IntroGate — autoplay hanya sah setelah interaksi user */
  unlocked: boolean;
};

type TrackMeta = {
  title?: string;
  artist?: string;
  startTime?: number;
  endTime?: number;
};

const FADE_MS = 1800;

export function MusicPlayer({ tracks, unlocked }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeRef = useRef<number | null>(null);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const track = tracks[index];
  const meta = (track?.meta ?? {}) as TrackMeta;
  const volume = 0.75;

  /** Fade manual: <audio> tidak punya fade bawaan, dan potong mendadak terdengar kasar. */
  const fadeTo = useCallback((target: number, done?: () => void) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (fadeRef.current) cancelAnimationFrame(fadeRef.current);

    const from = audio.volume;
    const start = performance.now();

    const step = (now: number) => {
      const t = Math.min((now - start) / FADE_MS, 1);
      audio.volume = from + (target - from) * t;
      if (t < 1) {
        fadeRef.current = requestAnimationFrame(step);
      } else {
        fadeRef.current = null;
        done?.();
      }
    };

    fadeRef.current = requestAnimationFrame(step);
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.volume = 0;
      await audio.play();
      setPlaying(true);
      fadeTo(muted ? 0 : volume);
    } catch {
      // Browser masih memblokir — biarkan user menekan tombol play manual.
      setPlaying(false);
    }
  }, [fadeTo, muted]);

  const pause = useCallback(() => {
    fadeTo(0, () => {
      audioRef.current?.pause();
      setPlaying(false);
    });
  }, [fadeTo]);

  const next = useCallback(() => {
    if (tracks.length < 2) return;
    fadeTo(0, () => setIndex((i) => (i + 1) % tracks.length));
  }, [fadeTo, tracks.length]);

  // Mulai otomatis begitu intro dibuka. play() sengaja di-await agar
  // perubahan state terjadi setelah promise, bukan sinkron di dalam effect.
  useEffect(() => {
    if (!unlocked || !track) return;

    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (!cancelled) await play();
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, index]);

  // Loop di titik yang ditentukan, bukan hanya di akhir file
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      if (meta.endTime && audio.currentTime >= meta.endTime) {
        audio.currentTime = meta.startTime ?? 0;
      }
    };
    const onEnded = () => (tracks.length > 1 ? next() : undefined);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, [meta.endTime, meta.startTime, next, tracks.length]);

  useEffect(() => {
    return () => {
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
    };
  }, []);

  if (!track) return null;

  function toggleMute() {
    const nextMuted = !muted;
    setMuted(nextMuted);
    fadeTo(nextMuted ? 0 : volume);
  }

  return (
    <div className={`${styles.player} ${expanded ? styles.expanded : ''}`}>
      <audio
        ref={audioRef}
        src={track.url}
        preload="none"
        onLoadedMetadata={(e) => {
          if (meta.startTime) e.currentTarget.currentTime = meta.startTime;
        }}
      />

      <button
        type="button"
        className={styles.toggle}
        onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? 'Sembunyikan pemutar musik' : 'Tampilkan pemutar musik'}
        aria-expanded={expanded}
      >
        <Music size={17} aria-hidden="true" />
      </button>

      <div className={styles.panel}>
        <div className={styles.meta}>
          <span className={styles.title}>{meta.title ?? 'Untitled'}</span>
          <span className={styles.artist}>{meta.artist ?? ''}</span>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            onClick={() => (playing ? pause() : void play())}
            aria-label={playing ? 'Jeda' : 'Putar'}
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>

          {tracks.length > 1 && (
            <button type="button" onClick={next} aria-label="Lagu berikutnya">
              <SkipForward size={15} />
            </button>
          )}

          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? 'Nyalakan suara' : 'Bisukan'}
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}
