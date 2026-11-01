import type { CSSProperties } from 'react';
import { surfaceBackground } from '@/design/tokens';
import type { DesignSpec } from '@/design/types';

/** Grain sebagai SVG inline — tanpa request jaringan, tanpa aset biner. */
const GRAIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>
<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/>
<feColorMatrix type='saturate' values='0'/></filter>
<rect width='180' height='180' filter='url(#n)' opacity='0.5'/></svg>`;

const GRAIN_URL = `url("data:image/svg+xml;utf8,${encodeURIComponent(GRAIN_SVG)}")`;

/**
 * Satu background tetap di belakang seluruh halaman. Dibuat fixed supaya
 * tidak ikut bergulir — inilah yang bikin halaman terasa satu ruang utuh,
 * bukan tumpukan section yang terpisah-pisah.
 */
export function SurfaceLayer({ design }: { design: DesignSpec }) {
  const style = {
    '--surface-bg': surfaceBackground(design.surface.kind),
  } as CSSProperties;

  return (
    <>
      <div className="surface-layer" style={style} aria-hidden="true" />
      {design.surface.image && (
        <div
          className="surface-photo"
          style={
            {
              '--surface-photo': `url(${JSON.stringify(design.surface.image)})`,
              '--surface-photo-dim': String(design.surface.imageOverlay ?? 0.5),
            } as CSSProperties
          }
          aria-hidden="true"
        />
      )}
      {design.surface.vignette > 0 && (
        <div className="surface-vignette" aria-hidden="true" />
      )}
      {design.surface.grain > 0 && (
        <div
          className="surface-grain"
          style={{ '--grain-url': GRAIN_URL } as CSSProperties}
          aria-hidden="true"
        />
      )}
    </>
  );
}
