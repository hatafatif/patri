// SegmentedControl: a choice between two or three options, as route links or local buttons.
import { esc, cx } from './_shared.js';

/**
 * A choice between 2 or 3 options. Options with an href are links (the page is the state); the others are toggle buttons.
 * @typedef {object} SegmentedControlProps
 * @property {{ value: string, label: string, href?: string }[]} options - Labels already localised. An option with href renders as an <a>.
 * @property {string} value - The value of the active option.
 * @property {string} label - Already localised. Becomes the group's aria-label.
 * @property {string} [className] - Extra classes, so a composing component can hook its own styles.
 */
export function SegmentedControl({ options = [], value, label = '', className } = {}) {
  const items = options.map(o => {
    const active = o.value === value;
    const inner = `<span class="p-segmentedcontrol__label">${esc(o.label)}</span>`;
    return o.href
      ? `<a class="p-segmentedcontrol__option" href="${esc(o.href)}"${active ? ' aria-current="page"' : ''}>${inner}</a>`
      : `<button type="button" class="p-segmentedcontrol__option" data-value="${esc(o.value)}" aria-pressed="${active ? 'true' : 'false'}">${inner}</button>`;
  }).join('');
  return `<div class="${cx('p-segmentedcontrol', className)}" role="group" aria-label="${esc(label)}">${items}</div>`;
}

/**
 * Handlers for bindSegmentedControl.
 * @typedef {object} SegmentedControlHandlers
 * @property {(value: string) => void} [onChange] - Called with the value of the option that was pressed.
 */
/**
 * Makes the local (button) options work: moves aria-pressed and calls onChange. Link options need no binding. Returns unbind().
 * @param {Element} root - The element the HTML was rendered into, or the component itself.
 * @param {SegmentedControlHandlers} [handlers]
 * @returns {() => void}
 */
export function bindSegmentedControl(root, { onChange } = {}) {
  const onClick = e => {
    const btn = e.target.closest?.('button.p-segmentedcontrol__option');
    if (!btn || !root.contains(btn)) return;
    const group = btn.closest('.p-segmentedcontrol');
    group.querySelectorAll('button.p-segmentedcontrol__option').forEach(b => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
    onChange?.(btn.dataset.value);
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
