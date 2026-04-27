import GLib from 'gi://GLib';

import {
    buildWeekColumns,
    formatContributionLabel,
    getContributionRange,
    isValidUsername,
    parseCachedResult,
    parseContributionHtml,
    parseContributionSvg,
    serializeCachedResult,
    summarizeContributions,
} from '../github-grid@walidozich/contributionData.js';

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
const htmlDays = parseContributionHtml(`
    <table>
      <td class="ContributionCalendar-day" id="contribution-day-component-0-0" data-date="2026-03-15" data-level="0"></td>
      <tool-tip for="contribution-day-component-0-0">No contributions on March 15th.</tool-tip>
      <td class="ContributionCalendar-day" id="contribution-day-component-0-1" data-date="2026-03-16" data-level="1"></td>
      <tool-tip for="contribution-day-component-0-1">7 contributions on March 16th.</tool-tip>
    </table>
`);
const summary = summarizeContributions(days);
const weeks = buildWeekColumns(days, summary.maxCount);
const sortedWeeks = buildWeekColumns([
    {date: '2026-01-11', count: 4},
    {date: '2026-01-04', count: 11},
    {date: '2026-01-18', count: 1},
    {date: '2026-01-25', count: 3},
    {date: '2026-02-01', count: 2},
    {date: '2026-02-08', count: 1},
    {date: '2026-02-15', count: 0},
], 11);
const cache = parseCachedResult(serializeCachedResult('octocat', {days, ...summary}));

assert(days.length === 7, 'Expected seven contribution cells');
assert(htmlDays.length === 2, 'Expected two HTML contribution cells');
assert(htmlDays[1].count === 7, 'Expected HTML contribution count parsing');
assert(summary.total === 51, 'Expected total contribution sum of 51');
assert(summary.maxCount === 21, 'Expected max contribution count of 21');
assert(summary.longestStreak === 6, 'Expected longest contribution streak');
assert(weeks.length === 1, 'Expected one week column');
assert(weeks[0][0].level === 0, 'Expected zero-contribution cell level');
assert(weeks[0][6].level === 4, 'Expected max contribution cell level');
assert(sortedWeeks[0][0].date === '2026-01-04', 'Expected week columns to be sorted chronologically');
assert(formatContributionLabel(days[1]).includes('1 contribution'), 'Expected singular label formatting');
assert(isValidUsername('octocat'), 'Expected octocat to be a valid username');
assert(!isValidUsername('bad--name'), 'Expected bad--name to be invalid');
assert(cache?.username === 'octocat', 'Expected cache to round-trip');
assert(getContributionRange([
    {date: '2026-03-16', count: 1},
    {date: '2026-03-14', count: 4},
    {date: '2026-03-15', count: 2},
]).from === '2026-03-14', 'Expected the computed range start to use the earliest day');
assert(getContributionRange([
    {date: '2026-03-16', count: 1},
    {date: '2026-03-14', count: 4},
    {date: '2026-03-15', count: 2},
]).to === '2026-03-16', 'Expected the computed range end to use the latest day');

print('Smoke tests passed.');
