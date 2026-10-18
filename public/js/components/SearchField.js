// SearchField: the search box for a train, station or city, with an optional From -> To link beside it.
import { esc, icon, cx } from './_shared.js';
import { t } from '../i18n.js';
import { IconButton } from './IconButton.js';
import { Button } from './Button.js';

/**
 * The search box for a train name, number, station or city. With a route it also shows a "From → To" link beside the field.
 * @typedef {object} SearchFieldProps
 * @property {string} [value=''] - The current text. The clear button is shown only when this is not empty.
 * @property {string} placeholder - Already localised. Also used as the input's aria-label.
 * @property {{ href: string, label: string }} [route] - Adds a secondary "From → To" link beside the field.
 * @property {string} [className] - Extra classes, so a composing component can hook its own styles.
 */
export function SearchField({ value = '', placeholder = '', route, className } = {}) {
  const clear = IconButton({ icon: 'close', label: t('clearSearch'), className: 'p-searchfield__clear' });
  // The clear button is hidden until there is something to clear; bindSearchField toggles it.
  const clearBtn = value ? clear : clear.replace('<button ', '<button hidden ');
  const field = `<label class="p-searchfield__field">${icon.search}<input type="search" class="p-searchfield__input" value="${esc(value)}" placeholder="${esc(placeholder)}" aria-label="${esc(placeholder)}" autocomplete="off" enterkeyhint="search">${clearBtn}</label>`;
  const link = route ? Button({ label: route.label, href: route.href, variant: 'secondary', className: 'p-searchfield__route' }) : '';
  return `<div class="${cx('p-searchfield', route && 'p-searchfield--route', className)}">${field}${link}</div>`;
}

/**
 * Handlers for bindSearchField.
 * @typedef {object} SearchFieldHandlers
 * @property {(value: string) => void} [onInput] - Called on every change of the text.
 * @property {() => void} [onClear] - Called after the clear button, or Escape, empties the field.
 */
/**
 * Wires typing, the clear button and Escape. Returns unbind().
 * @param {Element} root - The element the HTML was rendered into, or the component itself.
 * @param {SearchFieldHandlers} [handlers]
 * @returns {() => void}
 */
export function bindSearchField(root, { onInput, onClear } = {}) {
  const clearOf = input => input.closest('.p-searchfield').querySelector('.p-searchfield__clear');
  const clear = input => {
    input.value = '';
    const btn = clearOf(input);
    if (btn) btn.hidden = true;
    input.focus();
    onClear?.();
  };
  const onIn = e => {
    const input = e.target.closest?.('.p-searchfield__input');
    if (!input || !root.contains(input)) return;
    const btn = clearOf(input);
    if (btn) btn.hidden = !input.value;
    onInput?.(input.value);
  };
  const onClick = e => {
    const btn = e.target.closest?.('.p-searchfield__clear');
    if (!btn || !root.contains(btn)) return;
    clear(btn.closest('.p-searchfield').querySelector('.p-searchfield__input'));
  };
  const onKey = e => {
    const input = e.target.closest?.('.p-searchfield__input');
    if (!input || e.key !== 'Escape' || !input.value) return;
    e.preventDefault();
    clear(input);
  };
  root.addEventListener('input', onIn);
  root.addEventListener('click', onClick);
  root.addEventListener('keydown', onKey);
  return () => {
    root.removeEventListener('input', onIn);
    root.removeEventListener('click', onClick);
    root.removeEventListener('keydown', onKey);
  };
}
