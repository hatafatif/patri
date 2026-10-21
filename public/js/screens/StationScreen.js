// StationScreen: one station's board, with the map zoomed to it.
import { t, getLang, dur } from '../i18n.js';
import { AppBar, PageHeader, SectionHeader, SegmentedControl, StatusChip, DepartureRow, Photo, statusTone } from '../components/index.js';
import { frame, body, section, list, row, fill, note, notice, mapButton, backButton } from './_layout.js';
import { stationMap } from './_map-standin.js';
import { place, placeEn, placeUr, cityOf, trainTitle, time, approx, delayStatus } from './_format.js';

/**
 * The Station page, opened from a station on the map or in search: the map zoomed to the station, and the
 * Panel with the PageHeader (save, share) and the next trains through it (views/station.js, /api/board).
 * Rows keep the board's order (expected time); they are never sorted or filtered by lateness. The map shows
 * stations and the running trains.
 * Web: the AppBar with a back link above the same board in the sidebar, the map beside it with zoom buttons.
 * @typedef {object} StationScreenData
 * @property {'on' | 'reconnecting' | 'off'} live - The feed state, for the web sidebar's AppBar.
 * @property {import('./_format.js').ScreenStation} station - With city and cityUr for the subtitle.
 * @property {boolean} saved - Whether the station is saved (the star).
 * @property {number} now - Minutes after midnight.
 * @property {number} updatedAt - When the board was fetched, minutes after midnight: "Updated just now" or "Updated 3 min ago".
 * @property {StationRow[]} rows - The next trains, in expected-time order (never by lateness). Empty shows "No trains due".
 * @property {boolean} [loading] - The board hasn't arrived yet: a loading note instead of the list.
 * @property {'next' | 'timetable'} [view] - Which list the switch shows. Default 'next'.
 * @property {TimetableRow[]} [timetable] - The whole day's trains through the station, in scheduled-time order (never by lateness). Used when view is 'timetable'.
 * @property {boolean} [loadingTimetable] - The timetable hasn't arrived yet: a loading note instead of the list.
 * @property {string} [notice] - Short feedback under the header, already localised, such as "Link copied". It sits in a polite live region.
 * @property {import('../components/Photo.js').PhotoProps} [photo] - A photo of the station's city, when there is one.
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
 * @property {string} [lastSeen] - Short "Last seen 3 h ago", already localised, for a train with no live location. Appended to the sub line.
 */
/**
 * One train in the day's timetable: a /api/timetable row with the train resolved.
 * @typedef {object} TimetableRow
 * @property {import('./_format.js').ScreenTrain} train
 * @property {'starts' | 'passes' | 'ends'} kind
 * @property {import('./_format.js').ScreenStation} origin
 * @property {import('./_format.js').ScreenStation} dest
 * @property {number} time - Scheduled time here, minutes after midnight (0 to 1439).
 * @property {number | null} [late] - Delay in minutes, only for a train running towards this station; otherwise omitted.
 * @property {boolean} [gps] - Whether the train has GPS (with late).
 * @property {string | null} [runId] - The live run, when there is one.
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
  const timetableView = data.view === 'timetable';
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
    data.photo ? Photo(data.photo) : '',
    SegmentedControl({
      label: t('stationBoard'), value: timetableView ? 'timetable' : 'next',
      options: [
        { value: 'next', label: t('nextTrains'), href: `#/station/${station.id}` },
        { value: 'timetable', label: t('timetable'), href: `#/station/${station.id}?view=timetable` },
      ],
    }),
    timetableView ? timetableSection(data)
      : data.loading ? note(t('loading'))
      : section(
        row(fill(SectionHeader({ label: t('nextTrains'), count: rows.length })), StatusChip({ tone: 'neutral', text: t('updated', { ago: age }) })),
        rows.length ? list(...rows.map(r => boardRow(r, station, data.now))) : note(t('noTrainsSoon')),
      ),
  );

  return frame({
    name: 'station',
    options,
    label: name,
    snap: 'half',
    map: stationMap({ layout: web ? 'web' : 'phone', selected, ...(hover ? { hover } : {}) }),
    back: { href: '#/', label: t('home') },
    end: web ? mapButton('zoomIn') + mapButton('zoomOut') + mapButton('layers') : '',
    body: web ? AppBar({ live: data.live, lang: getLang(), back: { href: '#/', label: t('home') } }) + panel : panel,
  });
}

/** The whole day's trains, by scheduled time here. Only a train running towards the station gets a status. */
function timetableSection(data) {
  if (data.loadingTimetable) return note(t('loading'));
  const rows = data.timetable || [];
  return section(
    SectionHeader({ label: t('timetable'), count: rows.length }),
    note(t('tripsCount', { n: rows.length })),
    list(...rows.map(r => {
      const { train, kind, origin, dest, time: at, late, gps, runId } = r;
      const sub = kind === 'starts' ? t('startsHereTo', { x: place(dest) })
        : kind === 'ends' ? t('arrivesFrom', { x: place(origin) })
        : t('toStation', { x: place(dest) });
      return DepartureRow({
        href: `#/train/${train.number}${runId ? `?run=${runId}` : ''}`,
        time: { expected: time(at) },
        train: { number: train.label, direction: train.up ? 'up' : 'dn', name: trainTitle(train) },
        sub,
        ...(late != null ? { status: delayStatus(late, { gps }) } : {}),
      });
    })),
  );
}

/** One train on the board, linking to its page with this station as the stop. */
function boardRow(r, station, now) {
  const { train, kind, origin, dest, sched, est, late, gps, runId, kmAway, atPlatform, lastSeen } = r;
  const moved = est !== sched;
  let when;
  if (atPlatform) when = { expected: time(est, now) };
  else if (late != null) when = { expected: approx(est, now) };
  else when = { expected: time(sched, now) };
  if (when.expected !== time(sched, now) && moved) when.scheduled = time(sched, now);

  let sub;
  if (kind === 'starts') sub = t('startsHereTo', { x: place(dest) });
  else if (kind === 'ends') sub = t('arrivesFrom', { x: place(origin) });
  else sub = t('toStation', { x: place(dest) }) + (kmAway != null ? ` · ${t('kmAway', { km: kmAway })}` : '');
  if (lastSeen && (late == null || gps === false)) sub += ` · ${lastSeen}`;

  let status;
  if (atPlatform) status = { tone: late == null ? 'ontime' : statusTone(late), text: t('atPlatform') };
  else if (gps === false) status = delayStatus(null, { gps: false });
  else status = delayStatus(late, { gps });

  return DepartureRow({
    href: `#/train/${train.number}${runId ? `?run=${runId}` : ''}`,
    time: when,
    train: { number: train.label, direction: train.up ? 'up' : 'dn', name: trainTitle(train) },
    sub,
    status,
  });
}
