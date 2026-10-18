// StatusChip and StatusStrip: a train's status as a coloured chip, and the Sabz running + delay strip.
import { esc, cx } from './_shared.js';

/**
 * A small status chip: on time, late, early, no GPS, or plain muted text.
 * @typedef {object} StatusChipProps
 * @property {'ontime' | 'late' | 'early' | 'nogps' | 'neutral'} tone - Picks the colours. Get it from statusTone() in _shared.js; neutral is plain ink-muted text with no background.
 * @property {string} text - Already localised, such as "30 min late".
 * @property {boolean} [dot] - Show a small dot in the text colour before the text.
 */
export function StatusChip({ tone = 'neutral', text, dot } = {}) {
  return `<span class="${cx('p-statuschip', `p-statuschip--${tone}`)}">${dot ? '<span class="p-statuschip__dot" aria-hidden="true"></span>' : ''}${esc(text)}</span>`;
}

/**
 * The Sabz signature: a pale-green running panel joined to a coloured delay block in one sabz-700 frame, with an optional "updated" note after it.
 * @typedef {object} StatusStripProps
 * @property {{ text: string }} running - The running panel, such as "Running · 105 km/h". Already localised.
 * @property {{ tone: 'ontime' | 'late' | 'early' | 'nogps', text: string }} delay - The delay block, coloured by tone, such as "30 min late".
 * @property {string} [updated] - Muted note after the strip, such as "Updated 1 min ago". Already localised.
 */
export function StatusStrip({ running, delay, updated } = {}) {
  return `<div class="p-statusstrip"><div class="p-statusstrip__frame"><span class="p-statusstrip__running"><span class="p-statusstrip__dot" aria-hidden="true"></span>${esc(running?.text)}</span><span class="${cx('p-statusstrip__delay', `p-statusstrip__delay--${delay?.tone ?? 'ontime'}`)}">${esc(delay?.text)}</span></div>${updated ? `<span class="p-statusstrip__updated">${esc(updated)}</span>` : ''}</div>`;
}
