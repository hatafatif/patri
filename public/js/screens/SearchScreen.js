// SearchScreen: one box for a train, station or city, with the train results and recent searches.
import { t, isUrdu } from '../i18n.js';
import { SearchField, SegmentedControl, SectionHeader, TrainRow, LinkRow } from '../components/index.js';
import { frame, body, section, cards, list, stack, row, fill, note, mapButton, backButton } from './_layout.js';
import { place, trainTitle, badgeOf, route, delayStatus, cityOf } from './_format.js';
import { countryMap } from './_map-standin.js';

/**
 * Search, opened from Home: the Panel at full height with a back button, the search field, the
 * Train or station | From → To switch, the matching trains, recent searches and a hint.
 * @typedef {object} SearchScreenData
 * @property {string} query - The text in the search box, such as "Shalimar". Matches are highlighted in the results.
 * @property {SearchTrain[]} trains - The matching trains, in the order the search ranked them (never by lateness).
 * @property {SearchRecent[]} recent - Recent searches, newest first.
 * @property {SearchStation[]} [stations] - Stations that match the query, as LinkRows under "Stations · n". The view gives each href.
 * @property {SearchStation[]} [saved] - Saved stations, shown under "Saved stations" (the view passes them when the query is empty).
 * @property {SearchStation[]} [main] - The main station of each major city, shown under "Main stations" (pick mode, empty query).
 * @property {'all' | 'pick'} [mode='all'] - pick chooses a station for From → To: no trains, no Train-or-station | From → To switch, and the field searches stations.
 * @property {string} [pickLabel] - Pick mode: the side being picked ("From" or "To"), already localised, as a SectionHeader above the stations.
 * @property {string} [backHref='#/'] - Where the back button goes when there is no history (the trip page in pick mode).
 * @property {boolean} [stationsFirst] - List the matching stations above the trains (the view does this when the query is a name rather than a number).
 * @property {boolean} [hint=true] - Show the help text at the end. The view turns it off once there is a query.
 */
/**
 * One station row: a LinkRow to its page, or, in pick mode, to the trip with that station picked.
 * @typedef {object} SearchStation
 * @property {import('./_format.js').ScreenStation} station
 * @property {string} href
 * @property {string} [eyebrow] - The small label above the name, already localised. Defaults to the station's city, or "Station board".
 */
/**
 * @typedef {object} SearchTrain
 * @property {import('./_format.js').ScreenTrain} train
 * @property {import('./_format.js').ScreenStation} from - Where the train starts.
 * @property {import('./_format.js').ScreenStation} to - Where it ends.
 * @property {number | null} late - Today's delay in minutes; null when it isn't running or unknown.
 * @property {boolean} [gps] - false when the train has no GPS.
 * @property {boolean} followed - Whether it is in My trains (the star).
 * @property {string} [runId] - Adds ?run= to the train link.
 */
/**
 * @typedef {{ kind: 'trip', from: import('./_format.js').ScreenStation, to: import('./_format.js').ScreenStation } | { kind: 'station', station: import('./_format.js').ScreenStation }} SearchRecent
 */
/**
 * @param {SearchScreenData} data
 * @param {import('./_layout.js').ScreenOptions} [options]
 * @returns {string}
 */
export function SearchScreen(data, options = {}) {
  const web = options.layout === 'web';
  const pick = data.mode === 'pick';
  const field = SearchField({ value: data.query, placeholder: t(pick ? 'searchStations' : 'searchTrains') });
  const back = backButton(data.backHref || '#/');
  const mode = pick ? '' : SegmentedControl({
    label: t('searchBy'), value: 'search',
    options: [{ value: 'search', label: t('search'), href: '#/search' }, { value: 'trip', label: t('fromTo'), href: '#/trip' }],
  });

  const rows = data.trains.map(h => TrainRow({
    href: `#/train/${h.train.number}${h.runId ? `?run=${h.runId}` : ''}`,
    badge: badgeOf(h.train),
    name: trainTitle(h.train),
    sub: route(h.from, h.to),
    status: delayStatus(h.late, { gps: h.gps }),
    match: data.query,
    follow: { followed: h.followed },
  }));
  const recent = (data.recent || []).map(r => (r.kind === 'trip'
    ? LinkRow({ href: `#/trip/${r.from.id}/${r.to.id}`, eyebrow: t('tabTrip'), label: route(r.from, r.to) })
    : LinkRow({ href: `#/station/${r.station.id}`, eyebrow: t('stationBoard'), label: place(r.station) })));

  const stationRows = items => (items || []).map(r => LinkRow({
    href: r.href,
    // The API has no Urdu city names, so in Urdu a station without one gets "Station board" rather than an English city.
    eyebrow: r.eyebrow ?? ((isUrdu() ? r.station.cityUr : r.station.city) ? cityOf(r.station) : t('stationBoard')),
    label: place(r.station),
  }));
  const found = stationRows(data.stations), saved = stationRows(data.saved), main = stationRows(data.main);
  const trainsSection = rows.length ? section(SectionHeader({ label: t('tabTrains'), count: rows.length }), list(...rows)) : '';
  const foundSection = found.length ? section(SectionHeader({ label: t('tabStations'), count: found.length }), cards(...found)) : '';
  const nothing = data.query.trim() && !rows.length && !found.length;

  const panel = body(
    // The search box and its mode switch sit closer together than the sections do.
    stack(row(back, fill(field)), mode, pick ? SectionHeader({ label: data.pickLabel || '' }) : ''),
    ...(data.stationsFirst ? [foundSection, trainsSection] : [trainsSection, foundSection]),
    nothing ? note(t('noMatch', { q: data.query.trim() })) : '',
    recent.length ? section(SectionHeader({ label: t('recent') }), cards(...recent)) : '',
    saved.length ? section(SectionHeader({ label: t('savedStations') }), cards(...saved)) : '',
    main.length ? section(SectionHeader({ label: t('mainStations') }), cards(...main)) : '',
    data.hint !== false && !nothing ? note(t('searchHint')) : '',
  );

  if (!web) return frame({ name: 'search', options, snap: 'full', label: t('search'), map: countryMap({ layout: 'phone' }), body: panel });
  return frame({
    name: 'search', options, label: t('search'),
    map: countryMap({ layout: 'web' }),
    end: mapButton('zoomIn') + mapButton('zoomOut'),
    body: panel,
  });
}
