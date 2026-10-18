// TrainCard: one card in My trains on Home. The whole card is a link.
import { esc, bdi } from './_shared.js';
import { t } from '../i18n.js';
import { TrainBadge } from './TrainBadge.js';
import { StatusChip } from './StatusChip.js';

/**
 * One followed train on Home: badge, name, where it is, the rider's own stop, and its status.
 * @typedef {object} TrainCardProps
 * @property {string} href - Where the card links to, such as '#/train/28dn'.
 * @property {import('./TrainBadge.js').TrainBadgeProps} badge - The badge, shown at the md size.
 * @property {string} name - The train's name, already localised.
 * @property {string} position - Where the train is, such as "Sahiwal → Multan Cantt" or "Stopped · Lahore Jn". Already localised.
 * @property {{ name: string, time: string }} [yourStop] - The rider's own stop and the time the train reaches it. Adds a "Your stop · name · time" line.
 * @property {import('./StatusChip.js').StatusChipProps} status - The status chip, at the end of the card.
 */
export function TrainCard({ href, badge, name, position, yourStop, status } = {}) {
  const stop = yourStop
    ? `<div class="p-traincard__stop"><span class="p-traincard__stoplabel">${esc(t('yourStop'))}</span> · ${bdi(yourStop.name)} · ${bdi(yourStop.time)}</div>`
    : '';
  return `<a class="p-traincard" href="${esc(href)}">${TrainBadge({ ...badge, size: 'md' })}<span class="p-traincard__main"><span class="p-traincard__name">${bdi(name)}</span><span class="p-traincard__position">${esc(position)}</span>${stop}</span><span class="p-traincard__status">${StatusChip(status)}</span></a>`;
}
