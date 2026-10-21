// RouteScreen: From → To, the direct trains you can still board.
import { t, dur } from '../i18n.js';
import { SegmentedControl, StationFields, SectionHeader, DepartureRow } from '../components/index.js';
import { frame, body, section, list, row, fill, note, mapButton, backButton } from './_layout.js';
import { place, trainTitle, time, approx, dateLabel, delayStatus } from './_format.js';
import { countryMap } from './_map-standin.js';

/**
 * Search › From → To: the Panel at full height with a back button and the mode switch, the From and To
 * fields with swap, a Today | Tomorrow switch, then the direct trains still to leave From
 * (views/trip.js, /api/trip).
 * Either station may be null (the field shows its placeholder; the day switch and the lists are left out and
 * a hint asks for both). Tomorrow shows every direct train as leaving, from the timetable, with a note.
 * @typedef {object} RouteScreenData
 * @property {import('./_format.js').ScreenStation | null} from
 * @property {import('./_format.js').ScreenStation | null} to
 * @property {string} date - Today in Pakistan time, 'YYYY-MM-DD'; the day switch shows "Today · Sun 18 Oct" and "Tomorrow · Mon 19 Oct".
 * @property {'today' | 'tomorrow'} day - Which day is selected.
 * @property {{ today: string, tomorrow: string }} [hrefs] - Makes the day switch two links (the page is the state); without it the options are buttons.
 * @property {boolean} [loading] - The trains haven't arrived yet: a loading note instead of the lists.
 * @property {number} now - Minutes after midnight today.
 * @property {RouteTrip[]} leaving - Trains still to leave From, in departure order.
 */
/**
 * One direct train: a /api/trip row with the train resolved.
 * @typedef {object} RouteTrip
 * @property {import('./_format.js').ScreenTrain} train
 * @property {number} dep - Scheduled departure from From, minutes after midnight.
 * @property {number} arr - Scheduled arrival at To, minutes after midnight of the same day (1440+ is the next day).
 * @property {number | null} late - Today's delay in minutes; null when it isn't running yet, has no GPS, or the day is tomorrow (timetable times).
 * @property {boolean} gps - false when the train has no GPS.
 * @property {number} stopsBetween - Stops between From and To.
 * @property {string} [runId] - Adds ?run= to the train link.
 */
/**
 * @param {RouteScreenData} data
 * @param {import('./_layout.js').ScreenOptions} [options]
 * @returns {string}
 */
export function RouteScreen(data, options = {}) {
  const web = options.layout === 'web';
  const { from, to, now } = data;
  const tomorrow = data.day === 'tomorrow';
  const link = r => `#/train/${r.train.number}${r.runId ? `?run=${r.runId}` : ''}`;
  const trainOf = r => ({ number: r.train.label, direction: r.train.up ? 'up' : 'dn', name: trainTitle(r.train) });

  const leaving = data.leaving.map(r => {
    const known = r.late != null;
    return DepartureRow({
      href: link(r),
      train: trainOf(r),
      time: known ? { expected: approx(r.dep + r.late), scheduled: time(r.dep) } : { expected: time(r.dep) },
      sub: `${t('arrives', { time: known ? approx(r.arr + r.late) : time(r.arr) })} · ${t('stopsBetween', { n: r.stopsBetween })}`,
      status: known ? delayStatus(r.late, { gps: r.gps })
        : r.gps === false ? delayStatus(null, { gps: false })
        : { tone: 'neutral', text: tomorrow ? t('timetable') : t('inTime', { d: dur(r.dep - now) }) },
    });
  });

  const modeOptions = [{ value: 'search', label: t('search'), href: '#/search' }, { value: 'trip', label: t('fromTo'), href: '#/trip' }];
  const mode = SegmentedControl({ label: t('searchBy'), value: 'trip', options: modeOptions });

  const both = !!(from && to);
  let content = [];
  if (!both) content = [note(t('pickBoth'))];
  else if (data.loading) content = [note(t('loading'))];
  else if (!leaving.length) content = [note(t('noTrips'))];
  else {
    if (tomorrow) content.push(note(t('timetableTimes')));
    if (leaving.length) content.push(section(SectionHeader({ label: t('leavingNext', { station: place(from) }), count: leaving.length }), list(...leaving)));
  }

  const days = both ? SegmentedControl({
    label: t('dayChoice'), value: data.day,
    options: [
      { value: 'today', label: `${t('today')} · ${dateLabel(data.date)}`, ...(data.hrefs ? { href: data.hrefs.today } : {}) },
      { value: 'tomorrow', label: `${t('tomorrow')} · ${dateLabel(nextDay(data.date))}`, ...(data.hrefs ? { href: data.hrefs.tomorrow } : {}) },
    ],
  }) : '';

  const panel = body(
    web ? mode : row(backButton('#/'), fill(mode)),
    StationFields({ from: from ? place(from) : null, to: to ? place(to) : null, fromLabel: t('from'), toLabel: t('to') }),
    days,
    ...content,
  );

  if (!web) return frame({ name: 'route', options, snap: 'full', label: t('fromTo'), map: countryMap({ layout: 'phone' }), body: panel });
  return frame({
    name: 'route', options, label: t('fromTo'),
    map: countryMap({ layout: 'web' }),
    end: mapButton('zoomIn') + mapButton('zoomOut'),
    body: panel,
  });
}

/** 'YYYY-MM-DD' plus one day. */
function nextDay(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}
