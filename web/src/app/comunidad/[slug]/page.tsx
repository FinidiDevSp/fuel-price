import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRegionStats, getCommunities, getTimeSeries } from '@/lib/api-client';
import type { TimeSeriesPoint } from '@/lib/types';
import { FUEL_LABELS, DEFAULT_FUEL, ROUTES } from '@/lib/constants';
import { buildMetadata } from '@/lib/seo';
import { NavBreadcrumb } from '@/components/layout/nav-breadcrumb';
import { KpiCard } from '@/components/cards/kpi-card';
import { PriceEvolutionChart } from '@/components/charts/price-evolution-chart';
import { RankingTable } from '@/components/tables/ranking-table';
import { DeltaIndicator } from '@/components/shared/delta-indicator';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ fuel?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return buildMetadata({
    title: `Precio Combustibles en ${slug}`,
    description: `Consulta precios de gasolina y diésel en ${slug}. Comparativa con la media nacional y ranking de provincias.`,
    path: ROUTES.community(slug),
  });
}

export async function generateStaticParams() {
  try {
    const communities = await getCommunities();
    return communities.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export default async function CommunityPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { fuel } = await searchParams;
  const fuelCode = fuel || DEFAULT_FUEL;
  const fuelLabel = FUEL_LABELS[fuelCode] || fuelCode;

  let regionStats;
  try {
    regionStats = await getRegionStats(slug, fuelCode);
  } catch {
    notFound();
  }

  if (!regionStats) notFound();

  const { region, summary: regionSummary, nationalAvg, childRanking, series } = regionStats;
  const fuelData = regionSummary.find((s) => s.fuelCode === fuelCode);
  const deltaVsNational = fuelData && nationalAvg
    ? fuelData.avgPrice - nationalAvg
    : null;

  // Serie temporal: región vs nacional
  let nationalSeries: TimeSeriesPoint[];
  try {
    nationalSeries = await getTimeSeries(fuelCode, undefined, 30);
  } catch {
    nationalSeries = [];
  }

  const chartSeries = [
    {
      name: region.name,
      data: series.map((p) => ({
        date: p.date,
        value: parseFloat(p.avgPrice),
      })),
      color: '#2563eb',
    },
    {
      name: 'Media nacional',
      data: nationalSeries.map((p) => ({
        date: p.date,
        value: parseFloat(p.avgPrice),
      })),
      color: '#9ca3af',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <NavBreadcrumb items={[
        { label: 'Comunidades', href: '/comunidades' },
        { label: region.name },
      ]} />

      <h1 className="text-3xl font-bold">{region.name}</h1>
      <p className="mt-1 text-muted-foreground">
        Precios de {fuelLabel}
        {deltaVsNational !== null && (
          <span className="ml-2">
            · {deltaVsNational > 0 ? 'Por encima' : 'Por debajo'} de la media nacional:{' '}
            <DeltaIndicator value={deltaVsNational} suffix=" EUR/L" />
          </span>
        )}
      </p>

      {/* KPIs */}
      {fuelData && (
        <section className="mt-6 grid gap-4 sm:grid-cols-4">
          <KpiCard label="Precio medio" value={fuelData.avgPrice} />
          <KpiCard label="Mínimo" value={fuelData.minPrice} />
          <KpiCard label="Máximo" value={fuelData.maxPrice} />
          <KpiCard label="Estaciones" value={fuelData.stationCount} unit="" />
        </section>
      )}

      {/* Gráfico comparativo */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Evolución vs media nacional (30 días)
        </h2>
        <div className="rounded-lg border bg-card p-4">
          <PriceEvolutionChart series={chartSeries} height={350} />
        </div>
      </section>

      {/* Ranking de provincias */}
      {childRanking.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Ranking de provincias
          </h2>
          <div className="rounded-lg border">
            <RankingTable entries={childRanking} linkPrefix="/provincia" />
          </div>
        </section>
      )}
    </div>
  );
}
