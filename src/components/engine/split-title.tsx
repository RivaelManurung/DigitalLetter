import type { CSSProperties } from 'react';

type Props = {
  text: string;
  /** indeks huruf pertama, supaya baris kedua melanjutkan urutan baris pertama */
  offset?: number;
};

/**
 * Memecah judul pendek menjadi huruf untuk animasi judul tema
 * (lihat `[data-title]` di letter.css). Pembaca layar mendapat teks utuh.
 */
export function SplitTitle({ text, offset = 0 }: Props) {
  let index = offset;
  const words = text.split(/(\s+)/);

  return (
    <span className="split-title">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, w) => {
          if (/^\s+$/.test(word)) return word;
          return (
            <span key={w} className="split-word" style={{ '--wi': w / 2 } as CSSProperties}>
              {Array.from(word).map((ch, c) => {
                const i = index++;
                // urutan acak tapi deterministik untuk efek kedip/kelip
                const r = (Math.sin(i * 91.7) * 1000) % 1;
                return (
                  <span
                    key={c}
                    className="split-ch"
                    style={{ '--ci': i, '--cr': Math.abs(r).toFixed(3) } as CSSProperties}
                  >
                    {ch}
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>
    </span>
  );
}

export const splitLength = (text: string) => Array.from(text.replace(/\s+/g, '')).length;
