import { cn } from '@/lib/utils';

interface DeltaIndicatorProps {
  value: number;
  suffix?: string;
  className?: string;
}

export function DeltaIndicator({ value, suffix = '%', className }: DeltaIndicatorProps) {
  const isPositive = value > 0;
  const isZero = value === 0;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-medium',
        isZero && 'text-muted-foreground',
        isPositive && 'text-red-600',
        !isPositive && !isZero && 'text-green-600',
        className,
      )}
    >
      {!isZero && (
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
          {isPositive ? (
            <path d="M6 2L10 8H2L6 2Z" />
          ) : (
            <path d="M6 10L2 4H10L6 10Z" />
          )}
        </svg>
      )}
      {isZero ? '0.00' : Math.abs(value).toFixed(2)}
      {suffix}
    </span>
  );
}
