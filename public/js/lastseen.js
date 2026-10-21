// "Last seen" for trains with no live location: the last position the monitor recorded in the past 90 days,
// from GET /api/lastseen ({ "<train number>": { at, lat, lon, speed, prev, next } }). Fetched at most once per
// 5 minutes, and only by a page that shows a train with no live location.
//
// Dev aid: if localStorage.lastSeenMock holds that JSON, it is used instead of fetching. It reads localStorage only.
import { t, dur, clock, isUrdu } from './i18n.js';
import { state } from './app.js';
import { place, dateLabel } from './screens/_format.js';

const TTL_MS = 5 * 60e3;
let data = {}, fetchedAt = 0, loading = null;

const mock = () => { try { return JSON.parse(localStorage.getItem('lastSeenMock')); } catch { return null; } };

/** Loads the records if they are older than 5 minutes. onLoad runs only when new data arrived, so a view can render again. Failures leave {}. */
export function loadLastSeen(onLoad) {
  if (fetchedAt && Date.now() - fetchedAt < TTL_MS) return;
  if (!loading) {
    const m = mock();
    loading = (m && typeof m === 'object' ? Promise.resolve(m) : fetch('/api/lastseen').then(r => (r.ok ? r.json() : {})).catch(() => ({})))
      .then(d => { data = d && typeof d === 'object' ? d : {}; fetchedAt = Date.now(); loading = null; return true; });
  }
  if (onLoad) loading.then(onLoad);
}

/** The last-seen record of a train, or null. */
export const lastSeenOf = n => data[String(n)] || null;

/** "3 h ago" within 24 hours, else "Sun 18 Oct, 4:10 PM" (Pakistan time). */
export function agoText(at) {
  const min = (Date.now() - at) / 60000;
  if (min < 1) return t('justNow');
  if (min < 1440) return t('ago', { d: dur(min) });
  const iso = new Date(at + 5 * 3600e3).toISOString().slice(0, 10);
  const time = isUrdu() ? `\u2066${clock(at)}\u2069` : clock(at); // keep "6:57 PM" together inside right-to-left text
  return `${dateLabel(iso)}, ${time}`;
}

/** "Last seen near Multan Cantt · 3 h ago", or with { short } "Last seen 3 h ago" (also when no station is known). */
export function lastSeenText(rec, { short = false } = {}) {
  if (!rec) return '';
  const ago = agoText(rec.at);
  const s = state.stationById.get(String(rec.prev)) || state.stationById.get(String(rec.next));
  if (short || !s) return t('lastSeenShort', { ago });
  return t('lastSeen', { station: place(s), ago });
}
