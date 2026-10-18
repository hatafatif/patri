// FollowButton: the star that adds a train to My trains. An IconButton toggle.
import { esc, icon as icons } from './_shared.js';
import { t } from '../i18n.js';
import { IconButton } from './IconButton.js';

/**
 * The star that adds a train to My trains: filled sabz-700 when followed, empty ink-muted otherwise.
 * @typedef {object} FollowButtonProps
 * @property {boolean} [followed] - Whether the train is currently followed. Sets aria-pressed and the filled star.
 * @property {string} name - The train's name, already localised. Used in the aria-label ("Follow Shalimar Express").
 * @property {{ off: string, on: string }} [label] - Overrides the aria-label: off while not followed, on while followed, such as { off: 'Save Multan Cantt', on: 'Saved' } for stations. Already localised. bindFollowButton swaps it when the button flips.
 */
export function FollowButton({ followed, name, label } = {}) {
  const html = IconButton({
    icon: followed ? 'starFilled' : 'star',
    label: (followed ? label?.on : label?.off) ?? t('follow', { name }),
    pressed: !!followed,
    className: 'p-followbutton',
  });
  // Both labels stay on the button, so bindFollowButton can swap them when it flips.
  return label ? html.replace('<button ', `<button data-label-off="${esc(label.off)}" data-label-on="${esc(label.on)}" `) : html;
}

/**
 * @typedef {object} FollowButtonHandlers
 * @property {(followed: boolean, button: HTMLElement) => void} [onToggle] - Called after the star flips, with the new state and the button that was pressed. Saving is the view's job.
 */
export function bindFollowButton(root, { onToggle } = {}) {
  const onClick = e => {
    const btn = e.target.closest?.('.p-followbutton');
    if (!btn || !root.contains(btn)) return;
    const followed = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', followed ? 'true' : 'false');
    btn.innerHTML = icons[followed ? 'starFilled' : 'star'];
    const text = followed ? btn.dataset.labelOn : btn.dataset.labelOff;
    if (text) btn.setAttribute('aria-label', text);
    onToggle?.(followed, btn);
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
