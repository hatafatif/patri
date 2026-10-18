// DepartureRow: one train on a station board or in a From → To list. The whole row is a link.
import { esc, bdi } from './_shared.js';
import { t } from '../i18n.js';
import { StatusChip } from './StatusChip.js';

/**
 * One train on a station board or in a From → To list: time column, train number and name, a sub line and the status.
 * @typedef {object} DepartureRowProps
 * @property {string} href - Where the row links to.
 * @property {{ expected: string, scheduled?: string, caption?: string }} time - The expected time, such as "~1:20 PM". When scheduled is given and differs, it appears underneath, struck through. caption is a small label above the time, such as "Left" over "7:10 AM" for a train already on its way. Already formatted and localised.
 * @property {{ number: string | number, direction: 'up' | 'dn', name: string }} train - Number and direction show as "28 DN" in muted label style, then the name.
 * @property {string} sub - The line under the name, such as "To Karachi Cantt · 48 km away" or "Starts here → Karachi City". Already localised.
 * @property {import('./StatusChip.js').StatusChipProps} status - The status chip.
 */
export function DepartureRow({ href, time, train, sub, status } = {}) {
  const sched = time?.scheduled && time.scheduled !== time.expected
    ? `<s class="p-departurerow__sched"><span class="p-sr">${esc(t('scheduled'))} </span>${bdi(time.scheduled)}</s>`
    : '';
  const cap = time?.caption ? `<span class="p-departurerow__caption">${esc(time.caption)}</span>` : '';
  return `<a class="p-departurerow" href="${esc(href)}"><span class="p-departurerow__time">${cap}<span class="p-departurerow__expected">${bdi(time?.expected)}</span>${sched}</span><span class="p-departurerow__main"><span class="p-departurerow__head"><span class="p-departurerow__num">${bdi(train?.number)} ${esc(t(train?.direction))}</span> <span class="p-departurerow__name">${bdi(train?.name)}</span></span><span class="p-departurerow__sub">${esc(sub)}</span><span class="p-departurerow__status">${StatusChip(status)}</span></span></a>`;
}
