// Helpers every component shares: escaping, the icon set, the logo file and the status rule.
import { esc } from '../i18n.js';
export { esc, bdi } from '../i18n.js';

/** A small side-view locomotive in the Sabz livery, facing the inline end (right). Decorative: aria-hidden. Styled by .p-train in components.css. */
export const trainIcon = () => '<svg class="p-train" viewBox="0 0 40 22" aria-hidden="true" focusable="false"><rect class="p-train__roof" x="9" y="2.2" width="8" height="2.2" rx="1"/><path class="p-train__body" d="M5 4h20.5c1.4 0 2.8.6 3.8 1.7l5.6 6.1c.7.8 1.1 1.8 1.1 2.8V16.5H3V6a2 2 0 0 1 2-2z"/><path class="p-train__window" d="M25.2 6.4h.6c.9 0 1.7.4 2.3 1l3.4 3.8h-6.3z"/><rect class="p-train__window" x="6" y="6.4" width="5.2" height="3.6" rx="1"/><rect class="p-train__window" x="13.6" y="6.4" width="5.2" height="3.6" rx="1"/><rect class="p-train__stripe" x="3" y="12.2" width="33" height="1.8"/><circle class="p-train__lamp" cx="34.3" cy="15" r="0.9"/><rect class="p-train__frame" x="4" y="16.3" width="31" height="1.6" rx=".8"/><circle class="p-train__wheel" cx="8.5" cy="18.8" r="2.1"/><circle class="p-train__wheel" cx="13.5" cy="18.8" r="2.1"/><circle class="p-train__wheel" cx="25.5" cy="18.8" r="2.1"/><circle class="p-train__wheel" cx="30.5" cy="18.8" r="2.1"/></svg>';

// Icons are 24-unit inline SVGs that draw in currentColor. The ones marked p-flip point along the
// reading direction and are mirrored in right-to-left by components.css.
export const icon = {
  bell: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9M10 20.5a2 2 0 0 0 4 0"/></svg>',
  train: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 10h14M9 13.5h.01M15 13.5h.01M8 21l2-4M16 21l-2-4"/></svg>',
  station: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/></svg>',
  trip: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h6.5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7H16"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  share: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"/></svg>',
  pin: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  swap: '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4v16M7 4 4 7M7 4l3 3M17 20V4M17 20l-3-3M17 20l3-3"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  stop: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><rect x="7" y="6" width="3.5" height="12" rx="1"/><rect x="13.5" y="6" width="3.5" height="12" rx="1"/></svg>',
  // Media icons: they don't mirror in right-to-left, so no p-flip.
  play: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><rect x="7" y="6" width="3.5" height="12" rx="1"/><rect x="13.5" y="6" width="3.5" height="12" rx="1"/></svg>',
  clock: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>',
  flag: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 21V4M6 4h11l-2 4 2 4H6"/></svg>',
  signalOff: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 5.2-2.8M19 12.5a10 10 0 0 0-2.3-1.7M12 20h.01"/></svg>',
  // Added for the Sabz components.
  star: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.75 5.6 6.15.9-4.45 4.33 1.05 6.12L12 17.06l-5.5 2.89 1.05-6.12L3.1 9.5l6.15-.9Z"/></svg>',
  starFilled: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.75 5.6 6.15.9-4.45 4.33 1.05 6.12L12 17.06l-5.5 2.89 1.05-6.12L3.1 9.5l6.15-.9Z"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  back: '<svg class="p-flip" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  chevronEnd: '<svg class="p-flip" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
  layers: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 13 9 5 9-5"/></svg>',
  locate: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
};

// The bilingual "Rail line" lockup, PATRI ◆ پٹڑی. Always this file, never redrawn or inlined; it is
// generated by design-system/logo/compose.py. It doesn't mirror in Urdu.
export const LOGO_SRC = 'brand/patri-logo.svg';

// The only place that decides a train's status. Never sort or filter trains by it.
export function statusTone(lateMin, { gps } = {}) {
  if (gps === false || lateMin == null) return 'nogps';
  if (lateMin <= -1) return 'early';
  if (lateMin <= 15) return 'ontime';
  return 'late';
}

// Joins class names, dropping empty ones: cx('p-button', full && 'p-button--full').
export const cx = (...names) => names.filter(Boolean).join(' ');

// Escapes text and wraps every match of the search words in <mark> (TrainRow's match prop).
export function highlight(text, tokens) {
  text = String(text ?? '');
  if (!tokens.length) return esc(text);
  const re = new RegExp(tokens.map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'giu');
  let out = '', last = 0;
  for (const m of text.matchAll(re)) {
    if (!m[0]) continue;
    out += `${esc(text.slice(last, m.index))}<mark>${esc(m[0])}</mark>`;
    last = m.index + m[0].length;
  }
  return out + esc(text.slice(last));
}
