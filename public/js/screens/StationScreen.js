// StationScreen: one station's board, with the map zoomed to it.
import { t, getLang, dur } from '../i18n.js';
import { AppBar, PageHeader, SectionHeader, StatusChip, DepartureRow, statusTone } from '../components/index.js';
import { frame, body, section, list, row, fill, note, notice, mapButton, backButton } from './_layout.js';
import { stationMap } from './_map-standin.js';
import { place, placeEn, placeUr, cityOf, trainTitle, time, approx, delayStatus } from './_format.js';

/**
 * The Station page, opened from a station on the map or in search: the map zoomed to the station, and the
 * Panel with the PageHeader (save, share) and the next trains through it (views/station.js, /api/board).
 * Rows keep the board's order (expected time); they are never sorted or filtered by lateness. The map shows
 * stations, not trains.
 * Web: the AppBar with a back link above the same board in the sidebar, the map beside it with zoom buttons.
 * @typedef {object} StationScreenData
 * @property {'on' | 'reconnecting' | 'off'} live - The feed state, for the web sidebar's AppBar.
 * @property {import('./_format.js').ScreenStation} station - With city and cityUr for the subtitle.
 * @property {boolean} saved - Whether the station is saved (the star).
 * @property {number} now - Minutes after midnight.
 * @property {number} updatedAt - When the board was fetched, minutes after midnight: "Updated just now" or "Updated 3 min ago".
 * @property {StationRow[]} rows - The next trains, in expected-time order (never by lateness). Empty shows "No trains due".
 * @property {boolean} [loading] - The board hasn't arrived yet: a loading note instead of the list.
 * @property {string} [notice] - Short feedback under the header, already localised, such as "Link copied". It sits in a polite live region.
 * @property {{ hover?: { key: string, station: import('./_format.js').ScreenStation } }} [map] - Map stand-in only: a station shown hovered on the web map (key such as 'khanewal').
 */
/**
 * One train on the board: a /api/board row with the train and stations resolved.
 * @typedef {object} StationRow
 * @property {import('./_format.js').ScreenTrain} train
 * @property {'starts' | 'passes' | 'ends'} kind - Starts here, passes through, or ends here.
 * @property {import('./_format.js').ScreenStation} origin - Where the train starts.
 * @property {import('./_format.js').ScreenStation} dest - Where it ends.
 * @property {number} sched - Scheduled time here, minutes after midnight.
 * @property {number} est - Expected time here.
 * @property {number | null} late - Delay in minutes; null when not running or unknown.
 * @property {boolean} gps - false when the train has no GPS.
 * @property {string | null} [runId] - The live run, if any.
 * @property {number | null} [kmAway] - How far away it is.
 * @property {boolean} [atPlatform] - Standing at the platform now.
 */
/**
 * @param {StationScreenData} data
 * @param {import('./_layout.js').ScreenOptions} [options]
 * @returns {string}
 */
export function StationScreen(data, options = {}) {
  const web = options.layout === 'web';
  const { station, rows, now, updatedAt } = data;
  const name = place(station);
  const selected = { title: name };
  const hover = web && data.map?.hover
    ? { key: data.map.hover.key, title: place(data.map.hover.station), sub: t('clickForStation') }
    : undefined;
  const age = now - updatedAt < 1 ? t('justNow') : t('ago', { d: dur(now - updatedAt) });

  const panel = body(
    PageHeader({
      leading: { icon: 'pin' },
      title: placeEn(station),
      titleUr: placeUr(station) || undefined,
      subtitle: cityOf(station),
      actions: [
        { kind: 'follow', followed: data.saved, name, label: { off: t('saveStation', { name }), on: t('saved') } },
        { kind: 'share', label: t('share') },
      ],
    }),
    notice(data.notice),
    data.loading ? note(t('loading'))
      : section(
        row(fill(SectionHeader({ label: t('nextTrains'), count: rows.length })), StatusChip({ tone: 'neutral', text: t('updated', { ago: age }) })),
        rows.length ? list(...rows.map(r => boardRow(r, station))) : note(t('noTrainsSoon')),
      ),
  );

  return frame({
    name: 'station',
    options,
    label: name,
    snap: 'half',
    map: stationMap({ layout: web ? 'web' : 'phone', selected, ...(hover ? { hover } : {}) }),
    start: web ? '' : backButton('#/', 'float'),
    end: web ? mapButton('zoomIn') + mapButton('zoomOut') + mapButton('layers') : '',
    body: web ? AppBar({ live: data.live, lang: getLang(), back: { href: '#/', label: t('home') } }) + panel : panel,
  });
}

/** One train on the board, linking to its page with this station as the stop. */
function boardRow(r, station) {
  const { train, kind, origin, dest, sched, est, late, gps, runId, kmAway, atPlatform } = r;
  const moved = est !== sched;
  let when;
  if (atPlatform) when = { expected: time(est) };
  else if (late != null) when = { expected: approx(est) };
  else when = { expected: time(sched) };
  if (when.expected !== time(sched) && moved) when.scheduled = time(sched);

  let sub;
  if (kind === 'starts') sub = t('startsHereTo', { x: place(dest) });
  else if (kind === 'ends') sub = t('arrivesFrom', { x: place(origin) });
  else sub = t('toStation', { x: place(dest) }) + (kmAway != null ? ` · ${t('kmAway', { km: kmAway })}` : '');

  let status;
  if (atPlatform) status = { tone: late == null ? 'ontime' : statusTone(late), text: t('atPlatform') };
  else if (gps === false) status = delayStatus(null, { gps: false });
  else status = delayStatus(late, { gps });

  return DepartureRow({
    href: `#/train/${train.number}?stop=${encodeURIComponent(station.id)}${runId ? `&run=${runId}` : ''}`,
    time: when,
    train: { number: train.label, direction: train.up ? 'up' : 'dn', name: trainTitle(train) },
    sub,
    status,
  });
}
