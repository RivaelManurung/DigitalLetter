import { parseSequence, type MusicTrack, type NoteEvent } from '@/design/music-tracks';

const LOOKAHEAD_S = 0.45;
const TICK_MS = 90;
const FADE_S = 0.9;
const LOOP_GAP_BEATS = 2;

type Layer = { events: NoteEvent[]; gain: number; ring: number };

const midiToHz = (m: number) => 440 * 2 ** ((m - 69) / 12);

/** Impuls gema sintetis: derau stereo yang meluruh, tanpa berkas audio. */
function buildReverb(ctx: AudioContext): ConvolverNode {
  const seconds = 2.6;
  const length = Math.floor(ctx.sampleRate * seconds);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const data = impulse.getChannelData(c);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
    }
  }
  const convolver = ctx.createConvolver();
  convolver.buffer = impulse;
  return convolver;
}

/**
 * Synth kotak musik: sinus + oktaf + partial lonceng yang meluruh cepat.
 * AudioContext dibuat saat play() pertama — browser mensyaratkan gestur user.
 */
export class SynthEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private wet: GainNode | null = null;
  private timer: number | null = null;
  private layers: Layer[] = [];
  private cursors: number[] = [];
  private loopBeats = 0;
  private loopStart = 0;
  private secPerBeat = 0.5;
  private volume = 0.7;
  private playing = false;

  setTrack(track: MusicTrack) {
    const melody = parseSequence(track.melody);
    this.layers = [{ events: melody.events, gain: 0.5, ring: 1.6 }];
    if (track.chords) {
      this.layers.push({ events: parseSequence(track.chords).events, gain: 0.16, ring: 2.4 });
    }
    this.loopBeats = melody.total + LOOP_GAP_BEATS;
    this.secPerBeat = 60 / track.bpm;
    this.cursors = this.layers.map(() => 0);
    this.loopStart = this.ctx ? this.ctx.currentTime + 0.15 : 0;
  }

  async play() {
    if (this.playing || this.layers.length === 0) return;

    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.wet = this.ctx.createGain();
      this.wet.gain.value = 0.55;
      const reverb = buildReverb(this.ctx);
      this.wet.connect(reverb).connect(this.master);
      this.master.connect(this.ctx.destination);
      this.loopStart = this.ctx.currentTime + 0.15;
    }

    await this.ctx.resume();
    this.playing = true;
    this.fadeTo(this.volume);
    this.timer = window.setInterval(() => this.tick(), TICK_MS);
  }

  pause() {
    if (!this.playing || !this.ctx) return;
    this.playing = false;
    this.fadeTo(0);
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    const ctx = this.ctx;
    window.setTimeout(() => {
      if (!this.playing) void ctx.suspend();
    }, FADE_S * 1000 + 50);
  }

  /** posisi putar dalam satuan beat sejak awal lagu (0 … panjang lagu) */
  currentBeat(): number {
    if (!this.ctx || !this.playing || this.loopBeats === 0) return -1;
    let beat = (this.ctx.currentTime - this.loopStart) / this.secPerBeat;
    // penjadwal sudah memajukan loopStart ke putaran berikutnya sebelum bunyinya tiba
    if (beat < 0) beat += this.loopBeats;
    return beat;
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.playing) this.fadeTo(v);
  }

  dispose() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    this.playing = false;
    void this.ctx?.close();
    this.ctx = null;
  }

  private fadeTo(value: number) {
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(value, now + FADE_S);
  }

  private tick() {
    if (!this.ctx) return;
    const horizon = this.ctx.currentTime + LOOKAHEAD_S;

    this.layers.forEach((layer, li) => {
      for (;;) {
        const ev = layer.events[this.cursors[li]];
        if (!ev) break;
        const at = this.loopStart + ev.start * this.secPerBeat;
        if (at > horizon) return;
        this.note(ev, at, layer);
        this.cursors[li]++;
      }
    });

    // Semua layer habis → ulang dari awal setelah jeda singkat
    if (this.layers.every((l, i) => this.cursors[i] >= l.events.length)) {
      this.loopStart += this.loopBeats * this.secPerBeat;
      this.cursors = this.layers.map(() => 0);
    }
  }

  private note(ev: NoteEvent, at: number, layer: Layer) {
    const ctx = this.ctx!;
    const dur = ev.beats * this.secPerBeat;
    const release = dur * layer.ring + 0.5;
    const peak = (layer.gain / Math.sqrt(ev.midi.length)) * (ev.start % 1 === 0 ? 1 : 0.85);

    for (const midi of ev.midi) {
      const f = midiToHz(midi);
      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.0001, at);
      amp.gain.exponentialRampToValueAtTime(peak, at + 0.006);
      amp.gain.exponentialRampToValueAtTime(0.0001, at + release);
      amp.connect(this.master!);
      amp.connect(this.wet!);

      // [kelipatan frekuensi, bobot] — partial 2.76 memberi nuansa lonceng
      for (const [mult, weight] of [[1, 1], [2, 0.32], [2.76, 0.1]] as const) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f * mult;
        g.gain.value = weight;
        osc.connect(g).connect(amp);
        osc.start(at);
        osc.stop(at + release + 0.05);
      }
    }
  }
}
