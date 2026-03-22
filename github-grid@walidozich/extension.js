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
            text: 'Loading contribution grid...',
            style_class: 'github-grid-state',
            x_align: Clutter.ActorAlign.START,
        });

        this._content.add_child(this._title);
        this._content.add_child(this._stateLabel);
        popupItem.add_child(this._content);
        this.menu.addMenuItem(popupItem);
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
