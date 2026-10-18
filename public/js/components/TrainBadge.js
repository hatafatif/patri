// TrainBadge: the train number on a dark green square, with UP or DN underneath.
import { bdi, esc, cx } from './_shared.js';
import { t } from '../i18n.js';

/**
 * The train number badge: a sabz-900 square with the number in zard-500 and UP or DN underneath.
 * @typedef {object} TrainBadgeProps
 * @property {string | number} number - The train number, such as 28 or 115.
 * @property {'up' | 'dn'} direction - Shown as UP or DN in English, اپ or ڈاؤن in Urdu.
 * @property {'sm' | 'md' | 'lg'} [size='md'] - 40, 54 or 64px square.
 */
export function TrainBadge({ number, direction, size = 'md' } = {}) {
  return `<span class="${cx('p-trainbadge', `p-trainbadge--${size}`)}"><span class="p-trainbadge__number">${bdi(number)}</span><span class="p-trainbadge__dir">${esc(t(direction))}</span></span>`;
}
