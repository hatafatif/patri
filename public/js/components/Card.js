// Card: a surface with a border that holds a block of content, with an optional header.
import { cx } from './_shared.js';
import { SectionHeader } from './SectionHeader.js';

/**
 * A bordered surface for a block of content. The key tone marks the most important card on a screen, such as Right now.
 * @typedef {object} CardProps
 * @property {string} body - An HTML string, inserted as-is.
 * @property {string} [header] - A label shown as a ruled SectionHeader inside the top of the card. Already localised.
 * @property {'plain' | 'key'} [tone='plain'] - plain has a 1px line border; key a 1.5px sabz-700 border.
 */
export function Card({ body = '', header, tone = 'plain' } = {}) {
  const head = header ? SectionHeader({ label: header, ruled: true }) : '';
  return `<section class="${cx('p-card', `p-card--${tone}`)}">${head}<div class="p-card__body">${body}</div></section>`;
}
