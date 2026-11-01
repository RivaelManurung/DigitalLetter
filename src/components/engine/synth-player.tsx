'use client';

import { useEffect, useRef, useState } from 'react';
import { Music, Pause, Play, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { MUSIC_TRACKS } from '@/design/music-tracks';
import { SynthEngine } from './synth-engine';
import styles from './music-player.module.css';

type Props = {
  trackId: string;
  /** dinyalakan oleh IntroGate — audio hanya sah setelah interaksi user */
  unlocked: boolean;
};

const VOLUME = 0.7;

export function SynthPlayer({ trackId, unlocked }: Props) {
  const engineRef = useRef<SynthEngine | null>(null);
  const [index, setIndex] = useState(() =>
    Math.max(0, MUSIC_TRACKS.findIndex((t) => t.id === trackId)),
  );
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [line, setLine] = useState('');

  const track = MUSIC_TRACKS[index] ?? MUSIC_TRACKS[0];

  useEffect(() => {
    const engine = new SynthEngine();
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setTrack(track);
  }, [track]);

  useEffect(() => {
    if (!unlocked) return;
    let cancelled = false;
    void (async () => {
      try {
        await engineRef.current?.play();
        if (!cancelled) setPlaying(true);
      } catch {
        // Browser masih memblokir — user bisa menekan tombol putar manual.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [unlocked]);

  // Tab disembunyikan → jeda, supaya tidak berbunyi di latar belakang
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        engineRef.current?.pause();
        setPlaying(false);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Lirik mengikuti posisi lagu; dicek 4x per detik, cukup untuk ganti baris tiap ~5 detik.
  useEffect(() => {
    const lyrics = track.lyrics;
    if (!playing || !lyrics?.length) return;
    const timer = window.setInterval(() => {
      const beat = engineRef.current?.currentBeat() ?? -1;
      const current = [...lyrics].reverse().find((l) => beat >= l.beat);
      setLine(beat < 0 ? '' : (current?.text ?? ''));
    }, 250);
    return () => window.clearInterval(timer);
  }, [playing, track]);

  async function toggle() {
    const engine = engineRef.current;
    if (!engine) return;
    if (playing) {
      engine.pause();
      setPlaying(false);
    } else {
      try {
        await engine.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    }
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    engineRef.current?.setVolume(next ? 0 : VOLUME);
  }

  return (
    <div className={`${styles.player} ${expanded ? styles.expanded : ''}`}>
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
          <span className={styles.title}>{track.title}</span>
          <span className={styles.artist} aria-live="off">
            {track.lyrics?.length && playing && line ? `♪ ${line}` : track.artist}
          </span>
        </div>

        <div className={styles.controls}>
          <button type="button" onClick={() => void toggle()} aria-label={playing ? 'Jeda' : 'Putar'}>
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % MUSIC_TRACKS.length)}
            aria-label="Lagu berikutnya"
          >
            <SkipForward size={15} />
          </button>
          <button type="button" onClick={toggleMute} aria-label={muted ? 'Nyalakan suara' : 'Bisukan'}>
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}
