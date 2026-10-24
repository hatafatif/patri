// ToggleRow: one on/off choice in a list, such as one alert on the Alerts page.
import { esc, cx } from './_shared.js';

/**
 * One on/off choice in a list: a label with an optional quiet line under it, and a switch at the inline end. The whole row is the tap target.
 * @typedef {object} ToggleRowProps
 * @property {string} name - What onToggle reports; unique on the page.
 * @property {string} label - Already localised.
 * @property {string} [sub] - A quiet line under the label. Already localised.
 * @property {boolean} [checked=false]
 * @property {boolean} [disabled=false]
 * @property {string} [extra] - Trusted HTML (such as a SegmentedControl) shown under the row only while it is checked.
 * @property {string} [className] - Extra classes, so a composing component can hook its own styles.
 */
export function ToggleRow({ name = '', label = '', sub = '', checked = false, disabled = false, extra = '', className } = {}) {
  const subId = `p-togglerow-${esc(name)}-sub`;
  return `<div class="${cx('p-togglerow', checked && 'p-togglerow--on', className)}">`
    + `<label class="p-togglerow__row">`
    + `<span class="p-togglerow__text"><span class="p-togglerow__label">${esc(label)}</span>${sub ? `<span class="p-togglerow__sub" id="${subId}">${esc(sub)}</span>` : ''}</span>`
    + `<input class="p-togglerow__input" type="checkbox" role="switch" name="${esc(name)}"${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}${sub ? ` aria-describedby="${subId}"` : ''}>`
    + `<span class="p-togglerow__switch" aria-hidden="true"><span class="p-togglerow__knob"></span></span>`
    + `</label>`
    + (checked && extra ? `<div class="p-togglerow__extra">${extra}</div>` : '')
    + `</div>`;
}

/**
 * Handlers for bindToggleRow.
 * @typedef {object} ToggleRowHandlers
 * @property {(name: string, checked: boolean) => void} [onToggle] - A switch was flipped.
 */
/**
 * Moves the on class when a switch flips, then calls onToggle. Returns unbind().
 * @param {Element} root - The element the HTML was rendered into, or the component itself.
 * @param {ToggleRowHandlers} [handlers]
 * @returns {() => void}
 */
export function bindToggleRow(root, { onToggle } = {}) {
  const onChange = e => {
    const input = e.target.closest?.('.p-togglerow__input');
    if (!input || !root.contains(input)) return;
    input.closest('.p-togglerow').classList.toggle('p-togglerow--on', input.checked);
    onToggle?.(input.name, input.checked);
  };
  root.addEventListener('change', onChange);
  return () => root.removeEventListener('change', onChange);
}
