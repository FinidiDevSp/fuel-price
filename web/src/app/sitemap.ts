import type { MetadataRoute } from 'next';
import { getCommunities, getProvinces, getFuelTypes } from '@/lib/api-client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fuelprice.es';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE_URL}/comunidades`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ];

  try {
    const [communities, provinces, fuelTypes] = await Promise.all([
      getCommunities(),
      getProvinces(),
      getFuelTypes(),
    ]);

    for (const ft of fuelTypes.slice(0, 5)) {
      entries.push({
        url: `${SITE_URL}/combustible/${ft.code}`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.9,
      });
    }

    for (const c of communities) {
      entries.push({
        url: `${SITE_URL}/comunidad/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.8,
      });
    }

    for (const p of provinces) {
      entries.push({
        url: `${SITE_URL}/provincia/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.7,
      });
    }
  } catch {
    // Return basic sitemap if API is unavailable
  }

  return entries;
}
