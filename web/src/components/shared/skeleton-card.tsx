import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonCard() {
  return (
    <Card>
      <CardContent className="pt-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-9 w-20" />
        <Skeleton className="mt-1 h-4 w-16" />
      </CardContent>
    </Card>
  );
}
