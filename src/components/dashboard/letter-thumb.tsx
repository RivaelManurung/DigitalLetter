import { cn } from '@/lib/utils';
import type { DesignSpec } from '@/design/types';

/** Small preview of a letter's look: its background art, or its palette when it has none. */
export function LetterThumb({ design, className }: { design?: DesignSpec | null; className?: string }) {
  const palette = design?.palette;
  const image = design?.surface?.image;
  const gradient = palette ? `linear-gradient(135deg, ${palette.bgDeep}, ${palette.accent})` : 'var(--muted)';

  return (
    <span
      aria-hidden="true"
      className={cn('shrink-0 rounded-lg border bg-cover bg-center shadow-xs', className)}
      style={{ backgroundImage: image ? `url(${JSON.stringify(image)}), ${gradient}` : gradient }}
    />
  );
}
