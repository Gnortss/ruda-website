# RUDA Orodjarstvo — Website

Marketing site for RUDA Orodjarstvo (precision toolmaking, Spodnja Idrija, Slovenia).

- **Stack:** [Astro](https://astro.build) 5 (static), deployed to **Cloudflare Pages**
- **Locales:** `sl` (default, no prefix), `en` (/en/), `de` (/de/)
- **Design source:** `D:/dev/ruda-design/` (HTML/JSX bundle from Claude Design)

## Sections

Hero (fullwidth) → Services (alternating) → Strengths (overlay) → Our Work → Contact → Footer.

## Getting started

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # produces ./dist
npm run preview      # local Cloudflare Pages preview via Wrangler
```

## Project layout

```
src/
  i18n/                 sl.json, en.json, de.json + helpers
  layouts/BaseLayout.astro
  components/
    Nav.astro           # sticky nav, mobile menu, language switcher
    Hero.astro          # fullwidth carousel + dark overlay + headline
    Services.astro      # alternating image/text rows
    Strengths.astro     # 2×2 overlay grid
    Products.astro      # mosaic image grid
    Contact.astro       # phone, email, address, map placeholder
    Footer.astro
    HomePage.astro      # composes the page from a locale
    ImagePlaceholder.astro
    SmartImage.astro    # falls back to placeholder if file missing
  pages/
    index.astro         # /         (sl)
    en/index.astro      # /en/      (en)
    de/index.astro      # /de/      (de)
  styles/global.css
public/
  images/
    logo/               ruda_logo*.png  (real)
    services/           milling.png, turning.png, grinding.png  (real)
    strengths/          hard-carbide.png, precision.png, stamping-moulding.png, micro.png  (real)
    hero/               slide-1..4.jpg  (PLACEHOLDERS — drop in real photos)
    products/           product-1..8.jpg (PLACEHOLDERS — drop in real photos)
```

## Adding photos

Drop files into `public/images/hero/` and `public/images/products/` using the filenames listed in those folders' README.md. The site automatically swaps placeholder tiles for real images at build time.

## Localization

All copy lives in `src/i18n/{sl,en,de}.json`. To edit text, change those files — no component changes needed. To add a fourth locale, add it to `src/i18n/index.ts` (`locales` array) and `astro.config.mjs` (`i18n.locales`), then create a translation file and a `src/pages/<code>/index.astro` stub.

## Deploying to Cloudflare Pages

### Option A — Git integration (recommended)
1. Push this repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Build command: `npm run build`. Output directory: `dist`.
4. Set the production branch and deploy.

### Option B — Wrangler from CLI
```bash
npx wrangler login
npm run deploy        # builds and uploads ./dist to your Pages project
```

`wrangler.toml` sets `pages_build_output_dir = "./dist"` so `wrangler pages deploy` works without extra flags.

## Notes

- The site is fully static (`output: 'static'`) — no server runtime needed. The `@astrojs/cloudflare` adapter is included so you can switch to `output: 'server'` later (e.g. if you add a contact form Worker).
- The Google Maps embed is currently a placeholder; replace the `<!-- ... -->` block in `Contact.astro` with the embed iframe from Google Maps.
- Hreflang and canonical tags are emitted automatically per locale.
