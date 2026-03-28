import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { StationRankingEntry } from '@/lib/types';

interface StationListTableProps {
  stations: StationRankingEntry[];
  limit?: number;
}

export function StationListTable({ stations, limit }: StationListTableProps) {
  const displayStations = limit ? stations.slice(0, limit) : stations;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Estación</TableHead>
          <TableHead>Marca</TableHead>
          <TableHead>Provincia</TableHead>
          <TableHead className="text-right">Precio</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {displayStations.map((s, i) => (
          <TableRow key={s.stationSlug}>
            <TableCell className="font-medium text-muted-foreground">
              {i + 1}
            </TableCell>
            <TableCell>
              <Link
                href={`/estacion/${s.stationSlug}`}
                className="font-medium hover:underline"
              >
                {s.stationName}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {s.brandName ?? '--'}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {s.provinceName}
            </TableCell>
            <TableCell className="text-right tabular-nums font-mono font-bold">
              {s.price.toFixed(3)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
