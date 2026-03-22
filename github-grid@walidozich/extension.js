import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

const GithubGridIndicator = GObject.registerClass(
class GithubGridIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'GitHub Grid');

        const panelLabel = new St.Label({
            text: 'Grid',
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

        this._content.add_child(this._title);
        this._content.add_child(this._stateLabel);
        this._content.add_child(this._hintLabel);
        popupItem.add_child(this._content);
        this.menu.addMenuItem(popupItem);

        this.showLoadingState();
    }

    showLoadingState() {
        this._setState(
            'Loading contribution grid...',
            'The popup is ready. Data fetching will be wired in next.'
        );
    }

    showEmptyState() {
        this._setState(
            'No contribution data available yet.',
            'Set a GitHub username in extension preferences once settings are connected.'
        );
    }

    showErrorState(message = 'Unable to load contribution data.') {
        this._setState(
            message,
            'Check the username, network access, or future API configuration.'
        );
        this._stateLabel.add_style_class_name('github-grid-state-error');
    }

    _setState(stateText, hintText) {
        this._stateLabel.remove_style_class_name('github-grid-state-error');
        this._stateLabel.text = stateText;
        this._hintLabel.text = hintText;
    }
});

let indicator = null;

export default class GithubGridExtension {
    enable() {
        indicator = new GithubGridIndicator();
        Main.panel.addToStatusArea('github-grid', indicator);
    }

    disable() {
        if (indicator) {
            indicator.destroy();
            indicator = null;
        }
    }
}
