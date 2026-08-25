#!/usr/bin/env bash
# Encode a source clip into the site's hero video assets, backing up the current ones first.
#
# Usage: encode-hero.sh <source-video> [videos-dir]
#   <source-video>  path to the raw clip (e.g. footage.mov)
#   [videos-dir]    output dir; defaults to <repo>/public/videos (derived from this script)
#
# Produces: hero.mp4 (H.264 High, faststart), hero.webm (VP9), hero-poster.jpg
# Spec: 1280x720, 30 fps, no audio, ~1.5 Mbps 2-pass. See docs/hero-video.md.
set -euo pipefail

SRC="${1:?Usage: encode-hero.sh <source-video> [videos-dir]}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
VIDEOS_DIR="${2:-$REPO_ROOT/public/videos}"

[ -f "$SRC" ] || { echo "Source not found: $SRC" >&2; exit 1; }
command -v ffmpeg >/dev/null || { echo "ffmpeg not on PATH" >&2; exit 1; }
mkdir -p "$VIDEOS_DIR"
VIDEOS_DIR="$(cd "$VIDEOS_DIR" && pwd)"

# --- Keep large, uncommittable files out of git (idempotent) ---
ensure_ignored() {  # $1 = exact .gitignore line to guarantee
  local gi="$REPO_ROOT/.gitignore"
  if [ -f "$gi" ] && grep -qxF "$1" "$gi"; then
    echo "Already in .gitignore: $1"
  else
    [ -f "$gi" ] && [ -n "$(tail -c1 "$gi")" ] && printf '\n' >> "$gi"
    printf '%s\n' "$1" >> "$gi"
    echo "Added to .gitignore: $1"
  fi
}

# The raw source clip, if it lives inside the repo
SRC_ABS="$(cd "$(dirname "$SRC")" && pwd)/$(basename "$SRC")"
case "$SRC_ABS" in "$REPO_ROOT"/*) ensure_ignored "/${SRC_ABS#"$REPO_ROOT"/}" ;; esac

# The timestamped backup dir, if it lives inside the repo
case "$VIDEOS_DIR" in "$REPO_ROOT"/*) ensure_ignored "/${VIDEOS_DIR#"$REPO_ROOT"/}/old/" ;; esac

MP4="$VIDEOS_DIR/hero.mp4"
WEBM="$VIDEOS_DIR/hero.webm"
POSTER="$VIDEOS_DIR/hero-poster.jpg"

# --- Back up current assets into a timestamped subfolder (never clobbers) ---
BACKUP_DIR="$VIDEOS_DIR/old/$(date +%Y-%m-%d_%H%M%S)"
backed_up=0
for f in "$MP4" "$WEBM" "$POSTER"; do
  if [ -f "$f" ]; then
    mkdir -p "$BACKUP_DIR"
    mv "$f" "$BACKUP_DIR/"
    backed_up=1
  fi
done
if [ "$backed_up" = 1 ]; then
  echo "Backed up previous hero assets -> $BACKUP_DIR"
else
  echo "No existing hero assets to back up."
fi

# --- Encode: 1280x720, 30 fps, no audio, ~1.5 Mbps 2-pass ---
VF="scale=1280:720"
LOGDIR="$(mktemp -d)"
trap 'rm -rf "$LOGDIR"' EXIT

echo "Encoding H.264 mp4 (pass 1/2)..."
ffmpeg -y -i "$SRC" -c:v libx264 -profile:v high -pix_fmt yuv420p -b:v 1450k -pass 1 -passlogfile "$LOGDIR/x264" \
  -vf "$VF" -r 30 -an -f mp4 -map_metadata -1 /dev/null
ffmpeg -y -i "$SRC" -c:v libx264 -profile:v high -pix_fmt yuv420p -b:v 1450k -pass 2 -passlogfile "$LOGDIR/x264" \
  -vf "$VF" -r 30 -an -movflags +faststart -map_metadata -1 "$MP4"

echo "Encoding VP9 webm (pass 1/2)..."
ffmpeg -y -i "$SRC" -c:v libvpx-vp9 -pix_fmt yuv420p -b:v 1500k -pass 1 -passlogfile "$LOGDIR/vp9" \
  -vf "$VF" -r 30 -an -f null /dev/null
ffmpeg -y -i "$SRC" -c:v libvpx-vp9 -pix_fmt yuv420p -b:v 1500k -pass 2 -passlogfile "$LOGDIR/vp9" \
  -vf "$VF" -r 30 -an -map_metadata -1 "$WEBM"

echo "Extracting poster..."
ffmpeg -y -ss 00:00:02 -i "$SRC" -frames:v 1 -update 1 -vf "$VF" -q:v 4 "$POSTER"

echo "Done:"
ls -la "$MP4" "$WEBM" "$POSTER"
