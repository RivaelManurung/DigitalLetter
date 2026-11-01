/**
 * Musik latar sintetis. Semua melodi berasal dari komposisi domain publik
 * (tradisional / Pachelbel), dimainkan ulang oleh synth di browser — tidak
 * ada berkas audio, jadi tidak ada risiko hak cipta rekaman dan tidak ada
 * unduhan tambahan.
 */

export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  /** "NAMA_NOT:DURASI_BEAT", dipisah spasi; "R" = jeda */
  melody: string;
  /** "NOT,NOT,NOT:DURASI_BEAT" — dimainkan lembut di bawah melodi */
  chords?: string;
  /** baris lirik dan beat mulainya, ditampilkan di pemutar mengikuti lagu */
  lyrics?: { beat: number; text: string }[];
};

const CANON_ARPEGGIO =
  'F#4:.5 A4:.5 D5:.5 A4:.5 E4:.5 A4:.5 C#5:.5 A4:.5 D4:.5 F#4:.5 B4:.5 F#4:.5 ' +
  'C#4:.5 F#4:.5 A4:.5 F#4:.5 D4:.5 G4:.5 B4:.5 G4:.5 F#4:.5 A4:.5 D5:.5 A4:.5 ' +
  'D4:.5 G4:.5 B4:.5 G4:.5 E4:.5 A4:.5 C#5:.5 E5:.5';

const CANON_CHORDS =
  'D3,F#3,A3:2 A2,C#3,E3:2 B2,D3,F#3:2 F#2,A2,C#3:2 G2,B2,D3:2 D3,F#3,A3:2 G2,B2,D3:2 A2,C#3,E3:2';

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    // Lagu original untuk aplikasi ini — bebas dipakai, tanpa lisensi pihak ketiga.
    id: 'box-natal-kita',
    title: 'Natal Kita',
    artist: 'Lagu original · kotak musik',
    bpm: 88,
    melody:
      // bait
      'R:.5 D4:.5 G4:.5 G4:.5 A4:.5 B4:.5 B4:1 A4:1 G4:.5 E4:.5 G4:1 E4:1 ' +
      'R:.5 E4:.5 G4:.5 G4:.5 C5:.5 B4:.5 A4:1 A4:.5 A4:.5 B4:.5 A4:.5 F#4:1 D4:1 ' +
      'R:.5 D4:.5 G4:.5 B4:.5 D5:1.5 B4:.5 C5:.5 B4:.5 A4:.5 G4:.5 E4:1 G4:1 ' +
      'A4:.5 B4:.5 C5:.5 B4:.5 A4:.5 G4:.5 F#4:.5 A4:.5 G4:1 F#4:.5 G4:2.5 ' +
      // reff
      'E5:1 D5:.5 C5:.5 D5:1 E5:1 D5:.5 B4:.5 G4:.5 A4:.5 B4:1 G4:1 ' +
      'C5:1 B4:.5 A4:.5 C5:1 E5:1 D5:1.5 A4:.5 B4:.5 A4:.5 F#4:1 ' +
      'E5:.5 E5:.5 E5:.5 D5:.5 C5:1 E5:1 D5:1 B4:1 G4:2 ' +
      'C5:.5 C5:.5 C5:1 B4:.5 A4:.5 D5:1 B4:.5 A4:.5 G4:3',
    chords:
      'G2,D3,B3:4 E2,B2,G3:4 C3,E3,G3:4 D3,F#3,A3:4 G2,D3,B3:4 E2,B2,G3:4 A2,C3,E3:2 D3,F#3,A3:2 G2,D3,B3:4 ' +
      'C3,E3,G3:4 G2,D3,B3:4 A2,C3,E3:4 D3,F#3,A3:4 C3,E3,G3:4 B2,D3,G3:4 A2,C3,E3:2 D3,F#3,A3:2 G2,D3,B3:4',
    lyrics: [
      { beat: 0, text: 'Lampu kecil berkelip di jendela' },
      { beat: 8, text: 'Salju turun walau hanya dalam mimpi' },
      { beat: 16, text: 'Kau di sini, hangatkan malam sunyi' },
      { beat: 24, text: 'Tak ada kado seindah hadirmu' },
      { beat: 32, text: 'Natal kita, sederhana saja' },
      { beat: 40, text: 'Cukup kau dan aku, dan doa' },
      { beat: 48, text: 'Bila lonceng berbunyi nanti' },
      { beat: 56, text: 'Kupeluk kamu, selamanya' },
    ],
  },
  {
    id: 'box-canon-d',
    title: 'Canon in D (kotak musik)',
    artist: 'Pachelbel · kotak musik',
    bpm: 66,
    melody:
      'F#5:2 E5:2 D5:2 C#5:2 B4:2 A4:2 B4:2 C#5:2 ' + CANON_ARPEGGIO,
    chords: `${CANON_CHORDS} ${CANON_CHORDS}`,
  },
  {
    id: 'box-silent-night',
    title: 'Silent Night (kotak musik)',
    artist: 'Tradisional · kotak musik',
    bpm: 84,
    melody:
      'G4:1.5 A4:.5 G4:1 E4:3 G4:1.5 A4:.5 G4:1 E4:3 D5:2 D5:1 B4:3 C5:2 C5:1 G4:3 ' +
      'A4:2 A4:1 C5:1.5 B4:.5 A4:1 G4:1.5 A4:.5 G4:1 E4:3 A4:2 A4:1 C5:1.5 B4:.5 A4:1 ' +
      'G4:1.5 A4:.5 G4:1 E4:3 D5:2 D5:1 F5:1.5 D5:.5 B4:1 C5:3 E5:3 C5:1 G4:1 E4:1 ' +
      'G4:1.5 F4:.5 D4:1 C4:3',
  },
  {
    id: 'box-jingle-bells',
    title: 'Jingle Bells (kotak musik)',
    artist: 'J. Pierpont · kotak musik',
    bpm: 132,
    melody:
      'B4:1 B4:1 B4:2 B4:1 B4:1 B4:2 B4:1 D5:1 G4:1.5 A4:.5 B4:4 ' +
      'C5:1 C5:1 C5:1.5 C5:.5 C5:1 B4:1 B4:1 B4:.5 B4:.5 B4:1 A4:1 A4:1 B4:1 A4:2 D5:2',
  },
  {
    id: 'box-merry-christmas',
    title: 'We Wish You a Merry Christmas (kotak musik)',
    artist: 'Tradisional · kotak musik',
    bpm: 120,
    melody:
      'D4:1 G4:1 G4:.5 A4:.5 G4:.5 F#4:.5 E4:1 E4:1 E4:1 A4:1 A4:.5 B4:.5 A4:.5 G4:.5 ' +
      'F#4:1 D4:1 D4:1 B4:1 B4:.5 C5:.5 B4:.5 A4:.5 G4:1 E4:1 D4:.5 D4:.5 E4:1 A4:1 ' +
      'F#4:1 G4:2',
  },
];

export function getTrack(id: string | undefined): MusicTrack | null {
  return MUSIC_TRACKS.find((t) => t.id === id) ?? null;
}

/**
 * Rekaman asli di public/music. Sumber & lisensi tiap berkas dicatat di
 * public/music/CREDITS.md — lagu CC BY wajib menampilkan kreditnya di `artist`.
 */
export type AudioTrack = { id: string; title: string; artist: string; src: string };

export const AUDIO_TRACKS: AudioTrack[] = [
  { id: 'silent-night', title: 'Silent Night', artist: 'U.S. Air Force Band', src: '/music/silent-night.mp3' },
  { id: 'o-holy-night', title: 'O Holy Night', artist: 'U.S. Air Force Band', src: '/music/o-holy-night.mp3' },
  { id: 'jingle-bells', title: 'Jingle Bells', artist: 'U.S. Air Force Band', src: '/music/jingle-bells.mp3' },
  { id: 'merry-christmas', title: 'We Wish You a Merry Christmas', artist: 'U.S. Air Force Band', src: '/music/merry-christmas.mp3' },
  { id: 'carol-of-the-bells', title: 'Carol of the Bells', artist: 'U.S. Air Force Band', src: '/music/carol-of-the-bells.mp3' },
  { id: 'canon-d', title: 'Canon in D', artist: 'Kevin MacLeod · CC BY 3.0', src: '/music/canon-in-d.mp3' },
  { id: 'clair-de-lune', title: 'Clair de Lune', artist: 'Debussy · domain publik', src: '/music/clair-de-lune.mp3' },
];

export function getAudioTrack(id: string | undefined): AudioTrack | null {
  return AUDIO_TRACKS.find((t) => t.id === id) ?? null;
}

/** Daftar putar: lagu terpilih dulu, lalu sisanya — tombol "berikutnya" tetap berguna. */
export function playlistFrom(id: string): AudioTrack[] {
  const first = getAudioTrack(id);
  return first ? [first, ...AUDIO_TRACKS.filter((t) => t.id !== id)] : [];
}

export type NoteEvent = { midi: number[]; start: number; beats: number };

const SEMITONE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** "F#4" → nomor MIDI (C4 = 60). Melempar error pada not yang tidak valid. */
export function noteToMidi(note: string): number {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(note);
  if (!m) throw new Error(`Not tidak valid: "${note}"`);
  const accidental = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  return 12 * (Number(m[3]) + 1) + SEMITONE[m[1]] + accidental;
}

/** Mengurai deret "NOT:DURASI" menjadi event berwaktu (satuan beat). */
export function parseSequence(source: string): { events: NoteEvent[]; total: number } {
  let cursor = 0;
  const events: NoteEvent[] = [];

  for (const token of source.trim().split(/\s+/)) {
    const [names, dur] = token.split(':');
    const beats = Number(dur);
    if (!names || !(beats > 0)) throw new Error(`Token tidak valid: "${token}"`);
    if (names !== 'R') {
      events.push({ midi: names.split(',').map(noteToMidi), start: cursor, beats });
    }
    cursor += beats;
  }

  return { events, total: cursor };
}
