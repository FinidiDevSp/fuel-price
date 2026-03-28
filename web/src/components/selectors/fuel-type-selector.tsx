'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MAIN_FUEL_CODES, FUEL_SHORT_LABELS } from '@/lib/constants';

interface FuelTypeSelectorProps {
  currentFuel: string;
  paramName?: string;
}

export function FuelTypeSelector({ currentFuel, paramName = 'fuel' }: FuelTypeSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Tabs value={currentFuel} onValueChange={handleChange}>
      <TabsList>
        {MAIN_FUEL_CODES.map((code) => (
          <TabsTrigger key={code} value={code} className="text-xs sm:text-sm">
            {FUEL_SHORT_LABELS[code] || code}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
