import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PriceBadgeProps {
  price: number;
  className?: string;
}

export function PriceBadge({ price, className }: PriceBadgeProps) {
  return (
    <Badge variant="secondary" className={cn('tabular-nums font-mono', className)}>
      {price.toFixed(3)} EUR/L
    </Badge>
  );
}
