import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const published = status === 'published';
  return (
    <Badge variant={published ? 'success' : 'warning'} className={cn('shrink-0', className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {published ? 'Terbit' : 'Draf'}
    </Badge>
  );
}
