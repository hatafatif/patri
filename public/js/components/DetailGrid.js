// DetailGrid: a two-column grid of label and value facts about a train.
import { esc, bdi, cx } from './_shared.js';

/**
 * Key and value facts about a train, in a two-column grid. The 'lg' size shows big figures (the Train page's Current status).
 * @typedef {object} DetailGridProps
 * @property {{ label: string, value: string, lang?: 'ur', sub?: string, tone?: 'ontime' | 'late' | 'early' | 'nogps', wide?: boolean }[]} items - Already localised. A value with lang 'ur' renders right-to-left in Nastaliq, even on an English page. `sub` is a small already-localised line under the value. `tone` colours the value like a status. `wide` makes the item span both columns.
 * @property {'md' | 'lg'} [size='md'] - 'lg' shows the values as large figures with uppercase labels.
 * @property {string} [className] - Extra classes, so a composing component can hook its own styles.
 */
export function DetailGrid({ items = [], size = 'md', className } = {}) {
  const rows = items.map(({ label, value, lang, sub, tone, wide }) => {
    const attrs = lang === 'ur' ? ' lang="ur" dir="rtl"' : '';
    const subHtml = sub ? `<dd class="p-detailgrid__sub">${bdi(sub)}</dd>` : '';
    return `<div class="${cx('p-detailgrid__item', wide && 'p-detailgrid__item--wide')}"><dt class="p-detailgrid__label">${esc(label)}</dt><dd class="${cx('p-detailgrid__value', tone && `p-detailgrid__value--${tone}`)}"${attrs}>${lang === 'ur' ? esc(value) : bdi(value)}</dd>${subHtml}</div>`;
  }).join('');
  return `<dl class="${cx('p-detailgrid', size === 'lg' && 'p-detailgrid--lg', className)}">${rows}</dl>`;
}
