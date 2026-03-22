# Manual Runtime Checklist

## Setup

0. Confirm the shell version with `gnome-shell --version`.
1. Copy `github-grid@walidozich` to `~/.local/share/gnome-shell/extensions/`.
2. Run `glib-compile-schemas ~/.local/share/gnome-shell/extensions/github-grid@walidozich/schemas`.
3. Open preferences with `gnome-extensions prefs github-grid@walidozich`.
4. Enable the extension with `gnome-extensions enable github-grid@walidozich`.

If GNOME does not recognize the UUID, reload the shell session and re-check that `metadata.json` includes your major GNOME Shell version in `shell-version`.

## Valid Username

1. Set the username to `octocat`.
2. Open the top bar popup.
3. Confirm the grid renders and the summary text updates.
4. Hover several cells and confirm the date and contribution count change.

## Invalid Username

1. Set the username to `bad--name`.
2. Open the popup or trigger `Refresh now`.
3. Confirm the popup shows the local validation error without sending a request.

## Offline Behavior

1. Disconnect the network.
2. Trigger `Refresh now`.
3. Confirm the popup shows an error state.
4. Reconnect the network and trigger another refresh.
5. Confirm the popup recovers.

## API Failure

1. Change the fetch URL temporarily to an invalid path or use a firewall rule to block GitHub.
2. Trigger `Refresh now`.
3. Confirm the popup shows the request failure and does not leave stale loading text behind.

## Refresh Path

1. Trigger `Refresh now` repeatedly.
2. Confirm the menu item becomes insensitive while a refresh is active.
3. Lower the refresh interval in preferences.
4. Confirm the popup updates again after the configured interval.

## Layout

1. Test on the normal shell scale.
2. Test on a smaller display width or with panel crowding.
3. Confirm the popup remains readable and the grid cells stay aligned.
