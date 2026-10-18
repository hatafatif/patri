// LiveIndicator: an 8px dot with "Live" or "Reconnecting"; hidden when off.
import { cx } from './_shared.js';
import { t } from '../i18n.js';

/**
 * A small status dot with a word: "Live" when the feed is up, "Reconnecting" when it dropped, nothing when it is off.
 * @typedef {object} LiveIndicatorProps
 * @property {'on' | 'reconnecting' | 'off'} [state='off'] - on shows a sabz-700 dot and "Live"; reconnecting a zard-500 dot and "Reconnecting"; off renders the element hidden, with no text.
 */
export function LiveIndicator({ state = 'off' } = {}) {
  const cls = cx('p-liveindicator', `p-liveindicator--${state}`);
  const attrs = 'role="status" aria-live="polite"';
  if (state === 'on' || state === 'reconnecting') {
    const word = t(state === 'on' ? 'live' : 'reconnecting');
    return `<span class="${cls}" ${attrs}><span class="p-liveindicator__dot" aria-hidden="true"></span><span class="p-liveindicator__text">${word}</span></span>`;
  }
  return `<span class="${cls}" ${attrs} hidden></span>`;
}
