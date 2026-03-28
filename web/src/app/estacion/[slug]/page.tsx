import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStationBySlug, getStationPrices, getStationHistory } from '@/lib/api-client';
import { FUEL_LABELS, DEFAULT_FUEL, ROUTES } from '@/lib/constants';
import { buildMetadata, buildGasStationJsonLd } from '@/lib/seo';
import { NavBreadcrumb } from '@/components/layout/nav-breadcrumb';
import { PriceEvolutionChart } from '@/components/charts/price-evolution-chart';
import { DeltaIndicator } from '@/components/shared/delta-indicator';

export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ fuel?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return buildMetadata({
    title: `Estación ${slug}`,
    description: `Precios de combustible actualizados para esta estación de servicio.`,
    path: ROUTES.station(slug),
  });
}

export default async function StationPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { fuel } = await searchParams;
  const fuelCode = fuel || DEFAULT_FUEL;

  let station, prices, history;
  try {
    [station, prices, history] = await Promise.all([
      getStationBySlug(slug),
      getStationPrices(slug),
      getStationHistory(slug, fuelCode, 30),
    ]);
  } catch {
    notFound();
  }

  if (!station) notFound();

  const jsonLd = buildGasStationJsonLd(station);

  const chartSeries = history.length > 0 ? [{
    name: FUEL_LABELS[fuelCode] || fuelCode,
    data: history.map((h) => ({
      date: h.date,
      value: h.avgPrice,
    })),
    color: '#2563eb',
  }] : [];

  // Breadcrumbs
  const breadcrumbs = [];
  if (station.regionCommunity) {
    breadcrumbs.push({
      label: station.regionCommunity.name,
      href: ROUTES.community(station.regionCommunity.slug),
    });
  }
  if (station.regionProvince) {
    breadcrumbs.push({
      label: station.regionProvince.name,
      href: ROUTES.province(station.regionProvince.slug),
    });
  }
  breadcrumbs.push({ label: station.name });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <NavBreadcrumb items={breadcrumbs} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{station.name}</h1>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {station.brand && <span>{station.brand.name}</span>}
          {station.address && <span>{station.address}</span>}
          {station.openingHours && <span>Horario: {station.openingHours}</span>}
        </div>
      </div>

      {/* Precios actuales */}
      {prices.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Precios actuales</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {prices.map((p) => (
              <div key={p.id} className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  {FUEL_LABELS[p.fuelType.code] || p.fuelType.name}
                </p>
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-2xl font-bold tabular-nums">
                    {parseFloat(p.price).toFixed(3)}
                  </span>
                  <span className="text-sm text-muted-foreground">EUR/L</span>
                  {p.deltaAbs && parseFloat(p.deltaAbs) !== 0 && (
                    <DeltaIndicator
                      value={parseFloat(p.deltaPct || '0')}
                    />
                  )}
                </div>
                {p.previousPrice && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Anterior: {parseFloat(p.previousPrice).toFixed(3)} EUR/L
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gráfico histórico */}
      {chartSeries.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Histórico de precios (30 días)
          </h2>
          <div className="rounded-lg border bg-card p-4">
            <PriceEvolutionChart series={chartSeries} height={300} />
          </div>
        </section>
      )}

      {/* Info */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Información</h2>
        <div className="rounded-lg border p-4 grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Marca</span>
            <span>{station.brand?.name ?? 'Sin marca'}</span>
          </div>
          {station.address && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dirección</span>
              <span>{station.address}</span>
            </div>
          )}
          {station.postalCode && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Código postal</span>
              <span>{station.postalCode}</span>
            </div>
          )}
          {station.openingHours && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Horario</span>
              <span>{station.openingHours}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Coordenadas</span>
            <span>{station.lat}, {station.lng}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
