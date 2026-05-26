import type { Locale } from '../i18n/index';

const ORG_ID = 'https://orodjarstvoruda.com/#organization';
const SITE_URL = 'https://orodjarstvoruda.com';

export function buildLocalBusinessSchema(_locale: Locale): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': ORG_ID,
    name: 'RUDA Orodjarstvo',
    alternateName: 'Damjan Rupnik s.p.',
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo/ruda_logo.png`,
    image: `${SITE_URL}/images/logo/ruda_logo.png`,
    telephone: ['+38651664374', '+38641495661'],
    email: 'ruda.orodjarstvo@gmail.com',
    vatID: 'SI52946398',
    taxID: 'SI52946398',
    iso6523Code: '0199:SI52946398',
    foundingDate: '2007',
    founder: { '@type': 'Person', name: 'Damjan Rupnik' },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ledine 34',
      addressLocality: 'Spodnja Idrija',
      postalCode: '5281',
      addressCountry: 'SI',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 46.03957569239691,
      longitude: 14.049149609342338,
    },
    areaServed: [
      { '@type': 'Country', name: 'Slovenia' },
      { '@type': 'Country', name: 'Germany' },
      { '@type': 'Country', name: 'Austria' },
      { '@type': 'Country', name: 'Italy' },
    ],
    knowsAbout: [
      'CNC milling', '5-axis machining', 'hard milling 65 HRC',
      'carbide machining', 'WIDIA', 'precision toolmaking',
      'stamping dies', 'moulds', 'surface grinding', 'profile grinding',
      'micro-machining',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'CNC Milling' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'CNC Turning' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Precision Grinding' } },
      ],
    },
  };
}

export interface ServiceSchemaInput {
  key: 'milling' | 'turning' | 'grinding';
  locale: Locale;
  name: string;
  description: string;
  offers: string[];
}

export function buildServiceSchema(input: ServiceSchemaInput): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    serviceType: input.name,
    provider: { '@id': ORG_ID },
    areaServed: [
      { '@type': 'Country', name: 'Slovenia' },
      { '@type': 'Country', name: 'Germany' },
      { '@type': 'Country', name: 'Austria' },
      { '@type': 'Country', name: 'Italy' },
    ],
    description: input.description,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      itemListElement: input.offers.map((label) => ({
        '@type': 'Offer',
        name: label,
      })),
    },
  };
}

export interface BreadcrumbItem { name: string; url: string; }

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export interface FAQItem { q: string; a: string; }

export function buildFAQSchema(items: FAQItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}
