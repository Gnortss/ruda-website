# Deferred items — things discussed but not in the first SEO implementation

This is a running log of things that came up during planning but were intentionally left out of the initial SEO build. Each entry has the reason it was deferred and a pointer to what to do when picking it up.

## Hero video

Background video replacing the carousel on desktop (image carousel preserved on mobile). Full implementation guide already written.

- **Status:** deferred — sticking with image carousel for first run
- **Why deferred:** the user wants to ship simple first; video can layer on later without restructuring
- **See:** `docs/hero-video.md` for the full encoding spec, HTML markup, fallback strategy, and ffmpeg recipes
- **Decision when picking up:** desktop gets the video, mobile keeps the carousel, reduced-motion users get the poster

## Custom Open Graph image (`og-default.jpg`)

A purpose-built 1200×630 social card with logo, tagline, and workshop background.

- **Status:** deferred — using `ruda_logo.png` as the OG image for now
- **Why deferred:** logo works as a fallback; designing a proper social card is a separate visual-design task
- **What to do when ready:** create `public/images/og-default.jpg` at 1200×630, set as default OG image in `BaseLayout.astro`. Optionally per-service-subpage OG images later.

## Google Business Profile (GBP)

The single biggest local-SEO lever for a Slovenian B2B with a physical address — drives the Google Maps panel and "near me" rankings.

- **Status:** not part of code changes; needs a human to claim/verify
- **Why deferred:** out of scope for a code-only first run; one-time setup task for the owner
- **What to do when ready:** claim the business at `business.google.com`, verify by postcard/phone, add address (Ledine 34, 5281 Spodnja Idrija), phone numbers, services (Milling, Turning, Grinding), photos. ~30 minutes once, plus 1–2 week verification wait.
- **Why it matters:** without GBP, you don't appear in the Maps panel even for branded searches. With it, you dominate "orodjarstvo Idrija" / "CNC Spodnja Idrija" type queries.

## Cloudflare Stream

Adaptive-bitrate video delivery with analytics.

- **Status:** not needed at current scope
- **Why deferred:** plain MP4/WebM from `public/videos/` is correct for a 10-second hero loop. Stream is $5/1000 min watched and only worth it for heavy video usage.
- **What to do when ready:** only if the site adds significant long-form video (case studies, machine demos, recorded walkthroughs).

## Cloudflare Images (paid)

On-the-fly image resizing per request.

- **Status:** not needed
- **Why deferred:** Astro's build-time image service with sharp covers our needs at this traffic level. Astro outputs all required sizes at build time and caches at the edge.
- **What to do when ready:** only if image variants explode (hundreds of products, dynamic galleries, user uploads).

## Google Analytics 4 (GA4)

Event-level analytics in addition to Cloudflare Web Analytics.

- **Status:** not needed
- **Why deferred:** Cloudflare Web Analytics covers what marketing actually needs (pageviews, referrers, geo, Core Web Vitals) without cookies or a consent banner. GA4 requires a GDPR consent UI and brings cookie complexity.
- **What to do when ready:** only if you start running paid ads (Google Ads needs GA4 for conversion tracking) or want detailed funnel analysis.

## Content depth — Approach C (800+ word service subpages)

Per-service deep content: materials sections, tolerance tables, industry-applications grids, case-study slugs.

- **Status:** deferred — shipping Approach B (~500 words per subpage)
- **Why deferred:** more upfront writing/translation effort across 3 locales; current scope already gives rich-result eligibility and good ranking foundation
- **What to do when ready:** extend the existing service-subpage layout with extra sections. The page template, schema, and routing already support more content — just add more JSON keys and section markup.

## Case study / portfolio pages

Per-project pages showing specific work delivered (with photos, materials, tolerances, customer outcome).

- **Status:** not in scope
- **Why deferred:** requires writing real case study content with customer permission. High SEO value when done but a separate content project.
- **What to do when ready:** add `/portfolio/` or `/reference/` index + `/portfolio/[slug]/` template. Each case study gets `CreativeWork` or `Article` schema. Builds rich long-tail keyword surface area.

## Blog / news section

For publishing technical articles, equipment updates, industry commentary.

- **Status:** not in scope — explicitly out of "no ongoing effort" plan
- **Why deferred:** blogs only work if you publish consistently. User opted for no ongoing content commitment.
- **What to do when ready:** Astro supports Content Collections natively. Could add `/blog/` later with the same i18n setup. Worth it only if the business is committed to writing.

## Review schema / aggregate rating

`AggregateRating` JSON-LD that produces gold-star ratings in search results.

- **Status:** not in scope
- **Why deferred:** no customer reviews collected yet. Adding fake/aspirational ratings is against Google's guidelines and can trigger penalties.
- **What to do when ready:** start collecting Google Business Profile reviews and B2B testimonials. Once you have ~5+ real reviews, add `AggregateRating` to the LocalBusiness schema referencing the actual review count and average score.

## Contact form

Web form for inbound enquiries instead of (or in addition to) phone/email.

- **Status:** not in scope — the design uses direct phone + email
- **Why deferred:** static site; a form requires either a Cloudflare Worker / Pages Function or a third-party form service (Formspree, Web3Forms)
- **What to do when ready:** add a Cloudflare Pages Function endpoint at `functions/api/contact.ts` that validates input and sends to `ruda.orodjarstvo@gmail.com` via Resend, MailChannels, or a similar provider. Switch `astro.config.mjs` to `output: 'server'` (already set up for this — the Cloudflare adapter is in place).

## VideoObject JSON-LD

Structured data describing the hero video for Google's video rich results.

- **Status:** depends on hero video — see `docs/hero-video.md`
- **Why deferred:** schema only helps when the video shows actual work (CNC mid-cut, finished part). For ambient/abstract footage, skip.
- **What to do when ready:** add the VideoObject block shown in `docs/hero-video.md` to the homepage's `structuredData` once a real video is in place.

## Per-subpage custom OG images

Specific Open Graph images per service subpage (close-up of milling for the milling page, etc.).

- **Status:** deferred — all pages share the default OG image
- **Why deferred:** marginal social-share-CTR gain; significant design work
- **What to do when ready:** create `public/images/og/milling.jpg`, `og/turning.jpg`, `og/grinding.jpg`, each 1200×630, and add `ogImage` prop to each subpage.

## `humans.txt`

Decorative file listing humans who built the site.

- **Status:** skipped — no SEO impact, purely decorative
- **What to do when ready:** add `public/humans.txt` if desired. Five-minute task, no real benefit.

## Industry directory submissions

Listings on Europages, Wer-liefert-was, Kompass, bizi.si, etc. — backlink + referral source.

- **Status:** out of scope ("no ongoing effort" plan)
- **Why deferred:** each is a manual signup + verification flow with no engineering component
- **What to do when ready:** prioritize Europages (strongest for B2B EU manufacturing), Wer-liefert-was (DACH), bizi.si (Slovenia). Submit business profile + link back to the site. One-time setup per directory; high-trust backlinks.
