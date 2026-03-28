import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRegionStats, getProvinces, getStationRankings, getTimeSeries } from '@/lib/api-client';
import { FUEL_LABELS, DEFAULT_FUEL, ROUTES } from '@/lib/constants';
import { buildMetadata } from '@/lib/seo';
import { NavBreadcrumb } from '@/components/layout/nav-breadcrumb';
import { KpiCard } from '@/components/cards/kpi-card';
import { PriceEvolutionChart } from '@/components/charts/price-evolution-chart';
import { StationListTable } from '@/components/tables/station-list-table';
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
    description: `Precios de gasolina y diésel en la provincia. Estaciones más baratas y evolución de precios.`,
    path: ROUTES.province(slug),
  });
}

export async function generateStaticParams() {
  try {
    const provinces = await getProvinces();
    return provinces.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export default async function ProvincePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { fuel } = await searchParams;
  const fuelCode = fuel || DEFAULT_FUEL;
  const fuelLabel = FUEL_LABELS[fuelCode] || fuelCode;

  let regionStats, stationRankings, nationalSeries;
  try {
    [regionStats, stationRankings, nationalSeries] = await Promise.all([
      getRegionStats(slug, fuelCode),
      getStationRankings({ fuel: fuelCode, province: slug, limit: 20 }),
      getTimeSeries(fuelCode, undefined, 30),
    ]);
  } catch {
    notFound();
  }

  if (!regionStats) notFound();

  const { region, summary: regionSummary, nationalAvg, series } = regionStats;
  const fuelData = regionSummary.find((s) => s.fuelCode === fuelCode);
  const deltaVsNational = fuelData && nationalAvg
    ? fuelData.avgPrice - nationalAvg
    : null;

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

  // Breadcrumb with parent community if available
  const breadcrumbs = [];
  if (region.parent) {
    breadcrumbs.push({
      label: region.parent.name,
      href: ROUTES.community(region.parent.slug),
    });
  }
  breadcrumbs.push({ label: region.name });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <NavBreadcrumb items={breadcrumbs} />

      <h1 className="text-3xl font-bold">{region.name}</h1>
      <p className="mt-1 text-muted-foreground">
        Precios de {fuelLabel}
        {deltaVsNational !== null && (
          <span className="ml-2">
            · <DeltaIndicator value={deltaVsNational} suffix=" EUR/L" /> vs media nacional
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

      {/* Gráfico */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Evolución (30 días)</h2>
        <div className="rounded-lg border bg-card p-4">
          <PriceEvolutionChart series={chartSeries} height={350} />
        </div>
      </section>

      {/* Estaciones más baratas */}
      {stationRankings.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Estaciones más baratas
          </h2>
          <div className="rounded-lg border overflow-x-auto">
            <StationListTable stations={stationRankings} limit={20} />
          </div>
        </section>
      )}
    </div>
  );
}
