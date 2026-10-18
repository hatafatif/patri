// IconButton: a 44×44 icon control. A link when it has an href, otherwise a button.
import { esc, icon as icons, cx } from './_shared.js';

/**
 * A 44×44 icon-only control: plain, outlined, or floating over the map.
 * @typedef {object} IconButtonProps
 * @property {string} icon - A key in the icon set in _shared.js, such as 'swap', 'star', 'close' or 'plus'.
 * @property {string} label - Required, already localised. Becomes the aria-label.
 * @property {'plain' | 'outline' | 'float'} [variant='plain'] - plain has no border; outline has a 1.5px line border on surface; float sits over the map on surface with shadow-float.
 * @property {boolean} [pressed] - For toggles only: sets aria-pressed. Leave it out for plain actions.
 * @property {string} [href] - Renders an <a> instead of a <button>.
 * @property {string} [className] - Extra classes, so a composing component can hook its own styles and behaviour.
 */
export function IconButton({ icon, label, variant = 'plain', pressed, href, className } = {}) {
  const cls = cx('p-iconbutton', `p-iconbutton--${variant}`, className);
  const svg = icons[icon] ?? '';
  if (href) return `<a class="${cls}" href="${esc(href)}" aria-label="${esc(label)}">${svg}</a>`;
  const state = pressed == null ? '' : ` aria-pressed="${pressed ? 'true' : 'false'}"`;
  return `<button type="button" class="${cls}" aria-label="${esc(label)}"${state}>${svg}</button>`;
}
