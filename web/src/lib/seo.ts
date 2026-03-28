import type { Metadata } from 'next';
import { SITE_NAME } from './constants';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fuelprice.es';

export function buildMetadata(params: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  const fullTitle = `${params.title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description: params.description,
    openGraph: {
      title: fullTitle,
      description: params.description,
      url: `${SITE_URL}${params.path}`,
      siteName: SITE_NAME,
      locale: 'es_ES',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: params.description,
    },
    alternates: {
      canonical: `${SITE_URL}${params.path}`,
    },
    ...(params.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

// JSON-LD para páginas de estación
export function buildGasStationJsonLd(station: {
  name: string;
  address: string | null;
  lat: string;
  lng: string;
  openingHours: string | null;
  brand: { name: string } | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'GasStation',
    name: station.name,
    address: station.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: station.address,
          addressCountry: 'ES',
        }
      : undefined,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: parseFloat(station.lat),
      longitude: parseFloat(station.lng),
    },
    openingHours: station.openingHours ?? undefined,
    brand: station.brand
      ? { '@type': 'Brand', name: station.brand.name }
      : undefined,
  };
}

// JSON-LD genérico para páginas web
export function buildWebPageJsonLd(params: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: params.title,
    description: params.description,
    url: `${SITE_URL}${params.path}`,
    inLanguage: 'es',
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
