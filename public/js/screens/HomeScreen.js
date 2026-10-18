// HomeScreen: the station map with the Panel: search, My trains and Running now.
import { t, getLang } from '../i18n.js';
import { AppBar, SearchField, SectionHeader, TrainCard, TrainRow } from '../components/index.js';
import { frame, body, section, cards, list, mapButton, notice } from './_layout.js';
import { place, trainTitle, badgeOf, whereText, approx, time, delayStatus } from './_format.js';
import { countryMap } from './_map-standin.js';

/**
 * Home: the station map (stations, not trains) under the AppBar, and the Panel with the search field and
 * its From → To link, My trains and Running now. Phone: half snap by default. Web: the Panel is the
 * sidebar with the AppBar as its header; the map gets zoom buttons.
 * @typedef {object} HomeScreenData
 * @property {'on' | 'reconnecting' | 'off'} live - The feed state, for the AppBar's LiveIndicator.
 * @property {HomeTrain[]} myTrains - The followed trains (localStorage myTrains), in the rider's order, then recently viewed ones. The section is hidden when empty.
 * @property {HomeTrain[]} running - Trains running now (views/home.js running()). Shown in train-number order, never sorted or filtered by lateness.
 * @property {number} runningCount - How many trains are running now, for "Running now · 41"; running may be a subset.
 * @property {string} [notice] - A short feedback line under the search field, such as "Nearest station: Multan Cantt" (an always-present live region; empty when there is nothing to say).
 * @property {{ hover?: { key: string, station: import('./_format.js').ScreenStation } }} [map] - Map stand-in only: a city shown hovered on the web map (key as the stand-in knows it, such as 'lahore').
 */
/**
 * One train in My trains or Running now.
 * @typedef {object} HomeTrain
 * @property {import('./_format.js').ScreenTrain} train
 * @property {import('./_format.js').ScreenWhere | null} where - Where it is: between two stations, stopped at one, or not departed yet. null when the train has no live run: the row says "Not running now".
 * @property {number | null} late - run.lateBy in minutes; null when unknown.
 * @property {boolean} [gps] - false when the train has no GPS.
 * @property {string} [runId] - Adds ?run= to the train link.
 * @property {{ station: import('./_format.js').ScreenStation, est: number, scheduled?: boolean }} [yourStop] - The rider's stop and the expected time there, in minutes after midnight. scheduled: true shows the timetable time without the "~" (no live run to estimate from).
 */
/**
 * @param {HomeScreenData} data
 * @param {import('./_layout.js').ScreenOptions} [options]
 * @returns {string}
 */
export function HomeScreen(data, options = {}) {
  const web = options.layout === 'web';
  const lang = getLang();
  const appBar = AppBar({ live: data.live, lang });
  const href = h => `#/train/${h.train.number}${h.runId ? `?run=${h.runId}` : ''}`;
  const where = h => (h.where ? whereText(h.where) : t('notRunningNow'));
  const status = h => delayStatus(h.late, { gps: h.gps });

  const mine = data.myTrains.map(h => TrainCard({
    href: href(h),
    badge: badgeOf(h.train),
    name: trainTitle(h.train),
    position: where(h),
    ...(h.yourStop ? { yourStop: { name: place(h.yourStop.station), time: (h.yourStop.scheduled ? time : approx)(h.yourStop.est) } } : {}),
    status: status(h),
  }));
  // The data is frozen, so sort a copy. Train number order only; never by lateness.
  const running = [...data.running].sort((a, b) => a.train.number - b.train.number).map(h => TrainRow({
    href: href(h),
    badge: badgeOf(h.train),
    name: trainTitle(h.train),
    sub: where(h),
    status: status(h),
  }));

  const panel = body(
    SearchField({ placeholder: t('searchTrains'), route: { href: '#/trip', label: t('fromTo') } }),
    notice(data.notice),
    mine.length ? section(SectionHeader({ label: t('myTrains'), count: mine.length }), cards(...mine)) : '',
    section(SectionHeader({ label: t('runningNowHead'), count: data.runningCount }), list(...running)),
  );

  const layers = mapButton('layers');
  const locate = mapButton('locate');

  if (!web) {
    return frame({ name: 'home', options, snap: 'half', label: t('home'), top: appBar, map: countryMap({ layout: 'phone' }), end: layers + locate, body: panel });
  }
  const h = data.map?.hover;
  const hover = h ? { key: h.key, title: place(h.station), sub: t('clickForStation') } : undefined;
  return frame({
    name: 'home', options, label: t('home'),
    map: countryMap({ layout: 'web', hover }),
    end: mapButton('zoomIn') + mapButton('zoomOut') + layers + locate,
    body: appBar + panel,
  });
}
