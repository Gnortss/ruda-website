---
name: encode-hero-video
description: Use when given a source video clip to turn into the site's hero background — "make/update/replace the hero video from this file", regenerating hero.mp4, hero.webm and hero-poster.jpg for public/videos.
---

# Encode Hero Video

## Overview

Turns one raw source clip into the site's three hero assets at the fixed spec, and backs up the current assets first so nothing is lost.

**Outputs** (in `public/videos/`): `hero.mp4` (H.264 High, faststart), `hero.webm` (VP9), `hero-poster.jpg`.

**Spec** (from [docs/hero-video.md](../../../docs/hero-video.md), source of truth): 1280×720, 30 fps, no audio, ~1.5 Mbps 2-pass. Scaling is `scale=1280:720` — a non-16:9 source will be stretched; confirm the source is 16:9 first.

## When to Use

- User hands over a clip: "make the hero video from this", "here's the new footage, update the hero", "replace hero.mp4/webm".
- You need to regenerate hero assets after re-editing the source.

Not for: encoding unrelated video, or changing the spec itself (edit `docs/hero-video.md` and this script together if the spec changes).

## How to Run

One command. Pass the source clip; the script backs up current assets, then encodes.

```bash
bash .claude/skills/encode-hero-video/encode-hero.sh "path/to/source.mov"
```

What it does, in order:
1. Ensures large, uncommittable files are in `.gitignore` (idempotent, leading-slash anchored): the raw source clip if it lives inside the repo, and the `public/videos/old/` backup directory.
2. Moves any existing `hero.mp4` / `hero.webm` / `hero-poster.jpg` into `public/videos/old/<YYYY-MM-DD_HHMMSS>/` (timestamped — never clobbers a prior backup).
3. Encodes `hero.mp4` (2-pass) and `hero.webm` (2-pass).
4. Extracts `hero-poster.jpg` from the frame at 2 s.

Requires `ffmpeg` on PATH. Poster extraction assumes the source is ≥ ~3 s.

## Verify

After it finishes, confirm the outputs match spec:

```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=codec_name,width,height,r_frame_rate -of csv=p=0 public/videos/hero.mp4
ffprobe -v error -show_entries stream=codec_type -of csv=p=0 public/videos/hero.mp4   # video only, no audio
```

Expect `h264,1280,720,30/1` for the mp4 and `vp9,1280,720,30/1` for the webm, each with a single video stream. File sizes scale with clip length (~1.9 MB per 10 s).

## Common Mistakes

- **Running from the wrong directory.** Invoke from the repo root so the default `public/videos` target resolves. The script derives it from its own location, so an absolute or repo-root-relative source path is safest.
- **Non-16:9 source.** `scale=1280:720` stretches it. Crop/letterbox the source to 16:9 before encoding.
- **Forgetting the backup exists.** Old assets aren't deleted — they accumulate under `public/videos/old/`. Prune manually if it grows.
- **Assets exceed the 5 MB build guardrail.** A long clip (~30 s) lands ~5.7 MB, over the guardrail noted in `docs/hero-video.md`. Shorten the clip or raise the budget.
