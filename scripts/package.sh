#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXT_DIR="$ROOT_DIR/github-grid@walidozich"
OUT_DIR="${1:-$ROOT_DIR/dist}"

mkdir -p "$OUT_DIR"

glib-compile-schemas "$EXT_DIR/schemas"

gnome-extensions pack "$EXT_DIR" \
  --force \
  --schema=schemas/org.gnome.shell.extensions.github-grid.gschema.xml \
  --out-dir="$OUT_DIR"
