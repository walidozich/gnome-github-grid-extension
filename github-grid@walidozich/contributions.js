import GLib from 'gi://GLib';

export const USERNAME_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export function normalizeUsername(username) {
    return username.trim();
}

export function isValidUsername(username) {
    return USERNAME_PATTERN.test(username);
}

export function buildContributionsUrl(username) {
    const today = GLib.DateTime.new_now_utc();
    const oneYearAgo = today.add_years(-1);

    const from = oneYearAgo.format('%Y-%m-%d');
    const to = today.format('%Y-%m-%d');

    return `https://github.com/users/${encodeURIComponent(username)}/contributions?from=${from}&to=${to}`;
}

export function parseContributionSvg(svg) {
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

export function parseContributionHtml(html) {
    const tooltipCounts = new Map();
    const tooltipMatches = html.matchAll(/<tool-tip\b[^>]*for="([^"]+)"[^>]*>([^<]+)<\/tool-tip>/g);

    for (const [, targetId, tooltipText] of tooltipMatches) {
        const numberMatch = tooltipText.match(/(\d+)\s+contribution/);
        tooltipCounts.set(targetId, numberMatch ? Number.parseInt(numberMatch[1], 10) || 0 : 0);
    }

    const cellTags = html.match(/<td\b[^>]*ContributionCalendar-day[^>]*>/g) ?? [];
    const days = [];

    for (const cellTag of cellTags) {
        const dateMatch = cellTag.match(/data-date="([^"]+)"/);
        const idMatch = cellTag.match(/id="([^"]+)"/);
        const countMatch = cellTag.match(/data-level="([^"]+)"/);
        const textMatch = cellTag.match(/data-issue-count="([^"]+)"/);
        const ariaMatch = cellTag.match(/aria-label="([^"]+)"/);

        if (!dateMatch)
            continue;

        let count = 0;

        if (idMatch && tooltipCounts.has(idMatch[1]))
            count = tooltipCounts.get(idMatch[1]) ?? 0;
        else if (textMatch)
            count = Number.parseInt(textMatch[1], 10) || 0;
        else if (ariaMatch) {
            const numberMatch = ariaMatch[1].match(/(\d+)\s+contribution/);
            count = numberMatch ? Number.parseInt(numberMatch[1], 10) || 0 : 0;
        } else if (countMatch) {
            count = Number.parseInt(countMatch[1], 10) || 0;
        }

        days.push({
            date: dateMatch[1],
            count,
        });
    }

    return days;
}

export function getContributionLevel(count, maxCount) {
    if (count <= 0 || maxCount <= 0)
        return 0;

    const ratio = count / maxCount;
    if (ratio >= 0.75)
        return 4;
    if (ratio >= 0.5)
        return 3;
    if (ratio >= 0.25)
        return 2;
    return 1;
}

export function buildWeekColumns(days, maxCount) {
    const sortedDays = [...days].sort((left, right) => left.date.localeCompare(right.date));
    const weeks = [];

    for (let index = 0; index < sortedDays.length; index += 7) {
        const weekDays = sortedDays.slice(index, index + 7).map(day => ({
            ...day,
            level: getContributionLevel(day.count, maxCount),
        }));
        weeks.push(weekDays);
    }

    return weeks;
}

export function formatContributionLabel(day) {
    const date = GLib.DateTime.new_from_iso8601(`${day.date}T00:00:00Z`, null);
    const formattedDate = date ? date.format('%b %d, %Y') : day.date;
    const contributionText = day.count === 1 ? '1 contribution' : `${day.count} contributions`;

    return `${contributionText} on ${formattedDate}`;
}

export function summarizeContributions(days) {
    const total = days.reduce((sum, day) => sum + day.count, 0);
    const maxCount = days.reduce((max, day) => Math.max(max, day.count), 0);

    return {total, maxCount};
}

export function serializeCachedResult(username, result) {
    return JSON.stringify({
        username,
        result,
        cachedAt: GLib.DateTime.new_now_utc().format('%Y-%m-%dT%H:%M:%SZ'),
    });
}

export function parseCachedResult(rawValue) {
    if (!rawValue)
        return null;

    try {
        const parsed = JSON.parse(rawValue);
        if (!parsed?.username || !parsed?.result?.days)
            return null;

        return parsed;
    } catch {
        return null;
    }
}
