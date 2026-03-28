import { Card, CardContent } from '@/components/ui/card';
import { DeltaIndicator } from '@/components/shared/delta-indicator';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: number | null;
  unit?: string;
  delta?: number | null;
  deltaSuffix?: string;
  className?: string;
}

export function KpiCard({ label, value, unit = 'EUR/L', delta, deltaSuffix = '%', className }: KpiCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-bold tabular-nums">
          {value !== null && value !== undefined ? value.toFixed(3) : '--'}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{unit}</span>
          {delta !== null && delta !== undefined && (
            <DeltaIndicator value={delta} suffix={deltaSuffix} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
