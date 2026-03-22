import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class GithubGridPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: 'GitHub Grid',
            icon_name: 'applications-development-symbolic',
        });

        const generalGroup = new Adw.PreferencesGroup({
            title: 'General',
            description: 'Configure the GitHub account and refresh behavior.',
        });

        const usernameRow = new Adw.EntryRow({
            title: 'GitHub Username',
            text: settings.get_string('username'),
        });
        usernameRow.connect('changed', row => {
            settings.set_string('username', row.text.trim());
        });
        generalGroup.add(usernameRow);

        const refreshRow = new Adw.SpinRow({
            title: 'Refresh Interval',
            subtitle: 'Minutes between background refreshes',
            adjustment: new Gtk.Adjustment({
                lower: 5,
                upper: 1440,
                step_increment: 5,
                page_increment: 30,
                value: settings.get_int('refresh-interval-minutes'),
            }),
        });
        refreshRow.connect('changed', row => {
            settings.set_int('refresh-interval-minutes', row.get_value());
        });
        generalGroup.add(refreshRow);

        const tokenGroup = new Adw.PreferencesGroup({
            title: 'Future Authentication',
            description: 'The token is stored for future authenticated GitHub API work. The current MVP still uses the public contributions endpoint.',
        });

        const tokenRow = new Adw.PasswordEntryRow({
            title: 'GitHub Token',
            text: settings.get_string('github-token'),
        });
        tokenRow.connect('changed', row => {
            settings.set_string('github-token', row.text.trim());
        });
        tokenGroup.add(tokenRow);

        page.add(generalGroup);
        page.add(tokenGroup);
        window.add(page);
    }
}
