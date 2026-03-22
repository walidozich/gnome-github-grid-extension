import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

const GithubGridIndicator = GObject.registerClass(
class GithubGridIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'GitHub Grid');

        const label = new St.Label({
            text: 'GitHub',
            y_align: Clutter.ActorAlign.CENTER,
        });

        this.add_child(label);
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
