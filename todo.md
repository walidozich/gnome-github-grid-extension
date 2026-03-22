# TODO

## Project Setup

- [x] Decide the target GNOME Shell version.
- [x] Confirm the extension UUID.
- [x] Choose the GitHub username source:
  extension setting or hardcoded value.
- [x] Decide whether to support a GitHub token.
- [x] Create the base extension folder structure.

## Extension Scaffold

- [x] Create `metadata.json`.
- [x] Create `extension.js`.
- [ ] Create `stylesheet.css`.
- [ ] Create the `schemas` folder.
- [ ] Create the settings schema XML file.
- [ ] Add a basic README usage section.

## UI Placement

- [ ] Decide where the grid should appear:
  top bar popup or calendar menu section.
- [ ] Add a top bar indicator.
- [ ] Add a popup container for the grid.
- [ ] Add a loading state.
- [ ] Add an empty state.
- [ ] Add an error state.

## GitHub Data

- [ ] Choose the data source:
  GraphQL API or public profile parsing.
- [ ] Define the fetch function.
- [ ] Add username validation.
- [ ] Add network error handling.
- [ ] Add refresh logic.
- [ ] Add manual refresh support.

## Grid Rendering

- [ ] Define the grid data format.
- [ ] Map contribution counts to color levels.
- [ ] Render week columns.
- [ ] Render day cells.
- [ ] Add hover text or labels if practical.
- [ ] Match the GitHub-style visual spacing.

## Settings

- [ ] Add a username setting.
- [ ] Add a refresh interval setting.
- [ ] Add an optional token setting.
- [ ] Create a preferences UI.
- [ ] Load settings inside the extension.

## Lifecycle

- [ ] Load cached data on enable.
- [ ] Start data fetch on enable.
- [ ] Clean up timers on disable.
- [ ] Destroy UI objects on disable.
- [ ] Handle repeated enable and disable cycles safely.

## Testing

- [ ] Test the extension with a valid username.
- [ ] Test the extension with an invalid username.
- [ ] Test offline behavior.
- [ ] Test API failure behavior.
- [ ] Test the refresh path.
- [ ] Test UI layout on different panel sizes.

## Packaging

- [ ] Add installation instructions.
- [ ] Add local development instructions.
- [ ] Add screenshots later.
- [ ] Verify the final extension directory structure.
- [ ] Prepare the first usable release.
