import GLib from 'gi://GLib';

import {
    buildWeekColumns,
    formatContributionLabel,
    isValidUsername,
    parseCachedResult,
    parseContributionSvg,
    serializeCachedResult,
    summarizeContributions,
} from '../github-grid@walidozich/contributions.js';

function assert(condition, message) {
    if (!condition)
        throw new Error(message);
}

const fixturePath = GLib.build_filenamev([
    GLib.get_current_dir(),
    'tests',
    'fixtures',
    'contributions.svg',
]);

const [ok, contents] = GLib.file_get_contents(fixturePath);
assert(ok, 'Failed to load SVG fixture');

const svg = new TextDecoder().decode(contents);
const days = parseContributionSvg(svg);
const summary = summarizeContributions(days);
const weeks = buildWeekColumns(days, summary.maxCount);
const cache = parseCachedResult(serializeCachedResult('octocat', {days, ...summary}));

assert(days.length === 7, 'Expected seven contribution cells');
assert(summary.total === 51, 'Expected total contribution sum of 51');
assert(summary.maxCount === 21, 'Expected max contribution count of 21');
assert(weeks.length === 1, 'Expected one week column');
assert(weeks[0][0].level === 0, 'Expected zero-contribution cell level');
assert(weeks[0][6].level === 4, 'Expected max contribution cell level');
assert(formatContributionLabel(days[1]).includes('1 contribution'), 'Expected singular label formatting');
assert(isValidUsername('octocat'), 'Expected octocat to be a valid username');
assert(!isValidUsername('bad--name'), 'Expected bad--name to be invalid');
assert(cache?.username === 'octocat', 'Expected cache to round-trip');

print('Smoke tests passed.');
