#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXT_DIR="$ROOT_DIR/github-grid@walidozich"
OUT_DIR="${1:-$ROOT_DIR/dist}"
STAGE_DIR="$(mktemp -d)"
ZIP_PATH="$OUT_DIR/github-grid@walidozich.shell-extension.zip"

mkdir -p "$OUT_DIR"

cleanup() {
  rm -rf "$STAGE_DIR"
}

trap cleanup EXIT

mkdir -p "$STAGE_DIR/schemas"

cp "$EXT_DIR/metadata.json" "$STAGE_DIR/metadata.json"
cp "$EXT_DIR/extension.js" "$STAGE_DIR/extension.js"
cp "$EXT_DIR/prefs.js" "$STAGE_DIR/prefs.js"
cp "$EXT_DIR/stylesheet.css" "$STAGE_DIR/stylesheet.css"
cp "$EXT_DIR/contributions.js" "$STAGE_DIR/contributions.js"
cp "$EXT_DIR/schemas/org.gnome.shell.extensions.github-grid.gschema.xml" \
  "$STAGE_DIR/schemas/org.gnome.shell.extensions.github-grid.gschema.xml"

rm -f "$ZIP_PATH"
(cd "$STAGE_DIR" && zip -qr "$ZIP_PATH" .)
