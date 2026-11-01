'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import type { RevealKind } from '@/design/types';

type Props = {
  children: ReactNode;
  kind: RevealKind;
  /** urutan kemunculan dalam satu grup, dikalikan 90ms */
  index?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li';
};

/**
 * Mencari leluhur yang benar-benar bisa digulir. Di halaman surat hasilnya
 * null (viewport), tapi di preview dashboard surat hidup di dalam panel —
 * panel itulah yang harus jadi root observer, bukan viewport.
 */
export function scrollRoot(el: HTMLElement): HTMLElement | null {
  let node = el.parentElement;

  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
    node = node.parentElement;
  }

  return null;
}

/**
 * IntersectionObserver dengan satu jaring pengaman penting: elemen yang
 * sudah berada di viewport saat mount langsung ditampilkan. Tanpa ini,
 * konten bisa tersangkut tak terlihat — persis bug yang ada di situs asli.
 */
export function Reveal({
  children,
  kind,
  index = 0,
  className,
  as: Tag = 'div',
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => el.classList.add('is-visible');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      show();
      return;
    }

    const root = scrollRoot(el);
    const rect = el.getBoundingClientRect();
    const bounds = root
      ? root.getBoundingClientRect()
      : { top: 0, bottom: window.innerHeight };

    // Tampil langsung kalau elemen sudah terlihat ATAU sudah terlewat di
    // atas garis lipat — misalnya setelah refresh dengan posisi gulir
    // dipulihkan browser. Tanpa ini, menggulir ke atas menemui area kosong.
    if (rect.top < bounds.bottom) {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show();
            observer.unobserve(entry.target);
          }
        }
      },
      { root, rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      data-reveal={kind}
      className={className}
      style={{ '--reveal-delay': `${index * 90}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
