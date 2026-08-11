import type { CSSProperties, ReactNode } from 'react';
import { sectionStyleToCssVars } from '@/design/tokens';
import type { SectionStyle } from '@/design/types';

/**
 * Pembungkus yang membawa penyesuaian tampilan satu section.
 *
 * Caranya sengaja tidak menyentuh komponen section sama sekali: variabel CSS
 * ditulis ulang di sini, lalu diwariskan ke seluruh isinya. Section yang tidak
 * punya style tidak menghasilkan elemen tambahan — pembungkusnya dilewati —
 * jadi surat lama tetap identik, sampai ke struktur DOM-nya.
 */
export function SectionShell({
  style,
  children,
}: {
  style?: SectionStyle;
  children: ReactNode;
}) {
  if (!style || isEmpty(style)) return <>{children}</>;

  const vars = sectionStyleToCssVars(style) as Record<string, string>;
  const background = backgroundValue(style);

  return (
    <div
      className="section-shell"
      data-align={style.align || undefined}
      data-has-bg={background ? '' : undefined}
      style={{ ...vars, ...(background ? { '--section-bg': background } : {}) } as CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * Latar section: gambar ditumpuk di atas warna, jadi keduanya bisa dipakai
 * bersamaan — warna berfungsi sebagai alas saat gambar masih dimuat.
 */
function backgroundValue(style: SectionStyle): string | null {
  const layers: string[] = [];
  if (style.bgImage) layers.push(`url(${JSON.stringify(style.bgImage)})`);
  if (style.bg) layers.push(style.bg);
  return layers.length ? layers.join(', ') : null;
}

function isEmpty(style: SectionStyle): boolean {
  return Object.values(style).every(
    (value) => value === undefined || value === null || value === '',
  );
}
