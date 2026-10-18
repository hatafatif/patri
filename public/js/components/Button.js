// Button: primary, secondary or link. A link when it has an href, otherwise a button.
import { esc, icon as icons, cx } from './_shared.js';

/**
 * The text button: primary for the main action, secondary next to it, link for inline actions such as "Change".
 * @typedef {object} ButtonProps
 * @property {string} label - Already localised.
 * @property {string} [href] - Renders an <a> instead of a <button>.
 * @property {'primary' | 'secondary' | 'link'} [variant='primary'] - primary is a sabz-700 fill; secondary is outlined in sabz-700; link is underlined inline text with a 44px hit area.
 * @property {string} [icon] - A trailing icon key, usually 'chevronEnd', which flips in right-to-left.
 * @property {boolean} [full] - Stretches the button to the full width of its container.
 * @property {string} [className] - Extra classes, so a composing component can hook its own styles and behaviour.
 */
export function Button({ label, href, variant = 'primary', icon, full, className } = {}) {
  const cls = cx('p-button', `p-button--${variant}`, full && 'p-button--full', className);
  const inner = `<span class="p-button__label">${esc(label)}</span>${(icon && icons[icon]) || ''}`;
  return href ? `<a class="${cls}" href="${esc(href)}">${inner}</a>` : `<button type="button" class="${cls}">${inner}</button>`;
}
