// Shared by the screen templates: turns their data (shaped like the API, in both languages) into the
// localised text that component props expect. Formatting only; no markup.
import { t, clockMin, delayText, monthName, isUrdu } from '../i18n.js';
import { stationName, trainName, place as cleanPlace, clean } from '../names.js';
import { statusTone } from '../components/_shared.js';

/**
 * A station as the API gives it (/api/stations, /api/route, /api/board): English and Urdu names.
 * @typedef {object} ScreenStation
 * @property {string} [id] - The station id, such as '116'.
 * @property {string} name - English name as the API has it ("Lahore Jn."); cleaned for display.
 * @property {string} [nameUr] - Urdu name.
 * @property {string} [city] - English city ("Multan").
 * @property {string} [cityUr] - Urdu city ("ملتان").
 */

/**
 * A train: the fields of trainInfo() in public/js/names.js that the screens use.
 * @typedef {object} ScreenTrain
 * @property {number} number - The train number, such as 28.
 * @property {string} label - The number as shown, such as '28'.
 * @property {boolean} up - true for UP, false for DN.
 * @property {string} name - English name, without number or direction.
 * @property {string} [nameUr] - Urdu name.
 */

/** A station's name in the current language. */
export const place = s => (s ? stationName(s.name, s.nameUr) : '');
/** A station's English name, whatever the language (PageHeader title). */
export const placeEn = s => (s ? cleanPlace(s.name) : '');
/** A station's Urdu name, whatever the language (PageHeader titleUr); '' when there is none. */
export const placeUr = s => clean(s?.nameUr).replace(/[\s,،.]+$/, '');
/** A station's city in the current language, falling back to the station name. */
export const cityOf = s => (isUrdu() && s?.cityUr ? s.cityUr : s?.city ? stationName(s.city, '') : place(s));
/** A train's name in the current language. */
export const trainTitle = train => trainName(train);
/** "28 DN" / "28 ڈاؤن". */
export const trainNo = train => `${train.label ?? train.number} ${t(train.up ? 'up' : 'dn')}`;
/** TrainBadge props for a train. */
export const badgeOf = (train, size) => ({ number: train.label ?? String(train.number), direction: train.up ? 'up' : 'dn', ...(size ? { size } : {}) });
/** "Lahore Jn ➜ Karachi Cantt". */
export const route = (a, b) => t('passesFromTo', { a: place(a), b: place(b) });

// In Urdu a time sits inside right-to-left text: isolate the whole of it, so "~" and "+1" stay put.
const ltr = s => (isUrdu() ? `\u2066${s}\u2069` : s);
/** Minutes after midnight (PKT, service day) -> "2:50 AM +1". 1440 and over is the next day. */
export const time = min => ltr(`${clockMin(min)}${min >= 1440 ? ` +${Math.floor(min / 1440)}` : ''}`);
/** An estimated time: "~1:20 PM". */
export const approx = min => ltr(`~${time(min)}`);
/** 1165.2 -> "1,165". */
export const kmNum = n => Math.round(n).toLocaleString('en-US');
/** 1165.2 -> "1,165 km". */
export const km = n => t('km', { n: kmNum(n) });

/** "2026-10-18" -> "Sun 18 Oct" / "اتوار 18 اکتوبر". */
export function dateLabel(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return t('dateShort', { wd: t(`wd${wd}`), day: d, month: monthName(m - 1) });
}

/**
 * StatusChip props for a delay in minutes. The tone comes from statusTone(); nothing sorts or filters by it.
 * late == null: "No GPS" when the train has no GPS, "Timetable" otherwise.
 */
export function delayStatus(late, { gps, dot } = {}) {
  if (late == null) return { tone: 'nogps', text: t(gps === false ? 'tagNoGps' : 'timetable'), ...(dot ? { dot } : {}) };
  return { tone: statusTone(late, { gps }), text: delayText(late), ...(dot ? { dot } : {}) };
}

/**
 * Where a train is, as views/home.js works it out from a run (prevStation, nextStation, speed).
 * @typedef {{ kind: 'between', from: ScreenStation, to: ScreenStation } | { kind: 'stopped', at: ScreenStation } | { kind: 'notDeparted', at: ScreenStation }} ScreenWhere
 */
/** "Sahiwal ➜ Multan Cantt", "Stopped · Lahore Jn" or "Not departed · Peshawar Cantt". */
export function whereText(w) {
  if (!w) return '';
  if (w.kind === 'stopped') return t('stoppedAt', { station: place(w.at) });
  if (w.kind === 'notDeparted') return t('notDepartedAt', { station: place(w.at) });
  return route(w.from, w.to);
}
