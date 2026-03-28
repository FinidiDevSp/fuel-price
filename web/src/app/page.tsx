import type { Metadata } from 'next';
import { getHomePageData } from '@/lib/api-client';
import { FUEL_LABELS, DEFAULT_FUEL } from '@/lib/constants';
import { KpiCard } from '@/components/cards/kpi-card';
import { PriceEvolutionChart } from '@/components/charts/price-evolution-chart';
import { RankingTable } from '@/components/tables/ranking-table';
import { DeltaIndicator } from '@/components/shared/delta-indicator';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Precios de Combustibles en España Hoy',
  description:
    'Consulta el precio medio de gasolina y diésel en España. Evolución diaria, rankings por comunidad autónoma y estaciones con más variación.',
};

export default async function HomePage() {
  let homeData;
  try {
    homeData = await getHomePageData();
  } catch {
    // Fallback: show page without data
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <section className="text-center py-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Precios de Combustibles en España
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            No se pudieron cargar los datos. Asegúrate de que el backend está
            ejecutándose en localhost:3000.
          </p>
        </section>
      </div>
    );
  }

  const { summary, topMovers, communityRanking, mainSeries } = homeData;

  // Preparar datos de la serie temporal para el gráfico
  const chartSeries = [
    {
      name: FUEL_LABELS[DEFAULT_FUEL] || DEFAULT_FUEL,
      data: mainSeries.map((p) => ({
        date: p.date,
        value: parseFloat(p.avgPrice),
      })),
      color: '#2563eb',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero */}
      <section className="text-center py-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Precios de Combustibles en España
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Evolución diaria, rankings por comunidad autónoma y las estaciones
          con más variación de precio.
        </p>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.slice(0, 4).map((fuel) => (
          <KpiCard
            key={fuel.fuelCode}
            label={FUEL_LABELS[fuel.fuelCode] || fuel.fuelName}
            value={fuel.avgPrice}
            className="hover:shadow-md transition-shadow"
          />
        ))}
      </section>

      {/* Gráfico de evolución */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">
          Evolución del precio medio (30 días)
        </h2>
        <div className="rounded-lg border bg-card p-4">
          <PriceEvolutionChart series={chartSeries} height={350} />
        </div>
      </section>

      {/* Ranking de comunidades */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">
          Ranking por comunidad autónoma
        </h2>
        <div className="rounded-lg border">
          <RankingTable
            entries={communityRanking}
            linkPrefix="/comunidad"
            limit={10}
          />
        </div>
      </section>

      {/* Top movers */}
      {topMovers.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4">
            Mayor variación en las últimas 24h
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topMovers.map((mover, i) => (
              <div key={i} className="rounded-lg border p-4">
                <p className="font-medium text-sm truncate">
                  {mover.stationName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {mover.brandName} · {mover.provinceName}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-sm text-muted-foreground line-through">
                    {parseFloat(mover.previousPrice).toFixed(3)}
                  </span>
                  <span className="text-lg font-bold tabular-nums">
                    {parseFloat(mover.newPrice).toFixed(3)}
                  </span>
                  <DeltaIndicator
                    value={parseFloat(mover.deltaPct)}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="mt-12 text-center text-sm text-muted-foreground">
        Datos del Ministerio para la Transición Ecológica (MITECO). Actualizados
        cada 30 minutos.
      </p>
    </div>
  );
}
