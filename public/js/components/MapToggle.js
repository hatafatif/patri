// MapToggle: the "Following" pill that floats over the map.
import { esc, cx } from './_shared.js';

/**
 * The on/off pill over the map, such as "Following".
 * @typedef {object} MapToggleProps
 * @property {boolean} [on=false] - Whether it is on. Sets aria-pressed.
 * @property {string} label - Already localised.
 * @property {string} [className] - Extra classes, so a composing component can hook its own styles.
 */
export function MapToggle({ on = false, label = '', className } = {}) {
  return `<button type="button" class="${cx('p-maptoggle', on ? 'p-maptoggle--on' : 'p-maptoggle--off', className)}" aria-pressed="${on ? 'true' : 'false'}">${esc(label)}</button>`;
}

/**
 * Handlers for bindMapToggle.
 * @typedef {object} MapToggleHandlers
 * @property {(on: boolean) => void} [onToggle] - Called with the new state after it flips.
 */
/**
 * Flips aria-pressed and the on/off class when the pill is pressed, then calls onToggle. Returns unbind().
 * @param {Element} root - The element the HTML was rendered into, or the component itself.
 * @param {MapToggleHandlers} [handlers]
 * @returns {() => void}
 */
export function bindMapToggle(root, { onToggle } = {}) {
  const onClick = e => {
    const btn = e.target.closest?.('.p-maptoggle');
    if (!btn || !root.contains(btn)) return;
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.classList.toggle('p-maptoggle--on', on);
    btn.classList.toggle('p-maptoggle--off', !on);
    onToggle?.(on);
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
