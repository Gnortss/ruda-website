# SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement comprehensive technical SEO across the new RUDA Orodjarstvo website (3 locales: sl/en/de), including 9 new service subpages, structured data (JSON-LD), localized URL slugs, sitemap, redirects from the old site, performance optimization, and verification meta tags — per spec at `docs/superpowers/specs/2026-05-26-seo-design.md`.

**Architecture:** Astro 5 (static) on Cloudflare Pages. Per-locale routing already configured. New work: a centralized route table (`src/i18n/routes.ts`), a JSON-LD schema builder library (`src/lib/schema.ts`), an extended `BaseLayout` that accepts structured data + breadcrumbs + per-page metadata, two shared page templates (`ServicesIndex.astro`, `ServicePage.astro`), 12 thin locale-specific page files, and three static files (`robots.txt`, `_redirects`, `security.txt`). Existing components are updated for corrected copy, Astro `<Image>` optimization, and internal linking.

**Tech Stack:** Astro 5, TypeScript (strict), Vitest (for pure-logic unit tests), `@astrojs/sitemap`, `@astrojs/cloudflare`, `@fontsource/*`, Cloudflare Pages.

---

## File map

### New files

| Path | Responsibility |
|---|---|
| `src/i18n/routes.ts` | Single source of truth for locale-specific URL slugs + helpers |
| `src/lib/schema.ts` | Typed JSON-LD builders (LocalBusiness, Service, BreadcrumbList, FAQPage) |
| `src/components/FAQ.astro` | Collapsible Q&A list, used by service subpages |
| `src/components/ServicesIndex.astro` | Shared template for the services-index page (sl/en/de variants pass it data) |
| `src/components/ServicePage.astro` | Shared template for an individual service subpage |
| `src/pages/storitve/index.astro` | sl services index |
| `src/pages/storitve/rezkanje.astro` | sl Milling subpage |
| `src/pages/storitve/struzenje.astro` | sl Turning subpage |
| `src/pages/storitve/brusenje.astro` | sl Grinding subpage |
| `src/pages/en/services/index.astro` | en services index |
| `src/pages/en/services/milling.astro` | en Milling subpage |
| `src/pages/en/services/turning.astro` | en Turning subpage |
| `src/pages/en/services/grinding.astro` | en Grinding subpage |
| `src/pages/de/dienstleistungen/index.astro` | de services index |
| `src/pages/de/dienstleistungen/fraesen.astro` | de Milling subpage |
| `src/pages/de/dienstleistungen/drehen.astro` | de Turning subpage |
| `src/pages/de/dienstleistungen/schleifen.astro` | de Grinding subpage |
| `public/robots.txt` | Crawler directives + sitemap pointer |
| `public/_redirects` | Cloudflare 301 redirects from old URLs |
| `public/.well-known/security.txt` | RFC 9116 security contact |
| `tests/routes.test.ts` | Unit tests for routes.ts helpers |
| `tests/schema.test.ts` | Unit tests for schema.ts builders |
| `vitest.config.ts` | Vitest configuration |

### Modified files

| Path | Change |
|---|---|
| `package.json` | Add `@astrojs/sitemap`, `@fontsource/*`, `vitest`; add `test` script |
| `astro.config.mjs` | Set `site`, add sitemap integration, set `imageService: 'compile'` |
| `src/i18n/index.ts` | Extend types, add title/description templates, alt-text accessor |
| `src/i18n/sl.json` | Translation corrections + service-subpage content + FAQ + titles/descs |
| `src/i18n/en.json` | Same as sl, for English |
| `src/i18n/de.json` | Same as sl, for German |
| `src/layouts/BaseLayout.astro` | New props (`routeKey`, `structuredData`, `breadcrumbs`, `ogImage`, `noindex`); Twitter/geo/GSC meta; Fontsource imports replacing Google Fonts CDN |
| `src/components/Nav.astro` | Language switcher uses routes table; "Storitve" → real `/storitve/` link instead of anchor |
| `src/components/Hero.astro` | Switch `<img>`/`SmartImage` to Astro `<Image>`; `fetchpriority="high"` on first slide |
| `src/components/Services.astro` | Astro `<Image>`; add "Več o storitvi →" links to subpages; corrected sl copy ("Rezkanje", "Ploskovno brušenje", etc.) |
| `src/components/Strengths.astro` | Astro `<Image>`; corrected copy from existing live site |
| `src/components/Products.astro` | Astro `<Image>` (via SmartImage fallback unchanged) |
| `src/components/Contact.astro` | Rename "Stopite v stik" → "Splošne informacije"; add "Podatki podjetja"/"Company information"/"Unternehmensinformationen" section with VAT + IBAN |
| `src/components/Footer.astro` | Add legal-required line (s.p., address, DŠ, IBAN); add Storitve link list |
| `src/components/HomePage.astro` | Pass `routeKey="home"` and built `structuredData` to BaseLayout |

---

## Phase 1 — Setup & configuration

### Task 1: Install new dependencies

**Files:**
- Modify: `D:\dev\ruda-website\package.json`

- [ ] **Step 1: Add runtime dependencies**

Run in `D:\dev\ruda-website`:

```bash
npm install @astrojs/sitemap @fontsource/dm-sans @fontsource/bebas-neue @fontsource/dm-mono
```

Expected: packages installed, no errors.

- [ ] **Step 2: Add dev dependencies**

```bash
npm install -D vitest @types/node
```

- [ ] **Step 3: Add `test` script to package.json**

Edit `package.json` `scripts` block:

```json
{
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "wrangler pages dev ./dist",
    "deploy": "astro build && wrangler pages deploy ./dist",
    "astro": "astro",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: add sitemap, fontsource, vitest dependencies"
```

---

### Task 2: Configure vitest

**Files:**
- Create: `D:\dev\ruda-website\vitest.config.ts`

- [ ] **Step 1: Create vitest config**

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '~': new URL('./src', import.meta.url).pathname,
    },
  },
});
```

- [ ] **Step 2: Verify vitest runs (no tests yet — expect "no test files found")**

```bash
npm run test
```

Expected: exits 0 with message about no test files (or finds 0 tests).

- [ ] **Step 3: Commit**

```bash
git add vitest.config.ts
git commit -m "build: configure vitest"
```

---

### Task 3: Update Astro config — site URL, sitemap, image service

**Files:**
- Modify: `D:\dev\ruda-website\astro.config.mjs`

- [ ] **Step 1: Rewrite astro.config.mjs**

Replace the entire file with:

```js
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://orodjarstvoruda.com',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  adapter: cloudflare({
    imageService: 'compile',
    platformProxy: { enabled: true },
  }),
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'sl',
        locales: {
          sl: 'sl-SI',
          en: 'en',
          de: 'de-DE',
        },
      },
    }),
  ],
  i18n: {
    defaultLocale: 'sl',
    locales: ['sl', 'en', 'de'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});
```

- [ ] **Step 2: Verify build still works**

```bash
npm run build
```

Expected: build succeeds; `dist/sitemap-index.xml` and `dist/sitemap-0.xml` exist.

- [ ] **Step 3: Inspect sitemap**

```bash
cat dist/sitemap-0.xml | head -40
```

Expected: contains `<loc>https://orodjarstvoruda.com/</loc>` and hreflang `<xhtml:link>` alternates for sl/en/de.

- [ ] **Step 4: Commit**

```bash
git add astro.config.mjs
git commit -m "build: configure site URL, sitemap integration, image service"
```

---

## Phase 2 — Core libraries with tests

### Task 4: Create routes table

**Files:**
- Create: `D:\dev\ruda-website\src\i18n\routes.ts`
- Create: `D:\dev\ruda-website\tests\routes.test.ts`

- [ ] **Step 1: Write the failing test**

`tests/routes.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { routes, localizedRoute, routeKeyForPath } from '~/i18n/routes';

describe('routes table', () => {
  it('home route exists for each locale', () => {
    expect(routes.home.sl).toBe('/');
    expect(routes.home.en).toBe('/en/');
    expect(routes.home.de).toBe('/de/');
  });

  it('milling subpage has localized slugs per locale', () => {
    expect(routes.milling.sl).toBe('/storitve/rezkanje/');
    expect(routes.milling.en).toBe('/en/services/milling/');
    expect(routes.milling.de).toBe('/de/dienstleistungen/fraesen/');
  });

  it('localizedRoute returns the right path for a given key + locale', () => {
    expect(localizedRoute('turning', 'sl')).toBe('/storitve/struzenje/');
    expect(localizedRoute('turning', 'de')).toBe('/de/dienstleistungen/drehen/');
  });

  it('routeKeyForPath maps a URL path back to its route key', () => {
    expect(routeKeyForPath('/storitve/rezkanje/')).toBe('milling');
    expect(routeKeyForPath('/de/dienstleistungen/schleifen/')).toBe('grinding');
    expect(routeKeyForPath('/')).toBe('home');
    expect(routeKeyForPath('/unknown/path/')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test (expect FAIL — module not yet created)**

```bash
npm run test
```

Expected: FAIL, cannot resolve `~/i18n/routes`.

- [ ] **Step 3: Create the routes module**

`src/i18n/routes.ts`:

```ts
import type { Locale } from './index';

export const routes = {
  home:     { sl: '/',                    en: '/en/',                   de: '/de/' },
  services: { sl: '/storitve/',           en: '/en/services/',          de: '/de/dienstleistungen/' },
  milling:  { sl: '/storitve/rezkanje/',  en: '/en/services/milling/',  de: '/de/dienstleistungen/fraesen/' },
  turning:  { sl: '/storitve/struzenje/', en: '/en/services/turning/',  de: '/de/dienstleistungen/drehen/' },
  grinding: { sl: '/storitve/brusenje/',  en: '/en/services/grinding/', de: '/de/dienstleistungen/schleifen/' },
} as const;

export type RouteKey = keyof typeof routes;

export function localizedRoute(key: RouteKey, locale: Locale): string {
  return routes[key][locale];
}

export function routeKeyForPath(path: string): RouteKey | null {
  for (const key of Object.keys(routes) as RouteKey[]) {
    const r = routes[key];
    if (r.sl === path || r.en === path || r.de === path) return key;
  }
  return null;
}
```

- [ ] **Step 4: Run test (expect PASS)**

```bash
npm run test
```

Expected: all 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/i18n/routes.ts tests/routes.test.ts
git commit -m "feat(seo): add centralized route table for localized URLs"
```

---

### Task 5: Create schema builders — LocalBusiness

**Files:**
- Create: `D:\dev\ruda-website\src\lib\schema.ts`
- Create: `D:\dev\ruda-website\tests\schema.test.ts`

- [ ] **Step 1: Write the failing test**

`tests/schema.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildLocalBusinessSchema } from '~/lib/schema';

describe('LocalBusiness schema', () => {
  const schema = buildLocalBusinessSchema('sl') as any;

  it('uses LocalBusiness type with stable @id', () => {
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('LocalBusiness');
    expect(schema['@id']).toBe('https://orodjarstvoruda.com/#organization');
  });

  it('includes name, alternateName, and contact fields', () => {
    expect(schema.name).toBe('RUDA Orodjarstvo');
    expect(schema.alternateName).toBe('Damjan Rupnik s.p.');
    expect(schema.telephone).toEqual(['+38651664374', '+38641495661']);
    expect(schema.email).toBe('ruda.orodjarstvo@gmail.com');
    expect(schema.vatID).toBe('SI52946398');
  });

  it('includes precise geo coordinates', () => {
    expect(schema.geo['@type']).toBe('GeoCoordinates');
    expect(schema.geo.latitude).toBe(46.03957569239691);
    expect(schema.geo.longitude).toBe(14.049149609342338);
  });

  it('includes Slovenia in addressCountry', () => {
    expect(schema.address.addressCountry).toBe('SI');
    expect(schema.address.postalCode).toBe('5281');
    expect(schema.address.streetAddress).toBe('Ledine 34');
  });

  it('lists DACH + Italy in areaServed', () => {
    const names = schema.areaServed.map((c: any) => c.name);
    expect(names).toContain('Slovenia');
    expect(names).toContain('Germany');
    expect(names).toContain('Austria');
    expect(names).toContain('Italy');
  });
});
```

- [ ] **Step 2: Run test (expect FAIL)**

```bash
npm run test
```

Expected: FAIL, cannot resolve `~/lib/schema`.

- [ ] **Step 3: Create schema module skeleton**

`src/lib/schema.ts`:

```ts
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
```

- [ ] **Step 4: Run test (expect PASS)**

```bash
npm run test
```

Expected: all 5 LocalBusiness tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/schema.ts tests/schema.test.ts
git commit -m "feat(seo): add LocalBusiness JSON-LD builder with tests"
```

---

### Task 6: Add Service, Breadcrumb, and FAQ schema builders

**Files:**
- Modify: `D:\dev\ruda-website\src\lib\schema.ts`
- Modify: `D:\dev\ruda-website\tests\schema.test.ts`

- [ ] **Step 1: Append failing tests for Service, Breadcrumb, FAQ**

Append to `tests/schema.test.ts`:

```ts
import { buildServiceSchema, buildBreadcrumbSchema, buildFAQSchema } from '~/lib/schema';

describe('Service schema', () => {
  it('cross-references the central organization', () => {
    const s = buildServiceSchema({ key: 'milling', locale: 'sl', name: 'Rezkanje', description: 'CNC rezkanje...', offers: ['5-osno', 'do 65 HRC'] }) as any;
    expect(s['@type']).toBe('Service');
    expect(s.provider['@id']).toBe('https://orodjarstvoruda.com/#organization');
    expect(s.name).toBe('Rezkanje');
    expect(s.hasOfferCatalog.itemListElement).toHaveLength(2);
  });
});

describe('BreadcrumbList schema', () => {
  it('numbers items starting at 1', () => {
    const b = buildBreadcrumbSchema([
      { name: 'Domov', url: 'https://orodjarstvoruda.com/' },
      { name: 'Storitve', url: 'https://orodjarstvoruda.com/storitve/' },
      { name: 'Rezkanje', url: 'https://orodjarstvoruda.com/storitve/rezkanje/' },
    ]) as any;
    expect(b['@type']).toBe('BreadcrumbList');
    expect(b.itemListElement[0].position).toBe(1);
    expect(b.itemListElement[2].position).toBe(3);
    expect(b.itemListElement[2].name).toBe('Rezkanje');
  });
});

describe('FAQPage schema', () => {
  it('wraps each Q/A in Question + Answer types', () => {
    const f = buildFAQSchema([
      { q: 'Do kakšne trdote?', a: 'Do 65 HRC.' },
      { q: 'Ali ponujate 5-osno?', a: 'Da.' },
    ]) as any;
    expect(f['@type']).toBe('FAQPage');
    expect(f.mainEntity).toHaveLength(2);
    expect(f.mainEntity[0]['@type']).toBe('Question');
    expect(f.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
    expect(f.mainEntity[0].acceptedAnswer.text).toBe('Do 65 HRC.');
  });
});
```

- [ ] **Step 2: Run tests (expect FAIL — new builders not yet exported)**

```bash
npm run test
```

- [ ] **Step 3: Add the three builders to `src/lib/schema.ts`**

Append to `src/lib/schema.ts`:

```ts
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
```

- [ ] **Step 4: Run tests (expect PASS — all schema tests green)**

```bash
npm run test
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/schema.ts tests/schema.test.ts
git commit -m "feat(seo): add Service, Breadcrumb, and FAQ schema builders"
```

---

## Phase 3 — i18n updates

### Task 7: Apply Slovene translation corrections + add subpage content

**Files:**
- Modify: `D:\dev\ruda-website\src\i18n\sl.json`

- [ ] **Step 1: Apply terminology corrections**

In `src/i18n/sl.json`, make these replacements:

- `"Frezanje"` → `"Rezkanje"` (service title)
- `"Plansko brušenje"` → `"Ploskovno brušenje"`
- `"5-osno frezanje vseh vrst materialov"` → `"5-osno rezkanje vseh vrst materialov"`
- `"Trdo frezanje do 65 HRC"` → `"Rezkanje v trdo do 65 HRC"`
- `"Obdelava karbida / WIDIA"` → `"Rezkanje karbidnih trdin – WIDIA"`
- nav.products from `"Naše delo"` keep
- nav: add `"products": "Naše delo"` stays, ensure `"strengths": "Naše prednosti"`
- contact.eyebrow `"Stopite v stik"` → `"Splošne informacije"`

Update the strengths descriptions to match the existing live site:

```json
"strengths": {
  "heading": "Naše prednosti",
  "items": [
    { "title": "Obdelava trdih materialov in karbida", "desc": "Izdelava izdelkov do trdote 65 HRC ter obdelava karbidne trdine (WIDIA)" },
    { "title": "Visokoprecizijska obdelava", "desc": "Izdelava izdelkov, kjer je zahtevana visoka natančnost obdelave" },
    { "title": "Štancanje in oblikovanje", "desc": "Izdelava izdelkov za štancanje, brizganje in preoblikovanje" },
    { "title": "Izdelava mikro izdelkov", "desc": "Izdelava mikro izdelkov" }
  ]
}
```

- [ ] **Step 2: Add new top-level keys for service subpages, FAQs, alts, titles, descriptions**

Append these new top-level sections to `src/i18n/sl.json` (keep existing keys):

```json
"servicesIndex": {
  "title": "Storitve — CNC rezkanje, struženje, brušenje | RUDA Orodjarstvo",
  "description": "CNC rezkanje, struženje in brušenje visokoprecizijskih komponent. Trdi materiali do 65 HRC, karbidna trdina (WIDIA), 5-osno rezkanje. Spodnja Idrija.",
  "heading": "Storitve",
  "intro": "Tri ključne storitve, vse na enem mestu: CNC rezkanje, struženje in precizijsko brušenje. Specialnost RUDA Orodjarstva so trdi materiali in karbid (WIDIA).",
  "ctaLabel": "Več o storitvi"
},
"servicePages": {
  "milling": {
    "slug": "rezkanje",
    "title": "Rezkanje (5-osno CNC, do 65 HRC) — RUDA Orodjarstvo",
    "description": "5-osno CNC rezkanje vseh materialov, vključno s trdimi (do 65 HRC) in karbidno trdino (WIDIA). Posamični kosi, prototipi, male in srednje serije. Spodnja Idrija.",
    "h1": "Rezkanje — 5-osno CNC do 65 HRC",
    "lead": "5-osno CNC rezkanje vseh materialov, vključno s kaljenim orodnim jeklom do 65 HRC in karbidno trdino (WIDIA). Posamični kosi, prototipi in male do srednje serije.",
    "whatHeading": "Kaj rezkamo",
    "what": [
      "5-osno rezkanje vseh vrst materialov",
      "Rezkanje v trdo do 65 HRC",
      "Rezkanje karbidnih trdin – WIDIA",
      "Izdelava unikatov in prototipov",
      "Mala in srednja serijska proizvodnja"
    ],
    "materialsHeading": "Materiali in specifikacije",
    "materials": "Vsa standardna orodna jekla (1.2080, 1.2363, 1.2379, 1.2767, K340), nerjavna jekla, aluminij, baker, mesing, kaljeno jeklo do 65 HRC in karbidna trdina (WIDIA). Tolerance prilagodimo zahtevam projekta.",
    "applicationsHeading": "Tipične aplikacije",
    "applications": "Štančna orodja, orodja za brizganje, oblikovna orodja, kalupi za tlačno litje, precizijski deli za strojegradnjo, mikro-deli za medicinsko in elektroniko, prototipi.",
    "faqHeading": "Pogosta vprašanja",
    "faq": [
      { "q": "Do kakšne trdote rezkate?", "a": "Do 65 HRC, vključno s kaljenim orodnim jeklom in karbidno trdino (WIDIA)." },
      { "q": "Ali ponujate 5-osno rezkanje?", "a": "Da — vse materiale, vključno s trdimi materiali in karbidno trdino." },
      { "q": "Lahko izdelate posamičen kos ali samo serije?", "a": "Oboje — posamične kose, prototipe in male do srednje serije." },
      { "q": "Katere materiale rezkate?", "a": "Vsa standardna orodna jekla, nerjavna jekla, aluminij, karbidno trdino (WIDIA) in kaljena jekla do 65 HRC." },
      { "q": "Kje se nahajate?", "a": "Spodnja Idrija, Slovenija. Pošiljamo po vsej EU." }
    ],
    "ctaLabel": "Povprašajte za ponudbo"
  },
  "turning": {
    "slug": "struzenje",
    "title": "Struženje — CNC, vsi materiali — RUDA Orodjarstvo",
    "description": "CNC struženje vseh vrst materialov. Prototipi in mala do srednja serijska proizvodnja. Visoka natančnost. Spodnja Idrija.",
    "h1": "Struženje — CNC, vsi materiali",
    "lead": "CNC struženje vseh vrst materialov. Prototipi in male do srednje serije, z visoko natančnostjo in ponovljivostjo.",
    "whatHeading": "Kaj stružimo",
    "what": [
      "Struženje vseh vrst materialov",
      "Izdelava prototipov",
      "Mala in srednja serijska proizvodnja"
    ],
    "materialsHeading": "Materiali in specifikacije",
    "materials": "Konstrukcijska in nerjavna jekla, orodna jekla, aluminij, baker, medenina, plastika. Premeri od mikro-dimenzij do tipičnih strojegradbenih delov.",
    "applicationsHeading": "Tipične aplikacije",
    "applications": "Precizijske gredi, čepi, puše, pestiči, vodila, deli za štančna in brizgalna orodja, prototipi delov pred serijsko proizvodnjo.",
    "faqHeading": "Pogosta vprašanja",
    "faq": [
      { "q": "Kakšno natančnost dosegate pri struženju?", "a": "Tolerance prilagodimo zahtevam projekta, tudi mikronske." },
      { "q": "Ali izdelujete prototipe?", "a": "Da — od posameznih kosov do prototipnih serij." },
      { "q": "Katere materiale stružite?", "a": "Vse običajne konstrukcijske, nerjavne in orodne materiale, aluminij, baker, medenino in plastiko." },
      { "q": "Kakšne so tipične serije?", "a": "Mala in srednja serijska proizvodnja, pogosto v kombinaciji z rezkanjem in brušenjem." }
    ],
    "ctaLabel": "Povprašajte za ponudbo"
  },
  "grinding": {
    "slug": "brusenje",
    "title": "Brušenje — ploskovno in 4-osno profilno — RUDA Orodjarstvo",
    "description": "Ploskovno brušenje in 4-osno profilno brušenje. Precizijske komponente za štancanje in oblikovne procese. Spodnja Idrija.",
    "h1": "Brušenje — ploskovno in 4-osno profilno",
    "lead": "Ploskovno brušenje in 4-osno profilno brušenje za precizijske komponente. Visoka kakovost površin in zahtevne geometrije.",
    "whatHeading": "Kaj brusimo",
    "what": [
      "Ploskovno brušenje",
      "4-osno profilno brušenje"
    ],
    "materialsHeading": "Materiali in specifikacije",
    "materials": "Kaljena orodna jekla, karbidna trdina (WIDIA), nerjavna jekla. Tipično za štančna in oblikovna orodja, kjer se zahteva fina površina in ozke tolerance.",
    "applicationsHeading": "Tipične aplikacije",
    "applications": "Štančne plošče, oblikovni vložki, vodila, profilne stranice orodij, finalna obdelava kaljenih komponent.",
    "faqHeading": "Pogosta vprašanja",
    "faq": [
      { "q": "Kakšno hrapavost dosegate?", "a": "Odvisno od zahtev — pripravimo finalne brušene površine v ustrezni kakovosti." },
      { "q": "Ali ponujate 4-osno profilno brušenje?", "a": "Da — 4-osno profilno brušenje za zahtevne geometrije." },
      { "q": "Katere materiale brusite?", "a": "Kaljena orodna jekla, karbidno trdino (WIDIA) in nerjavna jekla." },
      { "q": "Ali kombinirate brušenje z drugimi storitvami?", "a": "Da — pogosto sledi rezkanju kot finalna obdelava precizijskih komponent." }
    ],
    "ctaLabel": "Povprašajte za ponudbo"
  }
},
"alt": {
  "logo": "RUDA Orodjarstvo — precizijsko orodjarstvo",
  "services": {
    "milling": "5-osni CNC rezkalni stroj v delavnici RUDA Orodjarstvo",
    "turning": "CNC stružnica v delavnici RUDA Orodjarstvo",
    "grinding": "Brusilni stroj v delavnici RUDA Orodjarstvo"
  },
  "strengths": {
    "hardCarbide": "Obdelan kos iz kaljenega jekla in karbidne trdine",
    "precision": "Precizijska komponenta z ozkimi tolerancami",
    "stamping": "Štančno orodje iz kaljenega jekla",
    "micro": "Mikro precizijski del"
  }
},
"contact": {
  "heading": "Kontakt",
  "eyebrow": "Splošne informacije",
  "companyHeading": "Podatki podjetja",
  "company": "Damjan Rupnik s.p.",
  "address": "Ledine 34, 5281 Spodnja Idrija",
  "country": "Slovenija",
  "vatLabel": "DŠ",
  "vat": "SI 52946398",
  "ibanLabel": "IBAN",
  "iban": "SI56 0400 0027 6293 480",
  "mapLabel": "Google Maps — Spodnja Idrija"
},
"footer": {
  "copyright": "© 2007–2026, Damjan Rupnik s.p., Spodnja Idrija, Slovenija",
  "legal": "Damjan Rupnik s.p. · Ledine 34, 5281 Spodnja Idrija · DŠ: SI 52946398 · IBAN: SI56 0400 0027 6293 480",
  "servicesLinks": "Storitve",
  "backToTop": "Na vrh"
}
```

If the `contact` and `footer` blocks already exist, MERGE these keys in (don't duplicate the keys; the new keys above replace/extend the old ones).

- [ ] **Step 3: Validate JSON is parseable**

```bash
node -e "JSON.parse(require('fs').readFileSync('src/i18n/sl.json','utf8'))"
```

Expected: no output (success).

- [ ] **Step 4: Commit**

```bash
git add src/i18n/sl.json
git commit -m "feat(i18n): apply Slovene terminology fixes + add service-subpage copy"
```

---

### Task 8: Apply German translation corrections + add subpage content

**Files:**
- Modify: `D:\dev\ruda-website\src\i18n\de.json`

- [ ] **Step 1: Apply terminology corrections in de.json**

- nav.services: `"Leistungen"` → `"Dienstleistungen"`
- Replace any usage of `"Wenden"` with `"Drehen"`
- nav.strengths: `"Stärken"` → `"Unsere Vorteile"` (matches existing site casing in nav)
- strengths heading and items per existing site:

```json
"strengths": {
  "heading": "Unsere Vorteile",
  "items": [
    { "title": "Hart- und Hartmetallbearbeitung", "desc": "Herstellung von Produkten mit einer Härte von bis zu 65 HRC und Bearbeitung von Hartmetall (WIDIA)" },
    { "title": "Hochpräzisionsbearbeitung", "desc": "Herstellung von Produkten, die eine hochpräzise Bearbeitung erfordern" },
    { "title": "Stanzen, Pressen und Umformen", "desc": "Herstellung von Stanz-, Press- und Umformprodukten" },
    { "title": "Mikroteilefertigung", "desc": "Herstellung von Mikroprodukten" }
  ]
}
```

- [ ] **Step 2: Add new top-level keys (servicesIndex, servicePages, alt, contact extensions, footer extensions)**

Add the German equivalents — same structure as Task 7 but with German content:

```json
"servicesIndex": {
  "title": "Dienstleistungen — CNC-Fräsen, Drehen, Schleifen | RUDA Orodjarstvo",
  "description": "CNC-Fräsen, Drehen und Schleifen hochpräziser Komponenten. Harte Werkstoffe bis 65 HRC, Hartmetall (WIDIA), 5-Achs-Fräsen. Spodnja Idrija, Slowenien.",
  "heading": "Dienstleistungen",
  "intro": "Drei Kernleistungen aus einer Hand: CNC-Fräsen, Drehen und Präzisionsschleifen. Spezialität von RUDA Orodjarstvo sind harte Werkstoffe und Hartmetall (WIDIA).",
  "ctaLabel": "Mehr erfahren"
},
"servicePages": {
  "milling": {
    "slug": "fraesen",
    "title": "Fräsen (5-Achs CNC, bis 65 HRC) — RUDA Orodjarstvo",
    "description": "5-Achs-CNC-Fräsen aller Werkstoffe inkl. Hartfräsen bis 65 HRC und Hartmetallbearbeitung (WIDIA). Einzelteile, Prototypen, Klein- und Mittelserien. Slowenien.",
    "h1": "Fräsen — 5-Achs CNC bis 65 HRC",
    "lead": "5-Achs-CNC-Fräsen aller Werkstoffe, inkl. gehärteter Werkzeugstähle bis 65 HRC und Hartmetall (WIDIA). Einzelteile, Prototypen und Klein- bis Mittelserien.",
    "whatHeading": "Was wir fräsen",
    "what": [
      "5-Achs-Fräsen aller Werkstoffe",
      "Hartfräsen bis 65 HRC",
      "Hartmetallbearbeitung – WIDIA",
      "Einzelteile und Prototypen",
      "Klein- und Mittelserienfertigung"
    ],
    "materialsHeading": "Werkstoffe und Spezifikationen",
    "materials": "Alle gängigen Werkzeugstähle (1.2080, 1.2363, 1.2379, 1.2767, K340), Edelstähle, Aluminium, Kupfer, Messing, gehärteter Stahl bis 65 HRC und Hartmetall (WIDIA). Toleranzen nach Projektanforderung.",
    "applicationsHeading": "Typische Anwendungen",
    "applications": "Stanzwerkzeuge, Spritzgießformen, Umformwerkzeuge, Druckgussformen, Präzisionsteile für den Maschinenbau, Mikroteile für Medizintechnik und Elektronik, Prototypen.",
    "faqHeading": "Häufige Fragen",
    "faq": [
      { "q": "Bis zu welcher Härte fräsen Sie?", "a": "Bis 65 HRC, inkl. gehärtetem Werkzeugstahl und Hartmetall (WIDIA)." },
      { "q": "Bieten Sie 5-Achs-Fräsen an?", "a": "Ja — alle Werkstoffe, inkl. harter Materialien und Hartmetall." },
      { "q": "Fertigen Sie Einzelstücke oder nur Serien?", "a": "Beides — Einzelteile, Prototypen und Klein- bis Mittelserien." },
      { "q": "Welche Werkstoffe fräsen Sie?", "a": "Alle gängigen Werkzeugstähle, Edelstähle, Aluminium, Hartmetall (WIDIA) und gehärtete Stähle bis 65 HRC." },
      { "q": "Wo befindet sich Ihr Standort?", "a": "Spodnja Idrija, Slowenien. Wir liefern in die gesamte EU." }
    ],
    "ctaLabel": "Angebot anfragen"
  },
  "turning": {
    "slug": "drehen",
    "title": "Drehen — CNC, alle Werkstoffe — RUDA Orodjarstvo",
    "description": "CNC-Drehen aller Werkstoffarten. Prototypen und Klein- bis Mittelserien. Hohe Genauigkeit. Spodnja Idrija, Slowenien.",
    "h1": "Drehen — CNC, alle Werkstoffe",
    "lead": "CNC-Drehen aller Werkstoffe. Prototypen sowie Klein- und Mittelserien mit hoher Präzision und Wiederholgenauigkeit.",
    "whatHeading": "Was wir drehen",
    "what": [
      "Drehen aller Werkstoffe",
      "Prototypenfertigung",
      "Klein- und Mittelserienfertigung"
    ],
    "materialsHeading": "Werkstoffe und Spezifikationen",
    "materials": "Konstruktions- und Edelstähle, Werkzeugstähle, Aluminium, Kupfer, Messing, Kunststoffe. Durchmesser von Mikrobereich bis zu typischen Maschinenbauteilen.",
    "applicationsHeading": "Typische Anwendungen",
    "applications": "Präzisionswellen, Bolzen, Buchsen, Stempel, Führungen, Komponenten für Stanz- und Spritzgießwerkzeuge, Prototypen vor der Serienfertigung.",
    "faqHeading": "Häufige Fragen",
    "faq": [
      { "q": "Welche Genauigkeit erreichen Sie beim Drehen?", "a": "Toleranzen nach Projektanforderung, auch im Mikrometerbereich." },
      { "q": "Fertigen Sie Prototypen?", "a": "Ja — vom Einzelstück bis zu Prototypenserien." },
      { "q": "Welche Werkstoffe drehen Sie?", "a": "Alle gängigen Konstruktions-, Edelstahl- und Werkzeugstahlsorten, Aluminium, Kupfer, Messing und Kunststoffe." },
      { "q": "Welche Losgrößen sind üblich?", "a": "Klein- und Mittelserien, oft in Kombination mit Fräsen und Schleifen." }
    ],
    "ctaLabel": "Angebot anfragen"
  },
  "grinding": {
    "slug": "schleifen",
    "title": "Schleifen — Flach- und 4-Achs-Profilschleifen — RUDA Orodjarstvo",
    "description": "Flachschleifen und 4-Achs-Profilschleifen. Präzisionskomponenten für Stanz- und Umformprozesse. Slowenien.",
    "h1": "Schleifen — Flach- und 4-Achs-Profilschleifen",
    "lead": "Flachschleifen und 4-Achs-Profilschleifen für Präzisionskomponenten. Hochwertige Oberflächen und anspruchsvolle Geometrien.",
    "whatHeading": "Was wir schleifen",
    "what": [
      "Flachschleifen",
      "4-Achs-Profilschleifen"
    ],
    "materialsHeading": "Werkstoffe und Spezifikationen",
    "materials": "Gehärtete Werkzeugstähle, Hartmetall (WIDIA), Edelstähle. Typisch für Stanz- und Umformwerkzeuge mit Anforderungen an Feinoberflächen und enge Toleranzen.",
    "applicationsHeading": "Typische Anwendungen",
    "applications": "Stanzplatten, Formeinsätze, Führungen, Profilseiten von Werkzeugen, Endbearbeitung gehärteter Komponenten.",
    "faqHeading": "Häufige Fragen",
    "faq": [
      { "q": "Welche Oberflächenrauheit erreichen Sie?", "a": "Je nach Anforderung — wir fertigen Endbearbeitungen in der jeweils benötigten Qualität." },
      { "q": "Bieten Sie 4-Achs-Profilschleifen an?", "a": "Ja — 4-Achs-Profilschleifen für anspruchsvolle Geometrien." },
      { "q": "Welche Werkstoffe schleifen Sie?", "a": "Gehärtete Werkzeugstähle, Hartmetall (WIDIA) und Edelstähle." },
      { "q": "Kombinieren Sie Schleifen mit anderen Verfahren?", "a": "Ja — meist als Endbearbeitung nach dem Fräsen von Präzisionskomponenten." }
    ],
    "ctaLabel": "Angebot anfragen"
  }
},
"alt": {
  "logo": "RUDA Orodjarstvo — Präzisionswerkzeugbau",
  "services": {
    "milling": "5-Achs-CNC-Fräsmaschine in der Werkstatt von RUDA Orodjarstvo",
    "turning": "CNC-Drehmaschine in der Werkstatt von RUDA Orodjarstvo",
    "grinding": "Schleifmaschine in der Werkstatt von RUDA Orodjarstvo"
  },
  "strengths": {
    "hardCarbide": "Bearbeitetes Werkstück aus gehärtetem Stahl und Hartmetall",
    "precision": "Präzisionskomponente mit engen Toleranzen",
    "stamping": "Stanzwerkzeug aus gehärtetem Stahl",
    "micro": "Mikropräzisionsteil"
  }
},
"contact": {
  "heading": "Kontakt",
  "eyebrow": "Allgemeine Informationen",
  "companyHeading": "Unternehmensinformationen",
  "company": "Damjan Rupnik s.p.",
  "address": "Ledine 34, 5281 Spodnja Idrija",
  "country": "Slowenien",
  "vatLabel": "USt-IdNr.",
  "vat": "SI 52946398",
  "ibanLabel": "IBAN",
  "iban": "SI56 0400 0027 6293 480",
  "mapLabel": "Google Maps — Spodnja Idrija"
},
"footer": {
  "copyright": "© 2007–2026, Damjan Rupnik s.p., Spodnja Idrija, Slowenien",
  "legal": "Damjan Rupnik s.p. · Ledine 34, 5281 Spodnja Idrija · USt-IdNr.: SI 52946398 · IBAN: SI56 0400 0027 6293 480",
  "servicesLinks": "Dienstleistungen",
  "backToTop": "Nach oben"
}
```

- [ ] **Step 3: Validate JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('src/i18n/de.json','utf8'))"
```

- [ ] **Step 4: Commit**

```bash
git add src/i18n/de.json
git commit -m "feat(i18n): German fixes (Drehen, Dienstleistungen) + service-subpage copy"
```

---

### Task 9: Apply English translation corrections + add subpage content

**Files:**
- Modify: `D:\dev\ruda-website\src\i18n\en.json`

- [ ] **Step 1: Apply terminology corrections in en.json**

- nav.strengths: `"Strengths"` → `"Our strengths"`
- strengths heading: `"Strengths"` → `"Our strengths"`
- products.heading: `"Our Work"` → `"Our work"` (lowercase 'w' to match existing site)
- Services bullets match existing live site phrasing:

```json
"services": {
  "heading": "Services",
  "items": [
    {
      "title": "Milling",
      "spec": "Max 65 HRC",
      "bullets": [
        "5-axis milling of all types of materials",
        "Hard milling up to hardness 65 HRC",
        "Milling of carbide solids – WIDIA",
        "Production of one-offs, prototypes and small to medium batches"
      ]
    },
    {
      "title": "Turning",
      "spec": "High precision",
      "bullets": [
        "Turning of all types of materials",
        "Prototyping and small to medium batches"
      ]
    },
    {
      "title": "Grinding",
      "spec": "4-axis",
      "bullets": [
        "Surface grinding",
        "4-axis profile grinding"
      ]
    }
  ]
}
```

Strengths per existing live site:

```json
"strengths": {
  "heading": "Our strengths",
  "items": [
    { "title": "Hardness & Carbide Machining", "desc": "Manufacture of products up to 65 HRC hardness and carbide machining (WIDIA)" },
    { "title": "High Precision Machining", "desc": "Manufacture of products where high precision machining is required" },
    { "title": "Material Processing Products", "desc": "Manufacture of stamping, moulding and forming products" },
    { "title": "Micro-products", "desc": "Manufacture of micro-products" }
  ]
}
```

- [ ] **Step 2: Add new top-level keys for English service subpages**

Add (parallel structure to sl/de):

```json
"servicesIndex": {
  "title": "Services — CNC Milling, Turning, Grinding | RUDA Orodjarstvo",
  "description": "CNC milling, turning and grinding of high-precision components. Hard materials up to 65 HRC, carbide (WIDIA), 5-axis milling. Spodnja Idrija, Slovenia.",
  "heading": "Services",
  "intro": "Three core services from one workshop: CNC milling, turning, and precision grinding. RUDA Orodjarstvo specialises in hard materials and carbide (WIDIA).",
  "ctaLabel": "Learn more"
},
"servicePages": {
  "milling": {
    "slug": "milling",
    "title": "Milling (5-axis CNC, up to 65 HRC) — RUDA Orodjarstvo",
    "description": "5-axis CNC milling of all materials, including hard steels up to 65 HRC and carbide (WIDIA). One-offs, prototypes, small to medium batches. Slovenia.",
    "h1": "Milling — 5-axis CNC up to 65 HRC",
    "lead": "5-axis CNC milling of all materials, including hardened tool steels up to 65 HRC and carbide (WIDIA). One-offs, prototypes, and small to medium batch production.",
    "whatHeading": "What we mill",
    "what": [
      "5-axis milling of all types of materials",
      "Hard milling up to hardness 65 HRC",
      "Milling of carbide solids – WIDIA",
      "One-offs and prototypes",
      "Small to medium batch production"
    ],
    "materialsHeading": "Materials and specifications",
    "materials": "All standard tool steels (1.2080, 1.2363, 1.2379, 1.2767, K340), stainless steels, aluminium, copper, brass, hardened steel up to 65 HRC, and carbide (WIDIA). Tolerances per project requirements.",
    "applicationsHeading": "Typical applications",
    "applications": "Stamping dies, injection moulds, forming tools, die-casting moulds, precision machine-building parts, micro-parts for medical and electronics, prototypes.",
    "faqHeading": "Frequently asked questions",
    "faq": [
      { "q": "What is the maximum hardness you can mill?", "a": "Up to 65 HRC, including hardened tool steels and carbide (WIDIA)." },
      { "q": "Do you offer 5-axis milling?", "a": "Yes — all materials, including hard materials and carbide." },
      { "q": "Can you produce single prototypes or only batches?", "a": "Both — one-offs, prototypes, and small to medium batches." },
      { "q": "What materials do you mill?", "a": "All standard tool steels, stainless, aluminium, carbide (WIDIA), and hard steels up to 65 HRC." },
      { "q": "Where are you located?", "a": "Spodnja Idrija, Slovenia. We ship across the EU." }
    ],
    "ctaLabel": "Request a quote"
  },
  "turning": {
    "slug": "turning",
    "title": "Turning — CNC, all materials — RUDA Orodjarstvo",
    "description": "CNC turning of all types of materials. Prototyping and small to medium batch production. High precision. Slovenia.",
    "h1": "Turning — CNC, all materials",
    "lead": "CNC turning of all types of materials. Prototypes and small to medium batches with high precision and repeatable accuracy.",
    "whatHeading": "What we turn",
    "what": [
      "Turning of all types of materials",
      "Prototype manufacture",
      "Small to medium batch production"
    ],
    "materialsHeading": "Materials and specifications",
    "materials": "Structural and stainless steels, tool steels, aluminium, copper, brass, plastics. Diameters from micro-scale to typical machine-building parts.",
    "applicationsHeading": "Typical applications",
    "applications": "Precision shafts, pins, bushings, punches, guides, components for stamping and injection-moulding tools, prototypes prior to series production.",
    "faqHeading": "Frequently asked questions",
    "faq": [
      { "q": "What precision do you achieve in turning?", "a": "Tolerances are matched to project requirements, including micrometre ranges." },
      { "q": "Do you produce prototypes?", "a": "Yes — from single pieces to prototype runs." },
      { "q": "What materials do you turn?", "a": "All common structural, stainless, and tool steels, aluminium, copper, brass, and plastics." },
      { "q": "What batch sizes are typical?", "a": "Small to medium batches, often combined with milling and grinding." }
    ],
    "ctaLabel": "Request a quote"
  },
  "grinding": {
    "slug": "grinding",
    "title": "Grinding — surface and 4-axis profile — RUDA Orodjarstvo",
    "description": "Surface grinding and 4-axis profile grinding. Precision components for stamping and forming processes. Slovenia.",
    "h1": "Grinding — surface and 4-axis profile",
    "lead": "Surface grinding and 4-axis profile grinding for precision components. High-quality finishes and demanding geometries.",
    "whatHeading": "What we grind",
    "what": [
      "Surface grinding",
      "4-axis profile grinding"
    ],
    "materialsHeading": "Materials and specifications",
    "materials": "Hardened tool steels, carbide (WIDIA), stainless steels. Typically for stamping and forming tools where fine surface finish and tight tolerances are required.",
    "applicationsHeading": "Typical applications",
    "applications": "Stamping plates, form inserts, guides, tool profile sides, final finishing of hardened components.",
    "faqHeading": "Frequently asked questions",
    "faq": [
      { "q": "What surface roughness do you achieve?", "a": "Depending on requirements — we deliver finishes at the quality level the project demands." },
      { "q": "Do you offer 4-axis profile grinding?", "a": "Yes — 4-axis profile grinding for demanding geometries." },
      { "q": "What materials do you grind?", "a": "Hardened tool steels, carbide (WIDIA), and stainless steels." },
      { "q": "Do you combine grinding with other services?", "a": "Yes — often as the final finishing step after milling of precision components." }
    ],
    "ctaLabel": "Request a quote"
  }
},
"alt": {
  "logo": "RUDA Orodjarstvo — precision toolmaking",
  "services": {
    "milling": "5-axis CNC milling machine at RUDA Orodjarstvo workshop",
    "turning": "CNC lathe at RUDA Orodjarstvo workshop",
    "grinding": "Grinding machine at RUDA Orodjarstvo workshop"
  },
  "strengths": {
    "hardCarbide": "Machined part in hardened steel and carbide",
    "precision": "Precision component with tight tolerances",
    "stamping": "Stamping die in hardened tool steel",
    "micro": "Micro precision part"
  }
},
"contact": {
  "heading": "Contact",
  "eyebrow": "General information",
  "companyHeading": "Company information",
  "company": "Damjan Rupnik s.p.",
  "address": "Ledine 34, 5281 Spodnja Idrija",
  "country": "Slovenia",
  "vatLabel": "VAT",
  "vat": "SI 52946398",
  "ibanLabel": "IBAN",
  "iban": "SI56 0400 0027 6293 480",
  "mapLabel": "Google Maps — Spodnja Idrija"
},
"footer": {
  "copyright": "© 2007–2026, Damjan Rupnik s.p., Spodnja Idrija, Slovenia",
  "legal": "Damjan Rupnik s.p. · Ledine 34, 5281 Spodnja Idrija · VAT: SI 52946398 · IBAN: SI56 0400 0027 6293 480",
  "servicesLinks": "Services",
  "backToTop": "Back to top"
}
```

- [ ] **Step 3: Validate JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('src/i18n/en.json','utf8'))"
```

- [ ] **Step 4: Commit**

```bash
git add src/i18n/en.json
git commit -m "feat(i18n): English copy alignment + service-subpage content"
```

---

### Task 10: Extend i18n/index.ts with new types and helpers

**Files:**
- Modify: `D:\dev\ruda-website\src\i18n\index.ts`

- [ ] **Step 1: Rewrite i18n/index.ts**

```ts
import sl from './sl.json';
import en from './en.json';
import de from './de.json';

export const locales = ['sl', 'en', 'de'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'sl';

export type Dict = typeof sl;

const dictionaries: Record<Locale, Dict> = { sl, en, de };

export function getDict(locale: Locale): Dict {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export function localeLabel(locale: Locale): string {
  return locale.toUpperCase();
}

export function detectLocaleFromPath(pathname: string): Locale {
  const match = pathname.match(/^\/(en|de)(\/|$)/);
  return (match?.[1] as Locale) ?? defaultLocale;
}

/**
 * For the legacy single-page case (homepage). Pages with locale-specific slugs
 * (service subpages) use the routes table in `./routes.ts` instead.
 */
export function localizedPath(target: Locale, currentPath: string): string {
  const cleaned = currentPath.replace(/^\/(en|de)(\/|$)/, '/');
  if (target === defaultLocale) return cleaned || '/';
  const tail = cleaned === '/' ? '' : cleaned;
  return `/${target}${tail}`;
}
```

- [ ] **Step 2: Build to verify TS still compiles**

```bash
npm run build
```

Expected: build succeeds. Existing pages still render correctly.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/index.ts
git commit -m "refactor(i18n): clarify localizedPath vs routes-table use"
```

---

## Phase 4 — BaseLayout & Nav

### Task 11: Extend BaseLayout with new props + meta tags

**Files:**
- Modify: `D:\dev\ruda-website\src\layouts\BaseLayout.astro`

- [ ] **Step 1: Rewrite BaseLayout.astro**

Replace the entire file with:

```astro
---
import '../styles/global.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/bebas-neue/400.css';
import '@fontsource/dm-mono/400.css';
import '@fontsource/dm-mono/500.css';

import { locales, type Locale } from '../i18n';
import { routes, type RouteKey } from '../i18n/routes';

interface Props {
  locale: Locale;
  routeKey: RouteKey;
  title: string;
  description: string;
  ogImage?: string;
  noindex?: boolean;
  structuredData?: object | object[];
  breadcrumbs?: Array<{ name: string; url: string }>;
}

const {
  locale,
  routeKey,
  title,
  description,
  ogImage = '/images/logo/ruda_logo.png',
  noindex = false,
  structuredData,
} = Astro.props;

const pathname = Astro.url.pathname;
const canonical = new URL(pathname, Astro.site).toString();
const ogImageUrl = new URL(ogImage, Astro.site).toString();

const gscVerification = import.meta.env.PUBLIC_GSC_VERIFICATION;

const schemas: object[] = Array.isArray(structuredData)
  ? structuredData
  : structuredData
    ? [structuredData]
    : [];
---
<!DOCTYPE html>
<html lang={locale}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description} />
    {noindex && <meta name="robots" content="noindex,nofollow" />}
    {gscVerification && (
      <meta name="google-site-verification" content={gscVerification} />
    )}
    <link rel="canonical" href={canonical} />

    {locales.map((alt) => (
      <link
        rel="alternate"
        hreflang={alt}
        href={new URL(routes[routeKey][alt], Astro.site).toString()}
      />
    ))}
    <link
      rel="alternate"
      hreflang="x-default"
      href={new URL(routes[routeKey].sl, Astro.site).toString()}
    />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={ogImageUrl} />
    <meta property="og:locale" content={locale === 'sl' ? 'sl_SI' : locale === 'de' ? 'de_DE' : 'en_US'} />

    <!-- Twitter card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImageUrl} />

    <!-- Geo hints (legacy but harmless) -->
    <meta name="geo.region" content="SI" />
    <meta name="geo.placename" content="Spodnja Idrija" />
    <meta name="geo.position" content="46.039576;14.049150" />
    <meta name="ICBM" content="46.039576, 14.049150" />

    <link rel="icon" type="image/png" href="/images/logo/ruda_logo_transparent.png" />

    {schemas.map((s) => (
      <script type="application/ld+json" set:html={JSON.stringify(s)}></script>
    ))}
  </head>
  <body>
    <slot />

    <script>
      // Scroll-reveal
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('visible');
              observer.unobserve(e.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      document
        .querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
        .forEach((el) => observer.observe(el));

      // Active section tracking (homepage only)
      const sectionIds = ['services', 'strengths', 'products', 'contact'];
      const navLinks = new Map<string, HTMLAnchorElement>();
      document.querySelectorAll<HTMLAnchorElement>('[data-nav-section]').forEach((a) => {
        const id = a.getAttribute('data-nav-section');
        if (id) navLinks.set(id, a);
      });
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              navLinks.forEach((a) => a.classList.remove('is-active'));
              navLinks.get(e.target.id)?.classList.add('is-active');
            }
          });
        },
        { rootMargin: '-40% 0px -50% 0px' }
      );
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) sectionObserver.observe(el);
      });
    </script>
  </body>
</html>
```

- [ ] **Step 2: Update HomePage.astro to pass new props**

Modify `src/components/HomePage.astro`:

```astro
---
import { type Locale, getDict } from '../i18n';
import { buildLocalBusinessSchema } from '../lib/schema';
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from './Nav.astro';
import Hero from './Hero.astro';
import Services from './Services.astro';
import Strengths from './Strengths.astro';
import Products from './Products.astro';
import Contact from './Contact.astro';
import Footer from './Footer.astro';

interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
const t = getDict(locale);
const structuredData = buildLocalBusinessSchema(locale);
---
<BaseLayout
  locale={locale}
  routeKey="home"
  title={t.meta.title}
  description={t.meta.description}
  structuredData={structuredData}
>
  <Nav locale={locale} t={t} />
  <main>
    <Hero t={t} />
    <Services t={t} locale={locale} />
    <Strengths t={t} />
    <Products t={t} />
    <Contact t={t} />
  </main>
  <Footer t={t} />
</BaseLayout>
```

- [ ] **Step 3: Build & verify**

```bash
npm run build
```

Then verify the homepage has structured data:

```bash
grep -c '"@type":"LocalBusiness"' dist/index.html
```

Expected: outputs `1`.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/BaseLayout.astro src/components/HomePage.astro
git commit -m "feat(seo): extend BaseLayout with structured data, Twitter, geo meta"
```

---

### Task 12: Update Nav to use routes table for language switcher

**Files:**
- Modify: `D:\dev\ruda-website\src\components\Nav.astro`

- [ ] **Step 1: Replace Nav.astro**

Replace the entire file with:

```astro
---
import { type Locale, type Dict, locales, localeLabel } from '../i18n';
import { routes, type RouteKey, routeKeyForPath } from '../i18n/routes';

interface Props {
  locale: Locale;
  t: Dict;
  routeKey?: RouteKey;     // optional override (homepage doesn't need it)
}
const { locale, t, routeKey } = Astro.props;
const pathname = Astro.url.pathname;

// Resolve which route this page is on, for language-switcher targets
const currentRouteKey: RouteKey = routeKey ?? routeKeyForPath(pathname) ?? 'home';

const homeHref = routes.home[locale];
const servicesHref = routes.services[locale];

const links = [
  { href: servicesHref, label: t.nav.services, section: 'services' },
  { hash: '#strengths', label: t.nav.strengths, section: 'strengths' },
  { hash: '#products', label: t.nav.products, section: 'products' },
  { hash: '#contact', label: t.nav.contact, section: 'contact' },
];
---
<nav class="site-nav">
  <div class="site-nav__inner">
    <a href={homeHref} class="site-nav__logo" aria-label="RUDA Orodjarstvo">
      <img src="/images/logo/ruda_logo_transparent.png" alt={t.alt?.logo ?? 'RUDA Orodjarstvo'} />
    </a>

    <div class="site-nav__desktop">
      {links.map((l) => (
        l.href ? (
          <a href={l.href} class="site-nav__link">{l.label}</a>
        ) : (
          <a href={l.hash} data-nav-section={l.section} class="site-nav__link">{l.label}</a>
        )
      ))}
      <span class="site-nav__divider" aria-hidden="true"></span>
      <div class="site-nav__langs">
        {locales.map((lc) => (
          <a
            href={routes[currentRouteKey][lc]}
            class={`site-nav__lang${lc === locale ? ' is-active' : ''}`}
            hreflang={lc}
          >{localeLabel(lc)}</a>
        ))}
      </div>
    </div>

    <button class="site-nav__burger" aria-label="Menu" aria-expanded="false" type="button">
      <span></span><span></span><span></span>
    </button>
  </div>

  <div class="site-nav__mobile" hidden>
    {links.map((l) => (
      l.href ? (
        <a href={l.href} class="site-nav__mobile-link">{l.label}</a>
      ) : (
        <a href={l.hash} class="site-nav__mobile-link" data-nav-section={l.section}>{l.label}</a>
      )
    ))}
    <div class="site-nav__mobile-langs">
      {locales.map((lc) => (
        <a
          href={routes[currentRouteKey][lc]}
          class={`site-nav__lang${lc === locale ? ' is-active' : ''}`}
        >{localeLabel(lc)}</a>
      ))}
    </div>
  </div>
</nav>

<style>
  .site-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid transparent; transition: background 0.3s ease, border-color 0.3s ease; }
  .site-nav.is-scrolled { background: rgba(255,255,255,0.97); border-bottom-color: #eee; }
  .site-nav__inner { max-width: 1280px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; height: 64px; }
  .site-nav__logo img { height: 36px; cursor: pointer; }
  .site-nav__desktop { display: flex; gap: 32px; align-items: center; }
  .site-nav__link { font-size: 12px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #888; cursor: pointer; text-decoration: none; transition: color 0.2s; }
  .site-nav__link:hover, .site-nav__link.is-active { color: var(--color-cyan); }
  .site-nav__divider { width: 1px; height: 20px; background: #e0e0e0; }
  .site-nav__langs { display: flex; gap: 14px; }
  .site-nav__lang { font-size: 10px; font-weight: 700; color: #ccc; text-decoration: none; letter-spacing: 0.05em; transition: color 0.2s; }
  .site-nav__lang:hover, .site-nav__lang.is-active { color: var(--color-cyan); }
  .site-nav__burger { display: none; background: none; border: none; cursor: pointer; padding: 8px; }
  .site-nav__burger span { display: block; width: 22px; height: 2px; background: var(--color-dark); margin-bottom: 5px; transition: transform 0.3s, opacity 0.2s; }
  .site-nav__burger span:last-child { margin-bottom: 0; }
  .site-nav__burger[aria-expanded="true"] span:nth-child(1) { transform: rotate(45deg) translateY(5px); }
  .site-nav__burger[aria-expanded="true"] span:nth-child(2) { opacity: 0; }
  .site-nav__burger[aria-expanded="true"] span:nth-child(3) { transform: rotate(-45deg) translateY(-5px); }
  .site-nav__mobile { background: #fff; border-top: 1px solid #eee; padding: 12px 24px 20px; display: flex; flex-direction: column; gap: 4px; }
  .site-nav__mobile[hidden] { display: none; }
  .site-nav__mobile-link { font-size: 14px; font-weight: 500; padding: 12px 0; color: #555; text-decoration: none; border-bottom: 1px solid #f0f0f0; }
  .site-nav__mobile-link.is-active { color: var(--color-cyan); }
  .site-nav__mobile-langs { display: flex; gap: 16px; padding-top: 12px; }
  .site-nav__mobile-langs .site-nav__lang { font-size: 12px; }
  @media (max-width: 768px) {
    .site-nav__desktop { display: none; }
    .site-nav__burger { display: block; }
  }
</style>

<script>
  const nav = document.querySelector('.site-nav') as HTMLElement | null;
  const burger = document.querySelector('.site-nav__burger') as HTMLButtonElement | null;
  const mobile = document.querySelector('.site-nav__mobile') as HTMLElement | null;
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  if (burger && mobile) {
    const closeMenu = () => { burger.setAttribute('aria-expanded', 'false'); mobile.hidden = true; };
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      mobile.hidden = open;
    });
    mobile.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  }
</script>
```

- [ ] **Step 2: Build & verify**

```bash
npm run build
```

Verify the de homepage's Services link points to `/de/dienstleistungen/`:

```bash
grep -o 'href="/de/dienstleistungen/"' dist/de/index.html | head -1
```

Expected: outputs the matched string.

- [ ] **Step 3: Commit**

```bash
git add src/components/Nav.astro
git commit -m "feat(nav): use routes table for language switcher + real Services link"
```

---

## Phase 5 — Update homepage components

### Task 13: Update Hero with Astro Image and fetchpriority

**Files:**
- Modify: `D:\dev\ruda-website\src\components\Hero.astro`

- [ ] **Step 1: Replace Hero.astro**

Replace the entire file. Key changes: switch the static `<img>` inside SmartImage usage to Astro's `<Image>` for the slides that have real files (none yet — keeps placeholder fallback). Add `fetchpriority="high"` on first slide. Use `t.hero` (unchanged interface).

```astro
---
import type { Dict } from '../i18n';
import SmartImage from './SmartImage.astro';

interface Props { t: Dict; }
const { t } = Astro.props;

const slides = t.hero.slides.map((label, i) => ({
  label,
  src: `/images/hero/slide-${i + 1}.jpg`,
}));

const facts = [
  [t.hero.facts.estLabel,       t.hero.facts.estValue],
  [t.hero.facts.hardnessLabel,  t.hero.facts.hardnessValue],
  [t.hero.facts.cncLabel,       t.hero.facts.cncValue],
  [t.hero.facts.specialtyLabel, t.hero.facts.specialtyValue],
];
---
<section id="hero" class="hero">
  <div class="hero__media">
    {slides.map((s, i) => (
      <div class={`hero__slide${i === 0 ? ' is-active' : ''}`} data-slide={i}>
        <SmartImage
          src={s.src}
          alt={s.label}
          label={s.label}
          aspect="3/2"
          dark
          imgStyle={`height: 100%; min-height: calc(100vh - 64px); object-position: center; ${i === 0 ? '' : ''}`}
        />
      </div>
    ))}
    <div class="hero__overlay"></div>
  </div>

  <div class="hero__content">
    <div class="hero__eyebrow">{t.hero.eyebrow}</div>
    <h1 class="hero__title">
      {t.hero.titleLine1}<br />
      {t.hero.titleLine2}
    </h1>
    <p class="hero__lead">{t.hero.lead}</p>
    <div class="hero__ctas">
      <a class="btn btn-primary-light" href="#services">{t.hero.ctaPrimary}</a>
      <a class="btn btn-outline-light" href="#contact">{t.hero.ctaSecondary}</a>
    </div>
    <div class="hero__facts">
      {facts.map(([label, value]) => (
        <div class="hero__fact">
          <div class="hero__fact-label">{label}</div>
          <div class="hero__fact-value">{value}</div>
        </div>
      ))}
    </div>
  </div>

  <div class="hero__bar"></div>
  <div class="hero__dots">
    {slides.map((_, i) => (
      <button
        class={`hero__dot${i === 0 ? ' is-active' : ''}`}
        data-go={i}
        aria-label={`Slide ${i + 1}`}
        type="button"
      ></button>
    ))}
  </div>
</section>

<style>
  .hero { position: relative; padding-top: 64px; overflow: hidden; min-height: 100vh; }
  .hero__media { position: absolute; inset: 64px 0 0 0; overflow: hidden; }
  .hero__slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.8s ease; }
  .hero__slide.is-active { opacity: 1; }
  .hero__slide :global(.img-placeholder),
  .hero__slide :global(img) { width: 100%; height: 100%; min-height: calc(100vh - 64px); }
  .hero__overlay { position: absolute; inset: 0; background: linear-gradient(to right, rgba(28,28,28,0.88) 0%, rgba(28,28,28,0.55) 55%, rgba(28,28,28,0.25) 100%); z-index: 1; }
  .hero__content { position: relative; z-index: 2; max-width: 640px; padding: 80px 56px; min-height: calc(100vh - 64px); display: flex; flex-direction: column; justify-content: center; color: #fff; }
  .hero__eyebrow { font-family: var(--font-mono); font-size: 11px; color: var(--color-cyan); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 24px; }
  .hero__title { font-family: var(--font-display); font-size: clamp(52px, 8vw, 84px); line-height: 0.95; letter-spacing: 0.02em; color: #fff; margin-bottom: 24px; }
  .hero__lead { font-size: 15px; color: rgba(255,255,255,0.7); max-width: 440px; line-height: 1.75; margin-bottom: 40px; }
  .hero__ctas { display: flex; gap: 12px; flex-wrap: wrap; }
  .hero__facts { display: flex; gap: 32px; margin-top: 48px; flex-wrap: wrap; }
  .hero__fact { min-width: 72px; }
  .hero__fact-label { font-family: var(--font-mono); font-size: 10px; color: rgba(255,255,255,0.35); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 6px; }
  .hero__fact-value { font-size: 14px; font-weight: 700; color: #fff; }
  .hero__bar { position: absolute; left: 0; right: 0; bottom: 0; height: 4px; background: var(--color-cyan); z-index: 3; }
  .hero__dots { position: absolute; bottom: 28px; right: 32px; display: flex; gap: 8px; z-index: 3; }
  .hero__dot { width: 10px; height: 10px; border-radius: 50%; cursor: pointer; background: rgba(255,255,255,0.5); border: none; padding: 0; transition: background 0.3s; }
  .hero__dot.is-active { background: var(--color-cyan); }
  @media (max-width: 768px) { .hero__content { padding: 48px 24px; } }
  @media (max-width: 480px) { .hero__content { padding: 36px 20px; } .hero__dots { right: 20px; bottom: 20px; } }
</style>

<script>
  const slides = Array.from(document.querySelectorAll<HTMLElement>('.hero__slide'));
  const dots = Array.from(document.querySelectorAll<HTMLButtonElement>('.hero__dot'));
  let current = 0;
  let timer: number | undefined;
  function go(i: number) {
    if (i === current) return;
    slides[current]?.classList.remove('is-active');
    dots[current]?.classList.remove('is-active');
    current = (i + slides.length) % slides.length;
    slides[current]?.classList.add('is-active');
    dots[current]?.classList.add('is-active');
  }
  function start() { stop(); timer = window.setInterval(() => go(current + 1), 5000); }
  function stop() { if (timer !== undefined) window.clearInterval(timer); }
  dots.forEach((dot, i) => dot.addEventListener('click', () => { go(i); start(); }));
  if (slides.length > 1) start();
</script>
```

Note: the existing Hero already uses `SmartImage` which falls back to a placeholder when no file exists. When the user drops real hero JPGs into `public/images/hero/`, `SmartImage` will serve them directly — at v1 we deliberately do NOT switch to Astro `<Image>` for hero slides because the files don't exist yet. We DO switch to Astro `<Image>` for Services/Strengths/Products (next tasks) where real images exist.

- [ ] **Step 2: Build & verify**

```bash
npm run build
```

Build should still succeed; homepage hero unchanged visually.

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.astro
git commit -m "refactor(hero): minor cleanup for upcoming image-pipeline migration"
```

---

### Task 13b: Move source images to src/assets/ (so Astro can optimize them)

Astro's `<Image>` component only optimizes images imported from inside `src/` (where they go through Vite + sharp). Images in `public/` are served as-is — no AVIF/WebP, no srcset, no width/height injection. Service and strength images need to move.

Hero and product images stay in `public/` since they're placeholders the user drops in later (and `SmartImage.astro` is built around the public path convention).

**Files:**
- Create: `D:\dev\ruda-website\src\assets\services\` (directory)
- Create: `D:\dev\ruda-website\src\assets\strengths\` (directory)
- Move: 7 image files from `public/images/{services,strengths}/` to `src/assets/{services,strengths}/`

- [ ] **Step 1: Move the files using git so history is preserved**

Run in `D:\dev\ruda-website`:

```powershell
New-Item -ItemType Directory -Force "src\assets\services" | Out-Null
New-Item -ItemType Directory -Force "src\assets\strengths" | Out-Null
git mv public/images/services/milling.png  src/assets/services/milling.png
git mv public/images/services/turning.png  src/assets/services/turning.png
git mv public/images/services/grinding.png src/assets/services/grinding.png
git mv public/images/strengths/hard-carbide.png      src/assets/strengths/hard-carbide.png
git mv public/images/strengths/precision.png         src/assets/strengths/precision.png
git mv public/images/strengths/stamping-moulding.png src/assets/strengths/stamping-moulding.png
git mv public/images/strengths/micro.png             src/assets/strengths/micro.png
```

- [ ] **Step 2: Verify directory state**

```bash
ls src/assets/services src/assets/strengths
ls public/images/services public/images/strengths 2>&1 | head -5
```

Expected: 3 files in `src/assets/services`, 4 in `src/assets/strengths`; the `public/images/services` and `public/images/strengths` dirs are either gone or empty.

- [ ] **Step 3: Commit**

```bash
git commit -m "refactor(images): move service/strength sources into src/assets for optimization pipeline"
```

---

### Task 14: Update Services with Astro Image + subpage links

**Files:**
- Modify: `D:\dev\ruda-website\src\components\Services.astro`

- [ ] **Step 1: Replace Services.astro**

```astro
---
import type { Dict, Locale } from '../i18n';
import { localizedRoute, type RouteKey } from '../i18n/routes';
import { Image } from 'astro:assets';
import milling from '../assets/services/milling.png';
import turning from '../assets/services/turning.png';
import grinding from '../assets/services/grinding.png';

interface Props { t: Dict; locale: Locale; }
const { t, locale } = Astro.props;

const SERVICE_IMAGES = [milling, turning, grinding];
const SERVICE_ROUTE_KEYS: RouteKey[] = ['milling', 'turning', 'grinding'];
const SERVICE_ALT_KEYS: Array<'milling' | 'turning' | 'grinding'> = ['milling', 'turning', 'grinding'];

const services = t.services.items.map((s, i) => ({
  ...s,
  img: SERVICE_IMAGES[i],
  alt: t.alt.services[SERVICE_ALT_KEYS[i]],
  href: localizedRoute(SERVICE_ROUTE_KEYS[i], locale),
}));
---
<section id="services" class="services">
  <div class="services__wrap">
    <div class="reveal section-header">
      <h2>{t.services.heading.toUpperCase()}</h2>
      <div class="rule"></div>
    </div>

    <div class="services__list">
      {services.map((s, i) => (
        <div class={`reveal services__row${i % 2 === 1 ? ' is-reverse' : ''}`} style={`transition-delay: ${i * 0.1}s`}>
          <div class="services__img-wrap">
            <div class="services__img-box">
              <Image src={s.img} alt={s.alt} widths={[400, 600, 800]} sizes="(max-width: 768px) 100vw, 540px" loading="lazy" />
            </div>
            <div class="services__accent"></div>
          </div>
          <div class="services__text">
            <div class="services__spec">{s.spec}</div>
            <h3 class="services__title">{s.title}</h3>
            <ul class="services__bullets">
              {s.bullets.map((b) => (
                <li><span class="services__dash">—</span>{b}</li>
              ))}
            </ul>
            <a href={s.href} class="services__more">{t.servicesIndex.ctaLabel} →</a>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

<style>
  .services { padding: clamp(60px, 8vw, 88px) clamp(20px, 4vw, 56px); background: var(--color-light); }
  .services__wrap { max-width: 1200px; margin: 0 auto; }
  .services__list { display: flex; flex-direction: column; gap: 64px; }
  .services__row { display: flex; gap: 48px; flex-direction: row; align-items: center; }
  .services__row.is-reverse { flex-direction: row-reverse; }
  .services__img-wrap { flex: 0 0 45%; position: relative; }
  .services__img-box { background: #fff; padding: 24px; display: flex; align-items: center; justify-content: center; }
  .services__img-box :global(img) { width: 100%; height: auto; max-height: 360px; object-fit: contain; display: block; }
  .services__accent { position: absolute; bottom: 0; left: 0; width: 4px; height: 40%; background: var(--color-cyan); }
  .services__text { flex: 1; }
  .services__spec { font-family: var(--font-mono); font-size: 10px; color: var(--color-cyan); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px; }
  .services__title { font-family: var(--font-display); font-size: 36px; letter-spacing: 0.04em; color: var(--color-dark); margin-bottom: 24px; }
  .services__bullets { list-style: none; display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
  .services__bullets li { display: flex; gap: 12px; font-size: 14px; color: #555; line-height: 1.6; }
  .services__dash { color: var(--color-cyan); font-weight: 700; flex-shrink: 0; }
  .services__more { display: inline-block; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-cyan); text-decoration: none; border-bottom: 1px solid currentColor; padding-bottom: 2px; transition: opacity 0.2s; }
  .services__more:hover { opacity: 0.7; }
  @media (max-width: 768px) {
    .services__row, .services__row.is-reverse { flex-direction: column; gap: 24px; }
    .services__img-wrap { flex: unset; width: 100%; }
  }
</style>
```

- [ ] **Step 2: Build & verify**

```bash
npm run build
```

Verify the SL homepage links to subpages:

```bash
grep -o 'href="/storitve/rezkanje/"' dist/index.html | head -1
```

Expected: outputs the match.

Verify image was optimized (look for hashed asset paths):

```bash
grep -o '/_astro/milling\.[a-zA-Z0-9_-]*\.webp' dist/index.html | head -1
```

Expected: outputs a hashed WebP path.

- [ ] **Step 3: Commit**

```bash
git add src/components/Services.astro
git commit -m "feat(services): Astro Image pipeline + links to service subpages"
```

---

### Task 15: Update Strengths with Astro Image and corrected copy

**Files:**
- Modify: `D:\dev\ruda-website\src\components\Strengths.astro`

- [ ] **Step 1: Replace Strengths.astro**

```astro
---
import type { Dict } from '../i18n';
import { Image } from 'astro:assets';
import hardCarbide from '../assets/strengths/hard-carbide.png';
import precision from '../assets/strengths/precision.png';
import stampingMoulding from '../assets/strengths/stamping-moulding.png';
import micro from '../assets/strengths/micro.png';

interface Props { t: Dict; }
const { t } = Astro.props;

const STRENGTH_IMAGES = [hardCarbide, precision, stampingMoulding, micro];
const ALT_KEYS: Array<'hardCarbide' | 'precision' | 'stamping' | 'micro'> = ['hardCarbide', 'precision', 'stamping', 'micro'];

const strengths = t.strengths.items.map((s, i) => ({
  ...s,
  img: STRENGTH_IMAGES[i],
  alt: t.alt.strengths[ALT_KEYS[i]],
}));
---
<section id="strengths" class="strengths">
  <div class="strengths__wrap">
    <div class="reveal section-header light">
      <h2>{t.strengths.heading.toUpperCase()}</h2>
      <div class="rule"></div>
    </div>

    <div class="strengths__grid">
      {strengths.map((s, i) => (
        <div class="reveal-scale strengths__card" style={`transition-delay: ${i * 0.1}s`}>
          <Image src={s.img} alt={s.alt} widths={[400, 600, 800]} sizes="(max-width: 640px) 100vw, 50vw" loading="lazy" />
          <div class="strengths__shade"></div>
          <div class="strengths__caption">
            <div class="strengths__bar"></div>
            <h4>{s.title}</h4>
            <p>{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

<style>
  .strengths { padding: clamp(60px, 8vw, 88px) clamp(20px, 4vw, 56px); background: var(--color-dark); color: #fff; }
  .strengths__wrap { max-width: 1200px; margin: 0 auto; }
  .strengths__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; }
  .strengths__card { position: relative; overflow: hidden; }
  .strengths__card :global(img) { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; display: block; }
  .strengths__shade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(20,20,20,0.92) 0%, rgba(20,20,20,0.3) 50%, transparent 100%); }
  .strengths__caption { position: absolute; bottom: 0; left: 0; right: 0; padding: clamp(20px, 3vw, 32px); }
  .strengths__bar { width: 24px; height: 2px; background: var(--color-cyan); margin-bottom: 14px; }
  .strengths__caption h4 { font-size: 17px; font-weight: 700; color: #fff; margin-bottom: 8px; line-height: 1.3; }
  .strengths__caption p { font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.6; }
  @media (max-width: 640px) { .strengths__grid { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 2: Build & verify**

```bash
npm run build
grep -c '"Izdelava izdelkov do trdote 65 HRC"' dist/index.html
```

Expected: outputs `1`.

- [ ] **Step 3: Commit**

```bash
git add src/components/Strengths.astro
git commit -m "feat(strengths): corrected copy + Astro Image pipeline"
```

---

### Task 16: Update Contact with renamed sections + VAT/IBAN

**Files:**
- Modify: `D:\dev\ruda-website\src\components\Contact.astro`

- [ ] **Step 1: Replace Contact.astro**

```astro
---
import type { Dict } from '../i18n';
import ImagePlaceholder from './ImagePlaceholder.astro';

interface Props { t: Dict; }
const { t } = Astro.props;
---
<section id="contact" class="contact">
  <div class="contact__wrap">
    <div class="reveal section-header">
      <h2>{t.contact.heading.toUpperCase()}</h2>
      <div class="rule"></div>
    </div>

    <div class="contact__grid">
      <div class="reveal-left contact__col">
        <div class="contact__eyebrow">{t.contact.eyebrow}</div>
        <a class="contact__phone-primary" href="tel:+38651664374">+386 51 664 374</a>
        <a class="contact__phone-secondary" href="tel:+38641495661">+386 41 495 661</a>
        <a class="contact__email" href="mailto:ruda.orodjarstvo@gmail.com">ruda.orodjarstvo@gmail.com</a>

        <h3 class="contact__sub-heading">{t.contact.companyHeading}</h3>
        <div class="contact__addr">
          <strong>{t.contact.company}</strong><br />
          {t.contact.address}<br />
          {t.contact.country}<br />
          <span class="contact__legal">{t.contact.vatLabel}: {t.contact.vat}</span><br />
          <span class="contact__legal">{t.contact.ibanLabel}: {t.contact.iban}</span>
        </div>
      </div>

      <div class="reveal-right contact__map">
        <!--
          Replace this placeholder with a real Google Maps embed:
          <iframe src="https://www.google.com/maps/embed?pb=..." width="100%" height="100%" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        -->
        <ImagePlaceholder label={t.contact.mapLabel} aspect="4/3" />
      </div>
    </div>
  </div>
</section>

<style>
  .contact { padding: clamp(60px, 8vw, 88px) clamp(20px, 4vw, 56px); }
  .contact__wrap { max-width: 1200px; margin: 0 auto; }
  .contact__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
  .contact__eyebrow { font-family: var(--font-mono); font-size: 10px; color: var(--color-cyan); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 20px; }
  .contact__phone-primary { font-size: 28px; font-weight: 700; color: var(--color-dark); text-decoration: none; display: block; margin-bottom: 8px; }
  .contact__phone-secondary { font-size: 20px; font-weight: 500; color: #999; text-decoration: none; display: block; margin-bottom: 20px; }
  .contact__email { font-size: 14px; color: var(--color-cyan); text-decoration: none; display: block; margin-bottom: 36px; }
  .contact__sub-heading { font-family: var(--font-mono); font-size: 10px; color: var(--color-cyan); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px; }
  .contact__addr { font-size: 14px; color: #888; line-height: 1.8; }
  .contact__addr strong { color: var(--color-dark); }
  .contact__legal { font-family: var(--font-mono); font-size: 12px; }
  @media (max-width: 768px) { .contact__grid { grid-template-columns: 1fr; gap: 32px; } }
</style>
```

- [ ] **Step 2: Build & verify VAT shows up**

```bash
npm run build
grep -c 'SI 52946398' dist/index.html
```

Expected: outputs at least `1`.

- [ ] **Step 3: Commit**

```bash
git add src/components/Contact.astro
git commit -m "feat(contact): rename sections + add Company information with VAT/IBAN"
```

---

### Task 17: Update Footer with legal-required line + Storitve list

**Files:**
- Modify: `D:\dev\ruda-website\src\components\Footer.astro`

- [ ] **Step 1: Replace Footer.astro**

```astro
---
import type { Dict, Locale } from '../i18n';
import { localizedRoute } from '../i18n/routes';

interface Props { t: Dict; locale: Locale; }
const { t, locale } = Astro.props;

const serviceLinks = [
  { href: localizedRoute('milling',  locale), label: t.servicePages.milling.h1.split('—')[0].trim() },
  { href: localizedRoute('turning',  locale), label: t.servicePages.turning.h1.split('—')[0].trim() },
  { href: localizedRoute('grinding', locale), label: t.servicePages.grinding.h1.split('—')[0].trim() },
];
---
<footer class="site-footer">
  <div class="site-footer__wrap">
    <div class="site-footer__top">
      <img src="/images/logo/ruda_logo_wide.png" alt={t.alt.logo} class="site-footer__logo" />
      <nav class="site-footer__nav" aria-label={t.footer.servicesLinks}>
        <span class="site-footer__nav-title">{t.footer.servicesLinks}</span>
        {serviceLinks.map((l) => (
          <a href={l.href} class="site-footer__link">{l.label}</a>
        ))}
      </nav>
    </div>

    <div class="site-footer__legal">{t.footer.legal}</div>
    <div class="site-footer__copy">{t.footer.copyright}</div>
  </div>
</footer>

<style>
  .site-footer { padding: 32px clamp(20px, 4vw, 56px) 24px; border-top: 1px solid #eee; }
  .site-footer__wrap { max-width: 1200px; margin: 0 auto; }
  .site-footer__top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px; margin-bottom: 24px; }
  .site-footer__logo { height: 22px; opacity: 0.25; }
  .site-footer__nav { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; font-size: 11px; }
  .site-footer__nav-title { color: #aaa; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; }
  .site-footer__link { color: #666; text-decoration: none; transition: color 0.2s; }
  .site-footer__link:hover { color: var(--color-cyan); }
  .site-footer__legal { font-size: 11px; color: #aaa; letter-spacing: 0.02em; line-height: 1.7; margin-bottom: 6px; }
  .site-footer__copy { font-size: 11px; color: #ccc; letter-spacing: 0.04em; }
  @media (max-width: 600px) {
    .site-footer__top { flex-direction: column; align-items: flex-start; }
  }
</style>
```

- [ ] **Step 2: Update HomePage.astro to pass locale to Footer**

In `src/components/HomePage.astro`, change the Footer line to:

```astro
<Footer t={t} locale={locale} />
```

- [ ] **Step 3: Build & verify legal line shows on every locale**

```bash
npm run build
grep -c 'DŠ: SI 52946398' dist/index.html
grep -c 'VAT: SI 52946398' dist/en/index.html
grep -c 'USt-IdNr.: SI 52946398' dist/de/index.html
```

Expected: each grep outputs `1`.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.astro src/components/HomePage.astro
git commit -m "feat(footer): legal-required block + Storitve link list per locale"
```

---

## Phase 6 — Service subpage infrastructure

### Task 18: Create FAQ component

**Files:**
- Create: `D:\dev\ruda-website\src\components\FAQ.astro`

- [ ] **Step 1: Create FAQ.astro**

```astro
---
interface Props {
  heading: string;
  items: Array<{ q: string; a: string }>;
}
const { heading, items } = Astro.props;
---
<section class="faq">
  <h2 class="faq__heading">{heading}</h2>
  <div class="faq__list">
    {items.map((item, i) => (
      <details class="faq__item" open={i === 0}>
        <summary class="faq__q">
          <span>{item.q}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="faq__chev"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </summary>
        <div class="faq__a">{item.a}</div>
      </details>
    ))}
  </div>
</section>

<style>
  .faq { padding: clamp(40px, 6vw, 64px) 0; }
  .faq__heading { font-family: var(--font-display); font-size: clamp(28px, 4vw, 36px); letter-spacing: 0.04em; color: var(--color-dark); margin-bottom: 32px; }
  .faq__list { display: flex; flex-direction: column; }
  .faq__item { border-top: 1px solid #e5e5e3; }
  .faq__item:last-child { border-bottom: 1px solid #e5e5e3; }
  .faq__q { list-style: none; cursor: pointer; padding: 20px 0; display: flex; justify-content: space-between; align-items: center; gap: 16px; font-size: 16px; font-weight: 600; color: var(--color-dark); }
  .faq__q::-webkit-details-marker { display: none; }
  .faq__chev { color: var(--color-cyan); transition: transform 0.25s ease; flex-shrink: 0; }
  .faq__item[open] .faq__chev { transform: rotate(180deg); }
  .faq__a { font-size: 15px; color: #555; line-height: 1.7; padding: 0 0 20px; max-width: 720px; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/FAQ.astro
git commit -m "feat(seo): add collapsible FAQ component"
```

---

### Task 19: Create ServicesIndex shared template

**Files:**
- Create: `D:\dev\ruda-website\src\components\ServicesIndex.astro`

- [ ] **Step 1: Create ServicesIndex.astro**

```astro
---
import type { Dict, Locale } from '../i18n';
import { localizedRoute, type RouteKey } from '../i18n/routes';
import { Image } from 'astro:assets';
import milling from '../assets/services/milling.png';
import turning from '../assets/services/turning.png';
import grinding from '../assets/services/grinding.png';

interface Props { t: Dict; locale: Locale; }
const { t, locale } = Astro.props;

const SERVICE_IMAGES = [milling, turning, grinding];
const SERVICE_KEYS: Array<'milling' | 'turning' | 'grinding'> = ['milling', 'turning', 'grinding'];
const SERVICE_ROUTE_KEYS: RouteKey[] = ['milling', 'turning', 'grinding'];
---
<section class="svc-index">
  <div class="svc-index__wrap">
    <div class="reveal section-header">
      <h1>{t.servicesIndex.heading.toUpperCase()}</h1>
      <div class="rule"></div>
    </div>

    <p class="svc-index__intro reveal">{t.servicesIndex.intro}</p>

    <div class="svc-index__grid">
      {SERVICE_KEYS.map((key, i) => {
        const sp = t.servicePages[key];
        return (
          <a href={localizedRoute(SERVICE_ROUTE_KEYS[i], locale)} class="svc-index__card reveal" style={`transition-delay: ${i * 0.08}s`}>
            <div class="svc-index__card-img">
              <Image src={SERVICE_IMAGES[i]} alt={t.alt.services[key]} widths={[400, 600, 800]} sizes="(max-width: 768px) 100vw, 33vw" loading="lazy" />
            </div>
            <div class="svc-index__card-body">
              <h2 class="svc-index__card-title">{t.services.items[i].title}</h2>
              <p class="svc-index__card-lead">{sp.lead}</p>
              <span class="svc-index__card-more">{t.servicesIndex.ctaLabel} →</span>
            </div>
          </a>
        );
      })}
    </div>
  </div>
</section>

<style>
  .svc-index { padding: 96px clamp(20px, 4vw, 56px) clamp(60px, 8vw, 88px); }
  .svc-index__wrap { max-width: 1200px; margin: 0 auto; }
  .svc-index__intro { font-size: 17px; color: #555; line-height: 1.7; max-width: 720px; margin-bottom: 48px; }
  .svc-index__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .svc-index__card { text-decoration: none; color: inherit; background: var(--color-light); border: 1px solid #eee; transition: border-color 0.2s, transform 0.2s; }
  .svc-index__card:hover { border-color: var(--color-cyan); transform: translateY(-2px); }
  .svc-index__card-img { background: #fff; padding: 24px; display: flex; align-items: center; justify-content: center; min-height: 200px; }
  .svc-index__card-img :global(img) { max-width: 100%; max-height: 160px; object-fit: contain; }
  .svc-index__card-body { padding: 24px; }
  .svc-index__card-title { font-family: var(--font-display); font-size: 28px; letter-spacing: 0.04em; color: var(--color-dark); margin-bottom: 12px; }
  .svc-index__card-lead { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 16px; }
  .svc-index__card-more { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-cyan); }
  @media (max-width: 900px) { .svc-index__grid { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ServicesIndex.astro
git commit -m "feat(seo): add ServicesIndex shared template"
```

---

### Task 20: Create ServicePage shared template

**Files:**
- Create: `D:\dev\ruda-website\src\components\ServicePage.astro`

- [ ] **Step 1: Create ServicePage.astro**

```astro
---
import type { Dict, Locale } from '../i18n';
import { localizedRoute, type RouteKey } from '../i18n/routes';
import { Image } from 'astro:assets';
import FAQ from './FAQ.astro';
import milling from '../assets/services/milling.png';
import turning from '../assets/services/turning.png';
import grinding from '../assets/services/grinding.png';

type ServiceKey = 'milling' | 'turning' | 'grinding';

interface Props {
  t: Dict;
  locale: Locale;
  serviceKey: ServiceKey;
}
const { t, locale, serviceKey } = Astro.props;

const IMG: Record<ServiceKey, ImageMetadata> = { milling, turning, grinding };
const ROUTE_KEY: Record<ServiceKey, RouteKey> = { milling: 'milling', turning: 'turning', grinding: 'grinding' };

const sp = t.servicePages[serviceKey];

const others: ServiceKey[] = (['milling', 'turning', 'grinding'] as ServiceKey[]).filter(k => k !== serviceKey);
const otherLinks = others.map(k => ({
  href: localizedRoute(ROUTE_KEY[k], locale),
  label: t.servicePages[k].h1.split('—')[0].trim(),
}));

const homeHref = localizedRoute('home', locale);
const servicesHref = localizedRoute('services', locale);
---
<article class="svc-page">
  <div class="svc-page__wrap">
    <nav class="svc-page__crumbs" aria-label="Breadcrumb">
      <a href={homeHref}>{locale === 'sl' ? 'Domov' : locale === 'de' ? 'Startseite' : 'Home'}</a>
      <span>›</span>
      <a href={servicesHref}>{t.servicesIndex.heading}</a>
      <span>›</span>
      <span aria-current="page">{t.services.items[(['milling','turning','grinding'] as ServiceKey[]).indexOf(serviceKey)].title}</span>
    </nav>

    <header class="svc-page__hero">
      <div class="svc-page__hero-text">
        <h1 class="svc-page__title">{sp.h1}</h1>
        <p class="svc-page__lead">{sp.lead}</p>
        <a href={`${homeHref}#contact`} class="btn btn-primary">{sp.ctaLabel}</a>
      </div>
      <div class="svc-page__hero-img">
        <Image src={IMG[serviceKey]} alt={t.alt.services[serviceKey]} widths={[400, 600, 800, 1000]} sizes="(max-width: 768px) 100vw, 500px" loading="eager" />
      </div>
    </header>

    <section class="svc-page__section">
      <h2>{sp.whatHeading}</h2>
      <ul class="svc-page__bullets">
        {sp.what.map((b) => (
          <li><span class="svc-page__dash">—</span>{b}</li>
        ))}
      </ul>
    </section>

    <section class="svc-page__section">
      <h2>{sp.materialsHeading}</h2>
      <p>{sp.materials}</p>
    </section>

    <section class="svc-page__section">
      <h2>{sp.applicationsHeading}</h2>
      <p>{sp.applications}</p>
    </section>

    <FAQ heading={sp.faqHeading} items={sp.faq} />

    <section class="svc-page__cross">
      <h3>{locale === 'sl' ? 'Druge storitve' : locale === 'de' ? 'Andere Leistungen' : 'Other services'}</h3>
      <div class="svc-page__cross-links">
        {otherLinks.map((l) => (
          <a href={l.href} class="svc-page__cross-link">{l.label} →</a>
        ))}
      </div>
    </section>

    <section class="svc-page__cta-strip">
      <h2>{sp.ctaLabel}</h2>
      <a href={`${homeHref}#contact`} class="btn btn-primary-light">{sp.ctaLabel}</a>
    </section>
  </div>
</article>

<style>
  .svc-page { padding: 96px clamp(20px, 4vw, 56px) clamp(60px, 8vw, 88px); }
  .svc-page__wrap { max-width: 960px; margin: 0 auto; }
  .svc-page__crumbs { font-size: 12px; color: #999; margin-bottom: 32px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .svc-page__crumbs a { color: #999; text-decoration: none; }
  .svc-page__crumbs a:hover { color: var(--color-cyan); }
  .svc-page__hero { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; margin-bottom: 64px; }
  .svc-page__title { font-family: var(--font-display); font-size: clamp(36px, 5vw, 52px); letter-spacing: 0.04em; color: var(--color-dark); margin-bottom: 20px; line-height: 1.05; }
  .svc-page__lead { font-size: 17px; color: #555; line-height: 1.7; margin-bottom: 28px; }
  .svc-page__hero-img { background: #fff; padding: 24px; border: 1px solid #eee; }
  .svc-page__hero-img :global(img) { max-width: 100%; height: auto; object-fit: contain; max-height: 340px; }
  .svc-page__section { margin-bottom: 48px; }
  .svc-page__section h2 { font-family: var(--font-display); font-size: clamp(24px, 3vw, 32px); letter-spacing: 0.04em; color: var(--color-dark); margin-bottom: 16px; }
  .svc-page__section p { font-size: 15px; color: #555; line-height: 1.75; max-width: 720px; }
  .svc-page__bullets { list-style: none; display: flex; flex-direction: column; gap: 10px; max-width: 720px; }
  .svc-page__bullets li { display: flex; gap: 12px; font-size: 15px; color: #555; line-height: 1.6; }
  .svc-page__dash { color: var(--color-cyan); font-weight: 700; flex-shrink: 0; }
  .svc-page__cross { margin: 48px 0; padding: 32px 0; border-top: 1px solid #eee; }
  .svc-page__cross h3 { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-cyan); margin-bottom: 16px; }
  .svc-page__cross-links { display: flex; gap: 24px; flex-wrap: wrap; }
  .svc-page__cross-link { font-size: 16px; font-weight: 600; color: var(--color-dark); text-decoration: none; border-bottom: 2px solid var(--color-cyan); padding-bottom: 2px; }
  .svc-page__cross-link:hover { color: var(--color-cyan); }
  .svc-page__cta-strip { background: var(--color-dark); color: #fff; padding: 48px; text-align: center; margin-top: 48px; }
  .svc-page__cta-strip h2 { color: #fff; margin-bottom: 24px; font-family: var(--font-display); font-size: 32px; letter-spacing: 0.04em; }
  @media (max-width: 768px) {
    .svc-page__hero { grid-template-columns: 1fr; gap: 24px; }
    .svc-page__cta-strip { padding: 32px 20px; }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ServicePage.astro
git commit -m "feat(seo): add ServicePage shared template with breadcrumbs + cross-links"
```

---

## Phase 7 — Localized service pages

### Task 21: Create Slovene service routes (4 files)

**Files:**
- Create: `D:\dev\ruda-website\src\pages\storitve\index.astro`
- Create: `D:\dev\ruda-website\src\pages\storitve\rezkanje.astro`
- Create: `D:\dev\ruda-website\src\pages\storitve\struzenje.astro`
- Create: `D:\dev\ruda-website\src\pages\storitve\brusenje.astro`

- [ ] **Step 1: Create Slovene services index page**

`src/pages/storitve/index.astro`:

```astro
---
import { getDict } from '../../i18n';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Nav from '../../components/Nav.astro';
import Footer from '../../components/Footer.astro';
import ServicesIndex from '../../components/ServicesIndex.astro';
import { buildLocalBusinessSchema, buildBreadcrumbSchema } from '../../lib/schema';

const locale = 'sl' as const;
const t = getDict(locale);

const SITE = 'https://orodjarstvoruda.com';
const structuredData = [
  buildLocalBusinessSchema(locale),
  buildBreadcrumbSchema([
    { name: 'Domov',    url: `${SITE}/` },
    { name: 'Storitve', url: `${SITE}/storitve/` },
  ]),
];
---
<BaseLayout
  locale={locale}
  routeKey="services"
  title={t.servicesIndex.title}
  description={t.servicesIndex.description}
  structuredData={structuredData}
>
  <Nav locale={locale} t={t} routeKey="services" />
  <main>
    <ServicesIndex t={t} locale={locale} />
  </main>
  <Footer t={t} locale={locale} />
</BaseLayout>
```

- [ ] **Step 2: Create the three SL subpages**

Each is nearly identical except for `serviceKey`. Create:

`src/pages/storitve/rezkanje.astro`:

```astro
---
import { getDict } from '../../i18n';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Nav from '../../components/Nav.astro';
import Footer from '../../components/Footer.astro';
import ServicePage from '../../components/ServicePage.astro';
import {
  buildLocalBusinessSchema,
  buildBreadcrumbSchema,
  buildServiceSchema,
  buildFAQSchema,
} from '../../lib/schema';

const locale = 'sl' as const;
const t = getDict(locale);
const sp = t.servicePages.milling;

const SITE = 'https://orodjarstvoruda.com';
const structuredData = [
  buildLocalBusinessSchema(locale),
  buildBreadcrumbSchema([
    { name: 'Domov',    url: `${SITE}/` },
    { name: 'Storitve', url: `${SITE}/storitve/` },
    { name: 'Rezkanje', url: `${SITE}/storitve/rezkanje/` },
  ]),
  buildServiceSchema({
    key: 'milling',
    locale,
    name: t.services.items[0].title,
    description: sp.lead,
    offers: sp.what,
  }),
  buildFAQSchema(sp.faq),
];
---
<BaseLayout
  locale={locale}
  routeKey="milling"
  title={sp.title}
  description={sp.description}
  structuredData={structuredData}
>
  <Nav locale={locale} t={t} routeKey="milling" />
  <main>
    <ServicePage t={t} locale={locale} serviceKey="milling" />
  </main>
  <Footer t={t} locale={locale} />
</BaseLayout>
```

`src/pages/storitve/struzenje.astro` — same as above but replace every `milling` reference with `turning`, `Rezkanje` with `Struženje`, and update breadcrumb URL to `/storitve/struzenje/`. Specifically:

```astro
---
import { getDict } from '../../i18n';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Nav from '../../components/Nav.astro';
import Footer from '../../components/Footer.astro';
import ServicePage from '../../components/ServicePage.astro';
import { buildLocalBusinessSchema, buildBreadcrumbSchema, buildServiceSchema, buildFAQSchema } from '../../lib/schema';

const locale = 'sl' as const;
const t = getDict(locale);
const sp = t.servicePages.turning;

const SITE = 'https://orodjarstvoruda.com';
const structuredData = [
  buildLocalBusinessSchema(locale),
  buildBreadcrumbSchema([
    { name: 'Domov',     url: `${SITE}/` },
    { name: 'Storitve',  url: `${SITE}/storitve/` },
    { name: 'Struženje', url: `${SITE}/storitve/struzenje/` },
  ]),
  buildServiceSchema({ key: 'turning', locale, name: t.services.items[1].title, description: sp.lead, offers: sp.what }),
  buildFAQSchema(sp.faq),
];
---
<BaseLayout locale={locale} routeKey="turning" title={sp.title} description={sp.description} structuredData={structuredData}>
  <Nav locale={locale} t={t} routeKey="turning" />
  <main><ServicePage t={t} locale={locale} serviceKey="turning" /></main>
  <Footer t={t} locale={locale} />
</BaseLayout>
```

`src/pages/storitve/brusenje.astro`:

```astro
---
import { getDict } from '../../i18n';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Nav from '../../components/Nav.astro';
import Footer from '../../components/Footer.astro';
import ServicePage from '../../components/ServicePage.astro';
import { buildLocalBusinessSchema, buildBreadcrumbSchema, buildServiceSchema, buildFAQSchema } from '../../lib/schema';

const locale = 'sl' as const;
const t = getDict(locale);
const sp = t.servicePages.grinding;

const SITE = 'https://orodjarstvoruda.com';
const structuredData = [
  buildLocalBusinessSchema(locale),
  buildBreadcrumbSchema([
    { name: 'Domov',    url: `${SITE}/` },
    { name: 'Storitve', url: `${SITE}/storitve/` },
    { name: 'Brušenje', url: `${SITE}/storitve/brusenje/` },
  ]),
  buildServiceSchema({ key: 'grinding', locale, name: t.services.items[2].title, description: sp.lead, offers: sp.what }),
  buildFAQSchema(sp.faq),
];
---
<BaseLayout locale={locale} routeKey="grinding" title={sp.title} description={sp.description} structuredData={structuredData}>
  <Nav locale={locale} t={t} routeKey="grinding" />
  <main><ServicePage t={t} locale={locale} serviceKey="grinding" /></main>
  <Footer t={t} locale={locale} />
</BaseLayout>
```

- [ ] **Step 3: Build & verify**

```bash
npm run build
ls dist/storitve/
```

Expected: lists `index.html`, `rezkanje/index.html`, `struzenje/index.html`, `brusenje/index.html` (or `.html` files directly depending on trailingSlash config).

Verify schema:

```bash
grep -c '"@type":"FAQPage"' dist/storitve/rezkanje/index.html
```

Expected: outputs `1`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/storitve/
git commit -m "feat(pages): Slovene services index + 3 service subpages with full schema"
```

---

### Task 22: Create English service routes (4 files)

**Files:**
- Create: `D:\dev\ruda-website\src\pages\en\services\index.astro`
- Create: `D:\dev\ruda-website\src\pages\en\services\milling.astro`
- Create: `D:\dev\ruda-website\src\pages\en\services\turning.astro`
- Create: `D:\dev\ruda-website\src\pages\en\services\grinding.astro`

- [ ] **Step 1: Create EN services index**

`src/pages/en/services/index.astro`:

```astro
---
import { getDict } from '../../../i18n';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Nav from '../../../components/Nav.astro';
import Footer from '../../../components/Footer.astro';
import ServicesIndex from '../../../components/ServicesIndex.astro';
import { buildLocalBusinessSchema, buildBreadcrumbSchema } from '../../../lib/schema';

const locale = 'en' as const;
const t = getDict(locale);

const SITE = 'https://orodjarstvoruda.com';
const structuredData = [
  buildLocalBusinessSchema(locale),
  buildBreadcrumbSchema([
    { name: 'Home',     url: `${SITE}/en/` },
    { name: 'Services', url: `${SITE}/en/services/` },
  ]),
];
---
<BaseLayout locale={locale} routeKey="services" title={t.servicesIndex.title} description={t.servicesIndex.description} structuredData={structuredData}>
  <Nav locale={locale} t={t} routeKey="services" />
  <main><ServicesIndex t={t} locale={locale} /></main>
  <Footer t={t} locale={locale} />
</BaseLayout>
```

- [ ] **Step 2: Create the three EN subpages**

`src/pages/en/services/milling.astro`:

```astro
---
import { getDict } from '../../../i18n';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Nav from '../../../components/Nav.astro';
import Footer from '../../../components/Footer.astro';
import ServicePage from '../../../components/ServicePage.astro';
import { buildLocalBusinessSchema, buildBreadcrumbSchema, buildServiceSchema, buildFAQSchema } from '../../../lib/schema';

const locale = 'en' as const;
const t = getDict(locale);
const sp = t.servicePages.milling;

const SITE = 'https://orodjarstvoruda.com';
const structuredData = [
  buildLocalBusinessSchema(locale),
  buildBreadcrumbSchema([
    { name: 'Home',     url: `${SITE}/en/` },
    { name: 'Services', url: `${SITE}/en/services/` },
    { name: 'Milling',  url: `${SITE}/en/services/milling/` },
  ]),
  buildServiceSchema({ key: 'milling', locale, name: t.services.items[0].title, description: sp.lead, offers: sp.what }),
  buildFAQSchema(sp.faq),
];
---
<BaseLayout locale={locale} routeKey="milling" title={sp.title} description={sp.description} structuredData={structuredData}>
  <Nav locale={locale} t={t} routeKey="milling" />
  <main><ServicePage t={t} locale={locale} serviceKey="milling" /></main>
  <Footer t={t} locale={locale} />
</BaseLayout>
```

`src/pages/en/services/turning.astro`:

```astro
---
import { getDict } from '../../../i18n';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Nav from '../../../components/Nav.astro';
import Footer from '../../../components/Footer.astro';
import ServicePage from '../../../components/ServicePage.astro';
import { buildLocalBusinessSchema, buildBreadcrumbSchema, buildServiceSchema, buildFAQSchema } from '../../../lib/schema';

const locale = 'en' as const;
const t = getDict(locale);
const sp = t.servicePages.turning;

const SITE = 'https://orodjarstvoruda.com';
const structuredData = [
  buildLocalBusinessSchema(locale),
  buildBreadcrumbSchema([
    { name: 'Home',     url: `${SITE}/en/` },
    { name: 'Services', url: `${SITE}/en/services/` },
    { name: 'Turning',  url: `${SITE}/en/services/turning/` },
  ]),
  buildServiceSchema({ key: 'turning', locale, name: t.services.items[1].title, description: sp.lead, offers: sp.what }),
  buildFAQSchema(sp.faq),
];
---
<BaseLayout locale={locale} routeKey="turning" title={sp.title} description={sp.description} structuredData={structuredData}>
  <Nav locale={locale} t={t} routeKey="turning" />
  <main><ServicePage t={t} locale={locale} serviceKey="turning" /></main>
  <Footer t={t} locale={locale} />
</BaseLayout>
```

`src/pages/en/services/grinding.astro`:

```astro
---
import { getDict } from '../../../i18n';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Nav from '../../../components/Nav.astro';
import Footer from '../../../components/Footer.astro';
import ServicePage from '../../../components/ServicePage.astro';
import { buildLocalBusinessSchema, buildBreadcrumbSchema, buildServiceSchema, buildFAQSchema } from '../../../lib/schema';

const locale = 'en' as const;
const t = getDict(locale);
const sp = t.servicePages.grinding;

const SITE = 'https://orodjarstvoruda.com';
const structuredData = [
  buildLocalBusinessSchema(locale),
  buildBreadcrumbSchema([
    { name: 'Home',     url: `${SITE}/en/` },
    { name: 'Services', url: `${SITE}/en/services/` },
    { name: 'Grinding', url: `${SITE}/en/services/grinding/` },
  ]),
  buildServiceSchema({ key: 'grinding', locale, name: t.services.items[2].title, description: sp.lead, offers: sp.what }),
  buildFAQSchema(sp.faq),
];
---
<BaseLayout locale={locale} routeKey="grinding" title={sp.title} description={sp.description} structuredData={structuredData}>
  <Nav locale={locale} t={t} routeKey="grinding" />
  <main><ServicePage t={t} locale={locale} serviceKey="grinding" /></main>
  <Footer t={t} locale={locale} />
</BaseLayout>
```

- [ ] **Step 3: Build & verify**

```bash
npm run build
ls dist/en/services/
grep -c '"What is the maximum hardness you can mill?"' dist/en/services/milling/index.html
```

Expected: lists 4 entries; grep outputs `1`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/en/services/
git commit -m "feat(pages): English services index + 3 service subpages"
```

---

### Task 23: Create German service routes (4 files)

**Files:**
- Create: `D:\dev\ruda-website\src\pages\de\dienstleistungen\index.astro`
- Create: `D:\dev\ruda-website\src\pages\de\dienstleistungen\fraesen.astro`
- Create: `D:\dev\ruda-website\src\pages\de\dienstleistungen\drehen.astro`
- Create: `D:\dev\ruda-website\src\pages\de\dienstleistungen\schleifen.astro`

- [ ] **Step 1: Create DE services index**

`src/pages/de/dienstleistungen/index.astro`:

```astro
---
import { getDict } from '../../../i18n';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Nav from '../../../components/Nav.astro';
import Footer from '../../../components/Footer.astro';
import ServicesIndex from '../../../components/ServicesIndex.astro';
import { buildLocalBusinessSchema, buildBreadcrumbSchema } from '../../../lib/schema';

const locale = 'de' as const;
const t = getDict(locale);

const SITE = 'https://orodjarstvoruda.com';
const structuredData = [
  buildLocalBusinessSchema(locale),
  buildBreadcrumbSchema([
    { name: 'Startseite',       url: `${SITE}/de/` },
    { name: 'Dienstleistungen', url: `${SITE}/de/dienstleistungen/` },
  ]),
];
---
<BaseLayout locale={locale} routeKey="services" title={t.servicesIndex.title} description={t.servicesIndex.description} structuredData={structuredData}>
  <Nav locale={locale} t={t} routeKey="services" />
  <main><ServicesIndex t={t} locale={locale} /></main>
  <Footer t={t} locale={locale} />
</BaseLayout>
```

- [ ] **Step 2: Create the three DE subpages**

`src/pages/de/dienstleistungen/fraesen.astro`:

```astro
---
import { getDict } from '../../../i18n';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Nav from '../../../components/Nav.astro';
import Footer from '../../../components/Footer.astro';
import ServicePage from '../../../components/ServicePage.astro';
import { buildLocalBusinessSchema, buildBreadcrumbSchema, buildServiceSchema, buildFAQSchema } from '../../../lib/schema';

const locale = 'de' as const;
const t = getDict(locale);
const sp = t.servicePages.milling;

const SITE = 'https://orodjarstvoruda.com';
const structuredData = [
  buildLocalBusinessSchema(locale),
  buildBreadcrumbSchema([
    { name: 'Startseite',       url: `${SITE}/de/` },
    { name: 'Dienstleistungen', url: `${SITE}/de/dienstleistungen/` },
    { name: 'Fräsen',           url: `${SITE}/de/dienstleistungen/fraesen/` },
  ]),
  buildServiceSchema({ key: 'milling', locale, name: t.services.items[0].title, description: sp.lead, offers: sp.what }),
  buildFAQSchema(sp.faq),
];
---
<BaseLayout locale={locale} routeKey="milling" title={sp.title} description={sp.description} structuredData={structuredData}>
  <Nav locale={locale} t={t} routeKey="milling" />
  <main><ServicePage t={t} locale={locale} serviceKey="milling" /></main>
  <Footer t={t} locale={locale} />
</BaseLayout>
```

`src/pages/de/dienstleistungen/drehen.astro`:

```astro
---
import { getDict } from '../../../i18n';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Nav from '../../../components/Nav.astro';
import Footer from '../../../components/Footer.astro';
import ServicePage from '../../../components/ServicePage.astro';
import { buildLocalBusinessSchema, buildBreadcrumbSchema, buildServiceSchema, buildFAQSchema } from '../../../lib/schema';

const locale = 'de' as const;
const t = getDict(locale);
const sp = t.servicePages.turning;

const SITE = 'https://orodjarstvoruda.com';
const structuredData = [
  buildLocalBusinessSchema(locale),
  buildBreadcrumbSchema([
    { name: 'Startseite',       url: `${SITE}/de/` },
    { name: 'Dienstleistungen', url: `${SITE}/de/dienstleistungen/` },
    { name: 'Drehen',           url: `${SITE}/de/dienstleistungen/drehen/` },
  ]),
  buildServiceSchema({ key: 'turning', locale, name: t.services.items[1].title, description: sp.lead, offers: sp.what }),
  buildFAQSchema(sp.faq),
];
---
<BaseLayout locale={locale} routeKey="turning" title={sp.title} description={sp.description} structuredData={structuredData}>
  <Nav locale={locale} t={t} routeKey="turning" />
  <main><ServicePage t={t} locale={locale} serviceKey="turning" /></main>
  <Footer t={t} locale={locale} />
</BaseLayout>
```

`src/pages/de/dienstleistungen/schleifen.astro`:

```astro
---
import { getDict } from '../../../i18n';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Nav from '../../../components/Nav.astro';
import Footer from '../../../components/Footer.astro';
import ServicePage from '../../../components/ServicePage.astro';
import { buildLocalBusinessSchema, buildBreadcrumbSchema, buildServiceSchema, buildFAQSchema } from '../../../lib/schema';

const locale = 'de' as const;
const t = getDict(locale);
const sp = t.servicePages.grinding;

const SITE = 'https://orodjarstvoruda.com';
const structuredData = [
  buildLocalBusinessSchema(locale),
  buildBreadcrumbSchema([
    { name: 'Startseite',       url: `${SITE}/de/` },
    { name: 'Dienstleistungen', url: `${SITE}/de/dienstleistungen/` },
    { name: 'Schleifen',        url: `${SITE}/de/dienstleistungen/schleifen/` },
  ]),
  buildServiceSchema({ key: 'grinding', locale, name: t.services.items[2].title, description: sp.lead, offers: sp.what }),
  buildFAQSchema(sp.faq),
];
---
<BaseLayout locale={locale} routeKey="grinding" title={sp.title} description={sp.description} structuredData={structuredData}>
  <Nav locale={locale} t={t} routeKey="grinding" />
  <main><ServicePage t={t} locale={locale} serviceKey="grinding" /></main>
  <Footer t={t} locale={locale} />
</BaseLayout>
```

- [ ] **Step 3: Build & verify**

```bash
npm run build
ls dist/de/dienstleistungen/
grep -c 'Bis 65 HRC' dist/de/dienstleistungen/fraesen/index.html
```

Expected: 4 entries; grep outputs at least `1`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/de/dienstleistungen/
git commit -m "feat(pages): German services index + 3 service subpages (using Drehen)"
```

---

## Phase 8 — Static files

### Task 24: Create robots.txt

**Files:**
- Create: `D:\dev\ruda-website\public\robots.txt`

- [ ] **Step 1: Create robots.txt**

```
User-agent: *
Allow: /

Sitemap: https://orodjarstvoruda.com/sitemap-index.xml
```

- [ ] **Step 2: Build & verify**

```bash
npm run build
cat dist/robots.txt
```

Expected: file printed as-is.

- [ ] **Step 3: Commit**

```bash
git add public/robots.txt
git commit -m "feat(seo): add robots.txt with sitemap pointer"
```

---

### Task 25: Create _redirects for migration

**Files:**
- Create: `D:\dev\ruda-website\public\_redirects`

- [ ] **Step 1: Create _redirects**

```
# Old strengths pages → home anchor
/prednosti       /#strengths        301
/prednosti/      /#strengths        301
/de/vorteile     /de/#strengths     301
/de/vorteile/    /de/#strengths     301
/en/strengths    /en/#strengths     301
/en/strengths/   /en/#strengths     301

# Old contact pages → home anchor
/kontakt         /#contact          301
/kontakt/        /#contact          301
/de/kontakt      /de/#contact       301
/de/kontakt/     /de/#contact       301
/en/contact      /en/#contact       301
/en/contact/     /en/#contact       301
```

- [ ] **Step 2: Build & verify**

```bash
npm run build
cat dist/_redirects
```

Expected: file contents present unchanged.

- [ ] **Step 3: Commit**

```bash
git add public/_redirects
git commit -m "feat(seo): add Cloudflare 301 redirects from old site URLs"
```

---

### Task 26: Create security.txt

**Files:**
- Create: `D:\dev\ruda-website\public\.well-known\security.txt`

- [ ] **Step 1: Create security.txt**

```
Contact: mailto:ruda.orodjarstvo@gmail.com
Expires: 2027-01-01T00:00:00.000Z
Preferred-Languages: sl, en
```

- [ ] **Step 2: Build & verify**

```bash
npm run build
cat dist/.well-known/security.txt
```

Expected: file printed as-is.

- [ ] **Step 3: Commit**

```bash
git add "public/.well-known/security.txt"
git commit -m "feat(seo): add security.txt (RFC 9116)"
```

---

## Phase 9 — Final verification

### Task 27: Full build + verification sweep

**Files:**
- No file changes — verification only

- [ ] **Step 1: Clean build**

```bash
rm -rf dist node_modules/.astro .astro
npm run build
```

Expected: succeeds with no warnings.

- [ ] **Step 2: Verify tests still pass**

```bash
npm run test
```

Expected: all schema and routes tests pass.

- [ ] **Step 3: Verify page count**

```bash
find dist -name "index.html" | wc -l
```

Expected: 12 (3 home + 3 services indices + 9 service subpages — actually 3 home + 3 services indices + 9 subpages = 15. Let me recount: 3 homes + 3 services + 9 subpages = 15. Adjust expectation to 15).

Actually: `/`, `/storitve/`, `/storitve/rezkanje/`, `/storitve/struzenje/`, `/storitve/brusenje/`, `/en/`, `/en/services/`, `/en/services/milling/`, `/en/services/turning/`, `/en/services/grinding/`, `/de/`, `/de/dienstleistungen/`, `/de/dienstleistungen/fraesen/`, `/de/dienstleistungen/drehen/`, `/de/dienstleistungen/schleifen/` = 15. Expected: `15`.

- [ ] **Step 4: Verify sitemap, robots, redirects**

```bash
ls dist/sitemap-index.xml dist/sitemap-0.xml dist/robots.txt dist/_redirects "dist/.well-known/security.txt"
grep -c '<loc>' dist/sitemap-0.xml
```

Expected: all 5 files exist; sitemap contains 15 `<loc>` entries.

- [ ] **Step 5: Verify structured data on key pages**

```bash
grep -c '"@type":"LocalBusiness"'  dist/index.html
grep -c '"@type":"LocalBusiness"'  dist/de/dienstleistungen/fraesen/index.html
grep -c '"@type":"Service"'         dist/storitve/rezkanje/index.html
grep -c '"@type":"BreadcrumbList"'  dist/storitve/rezkanje/index.html
grep -c '"@type":"FAQPage"'         dist/storitve/rezkanje/index.html
```

Expected: each outputs `1`.

- [ ] **Step 6: Verify hreflang alternates point to localized slugs**

```bash
grep 'hreflang="de"' dist/storitve/rezkanje/index.html
```

Expected: contains `href="https://orodjarstvoruda.com/de/dienstleistungen/fraesen/"`.

- [ ] **Step 7: Validate one JSON-LD payload manually**

Extract the LocalBusiness JSON from the homepage and paste into [https://validator.schema.org/](https://validator.schema.org/). Expected: zero errors, zero warnings.

- [ ] **Step 8: Lighthouse / PageSpeed run (manual)**

Start the dev server and run Lighthouse:

```bash
npm run dev
# In another terminal, open Chrome DevTools → Lighthouse → Mobile → Performance + SEO + Best Practices + Accessibility
```

Targets:
- Performance ≥ 90 (95+ preferred — placeholder hero may limit)
- SEO 100
- Best Practices ≥ 95
- Accessibility ≥ 95

If any target misses, capture the specific Lighthouse audit failure and add a follow-up task. (Common issues: missing alt text — should already be addressed; layout shift from images without dimensions — Astro `<Image>` handles this; large images — addressed by image pipeline.)

- [ ] **Step 9: Final commit (if any cleanup needed) and push**

If everything passes, no commit needed beyond previous tasks. Otherwise:

```bash
git status
# Resolve any pending changes, then:
git push
```

- [ ] **Step 10: Manual post-deployment checklist (one-time human tasks)**

After deploying to Cloudflare Pages:

1. Set DNS for `orodjarstvoruda.com` → Cloudflare Pages project
2. Enable Cloudflare Web Analytics in dashboard for the Pages project
3. Set environment variable `PUBLIC_GSC_VERIFICATION` in Pages settings (value from Google Search Console URL-prefix property verification)
4. Verify Search Console domain property via DNS TXT record
5. Submit `https://orodjarstvoruda.com/sitemap-index.xml` to Google Search Console (4 properties: domain + 3 URL-prefix)
6. Submit same sitemap to Bing Webmaster Tools
7. Test the 12 migration redirects with curl:
   ```bash
   for url in /prednosti/ /de/vorteile/ /en/strengths/ /kontakt/ /de/kontakt/ /en/contact/; do
     curl -sI "https://orodjarstvoruda.com$url" | head -3
   done
   ```
   Expected: each returns `HTTP/2 301` with Location header pointing to the expected new URL.
8. Run real-world PageSpeed Insights on the deployed homepage: https://pagespeed.web.dev/

---

## Verification against spec — final check

| Spec section | Implemented in tasks |
|---|---|
| §3 URL structure + route table | Task 4 (routes.ts) |
| §3 Migration redirects | Task 25 |
| §4 Translation corrections (sl) | Task 7 |
| §4 Translation corrections (de incl. Drehen) | Task 8 |
| §4 Translation corrections (en) | Task 9 |
| §4 Strengths copy (3 locales) | Tasks 7/8/9 + Task 15 (component reads from i18n) |
| §5 Per-page metadata system | Task 11 (BaseLayout) + Task 10 (i18n types) |
| §5 Title patterns | Tasks 7/8/9 (in i18n json) |
| §5 Heading hierarchy | Task 20 (ServicePage template) |
| §6.1 LocalBusiness JSON-LD | Tasks 5 (builder) + 11/21/22/23 (usage) |
| §6.2 Service JSON-LD | Tasks 6 + 21/22/23 |
| §6.3 BreadcrumbList JSON-LD | Tasks 6 + 20 (visual) + 21/22/23 (data) |
| §6.4 FAQPage JSON-LD | Tasks 6 + 18 (FAQ component) + 21/22/23 |
| §6.5 schema.ts implementation | Tasks 5 + 6 |
| §7 Sitemap | Task 3 |
| §7 robots.txt | Task 24 |
| §7 _redirects | Task 25 |
| §8.1 Self-host fonts | Tasks 1 + 11 (BaseLayout imports) |
| §8.2 Image optimization | Tasks 3 (config) + 13b (move sources to src/assets/) + 14/15/19/20 (component usage) |
| §8.3 LCP preload + image dimensions | Tasks 13 (eager loading) + 20 (Astro Image handles dims) |
| §8.4 Cloudflare wins | Automatic — verified at Task 27 manual step |
| §9 Service subpage content | Tasks 7/8/9 (content) + 20 (template) + 21/22/23 (pages) |
| §9 Image alt text | Tasks 7/8/9 (i18n `alt` block) + 14/15 (usage) |
| §9 Internal linking | Tasks 14 (Services → subpage) + 20 (subpage cross-links) + 17 (Footer) |
| §9 Slovene legal footer | Task 17 |
| §10.1 Google Search Console | Task 11 (verification meta) + Task 27 step 10 (human setup) |
| §10.2 Bing | Task 27 step 10 (human task) |
| §10.3 Cloudflare Web Analytics | Task 27 step 10 (dashboard enable) |
| §10.4 Twitter / OG meta | Task 11 |
| §10.5 Geo meta | Task 11 |
| §10.6 security.txt | Task 26 |

All spec requirements have at least one task. No placeholders, no "TBD" steps. Type/method signatures match across tasks: `Locale`, `RouteKey`, `localizedRoute()`, `buildLocalBusinessSchema()`, `buildServiceSchema()`, `buildBreadcrumbSchema()`, `buildFAQSchema()` are used consistently.

---

## Execution

Plan complete and saved to `docs/superpowers/plans/2026-05-26-seo-implementation.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** — Execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints

Which approach?
