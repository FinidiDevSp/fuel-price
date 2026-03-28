import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DeltaIndicator } from '@/components/shared/delta-indicator';
import type { RankingEntry } from '@/lib/types';

interface RankingTableProps {
  entries: RankingEntry[];
  linkPrefix: string;
  showDelta?: boolean;
  limit?: number;
}

export function RankingTable({ entries, linkPrefix, showDelta = false, limit }: RankingTableProps) {
  const displayEntries = limit ? entries.slice(0, limit) : entries;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Región</TableHead>
          <TableHead className="text-right">Precio medio</TableHead>
          <TableHead className="text-right">Estaciones</TableHead>
          {showDelta && <TableHead className="text-right">Var.</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {displayEntries.map((entry, i) => (
          <TableRow key={entry.regionId}>
            <TableCell className="font-medium text-muted-foreground">
              {i + 1}
            </TableCell>
            <TableCell>
              <Link
                href={`${linkPrefix}/${entry.regionSlug}`}
                className="font-medium hover:underline"
              >
                {entry.regionName}
              </Link>
            </TableCell>
            <TableCell className="text-right tabular-nums font-mono">
              {entry.avgPrice.toFixed(3)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {entry.stationCount}
            </TableCell>
            {showDelta && (
              <TableCell className="text-right">
                {entry.changeVsPrevDay !== null ? (
                  <DeltaIndicator value={entry.changeVsPrevDay} suffix="" />
                ) : (
                  <span className="text-muted-foreground">--</span>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
