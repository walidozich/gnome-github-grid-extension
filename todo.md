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
- [x] Create `stylesheet.css`.
- [x] Create the `schemas` folder.
- [x] Create the settings schema XML file.
- [x] Add a basic README usage section.

## UI Placement

- [x] Decide where the grid should appear:
  top bar popup or calendar menu section.
- [x] Add a top bar indicator.
- [x] Add a popup container for the grid.
- [x] Add a loading state.
- [x] Add an empty state.
- [x] Add an error state.

## GitHub Data

- [x] Choose the data source:
  GraphQL API or public profile parsing.
- [x] Define the fetch function.
- [x] Add username validation.
- [x] Add network error handling.
- [x] Add refresh logic.
- [x] Add manual refresh support.

## Grid Rendering

- [x] Define the grid data format.
- [x] Map contribution counts to color levels.
- [x] Render week columns.
- [x] Render day cells.
- [x] Add hover text or labels if practical.
- [x] Match the GitHub-style visual spacing.

## Settings

- [x] Add a username setting.
- [x] Add a refresh interval setting.
- [x] Add an optional token setting.
- [x] Create a preferences UI.
- [x] Load settings inside the extension.

## Lifecycle

- [x] Load cached data on enable.
- [x] Start data fetch on enable.
- [x] Clean up timers on disable.
- [x] Destroy UI objects on disable.
- [x] Handle repeated enable and disable cycles safely.

## Testing

- [x] Add automated smoke tests for shared contribution logic.
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
