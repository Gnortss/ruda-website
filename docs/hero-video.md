# Hero video — implementation guide (future enhancement)

Status: **deferred**. The current site ships with a 4-slide image carousel. This document captures the design and implementation steps for swapping in a fullscreen background video on desktop while preserving the image carousel on mobile.

## Intent

- **Desktop**: a silent, looping fullscreen video replaces the carousel entirely. Showcases CNC work in motion — the strongest visual argument for a precision-toolmaking business.
- **Mobile**: image carousel stays as-is. Mobile data + autoplay UX make a fullscreen video hostile on phones. Visitors on small screens get the existing 4-slide carousel.
- **Accessibility**: users with `prefers-reduced-motion: reduce` see the still poster instead of the video.

## Why this can be fast

Three facts make a video hero hit the same Core Web Vitals targets as an image hero:

1. **LCP is measured on the poster image, not the video frames.** Chrome's LCP measurement uses the first painted frame; if we ship a poster, the poster fills LCP at the same speed as a hero JPG.
2. **File size is governable.** A 10-second 1080p silent loop, well-encoded, lands ~1.5–3 MB total. Comparable to a high-quality hero JPG.
3. **`preload="auto"` only loads what plays** before user interaction. With a short loop, that's the entire file — but only once and only on desktop.

Target metrics (PageSpeed on mobile, where mobile gets carousel only):
| Metric | Target |
|---|---|
| LCP | < 2.5 s |
| INP | < 200 ms |
| CLS | < 0.1 |
| Performance | 95+ |

## Source material

- **Length**: 8–12 seconds, looped seamlessly (first and last frame should match or fade)
- **Content**: 5-axis CNC mid-cut, workshop overview pan, or close-up of a finished precision part. Slow, deliberate motion is more premium than fast cuts.
- **Resolution of source**: 4K is fine for editing; final output is 1080p. Don't ship 4K.

## Encoding spec

Deliver three sources. Browsers pick the best supported.

| Format | Codec | Container | Target size | Browser support |
|---|---|---|---|---|
| Primary | AV1 | `.webm` | ~1.2 MB | Chrome 113+, Firefox 100+, Safari 17.4+ |
| Mid | VP9 | `.webm` | ~2.0 MB | All modern except old Safari |
| Fallback | H.264 high profile | `.mp4` | ~2.8 MB | Universal |

Common encoding rules:
- **Resolution**: 1920×1080
- **Frame rate**: 24 fps
- **No audio track** (smaller file + required for autoplay)
- **2-pass encoding** for quality at low bitrate
- **`+faststart`** flag on MP4 so playback can begin before full download
- **Strip metadata** to save bytes

### ffmpeg recipes

```bash
# H.264 mp4 — universal fallback
ffmpeg -i source.mov \
  -c:v libx264 -profile:v high -crf 28 -preset slow \
  -vf "scale=1920:1080" -r 24 -an \
  -movflags +faststart -map_metadata -1 \
  hero.mp4

# VP9 webm
ffmpeg -i source.mov \
  -c:v libvpx-vp9 -crf 35 -b:v 1M \
  -vf "scale=1920:1080" -r 24 -an -map_metadata -1 \
  hero.webm

# AV1 webm — smallest, best browsers
ffmpeg -i source.mov \
  -c:v libsvtav1 -crf 38 -preset 6 \
  -vf "scale=1920:1080" -r 24 -an -map_metadata -1 \
  hero.av1.webm
```

### Poster image

Extract a representative frame for the LCP poster:

```bash
ffmpeg -i source.mov -ss 00:00:02 -vframes 1 \
  -vf "scale=1920:1080" -q:v 4 \
  hero-poster.jpg
```

Convert poster to WebP/AVIF via Astro's `<Image>` at build time (automatic).

## File placement

```
public/
  videos/
    hero.av1.webm       (AV1, smallest)
    hero.webm           (VP9, mid)
    hero.mp4            (H.264, fallback)
  images/
    hero/
      slide-1-poster.jpg   (also serves as carousel slide 1)
      slide-2.jpg
      slide-3.jpg
      slide-4.jpg
```

## HTML markup

The hero renders both the video (desktop) and the carousel (mobile), and CSS shows one based on viewport:

```astro
---
// Hero.astro — additions
const hasVideo = /* check whether public/videos/hero.mp4 exists at build time */;
---
{hasVideo && (
  <video
    class="hero__video"
    autoplay
    muted
    loop
    playsinline
    preload="auto"
    poster="/images/hero/slide-1-poster.jpg"
    aria-hidden="true">
    <source src="/videos/hero.av1.webm" type='video/webm; codecs="av01.0.05M.08"'>
    <source src="/videos/hero.webm" type="video/webm">
    <source src="/videos/hero.mp4" type="video/mp4">
  </video>
)}

<div class="hero__carousel">
  {/* existing image carousel — unchanged */}
</div>
```

All four attributes (`autoplay`, `muted`, `playsinline`, `loop`) are required for iOS Safari to autoplay. Dropping any one breaks it.

## CSS — desktop video, mobile carousel

```css
.hero__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: none;
}

@media (min-width: 769px) {
  .hero__video { display: block; }
  .hero__carousel { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .hero__video { display: none; }
  .hero__carousel { display: block; }
}
```

Mobile breakpoint (768px) matches existing nav breakpoint for consistency.

## LCP preload

In `BaseLayout.astro`, add to the `<head>` when the page has a hero:

```html
<link
  rel="preload"
  as="image"
  href="/images/hero/slide-1-poster.jpg"
  fetchpriority="high"
/>
```

We preload the **poster image**, not the video. The poster is what LCP measures; the video lazy-loads after the poster paints.

## VideoObject JSON-LD (optional)

If the video shows actual work (vs. abstract footage), add VideoObject schema to make it eligible for Google's video rich results:

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "RUDA Orodjarstvo — CNC milling workshop",
  "description": "5-axis CNC machining of precision tooling components at RUDA Orodjarstvo, Spodnja Idrija.",
  "thumbnailUrl": "https://orodjarstvoruda.com/images/hero/slide-1-poster.jpg",
  "uploadDate": "2026-MM-DD",
  "contentUrl": "https://orodjarstvoruda.com/videos/hero.mp4",
  "duration": "PT10S"
}
```

Skip if the video is purely ambient / abstract.

## Cloudflare delivery

Plain `.mp4` / `.webm` files in `public/videos/` are served by Cloudflare Pages over HTTP/2 with HTTP-range requests for video seeking. No extra service required.

**Cloudflare Stream** ($5 per 1000 minutes watched) only matters if:
- You want adaptive bitrate (multiple resolutions auto-switched based on connection)
- You want analytics on plays/watch-time
- The video gets significant viewership

For a 10-second background loop on a B2B marketing site, plain static delivery is correct.

## Build-time guardrail

Add a check to the build that warns/fails if any video in `public/videos/` exceeds a size budget (e.g. 5 MB), to catch accidentally-shipped huge files:

```js
// astro.config.mjs integration (sketch)
import { statSync, readdirSync } from 'node:fs';
const MAX_MB = 5;
for (const f of readdirSync('public/videos')) {
  const sizeMB = statSync(`public/videos/${f}`).size / 1024 / 1024;
  if (sizeMB > MAX_MB) {
    throw new Error(`Video ${f} is ${sizeMB.toFixed(1)} MB — exceeds budget of ${MAX_MB} MB`);
  }
}
```

## Implementation checklist (when ready)

- [ ] Source 8–12s of usable footage
- [ ] Encode with the three ffmpeg recipes above
- [ ] Extract poster frame
- [ ] Drop files into `public/videos/` and `public/images/hero/`
- [ ] Update `Hero.astro` with the markup above
- [ ] Add CSS breakpoint rules for desktop/mobile/reduced-motion
- [ ] Add poster preload to `BaseLayout.astro`
- [ ] (Optional) Add VideoObject JSON-LD if the video shows actual work
- [ ] Verify on real iPhone/Android (autoplay quirks are device-specific)
- [ ] Run PageSpeed Insights — confirm LCP still under 2.5s on mobile
