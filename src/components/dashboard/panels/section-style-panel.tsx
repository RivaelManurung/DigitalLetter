'use client';

import { REVEAL_LABEL } from '@/design/motion-labels';
import type { RevealKind } from '@/design/types';
import { Paintbrush } from 'lucide-react';
import { FONT_PAIRS } from '@/design/fonts';
import type { DesignSpec, SectionStyle } from '@/design/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  ChoiceField,
  ColorField,
  SliderField,
  StyleGroup,
  TextField,
} from './style-controls';

type Props = {
  style: SectionStyle;
  /** desain surat — dipakai sebagai nilai bawaan yang ditampilkan */
  design: DesignSpec;
  onChange: (style: SectionStyle) => void;
};

/**
 * Panel "Design" milik satu section.
 *
 * Setiap kendali menimpa satu nilai desain surat. Yang tidak disentuh tetap
 * ikut desain — jadi panel ini bisa dipakai sekadar untuk menggeser satu
 * warna, tanpa harus menentukan ulang seluruh tampilan section.
 */
export function SectionStylePanel({ style, design, onChange }: Props) {
  function set<K extends keyof SectionStyle>(key: K, value: SectionStyle[K]) {
    const next = { ...style };
    if (value === undefined || value === '') delete next[key];
    else next[key] = value;
    onChange(next);
  }

  const touched = Object.keys(style).length;

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Paintbrush size={11} />
          {touched > 0
            ? `${touched} penyesuaian aktif`
            : 'Semuanya ikut desain surat'}
        </p>

        {touched > 0 && (
          <Button variant="ghost" size="xs" onClick={() => onChange({})}>
            Reset semua
          </Button>
        )}
      </div>

      <StyleGroup title="Warna & latar">
        <ColorField
          label="Warna teks"
          value={style.text}
          fallback={design.palette.text}
          onChange={(v) => set('text', v)}
        />
        <ColorField
          label="Teks redup"
          value={style.textMuted}
          fallback={design.palette.textMuted}
          onChange={(v) => set('textMuted', v)}
        />
        <ColorField
          label="Warna aksen"
          value={style.accent}
          fallback={design.palette.accent}
          onChange={(v) => set('accent', v)}
        />
        <ColorField
          label="Latar section"
          value={style.bg}
          fallback={design.palette.bgDeep}
          onChange={(v) => set('bg', v)}
        />
        <TextField
          label="Gambar latar"
          value={style.bgImage}
          placeholder="/foto.jpg atau https://…"
          hint="Ditumpuk di atas warna latar."
          onChange={(v) => set('bgImage', v)}
        />
        {style.bgImage && (
          <SliderField
            label="Peredup gambar"
            value={style.bgOverlay}
            fallback={0}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => set('bgOverlay', v)}
          />
        )}
      </StyleGroup>

      <StyleGroup title="Tipografi">
        <div className="grid gap-1.5">
          <Label className="text-xs text-muted-foreground">Pasangan font</Label>
          <Select
            value={style.fontPair || '__default'}
            onValueChange={(v) =>
              set('fontPair', !v || v === '__default' ? undefined : String(v))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__default">Ikut desain surat</SelectItem>
              {FONT_PAIRS.map((pair) => (
                <SelectItem key={pair.id} value={pair.id}>
                  {pair.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <SliderField
          label="Ukuran judul"
          value={style.titleScale}
          fallback={1}
          min={0.5}
          max={2.5}
          step={0.05}
          suffix="×"
          onChange={(v) => set('titleScale', v)}
        />
        <SliderField
          label="Ukuran teks isi"
          value={style.bodyScale}
          fallback={1}
          min={0.5}
          max={2}
          step={0.05}
          suffix="×"
          onChange={(v) => set('bodyScale', v)}
        />
        <SliderField
          label="Jarak huruf judul"
          value={style.titleTracking}
          fallback={-0.015}
          min={-0.1}
          max={0.5}
          step={0.005}
          suffix="em"
          onChange={(v) => set('titleTracking', v)}
        />
      </StyleGroup>

      <StyleGroup title="Jarak & tata letak">
        <ChoiceField
          label="Perataan"
          value={style.align}
          options={[
            { value: 'left', label: 'Kiri' },
            { value: 'center', label: 'Tengah' },
            { value: 'right', label: 'Kanan' },
          ]}
          onChange={(v) => set('align', v)}
        />
        <SliderField
          label="Jarak atas"
          value={style.padTop}
          fallback={6}
          min={0}
          max={24}
          step={0.5}
          suffix="rem"
          onChange={(v) => set('padTop', v)}
        />
        <SliderField
          label="Jarak bawah"
          value={style.padBottom}
          fallback={6}
          min={0}
          max={24}
          step={0.5}
          suffix="rem"
          onChange={(v) => set('padBottom', v)}
        />
        <SliderField
          label="Lebar isi"
          value={style.maxWidth}
          fallback={1180}
          min={320}
          max={1600}
          step={20}
          suffix="px"
          onChange={(v) => set('maxWidth', v)}
        />
      </StyleGroup>

      <StyleGroup title="Animasi & efek">
        <ChoiceField
          label="Gaya munculnya"
          value={style.reveal}
          options={Object.entries(REVEAL_LABEL).map(([value, label]) => ({ value, label }))}
          onChange={(v) => set('reveal', v as RevealKind | undefined)}
        />
        <SliderField
          label="Kecepatan"
          value={style.speed}
          fallback={design.motion.speed}
          min={0.4}
          max={2}
          step={0.05}
          suffix="×"
          onChange={(v) => set('speed', v)}
        />
        <SliderField
          label="Kerapatan partikel"
          value={style.particleDensity}
          fallback={design.particles.density}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => set('particleDensity', v)}
        />
      </StyleGroup>
    </div>
  );
}
