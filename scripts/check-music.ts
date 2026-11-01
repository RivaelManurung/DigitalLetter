import { MUSIC_TRACKS, noteToMidi, parseSequence } from '../src/design/music-tracks';

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(noteToMidi('C4') === 60, 'C4 harus 60');
assert(noteToMidi('F#5') === 78, 'F#5 harus 78');
assert(noteToMidi('Bb3') === 58, 'Bb3 harus 58');

for (const t of MUSIC_TRACKS) {
  const melody = parseSequence(t.melody);
  assert(melody.events.length > 8, `${t.id}: melodi terlalu pendek`);
  if (t.chords) {
    const chords = parseSequence(t.chords);
    assert(chords.total === melody.total, `${t.id}: akor ${chords.total} beat ≠ melodi ${melody.total} beat`);
  }
  if (t.lyrics) {
    t.lyrics.forEach((l, i) => {
      assert(l.beat < melody.total, `${t.id}: lirik "${l.text}" melewati akhir lagu`);
      if (i) assert(l.beat > t.lyrics![i - 1].beat, `${t.id}: urutan lirik salah`);
    });
  }
  console.log(`ok ${t.id}: ${melody.events.length} not, ${melody.total} beat`);
}

import { designSchema } from '../src/design/schemas';
import { DESIGN_PRESETS } from '../src/design/presets';
import { OCCASIONS } from '../src/design/occasions';
import { getTrack, getAudioTrack, AUDIO_TRACKS } from '../src/design/music-tracks';
import { existsSync } from 'node:fs';

for (const [id, preset] of Object.entries(DESIGN_PRESETS)) {
  const result = designSchema.safeParse(preset);
  assert(result.success, `preset ${id} gagal validasi: ${JSON.stringify(result.error?.issues)}`);
  if (preset.music) assert(getTrack(preset.music.track) || getAudioTrack(preset.music.track), `preset ${id}: lagu tidak dikenal`);
}
for (const [id, o] of Object.entries(OCCASIONS)) {
  assert(o.preset in DESIGN_PRESETS, `occasion ${id}: preset "${o.preset}" tidak ada`);
}
console.log(`ok ${Object.keys(DESIGN_PRESETS).length} preset, ${Object.keys(OCCASIONS).length} occasion`);

import { defaultSectionsFor } from '../src/lib/defaults';
for (const id of Object.keys(OCCASIONS) as (keyof typeof OCCASIONS)[]) {
  const rows = defaultSectionsFor('x', 'Rina', id);
  assert(rows.length === OCCASIONS[id].sections.length, `${id}: jumlah section salah`);
}
console.log('ok isi awal tiap occasion lolos validasi schema');

for (const t of AUDIO_TRACKS) {
  assert(existsSync(`public${t.src}`), `berkas lagu hilang: ${t.src}`);
  assert(!getTrack(t.id), `id ${t.id} bentrok dengan lagu synth`);
}
console.log(`ok ${AUDIO_TRACKS.length} rekaman ada di public/music`);
