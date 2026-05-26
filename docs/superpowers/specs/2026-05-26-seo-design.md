# SEO design — RUDA Orodjarstvo website

**Date:** 2026-05-26
**Status:** spec, not yet implemented
**Project:** `D:\dev\ruda-website` (Astro 5 + Cloudflare Pages, locales sl/en/de)
**Production domain:** `https://orodjarstvoruda.com`

## 1. Goal

Replace `orodjarstvoruda.com` (existing site, criticized as weak SEO) with the new Astro build, with strong technical SEO across all three locales. One-time setup; no ongoing playbook in scope.

Realistic outcomes:
- Trivial #1 ranking for branded queries ("RUDA Orodjarstvo", "Damjan Rupnik orodjarstvo")
- Strong competitive position for local queries ("orodjarstvo Idrija", "CNC frezanje Gorenjska")
- Rich-result eligibility (FAQ, breadcrumb, business panel) via JSON-LD
- Core Web Vitals in "Good" thresholds across mobile + desktop
- Foundation that adding locales/pages/ongoing work later is straightforward

## 2. Scope decisions (from brainstorming)

| Question | Decision |
|---|---|
| Target market | All three locales technically optimized equally; ongoing effort plan deferred |
| Content depth | Approach B: 500-word service subpages with FAQ schema; not 800+ word deep content |
| Domain | `orodjarstvoruda.com` (already owned) |
| German "Wenden" issue | Use `Drehen` (standard term, matches existing body text) |
| Section "Other" label | Renamed to `Company information` / `Podatki podjetja` / `Unternehmensinformationen` |
| Hero video | Deferred — see `docs/hero-video.md` |
| OG default image | Use existing logo, no custom card |
| Google Analytics | Cloudflare Web Analytics only |

## 3. URL structure & routes

### Locale routing

- `sl` is default, lives at `/` (no prefix)
- `en` at `/en/`
- `de` at `/de/`

### Page set (12 routes total)

| sl | en | de |
|---|---|---|
| `/` | `/en/` | `/de/` |
| `/storitve/` | `/en/services/` | `/de/dienstleistungen/` |
| `/storitve/rezkanje/` | `/en/services/milling/` | `/de/dienstleistungen/fraesen/` |
| `/storitve/struzenje/` | `/en/services/turning/` | `/de/dienstleistungen/drehen/` |
| `/storitve/brusenje/` | `/en/services/grinding/` | `/de/dienstleistungen/schleifen/` |

Localized slugs (not generic English slugs) are required so each language's URL contains its native keyword. Astro's i18n supports per-locale path mapping.

### Route table (single source of truth)

New file `src/i18n/routes.ts`:

```ts
export const routes = {
  home:     { sl: '/',                    en: '/en/',                   de: '/de/' },
  services: { sl: '/storitve/',           en: '/en/services/',          de: '/de/dienstleistungen/' },
  milling:  { sl: '/storitve/rezkanje/',  en: '/en/services/milling/',  de: '/de/dienstleistungen/fraesen/' },
  turning:  { sl: '/storitve/struzenje/', en: '/en/services/turning/',  de: '/de/dienstleistungen/drehen/' },
  grinding: { sl: '/storitve/brusenje/',  en: '/en/services/grinding/', de: '/de/dienstleistungen/schleifen/' },
} as const;

export type RouteKey = keyof typeof routes;
export const localizedRoute = (key: RouteKey, locale: Locale) => routes[key][locale];
```

`BaseLayout` derives hreflang alternates from this table. The language switcher in `Nav.astro` jumps to the equivalent page in the target locale (not just the homepage).

### Migration redirects (301)

New `public/_redirects` file. Cloudflare Pages picks it up automatically.

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

`/storitve/`, `/de/dienstleistungen/`, `/en/services/` are NOT redirected — these URLs are preserved as the new real services-index pages.

## 4. Translation corrections (replacing earlier placeholders)

### Slovenian — match existing live site terminology

| Current spec | Corrected |
|---|---|
| `Frezanje` | `Rezkanje` |
| `Plansko brušenje` | `Ploskovno brušenje` |
| `Trdo frezanje do 65 HRC` | `Rezkanje v trdo do 65 HRC` |
| Nav: `Prednosti` | `Naše prednosti` |
| Milling spec: `5-osno frezanje vseh vrst materialov` | `5-osno rezkanje vseh vrst materialov` |
| `Obdelava karbida / WIDIA` | `Rezkanje karbidnih trdin – WIDIA` |
| Contact section header: `Stopite v stik` | `Splošne informacije`, `Podatki podjetja` |

### German — match existing site + fix "Wenden" → "Drehen"

| Current spec | Corrected |
|---|---|
| Nav: `Leistungen` | `Dienstleistungen` |
| URL `/de/leistungen/...` | `/de/dienstleistungen/...` |
| Turning heading: (was unclear, fixing existing) | `Drehen` (NOT `Wenden`) |
| Strengths heading | `UNSERE VORTEILE` |
| Contact section header: `Allgemeine Informationen` | unchanged |
| `Andere` | `Unternehmensinformationen` |

### English — match existing live site phrasing

| Current spec | Corrected |
|---|---|
| Nav: `Strengths` | `Our strengths` |
| Strengths heading | `OUR STRENGTHS` |
| Milling bullet: `Carbide / WIDIA machining` | `Milling of carbide solids – WIDIA` |
| Contact section header: `Get in touch` | `General information`, `Company information` |
| `Other` | `Company information` |

### Strengths copy (per existing site, all three locales)

| # | sl | en | de |
|---|---|---|---|
| 1 | Izdelava izdelkov do trdote 65 HRC ter obdelava karbidne trdine (WIDIA) | Manufacture of products up to 65 HRC hardness and carbide machining (WIDIA) | Herstellung von Produkten mit einer Härte von bis zu 65 HRC und Bearbeitung von Hartmetall (WIDIA) |
| 2 | Izdelava izdelkov, kjer je zahtevana visoka natančnost obdelave | Manufacture of products where high precision machining is required | Herstellung von Produkten, die eine hochpräzise Bearbeitung erfordern |
| 3 | Izdelava izdelkov za štancanje, brizganje in preoblikovanje | Manufacture of stamping, moulding and forming products | Herstellung von Stanz-, Press- und Umformprodukten |
| 4 | Izdelava mikro izdelkov | Manufacture of micro-products | Herstellung von Mikroprodukten |

## 5. Per-page metadata system

### Extended `BaseLayout.astro` props

```ts
interface Props {
  locale: Locale;
  routeKey: RouteKey;          // used to derive hreflang alternates
  title: string;
  description: string;
  ogImage?: string;            // page-specific OG image (defaults to logo)
  noindex?: boolean;           // for thank-you / preview pages
  structuredData?: object | object[];   // JSON-LD payload(s)
  breadcrumbs?: Array<{ name: string; url: string }>;  // auto-emits BreadcrumbList
}
```

### Title pattern (one per page type)

Keyword front-loaded, brand at the end:

| Page | Pattern | Example (sl) |
|---|---|---|
| Home | `[Brand] — [Tagline] \| [City]` | `RUDA Orodjarstvo — Precizno orodjarstvo, CNC obdelava \| Spodnja Idrija` |
| Services index | `[Heading] — [Service list] \| [Brand]` | `Storitve — CNC rezkanje, struženje, brušenje \| RUDA Orodjarstvo` |
| Service subpage | `[Service] ([Key spec]) — [Brand]` | `Rezkanje (5-osno CNC, do 65 HRC) — RUDA Orodjarstvo` |

Titles stay ≤ 60 characters where possible. Descriptions target 150–160 characters and include the primary keyword + secondary signal (location, capability, USP).

Title and description templates live in the i18n JSON files so they're easy to edit without touching components.

### Heading hierarchy (strict)

- One `<h1>` per page, containing the primary keyword
- `<h2>` for major sections
- `<h3>` for sub-items

Service subpage pattern:
- `<h1>`: `Rezkanje — 5-osno CNC do 65 HRC`
- `<h2>`: `Kaj rezkamo`, `Materiali in specifikacije`, `Tipične aplikacije`, `Pogosta vprašanja`
- `<h3>`: individual capability points, individual FAQ questions

## 6. Structured data (JSON-LD)

All schemas emitted as `<script type="application/ld+json">` via the `structuredData` prop. Schemas cross-reference the central Organization by `@id`.

### 6.1 LocalBusiness (homepage, every locale)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://orodjarstvoruda.com/#organization",
  "name": "RUDA Orodjarstvo",
  "alternateName": "Damjan Rupnik s.p.",
  "url": "https://orodjarstvoruda.com",
  "logo": "https://orodjarstvoruda.com/images/logo/ruda_logo.png",
  "image": "https://orodjarstvoruda.com/images/logo/ruda_logo.png",
  "telephone": ["+38651664374", "+38641495661"],
  "email": "ruda.orodjarstvo@gmail.com",
  "vatID": "SI52946398",
  "taxID": "SI52946398",
  "iso6523Code": "0199:SI52946398",
  "foundingDate": "2007",
  "founder": { "@type": "Person", "name": "Damjan Rupnik" },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Ledine 34",
    "addressLocality": "Spodnja Idrija",
    "postalCode": "5281",
    "addressCountry": "SI"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 46.03957569239691,
    "longitude": 14.049149609342338
  },
  "areaServed": [
    { "@type": "Country", "name": "Slovenia" },
    { "@type": "Country", "name": "Germany"  },
    { "@type": "Country", "name": "Austria"  },
    { "@type": "Country", "name": "Italy"    }
  ],
  "knowsAbout": [
    "CNC milling", "5-axis machining", "hard milling 65 HRC",
    "carbide machining", "WIDIA", "precision toolmaking",
    "stamping dies", "moulds", "surface grinding", "profile grinding",
    "micro-machining"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Services",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "CNC Milling" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "CNC Turning" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Precision Grinding" } }
    ]
  }
}
```

### 6.2 Service (one per service subpage)

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "CNC Milling",
  "serviceType": "CNC Milling",
  "provider": { "@id": "https://orodjarstvoruda.com/#organization" },
  "areaServed": [/* same as 6.1 */],
  "description": "5-axis CNC milling of all materials, including hardened steel up to 65 HRC and carbide (WIDIA). One-offs, prototypes, and small-to-medium batch production.",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "itemListElement": [
      { "@type": "Offer", "name": "5-axis milling, all materials" },
      { "@type": "Offer", "name": "Hard milling up to 65 HRC" },
      { "@type": "Offer", "name": "Carbide / WIDIA machining" },
      { "@type": "Offer", "name": "One-offs and prototypes" },
      { "@type": "Offer", "name": "Small to medium batch production" }
    ]
  }
}
```

Localized `name` and `description` per locale. Same pattern for Turning and Grinding.

### 6.3 BreadcrumbList (services index + subpages)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Domov",     "item": "https://orodjarstvoruda.com/" },
    { "@type": "ListItem", "position": 2, "name": "Storitve",  "item": "https://orodjarstvoruda.com/storitve/" },
    { "@type": "ListItem", "position": 3, "name": "Rezkanje",  "item": "https://orodjarstvoruda.com/storitve/rezkanje/" }
  ]
}
```

Auto-generated from the `breadcrumbs` prop on `BaseLayout`.

### 6.4 FAQPage (one per service subpage)

3–5 Q&A pairs per service. Rendered as collapsible accordions in HTML + emitted as FAQPage JSON-LD. Example for Milling (sl):

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Do kakšne trdote rezkamo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Do 65 HRC, vključno s kaljenim orodnim jeklom in karbidno trdino (WIDIA)."
      }
    },
    {
      "@type": "Question",
      "name": "Ali ponujate 5-osno rezkanje?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da — vse materiale, vključno s trdimi materiali in karbidno trdino."
      }
    },
    {
      "@type": "Question",
      "name": "Lahko izdelate posamičen kos ali samo serije?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oboje — posamične kose, prototipe in male do srednje serije."
      }
    },
    {
      "@type": "Question",
      "name": "Katere materiale rezkate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Vsa standardna orodna jekla, nerjavna jekla, aluminij, karbidno trdino (WIDIA) in kaljena jekla do 65 HRC."
      }
    },
    {
      "@type": "Question",
      "name": "Kje se nahajate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Spodnja Idrija, Slovenija. Pošiljamo po vsej EU."
      }
    }
  ]
}
```

Translated equivalents for en/de. Same FAQ structure for Turning and Grinding (different questions).

### 6.5 Implementation

New module `src/lib/schema.ts` exports typed builders:

```ts
export function buildLocalBusinessSchema(locale: Locale): object;
export function buildServiceSchema(service: 'milling'|'turning'|'grinding', locale: Locale): object;
export function buildBreadcrumbSchema(items: Array<{name: string; url: string}>): object;
export function buildFAQSchema(qa: Array<{q: string; a: string}>): object;
```

Pages pass schema arrays to `BaseLayout`, which serializes them all into `<script>` tags in `<head>`.

## 7. Sitemap, robots, redirects

### Sitemap

Use `@astrojs/sitemap` integration. Auto-discovers all routes, emits `sitemap-index.xml` + `sitemap-0.xml` with hreflang alternates inline per URL. Configured in `astro.config.mjs`:

```js
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://orodjarstvoruda.com',
  integrations: [sitemap({
    i18n: {
      defaultLocale: 'sl',
      locales: { sl: 'sl-SI', en: 'en', de: 'de-DE' }
    }
  })],
  // ...
});
```

### robots.txt

New `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://orodjarstvoruda.com/sitemap-index.xml
```

### _redirects

See section 3 — migration redirects from old URLs.

## 8. Performance

### Self-host fonts via Fontsource

Replace the Google Fonts CDN `<link>` in `BaseLayout.astro` with Fontsource imports:

```ts
// in BaseLayout.astro frontmatter or global CSS
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/bebas-neue/400.css';
import '@fontsource/dm-mono/400.css';
import '@fontsource/dm-mono/500.css';
```

Fontsource's bundled CSS uses `font-display: swap` by default — text renders immediately with the system fallback, swaps to DM Sans once loaded. Astro bundles the woff2 files into `_astro/` with content-hashed names, so we rely on the CSS bundle to fetch them (no manual `<link rel="preload">` with hardcoded paths). If LCP measurements later show font-load delay matters, switch to a manual preload using Astro's `getAssetPath()` helper to resolve the hashed filename at build time.

Net effect: ~200–400 ms LCP improvement vs the external CDN, one fewer DNS lookup, fonts served from the same Cloudflare edge as the page.

### Image optimization

Switch on Astro's image service in compile mode (fixes the Cloudflare adapter warning):

```js
// astro.config.mjs
adapter: cloudflare({ imageService: 'compile', platformProxy: { enabled: true } }),
```

Replace `<img>` usage with `<Image>` from `astro:assets`. At build time, sharp produces AVIF + WebP + JPG with `srcset` and explicit `width`/`height`. Sharp runs during `npm run build` only, not at runtime — deployment stays static.

Expected savings on the existing service/strength PNGs: ~3.5 MB → ~250 KB total on the homepage.

### LCP preload

For each homepage, preload the first hero slide image (LCP element):

```html
<link rel="preload" as="image" href="/images/hero/slide-1.jpg" fetchpriority="high">
```

First hero `<img>` marked `loading="eager" fetchpriority="high"`. All below-fold images stay `loading="lazy"`.

### CLS prevention

Every `<img>` gets explicit `width`/`height` (Astro `<Image>` handles automatically). Placeholders already do this via `aspect-ratio`.

### Cloudflare (automatic)

- Brotli compression — default
- HTTP/3 + 0-RTT — default
- Cache rules for `_astro/*` chunks (1-year immutable)
- Edge caching for HTML with smart revalidation

### Targets

| Metric | Target |
|---|---|
| LCP | < 2.5 s (mobile) |
| INP | < 200 ms |
| CLS | < 0.1 |
| PageSpeed Performance | 95+ |

## 9. Content & on-page

### Service subpage structure (~500 words each)

1. **Hero block** — `<h1>` + 1–2 sentence positioning + CTA to contact
2. **What we do** — extended bullet list (more depth than homepage)
3. **Materials & specifications** — concrete numbers
4. **Typical applications** — industries served / part types (dense with secondary keywords)
5. **FAQ** — 3–5 collapsible Q&A pairs (drives FAQ schema)
6. **Cross-links** — "See also: [other 2 services]"
7. **CTA strip** — "Get a quote" → Contact

### Image alt text

Per-locale alt strings in i18n JSON. Subject + context, not keyword stuffing.

| Image | Improved alt (sl) |
|---|---|
| Milling photo | `5-osni CNC rezkalni stroj v delavnici RUDA Orodjarstvo` |
| Stamping die photo | `Štančno orodje iz kaljenega jekla` |

### Internal linking

- Homepage Services section → "Več o storitvi rezkanja →" links to subpages
- Services index → each subpage (visual cards)
- Each subpage → other 2 service subpages
- Each subpage → contact section
- Footer adds a "Storitve" link list

Net result: every page reachable in ≤ 2 clicks; every service subpage has ≥ 4 inbound internal links.

### Legal-required footer block (Slovene law)

Compact line in `Footer.astro`, low-contrast styling, present on every page:

```
Damjan Rupnik s.p. · Ledine 34, 5281 Spodnja Idrija · DŠ: SI 52946398 · IBAN: SI56 0400 0027 6293 480
```

Also a strong E-E-A-T signal.

## 10. Search Console, analytics, social cards

### Google Search Console

Four properties:

| Property | Purpose |
|---|---|
| Domain: `orodjarstvoruda.com` | Aggregate across all locales (DNS TXT verification, one-time) |
| URL prefix: `https://orodjarstvoruda.com/` | Slovene-only drilldown |
| URL prefix: `https://orodjarstvoruda.com/en/` | English-only drilldown |
| URL prefix: `https://orodjarstvoruda.com/de/` | German-only drilldown |

URL-prefix properties verified via `<meta name="google-site-verification">` in `BaseLayout.astro`. Verification token comes from `import.meta.env.GSC_VERIFICATION` so it's not hardcoded.

Submit `https://orodjarstvoruda.com/sitemap-index.xml` to all four properties once verified.

### Bing Webmaster Tools

Same flow, separate property. ~5 minutes. Covers Bing, DuckDuckGo, and Bingbot-using AI assistants.

### Cloudflare Web Analytics

Enabled via the Cloudflare dashboard once the Pages project is live — Cloudflare auto-injects the beacon snippet at the edge for any zone routed through them. No code change required, no cookies, no GDPR consent banner. If we ever want it versioned in code (e.g. for non-Cloudflare hosting), we can add the script tag to `BaseLayout.astro` later.

GA4 explicitly deferred — see `docs/deferred-items.md`.

### OG / Twitter cards

`BaseLayout.astro` already emits `og:type`, `og:title`, `og:description`, `og:url`, `og:image`. Adding Twitter card meta:

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content={title}>
<meta name="twitter:description" content={description}>
<meta name="twitter:image" content={ogImage ?? '/images/logo/ruda_logo.png'}>
```

Custom OG image deferred (see `docs/deferred-items.md`). For now, logo serves as OG image fallback.

### Geo meta (belt-and-suspenders)

```html
<meta name="geo.region" content="SI">
<meta name="geo.placename" content="Spodnja Idrija">
<meta name="geo.position" content="46.039576;14.049150">
<meta name="ICBM" content="46.039576, 14.049150">
```

Old-school but harmless. Real geo signal is the LocalBusiness JSON-LD.

### security.txt

New `public/.well-known/security.txt`:

```
Contact: mailto:ruda.orodjarstvo@gmail.com
Expires: 2027-01-01T00:00:00.000Z
Preferred-Languages: sl, en
```

## 11. File-by-file change summary

### New files

```
docs/superpowers/specs/2026-05-26-seo-design.md    (this file)
docs/hero-video.md                                  (future enhancement guide)
docs/deferred-items.md                              (future-tracking log)
public/robots.txt
public/_redirects
public/.well-known/security.txt
src/i18n/routes.ts                                  (route table)
src/lib/schema.ts                                   (JSON-LD builders)
src/pages/storitve/index.astro                      (sl services index)
src/pages/storitve/rezkanje.astro                   (sl Milling subpage)
src/pages/storitve/struzenje.astro                  (sl Turning subpage)
src/pages/storitve/brusenje.astro                   (sl Grinding subpage)
src/pages/en/services/index.astro
src/pages/en/services/milling.astro
src/pages/en/services/turning.astro
src/pages/en/services/grinding.astro
src/pages/de/dienstleistungen/index.astro
src/pages/de/dienstleistungen/fraesen.astro
src/pages/de/dienstleistungen/drehen.astro
src/pages/de/dienstleistungen/schleifen.astro
src/components/ServicePage.astro                    (shared template)
src/components/ServicesIndex.astro                  (shared template)
src/components/FAQ.astro                            (collapsible Q&A)
```

### Modified files

```
astro.config.mjs        — add sitemap integration, imageService: 'compile', site URL
package.json            — add @astrojs/sitemap, @fontsource/*
src/i18n/index.ts       — extend with title/description templates, alt-text strings
src/i18n/sl.json        — translation corrections + service-subpage copy + FAQ
src/i18n/en.json        — translation corrections + service-subpage copy + FAQ
src/i18n/de.json        — translation corrections + service-subpage copy + FAQ
src/layouts/BaseLayout.astro
                        — extend props (routeKey, structuredData, breadcrumbs, ogImage, noindex)
                        — emit Twitter card meta, geo meta, GSC verification, LCP preload
                        — replace Google Fonts CDN with Fontsource imports
src/components/Nav.astro
                        — language switcher uses routes table to swap to equivalent page in target locale
                        — add "Storitve" → /storitve/ link (was just an anchor)
src/components/Hero.astro
                        — switch <img> to Astro <Image>
                        — add fetchpriority/eager on first slide
src/components/Services.astro
                        — switch <img> to Astro <Image>
                        — add "Več o storitvi →" links to subpages
src/components/Strengths.astro
                        — switch <img> to Astro <Image>
                        — apply corrected copy
src/components/Products.astro
                        — switch SmartImage to Astro <Image>
src/components/Contact.astro
                        — rename "Stopite v stik" → "Splošne informacije"
                        — add "Company information" block with VAT + IBAN
src/components/Footer.astro
                        — add legal-required line (s.p., address, DŠ, IBAN)
                        — add Storitve link list
```

## 12. Out of scope (see `docs/deferred-items.md`)

- Hero video (see `docs/hero-video.md`)
- Custom OG image
- Google Business Profile setup (human task, not code)
- Cloudflare Stream / Cloudflare Images
- Google Analytics 4
- Approach C content depth (800+ words per subpage)
- Case study / portfolio pages
- Blog
- Review schema / AggregateRating
- Contact form
- VideoObject JSON-LD
- Per-subpage custom OG images
- humans.txt
- Industry directory submissions

## 13. Risks & mitigations

| Risk | Mitigation |
|---|---|
| `Drehen` deviates from existing site's `Wenden` — risk of breaking inbound links if anyone deep-linked using `Wenden` term | Existing site doesn't have separate URLs per service, just a single `/de/dienstleistungen/` page. No deep links to break. Body text already uses `Drehen`. |
| Migration redirects on hash anchors lose some link equity vs. dedicated pages | Old pages (`/prednosti/`, `/kontakt/`) were thin content. Equity loss is small; consolidation benefit is larger. |
| Sharp at build time on Cloudflare Pages | `imageService: 'compile'` runs sharp during `npm run build`, not at runtime. Confirmed by Astro Cloudflare adapter docs. |
| New service subpages content needs to be written across 3 locales | ~500 words × 3 services × 3 locales = ~4500 words total. Manageable; bulk of repeat phrasing across services. |
| Multiple JSON-LD schemas per page can confuse Google if poorly cross-referenced | All schemas share `@id: https://orodjarstvoruda.com/#organization` for cross-referencing. Tested with Schema.org validator before deploy. |
| Slovene `<title>` length exceeds 60 chars in some cases | Title template is data, not code — copywriter trims to ≤60 chars where it matters. Implementation flags any title > 70 chars at build time. |

## 14. Verification checklist (post-implementation)

- [ ] `npm run build` succeeds with no warnings
- [ ] `dist/sitemap-index.xml` exists and includes all 12 routes with hreflang alternates
- [ ] `dist/robots.txt` exists and references sitemap
- [ ] `dist/_redirects` exists and contains all 12 migration rules
- [ ] Each rendered page has exactly one `<h1>`, correct `<title>`, correct `<meta description>`
- [ ] Each rendered page has `<link rel="canonical">` to its own URL
- [ ] hreflang tags reference each locale's localized slug (not just `/`)
- [ ] JSON-LD validates at https://validator.schema.org for at least 1 page per locale per template
- [ ] No console errors on any rendered page
- [ ] PageSpeed Insights mobile score ≥ 95 on homepage + at least one service subpage
- [ ] LCP measured ≤ 2.5s on mobile
- [ ] All images have width/height attributes
- [ ] Old URLs (`/prednosti/`, `/kontakt/`, etc.) return 301 to expected new URLs (test with curl)
- [ ] Cloudflare Web Analytics shows pageviews after first visit

## 15. Next step

Hand off to `superpowers:writing-plans` to produce a step-by-step implementation plan grouped into commits.
