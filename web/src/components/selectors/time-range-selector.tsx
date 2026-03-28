'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { TIME_RANGES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface TimeRangeSelectorProps {
  currentDays: number;
}

export function TimeRangeSelector({ currentDays }: TimeRangeSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(days: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('days', String(days));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-1">
      {TIME_RANGES.map((range) => (
        <button
          key={range.days}
          type="button"
          onClick={() => handleChange(range.days)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            currentDays === range.days
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent',
          )}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
