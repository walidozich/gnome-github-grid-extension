# GitHub Grid GNOME Extension

GNOME Shell extension idea: show a GitHub-style contribution grid for a specific account from the top bar or notification-related UI.

## Status

Project initialized. Implementation has not started yet.

## Project Setup Decisions

- Target GNOME Shell versions: 46 and 49
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

## Packaging

Build a distributable bundle with:

```bash
./scripts/package.sh
```

That writes `dist/github-grid@walidozich.shell-extension.zip` and includes the shared `contributions.js` module that the runtime extension imports.

Install the built bundle with:

```bash
gnome-extensions install -f dist/github-grid@walidozich.shell-extension.zip
```

For local development without reinstalling the zip on every edit:

```bash
cp -r github-grid@walidozich/. ~/.local/share/gnome-shell/extensions/github-grid@walidozich/
glib-compile-schemas ~/.local/share/gnome-shell/extensions/github-grid@walidozich/schemas
gnome-extensions disable github-grid@walidozich || true
gnome-extensions enable github-grid@walidozich
```

If GNOME still appears to hold stale extension state after reinstalling on Wayland, log out and log back in once before continuing runtime tests.

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

On shutdown, the extension removes refresh timers, aborts the active Soup session, and ignores late async responses from older refresh requests. That keeps repeated enable/disable cycles from mutating destroyed UI actors.

## Local Validation

There is now a local `gjs` smoke test at `tests/contributions-smoke.js` that exercises the shared contribution parser, level mapping, cache round-trip, and username validation logic without requiring a live GNOME Shell session.

Run it with:

```bash
gjs -m tests/contributions-smoke.js
glib-compile-schemas github-grid@walidozich/schemas
```

Executed locally:

- `gjs -m tests/contributions-smoke.js` passed
- `glib-compile-schemas github-grid@walidozich/schemas` passed
- `gnome-shell --version` reported `GNOME Shell 49.4`
- `gnome-extensions pack github-grid@walidozich --schema=schemas/org.gnome.shell.extensions.github-grid.gschema.xml -o .` passed

Compatibility note:

- The extension metadata now declares support for GNOME Shell `46` and `49`
- `gnome-extensions info github-grid@walidozich` still did not enumerate the UUID from this CLI context after direct copy and bundle install, which points to session-side discovery state rather than a simple missing file

Diagnosis so far:

- The original metadata was incompatible with this machine because the shell is `49.4` and the extension initially declared only `46`
- The CLI now works normally for other extensions and the bundle packs successfully
- The installed files and `metadata.json` are present in `~/.local/share/gnome-shell/extensions/github-grid@walidozich`
- On Wayland, GNOME Shell can require a session restart before a newly added UUID is enumerated by the shell-side extension service

## Manual Runtime Testing

The live GNOME test matrix is documented in `tests/manual-runtime-checklist.md`. That checklist covers valid and invalid usernames, offline behavior, API failure behavior, refresh flow, and popup layout checks inside an actual GNOME Shell session.
