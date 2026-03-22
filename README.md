# GitHub Grid GNOME Extension

GNOME Shell extension idea: show a GitHub-style contribution grid for a specific account from the top bar or notification-related UI.

## Status

Project initialized. Implementation has not started yet.

## Project Setup Decisions

- Target GNOME Shell version: 46
- Extension UUID: `github-grid@walidozich`
- GitHub username source: extension setting
- GitHub token support: not in the first version

## Next Step

Build the extension scaffold and choose the GitHub data source.

## Base Structure

```text
github-grid@walidozich/
├── assets/
├── extension.js
├── lib/
├── metadata.json
└── schemas/
```

## Basic Usage

1. Copy `github-grid@walidozich` into `~/.local/share/gnome-shell/extensions/`.
2. Compile the schema inside the extension directory:
   `glib-compile-schemas schemas`
3. Restart GNOME Shell or log out and log back in.
4. Enable the extension with the GNOME Extensions app or `gnome-extensions enable github-grid@walidozich`.

## Current Scaffold

- `metadata.json` declares the extension metadata and settings schema.
- `extension.js` adds a minimal top bar indicator.
- `stylesheet.css` defines the initial UI classes.
- `schemas/org.gnome.shell.extensions.github-grid.gschema.xml` defines base settings.
