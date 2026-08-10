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

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
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
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
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
