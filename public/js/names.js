// The backend's names are hand-typed: mixed case, stray spaces, "Jn." vs "Jn", emojis (some routes
// use 🚂 in place of "To") and "Railway Station" tacked on. These helpers tidy them for display.
import { isUrdu } from './i18n.js';

const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu;
export const clean = s => String(s ?? '').replace(EMOJI, ' ').replace(/\s+/g, ' ').trim();
const titleCase = s => s.replace(/(^|\s)(\p{Ll})/gu, (_, sp, c) => sp + c.toUpperCase());

export const place = s => titleCase(clean(s).replace(/\.$/, '').replace(/^Railway Station (?=\S)| Railway Station$/gi, ''));
const placeUr = s => clean(s).replace(/[\s,،.]+$/, '');

// Station or city name in the current language, falling back to English.
export const stationName = (en, ur) => (isUrdu() && placeUr(ur) ? placeUr(ur) : place(en));

// "Khyber Mail 1UP" -> name, number and direction; "Karachi Cantt To Peshawar Cantt" -> from and to.
export function trainInfo(t) {
  const raw = clean(t.name);
  const m = raw.match(/[\s-]+(?:S\d+)?\s*(\d+)?\s*(up|dn|down)?$/i);
  const suffix = m && (m[1] || m[2]) ? m : null;
  const name = titleCase(suffix ? raw.slice(0, suffix.index) : raw);
  const up = suffix?.[2] ? /^up$/i.test(suffix[2]) : t.up;
  const label = suffix?.[1] || String(t.number);
  const parts = String(t.description ?? '').split(/\s(?:to|🚂)\s/iu);
  const [from, to] = parts.length === 2 ? parts.map(place) : [place(t.description), ''];
  const nameUr = clean(t.nameUr).replace(/\s*\d+\s*(اپ|ڈاؤن|ڈائون|ڈاون)?\s*$/u, '').trim();
  return {
    number: t.number,
    id: t.id,
    live: t.live,
    up,
    label,
    name,
    nameUr,
    from,
    to,
    departs: t.departs,
    arrives: t.arrives,
    stops: t.stops,
    fromId: t.fromId,
    toId: t.toId,
    search: [name, label, t.number, from, to, nameUr, up ? 'up' : 'dn'].join(' ').toLowerCase(),
  };
}

export const trainName = info => (isUrdu() && info.nameUr ? info.nameUr : info.name);
