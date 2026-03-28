import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNationalSummary, getRankingCommunities, getTimeSeries, getFuelTypes } from '@/lib/api-client';
import { FUEL_LABELS, ROUTES } from '@/lib/constants';
import { buildMetadata } from '@/lib/seo';
import { NavBreadcrumb } from '@/components/layout/nav-breadcrumb';
import { KpiCard } from '@/components/cards/kpi-card';
import { PriceEvolutionChart } from '@/components/charts/price-evolution-chart';
import { RankingTable } from '@/components/tables/ranking-table';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ fuelCode: string }>;
  searchParams: Promise<{ days?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { fuelCode } = await params;
  const label = FUEL_LABELS[fuelCode] || fuelCode;
  return buildMetadata({
    title: `Precio ${label} Hoy en España`,
    description: `Consulta el precio medio de ${label} en España. Evolución, ranking de comunidades y provincias más baratas.`,
    path: ROUTES.fuel(fuelCode),
  });
}

export async function generateStaticParams() {
  try {
    const fuelTypes = await getFuelTypes();
    return fuelTypes.slice(0, 5).map((ft) => ({ fuelCode: ft.code }));
  } catch {
    return [{ fuelCode: 'G95E5' }, { fuelCode: 'GOA' }, { fuelCode: 'G98E5' }, { fuelCode: 'GOAP' }];
  }
}

export default async function FuelPage({ params, searchParams }: PageProps) {
  const { fuelCode } = await params;
  const { days: daysStr } = await searchParams;
  const days = daysStr ? parseInt(daysStr, 10) : 30;
  const label = FUEL_LABELS[fuelCode] || fuelCode;

  let summary, communityRanking, series;
  try {
    [summary, communityRanking, series] = await Promise.all([
      getNationalSummary(),
      getRankingCommunities(fuelCode),
      getTimeSeries(fuelCode, undefined, days),
    ]);
  } catch {
    notFound();
  }

  const fuelSummary = summary.find((s) => s.fuelCode === fuelCode);
  if (!fuelSummary) notFound();

  const chartSeries = [{
    name: label,
    data: series.map((p) => ({ date: p.date, value: parseFloat(p.avgPrice) })),
    color: '#2563eb',
  }];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <NavBreadcrumb items={[
        { label: 'Combustibles' },
        { label },
      ]} />

      <h1 className="text-3xl font-bold">{label}</h1>
      <p className="mt-1 text-muted-foreground">
        Precio medio nacional y ranking territorial
      </p>

      {/* KPIs */}
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <KpiCard label="Precio medio" value={fuelSummary.avgPrice} />
        <KpiCard label="Mínimo" value={fuelSummary.minPrice} />
        <KpiCard label="Máximo" value={fuelSummary.maxPrice} />
      </section>

      {/* Gráfico */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Evolución ({days} días)</h2>
        <div className="rounded-lg border bg-card p-4">
          <PriceEvolutionChart series={chartSeries} height={350} />
        </div>
      </section>

      {/* Ranking */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Ranking de comunidades autónomas
        </h2>
        <div className="rounded-lg border">
          <RankingTable entries={communityRanking} linkPrefix="/comunidad" />
        </div>
      </section>
    </div>
  );
}
