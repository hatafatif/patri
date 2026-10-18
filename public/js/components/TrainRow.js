// TrainRow: a compact row for Running now and search results, with an optional follow star beside it.
import { esc, highlight } from './_shared.js';
import { TrainBadge } from './TrainBadge.js';
import { StatusChip } from './StatusChip.js';
import { FollowButton } from './FollowButton.js';

/**
 * A compact train row: small badge, name, a sub line and the status, with an optional follow star. The star is a sibling of the link, never inside it.
 * @typedef {object} TrainRowProps
 * @property {string} href - Where the row links to.
 * @property {import('./TrainBadge.js').TrainBadgeProps} badge - The badge, shown at the sm size.
 * @property {string} name - The train's name, already localised.
 * @property {string} sub - The line under the name, such as "Lahore Jn → Karachi Cantt". Already localised.
 * @property {import('./StatusChip.js').StatusChipProps} status - The status chip, at the end of the link.
 * @property {string} [match] - Search text; each word found in the name or sub line is wrapped in <mark>.
 * @property {{ followed: boolean }} [follow] - Adds a FollowButton beside the link. Wire it with bindFollowButton().
 */
export function TrainRow({ href, badge, name, sub, status, match, follow } = {}) {
  const tokens = String(match ?? '').trim().split(/\s+/).filter(Boolean);
  return `<div class="p-trainrow"><a class="p-trainrow__link" href="${esc(href)}">${TrainBadge({ ...badge, size: 'sm' })}<span class="p-trainrow__main"><span class="p-trainrow__name"><bdi>${highlight(name, tokens)}</bdi></span><span class="p-trainrow__sub"><bdi>${highlight(sub, tokens)}</bdi></span></span><span class="p-trainrow__status">${StatusChip(status)}</span></a>${follow ? FollowButton({ followed: follow.followed, name }) : ''}</div>`;
}
