import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Soup from 'gi://Soup';
import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import {
    buildContributionsUrl,
    buildWeekColumns,
    formatContributionLabel,
    isValidUsername,
    normalizeUsername,
    parseCachedResult,
    parseContributionSvg,
    serializeCachedResult,
    summarizeContributions,
} from './lib/contributions.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

const DECODER = new TextDecoder();

async function fetchContributions(session, username) {
    const message = Soup.Message.new('GET', buildContributionsUrl(username));
    message.request_headers.append('User-Agent', 'github-grid-gnome-extension');

    const bytes = await session.send_and_read_async(
        message,
        GLib.PRIORITY_DEFAULT,
        null
    );

    const statusCode = message.get_status();
    if (statusCode !== Soup.Status.OK)
        throw new Error(`GitHub returned HTTP ${statusCode}`);

    const svg = DECODER.decode(bytes.get_data());
    const days = parseContributionSvg(svg);
    const {total, maxCount} = summarizeContributions(days);

    return {days, total, maxCount};
}

const GithubGridIndicator = GObject.registerClass(
class GithubGridIndicator extends PanelMenu.Button {
    _init(settings, session) {
        super._init(0.0, 'GitHub Grid');
        this._settings = settings;
        this._session = session;
        this._refreshSourceId = null;
        this._settingsSignals = [];
        this._isRefreshing = false;
        this._destroyed = false;
        this._requestSerial = 0;

        const panelLabel = new St.Label({
            text: 'GH',
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'github-grid-panel-label',
        });

        this.add_child(panelLabel);

        const popupItem = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            can_focus: false,
        });

        this._content = new St.BoxLayout({
            vertical: true,
            style_class: 'github-grid-popup',
        });

        this._title = new St.Label({
            text: 'GitHub Contributions',
            style_class: 'github-grid-title',
            x_align: Clutter.ActorAlign.START,
        });

        this._stateLabel = new St.Label({
            text: '',
            style_class: 'github-grid-state',
            x_align: Clutter.ActorAlign.START,
        });

        this._hintLabel = new St.Label({
            text: '',
            style_class: 'github-grid-hint',
            x_align: Clutter.ActorAlign.START,
        });

        this._summaryLabel = new St.Label({
            text: '',
            style_class: 'github-grid-summary',
            x_align: Clutter.ActorAlign.START,
        });

        this._gridFrame = new St.BoxLayout({
            style_class: 'github-grid-frame',
            x_expand: true,
        });

        this._grid = new St.BoxLayout({
            style_class: 'github-grid',
            x_expand: true,
        });

        this._gridFrame.add_child(this._grid);

        this._content.add_child(this._title);
        this._content.add_child(this._stateLabel);
        this._content.add_child(this._hintLabel);
        this._content.add_child(this._summaryLabel);
        this._content.add_child(this._gridFrame);
        popupItem.add_child(this._content);
        this.menu.addMenuItem(popupItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        this._refreshItem = new PopupMenu.PopupMenuItem('Refresh now');
        this._refreshItem.connect('activate', () => {
            void this.refresh();
        });
        this.menu.addMenuItem(this._refreshItem);

        this._settingsSignals.push(
            this._settings.connect('changed::username', () => {
                void this.refresh();
            })
        );
        this._settingsSignals.push(
            this._settings.connect('changed::refresh-interval-minutes', () => {
                this.startAutoRefresh();
            })
        );

        this.showLoadingState();
    }

    async refresh() {
        if (this._isRefreshing)
            return;

        const username = this._getUsername();
        if (!username) {
            this.showEmptyState();
            return;
        }

        if (!isValidUsername(username)) {
            this.showErrorState(
                `Invalid GitHub username: ${username}`,
                'Use only letters, numbers, and single hyphens between characters.'
            );
            return;
        }

        this._isRefreshing = true;
        const requestSerial = ++this._requestSerial;
        this._refreshItem.setSensitive(false);
        this.showLoadingState(username);

        try {
            const result = await fetchContributions(this._session, username);
            if (this._destroyed || requestSerial !== this._requestSerial)
                return;

            if (result.days.length === 0) {
                this.showEmptyState(username);
                return;
            }

            this._settings.set_string(
                'cached-result',
                serializeCachedResult(username, result)
            );
            this.showLoadedState(username, result);
        } catch (error) {
            if (this._destroyed || requestSerial !== this._requestSerial)
                return;

            this.showErrorState(
                `Unable to load @${username}.`,
                error.message
            );
        } finally {
            if (this._destroyed || requestSerial !== this._requestSerial)
                return;

            this._refreshItem.setSensitive(true);
            this._isRefreshing = false;
        }
    }

    startAutoRefresh() {
        this.stopAutoRefresh();

        const minutes = this._getRefreshIntervalMinutes();
        this._refreshSourceId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            minutes * 60,
            () => {
                void this.refresh();
                return GLib.SOURCE_CONTINUE;
            }
        );

        GLib.Source.set_name_by_id(this._refreshSourceId, '[github-grid] auto-refresh');
    }

    stopAutoRefresh() {
        if (this._refreshSourceId !== null) {
            GLib.Source.remove(this._refreshSourceId);
            this._refreshSourceId = null;
        }
    }

    showLoadingState(username = '') {
        this._clearGrid();
        const target = username ? ` for @${username}` : '';
        this._setState(
            `Loading contribution grid${target}...`,
            'Fetching public contribution data from GitHub.'
        );
    }

    showEmptyState(username = '') {
        this._clearGrid();
        const target = username ? ` for @${username}` : '';
        this._setState(
            `No contribution data available${target}.`,
            'GitHub returned no contribution cells for the selected period.'
        );
    }

    showLoadedState(username, result) {
        this._renderGrid(result);
        this._setState(
            `Loaded ${result.days.length} daily cells for @${username}.`,
            'Public contributions from the last year.'
        );
        this._summaryLabel.text = `Total contributions: ${result.total} | Peak day: ${result.maxCount}`;
    }

    restoreCachedState() {
        const cached = parseCachedResult(this._settings.get_string('cached-result'));
        if (!cached)
            return false;

        this.showLoadedState(cached.username, cached.result);
        this._hintLabel.text = `Showing cached data from ${cached.cachedAt} until refresh completes.`;
        return true;
    }

    showErrorState(message = 'Unable to load contribution data.', hint = 'Check the username or network access.') {
        this._clearGrid();
        this._setState(
            message,
            hint
        );
        this._stateLabel.add_style_class_name('github-grid-state-error');
    }

    _setState(stateText, hintText) {
        this._stateLabel.remove_style_class_name('github-grid-state-error');
        this._stateLabel.text = stateText;
        this._hintLabel.text = hintText;
        if (!this._grid.visible)
            this._summaryLabel.text = '';
    }

    _getUsername() {
        return normalizeUsername(this._settings.get_string('username'));
    }

    _getRefreshIntervalMinutes() {
        return Math.max(5, this._settings.get_int('refresh-interval-minutes'));
    }

    _getGithubToken() {
        return this._settings.get_string('github-token').trim();
    }

    _clearGrid() {
        this._grid.destroy_all_children();
        this._grid.hide();
    }

    _renderGrid(result) {
        this._clearGrid();

        const weeks = buildWeekColumns(result.days, result.maxCount);
        for (const weekDays of weeks) {
            const weekColumn = new St.BoxLayout({
                vertical: true,
                style_class: 'github-grid-week',
            });

            for (const day of weekDays) {
                const cell = new St.Widget({
                    style_class: `github-grid-cell github-grid-cell-level-${day.level}`,
                    width: 10,
                    height: 10,
                    reactive: true,
                    track_hover: true,
                });
                cell.connect('enter-event', () => {
                    this._hintLabel.text = formatContributionLabel(day);
                });
                cell.connect('leave-event', () => {
                    this._hintLabel.text = 'Public contributions from the last year.';
                });
                weekColumn.add_child(cell);
            }

            this._grid.add_child(weekColumn);
        }

        this._grid.show();
    }

    destroy() {
        this._destroyed = true;
        this._requestSerial += 1;
        this._isRefreshing = false;
        this.stopAutoRefresh();

        for (const signalId of this._settingsSignals)
            this._settings.disconnect(signalId);

        this._settingsSignals = [];
        this._clearGrid();
        this._content.destroy_all_children();
        this._refreshItem = null;
        this._grid = null;
        this._gridFrame = null;
        this._summaryLabel = null;
        this._hintLabel = null;
        this._stateLabel = null;
        this._title = null;
        super.destroy();
    }
});

let indicator = null;
let session = null;

export default class GithubGridExtension extends Extension {
    enable() {
        session = new Soup.Session();
        indicator = new GithubGridIndicator(this.getSettings(), session);
        Main.panel.addToStatusArea('github-grid', indicator);
        indicator.startAutoRefresh();
        indicator.restoreCachedState();
        void indicator.refresh();
    }

    disable() {
        if (indicator) {
            indicator.destroy();
            indicator = null;
        }

        if (session)
            session.abort();

        session = null;
    }
}
