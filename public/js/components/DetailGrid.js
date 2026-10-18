// DetailGrid: a two-column grid of label and value facts about a train.
import { esc, bdi, cx } from './_shared.js';

/**
 * Key and value facts about a train, in a two-column grid.
 * @typedef {object} DetailGridProps
 * @property {{ label: string, value: string, lang?: 'ur' }[]} items - Already localised. A value with lang 'ur' renders right-to-left in Nastaliq, even on an English page.
 * @property {string} [className] - Extra classes, so a composing component can hook its own styles.
 */
export function DetailGrid({ items = [], className } = {}) {
  const rows = items.map(({ label, value, lang }) => {
    const attrs = lang === 'ur' ? ' lang="ur" dir="rtl"' : '';
    return `<div class="p-detailgrid__item"><dt class="p-detailgrid__label">${esc(label)}</dt><dd class="p-detailgrid__value"${attrs}>${lang === 'ur' ? esc(value) : bdi(value)}</dd></div>`;
  }).join('');
  return `<dl class="${cx('p-detailgrid', className)}">${rows}</dl>`;
}
