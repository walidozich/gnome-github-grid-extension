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
3. Open preferences with `gnome-extensions prefs github-grid@walidozich` and set the username.
4. Restart GNOME Shell or log out and log back in.
5. Enable the extension with the GNOME Extensions app or `gnome-extensions enable github-grid@walidozich`.

## Current Scaffold

- `metadata.json` declares the extension metadata and settings schema.
- `extension.js` adds a top bar indicator with a popup container and basic UI states.
- `stylesheet.css` defines the initial UI classes.
- `schemas/org.gnome.shell.extensions.github-grid.gschema.xml` defines base settings.

## UI Placement Choice

The grid will live in a top bar popup instead of the notification list. This keeps it pinned and easy to reopen without depending on transient GNOME notifications.

## GitHub Data Choice

The first version uses GitHub's public contributions endpoint and parses the returned SVG data. This avoids requiring a token for the MVP while still exposing the daily contribution counts we need for rendering.

The popup supports manual refresh and periodic background refresh using the configured interval. Username validation happens before the request is sent so obvious input errors fail locally.

## Grid Rendering Notes

The popup now renders the last year of contributions as week columns with daily cells. Hovering a cell updates the detail text with the contribution count and date, which is a practical replacement for a traditional tooltip in GNOME Shell popup content.

## Settings Model

The extension settings now define three keys:

- `username`
- `refresh-interval-minutes`
- `github-token`

The token is not used by the MVP fetch path yet, but the schema is in place so the preferences UI and future authenticated API work can build on a stable settings model.

## Preferences UI

`prefs.js` provides a Libadwaita preferences window with:

- a GitHub username entry
- a refresh interval control
- a stored token field for future authenticated requests

## Lifecycle Notes

On startup, the extension restores the last successful contribution payload from settings if one exists, then starts a fresh fetch immediately. This keeps the popup populated while the next network request is still in flight.
