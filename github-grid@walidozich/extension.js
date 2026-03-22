import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Soup from 'gi://Soup';
import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

const DECODER = new TextDecoder();

function buildContributionsUrl(username) {
    const today = GLib.DateTime.new_now_utc();
    const oneYearAgo = today.add_years(-1);

    const from = oneYearAgo.format('%Y-%m-%d');
    const to = today.format('%Y-%m-%d');

    return `https://github.com/users/${encodeURIComponent(username)}/contributions?from=${from}&to=${to}`;
}

function parseContributionSvg(svg) {
    const rectTags = svg.match(/<rect\b[^>]*>/g) ?? [];
    const days = [];

    for (const rectTag of rectTags) {
        const dateMatch = rectTag.match(/data-date="([^"]+)"/);
        const countMatch = rectTag.match(/data-count="([^"]+)"/);

        if (!dateMatch || !countMatch)
            continue;

        days.push({
            date: dateMatch[1],
            count: Number.parseInt(countMatch[1], 10) || 0,
        });
    }

    return days;
}

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
    const total = days.reduce((sum, day) => sum + day.count, 0);
    const maxCount = days.reduce((max, day) => Math.max(max, day.count), 0);

    return {days, total, maxCount};
}

const GithubGridIndicator = GObject.registerClass(
class GithubGridIndicator extends PanelMenu.Button {
    _init(settings, session) {
        super._init(0.0, 'GitHub Grid');
        this._settings = settings;
        this._session = session;

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

        this._content.add_child(this._title);
        this._content.add_child(this._stateLabel);
        this._content.add_child(this._hintLabel);
        this._content.add_child(this._summaryLabel);
        popupItem.add_child(this._content);
        this.menu.addMenuItem(popupItem);

        this.showLoadingState();
    }

    async loadContributions() {
        const username = this._settings.get_string('username').trim();
        this.showLoadingState(username);

        const result = await fetchContributions(this._session, username);
        if (result.days.length === 0) {
            this.showEmptyState(username);
            return;
        }

        this.showLoadedState(username, result);
    }

    showLoadingState(username = '') {
        const target = username ? ` for @${username}` : '';
        this._setState(
            `Loading contribution grid${target}...`,
            'Fetching public contribution data from GitHub.'
        );
    }

    showEmptyState(username = '') {
        const target = username ? ` for @${username}` : '';
        this._setState(
            `No contribution data available${target}.`,
            'GitHub returned no contribution cells for the selected period.'
        );
    }

    showLoadedState(username, result) {
        this._setState(
            `Loaded ${result.days.length} daily cells for @${username}.`,
            'The real contribution grid will be rendered in the next section.'
        );
        this._summaryLabel.text = `Total contributions: ${result.total} | Peak day: ${result.maxCount}`;
    }

    showErrorState(message = 'Unable to load contribution data.', hint = 'Check the username or network access.') {
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
        this._summaryLabel.text = '';
    }
});

let indicator = null;
let session = null;

export default class GithubGridExtension extends Extension {
    enable() {
        session = new Soup.Session();
        indicator = new GithubGridIndicator(this.getSettings(), session);
        Main.panel.addToStatusArea('github-grid', indicator);
        void indicator.loadContributions().catch(error => {
            indicator.showErrorState(
                'Unable to load contribution data.',
                error.message
            );
        });
    }

    disable() {
        if (indicator) {
            indicator.destroy();
            indicator = null;
        }

        session = null;
    }
}
