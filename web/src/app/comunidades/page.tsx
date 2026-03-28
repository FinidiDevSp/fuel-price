import type { Metadata } from 'next';
import Link from 'next/link';
import { getCommunities, getRankingCommunities } from '@/lib/api-client';
import { DEFAULT_FUEL, ROUTES } from '@/lib/constants';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: 'Comunidades Autónomas',
  description: 'Precios de combustibles por comunidad autónoma en España. Ranking y evolución.',
  path: '/comunidades',
});

export default async function CommunitiesPage() {
  let communities, ranking;
  try {
    [communities, ranking] = await Promise.all([
      getCommunities(),
      getRankingCommunities(DEFAULT_FUEL),
    ]);
  } catch {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-bold">Comunidades Autónomas</h1>
        <p className="mt-2 text-muted-foreground">No se pudieron cargar los datos.</p>
      </div>
    );
  }

  // Merge ranking data with community info
  const rankingMap = new Map(ranking.map((r) => [r.regionSlug, r]));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Comunidades Autónomas</h1>
      <p className="mt-2 text-muted-foreground mb-8">
        Precio medio de Gasolina 95 por comunidad autónoma
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {communities.map((community) => {
          const rankData = rankingMap.get(community.slug);
          return (
            <Link
              key={community.id}
              href={ROUTES.community(community.slug)}
              className="rounded-lg border p-5 hover:shadow-md transition-shadow"
            >
              <p className="font-semibold">{community.name}</p>
              {rankData && (
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-2xl font-bold tabular-nums">
                    {rankData.avgPrice.toFixed(3)}
                  </span>
                  <span className="text-sm text-muted-foreground">EUR/L</span>
                  <span className="text-xs text-muted-foreground">
                    {rankData.stationCount} estaciones
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
