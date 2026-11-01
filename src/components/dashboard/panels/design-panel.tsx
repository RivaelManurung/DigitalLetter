'use client';

import { THEME_IMAGES } from '@/design/theme-images';
import { AUDIO_TRACKS, MUSIC_TRACKS } from '@/design/music-tracks';
import { useEffect, useRef, useState } from 'react';
import { Dices, ImageDown } from 'lucide-react';
import { toast } from 'sonner';
import { FONT_PAIRS } from '@/design/fonts';
import { getPreset } from '@/design/presets';
import {
  DEFAULT_VARIANTS,
  SECTION_LABEL,
  SECTION_TYPES,
  SECTION_VARIANTS,
  type DesignSpec,
  type Palette,
} from '@/design/types';
import { variantLabel } from '@/design/variant-labels';
import { updateDesign } from '@/lib/actions/letter';
import { extractPalette } from '@/lib/palette';
import { Button } from '@/components/ui/button';
import { Field, Select, Slider } from '@/components/ui/field';
import { Card, CardHeader } from '@/components/ui/surface';
import { PresetPicker } from '../preset-picker';

type Props = {
  /**
   * Id surat untuk autosave. Dikosongkan saat panel dipakai di editor
   * template — di sana desain ikut disimpan bersama seluruh draft, jadi
   * panel ini murni terkendali dan tidak menulis ke database sendiri.
   */
  letterId?: string;
  design: DesignSpec;
  onChange: (design: DesignSpec) => void;
};

const PALETTE_SLOTS: { key: keyof Palette; label: string }[] = [
  { key: 'bgDeep', label: 'Latar utama' },
  { key: 'bgMid', label: 'Latar tengah' },
  { key: 'bgSoft', label: 'Latar lembut' },
  { key: 'accent', label: 'Aksen' },
  { key: 'accentSoft', label: 'Aksen lembut' },
  { key: 'text', label: 'Teks' },
  { key: 'textMuted', label: 'Teks redup' },
];

const AUTOSAVE_MS = 900;

export function DesignPanel({ letterId, design, onChange }: Props) {
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (!letterId) return; // mode template: induk yang menyimpan

    if (first.current) {
      first.current = false;
      return;
    }

    if (timer.current) clearTimeout(timer.current);
    setSaving(true);

    timer.current = setTimeout(async () => {
      const result = await updateDesign({ id: letterId, design });
      setSaving(false);
      if (!result.ok) toast.error(result.error);
    }, AUTOSAVE_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [design, letterId]);

  function patch(partial: Partial<DesignSpec>) {
    onChange({ ...design, ...partial });
  }

  async function handleImage(file: File) {
    try {
      const palette = await extractPalette(file);
      patch({ palette });
      toast.success('Palet diambil dari gambar');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal membaca gambar');
    }
  }

  function randomize() {
    const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];

    patch({
      fontPair: pick(FONT_PAIRS).id,
      surface: { ...design.surface, kind: pick(['aurora', 'gradient', 'mesh', 'grain', 'solid'] as const) },
      particles: { ...design.particles, kind: pick(['sakura', 'rose', 'dust', 'snow', 'snowflake', 'heart', 'star'] as const) },
      variants: Object.fromEntries(
        SECTION_TYPES.map((type) => [type, pick(SECTION_VARIANTS[type])]),
      ) as DesignSpec['variants'],
    });
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {!letterId
            ? 'Ikut tersimpan bersama template'
            : saving
              ? 'Menyimpan desain…'
              : 'Desain tersimpan'}
        </p>
        <Button variant="outline" size="sm" onClick={randomize}>
          <Dices size={13} />
          Kejutkan aku
        </Button>
      </div>

      <Card>
        <CardHeader
          title="Preset"
          description="Titik mulai. Semua token di bawah tetap bisa kamu timpa."
        />
        <div className="p-3">
          <PresetPicker
            value={design.preset}
            onChange={(id) => {
              const preset = getPreset(id);
              onChange({ ...preset, name: design.name });
            }}
          />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Warna"
          description="Ambil dari gambar apa pun — desain Canva, foto, poster."
          action={<ImagePaletteButton onFile={handleImage} />}
        />
        <div className="grid gap-2 p-3">
          {PALETTE_SLOTS.map(({ key, label }) => (
            <ColorRow
              key={key}
              label={label}
              value={design.palette[key]}
              onChange={(value) => patch({ palette: { ...design.palette, [key]: value } })}
            />
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Tipografi & permukaan" />
        <div className="grid gap-3 p-3">
          <Field label="Pasangan font">
            <Select
              value={design.fontPair}
              onChange={(e) => patch({ fontPair: e.target.value })}
            >
              {FONT_PAIRS.map((pair) => (
                <option key={pair.id} value={pair.id}>
                  {pair.label} — {pair.display} + {pair.body}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Jenis latar">
            <Select
              value={design.surface.kind}
              onChange={(e) =>
                patch({
                  surface: {
                    ...design.surface,
                    kind: e.target.value as DesignSpec['surface']['kind'],
                  },
                })
              }
            >
              <option value="aurora">Aurora</option>
              <option value="gradient">Gradien</option>
              <option value="mesh">Mesh</option>
              <option value="grain">Grain</option>
              <option value="solid">Solid</option>
            </Select>
          </Field>

          <Field label="Ilustrasi latar">
            <Select
              value={design.surface.image ?? ''}
              onChange={(e) =>
                patch({ surface: { ...design.surface, image: e.target.value || undefined } })
              }
            >
              <option value="">Tanpa ilustrasi</option>
              {THEME_IMAGES.map((img) => (
                <option key={img.src} value={img.src}>
                  {img.label}
                </option>
              ))}
            </Select>
          </Field>

          {design.surface.image && (
            <Slider
              label="Redupkan ilustrasi"
              min={0} max={0.9} step={0.05}
              value={design.surface.imageOverlay ?? 0.5}
              onChange={(e) =>
                patch({ surface: { ...design.surface, imageOverlay: Number(e.target.value) } })
              }
            />
          )}

          <Slider
            label="Vignette"
            min={0} max={1} step={0.05}
            value={design.surface.vignette}
            onChange={(e) =>
              patch({ surface: { ...design.surface, vignette: Number(e.target.value) } })
            }
          />

          <Slider
            label="Grain"
            min={0} max={1} step={0.05}
            value={design.surface.grain}
            onChange={(e) =>
              patch({ surface: { ...design.surface, grain: Number(e.target.value) } })
            }
          />

          <Slider
            label="Sudut membulat" suffix="px"
            min={0} max={48} step={1}
            value={design.shape.radius}
            onChange={(e) =>
              patch({ shape: { ...design.shape, radius: Number(e.target.value) } })
            }
          />

          <Slider
            label="Blur kaca" suffix="px"
            min={0} max={40} step={1}
            value={design.shape.glassBlur}
            onChange={(e) =>
              patch({ shape: { ...design.shape, glassBlur: Number(e.target.value) } })
            }
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Gerak & partikel" />
        <div className="grid gap-3 p-3">
          <Slider
            label="Kecepatan animasi" suffix="×"
            min={0.4} max={2} step={0.05}
            value={design.motion.speed}
            onChange={(e) =>
              patch({ motion: { ...design.motion, speed: Number(e.target.value) } })
            }
          />

          <Field label="Gaya kemunculan">
            <Select
              value={design.motion.reveal}
              onChange={(e) =>
                patch({
                  motion: {
                    ...design.motion,
                    reveal: e.target.value as DesignSpec['motion']['reveal'],
                  },
                })
              }
            >
              <option value="fade-up">Naik & memudar</option>
              <option value="fade">Memudar</option>
              <option value="blur-in">Dari buram</option>
            </Select>
          </Field>

          <Field label="Jenis partikel">
            <Select
              value={design.particles.kind}
              onChange={(e) =>
                patch({
                  particles: {
                    ...design.particles,
                    kind: e.target.value as DesignSpec['particles']['kind'],
                  },
                })
              }
            >
              <option value="sakura">Kelopak sakura</option>
              <option value="rose">Kelopak mawar</option>
              <option value="dust">Debu cahaya</option>
              <option value="snow">Salju</option>
              <option value="snowflake">Kristal salju</option>
              <option value="heart">Hati melayang</option>
              <option value="star">Bintang berkilau</option>
              <option value="none">Tidak ada</option>
            </Select>
          </Field>

          <Field label="Musik latar bawaan">
            <Select
              value={design.music?.track ?? ''}
              onChange={(e) =>
                patch({ music: e.target.value ? { track: e.target.value } : undefined })
              }
            >
              <option value="">Tanpa musik</option>
              <optgroup label="Rekaman asli">
                {AUDIO_TRACKS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Kotak musik (synth)">
                {MUSIC_TRACKS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </optgroup>
            </Select>
          </Field>

          <Slider
            label="Kepadatan partikel"
            min={0} max={1} step={0.05}
            value={design.particles.density}
            onChange={(e) =>
              patch({
                particles: { ...design.particles, density: Number(e.target.value) },
              })
            }
          />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Varian layout bawaan"
          description="Berlaku untuk semua section bertipe sama. Satu section bisa menimpanya sendiri lewat tab Konten."
        />
        <div className="grid gap-2 p-3">
          {SECTION_TYPES.map((type) => (
            <Field key={type} label={SECTION_LABEL[type]}>
              <Select
                value={design.variants[type] ?? DEFAULT_VARIANTS[type]}
                onChange={(e) =>
                  patch({ variants: { ...design.variants, [type]: e.target.value } })
                }
              >
                {SECTION_VARIANTS[type].map((variant) => (
                  <option key={variant} value={variant}>
                    {variantLabel(variant)}
                  </option>
                ))}
              </Select>
            </Field>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  // <input type=color> hanya menerima hex; rgba() diedit sebagai teks.
  const isHex = value.startsWith('#');

  return (
    <div className="flex items-center gap-2">
      <label className="flex-1 text-xs text-muted-foreground">{label}</label>
      {isHex && (
        <input
          type="color"
          value={value.slice(0, 7)}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`Pilih warna ${label}`}
          className="h-7 w-9 cursor-pointer rounded border border-border bg-transparent"
        />
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`Kode warna ${label}`}
        className="w-40 rounded-md border border-border bg-background px-2 py-1 font-mono text-[11px] outline-none focus-visible:border-ring"
      />
    </div>
  );
}

function ImagePaletteButton({ onFile }: { onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
        <ImageDown size={13} />
        Dari gambar
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
    </>
  );
}
