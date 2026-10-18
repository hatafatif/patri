// LinkRow: a full-width link row with a small eyebrow, a name and a chevron.
import { esc, bdi, icon, cx } from './_shared.js';

/**
 * A full-width link row, such as "Return train" over "27 UP Shalimar Express".
 * @typedef {object} LinkRowProps
 * @property {string} href - Where the row goes.
 * @property {string} eyebrow - Already localised small label above the name.
 * @property {string} label - Already localised name or title.
 * @property {string} [className] - Extra classes, so a composing component can hook its own styles.
 */
export function LinkRow({ href = '#', eyebrow = '', label = '', className } = {}) {
  return `<a class="${cx('p-linkrow', className)}" href="${esc(href)}"><span class="p-linkrow__text"><span class="p-linkrow__eyebrow">${esc(eyebrow)}</span><span class="p-linkrow__label">${bdi(label)}</span></span>${icon.chevronEnd}</a>`;
}
