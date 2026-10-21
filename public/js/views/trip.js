// From → To: the direct trains between two stations. /api/trip gives the timetable and today's live delay;
// this view splits it into "leaving From next" and "already on the way" (Today), or lists the timetable (Tomorrow).
import { RouteScreen } from '../screens/index.js';
import { trainInfo } from '../names.js';
import { pktMidnight } from '../i18n.js';
import { state, api, store, paint, layout, navigate, mapTrains, addRecentSearch } from '../app.js';
import * as map from '../map.js';

const REFRESH_MS = 60e3;
const LIVE_DEBOUNCE_MS = 5e3;
const GRACE_MIN = 5; // a train with no GPS still counts as "leaving" for this long after its scheduled time
const GONE_MIN = 30; // drop a train that should have reached To more than this long ago

let v = null;

/** A trip's hash. A missing From is '-'; a bare #/trip when neither is set. */
function tripHash(from, to, day) {
  const base = !from && !to ? '#/trip' : !to ? `#/trip/${from}` : `#/trip/${from || '-'}/${to}`;
  return day === 'tomorrow' ? `${base}?day=tomorrow` : base;
}

const asTrip = r => ({
  train: state.byNumber.get(r.number) || trainInfo(r),
  dep: r.dep, arr: r.arr, late: r.late, gps: r.gps, stopsBetween: r.stopsBetween, runId: r.runId ?? undefined,
});

/** Today: not yet gone from From vs already on the way. Tomorrow: everything, from the timetable. Never ordered by lateness. */
function split(rows, now, day) {
  const byDep = (a, b) => a.dep - b.dep;
  if (day === 'tomorrow') {
    return { leaving: rows.map(r => asTrip({ ...r, late: null, runId: null })).sort(byDep), onTheWay: [] };
  }
  const leaving = rows.filter(r => (r.runId ? !r.passedFrom : r.dep >= now - GRACE_MIN));
  const onTheWay = rows.filter(r => !leaving.includes(r)
    && (r.passedFrom || (!r.runId && r.dep < now && now < r.arr))
    && r.arr + (r.late ?? 0) >= now - GONE_MIN);
  return { leaving: leaving.map(asTrip).sort(byDep), onTheWay: onTheWay.map(asTrip).sort(byDep) };
}

function data() {
  const { from, to, day, trip } = v;
  const now = trip?.now ?? 0;
  const { leaving, onTheWay } = trip ? split(trip.rows, now, day) : { leaving: [], onTheWay: [] };
  return {
    from: from ? state.stationById.get(from) || null : null,
    to: to ? state.stationById.get(to) || null : null,
    date: new Date(pktMidnight() + 5 * 3600e3).toISOString().slice(0, 10),
    day,
    hrefs: { today: tripHash(from, to, 'today'), tomorrow: tripHash(from, to, 'tomorrow') },
    loading: !!(from && to && !trip),
    now,
    leaving,
    onTheWay,
  };
}

function render() {
  if (!v) return;
  map.setTrains(mapTrains());
  paint(RouteScreen(data(), { layout: layout(), standin: false }), {
    onPickFrom: () => navigate('#/search?pick=from'),
    onPickTo: () => navigate('#/search?pick=to'),
    onSwap: () => navigate(tripHash(v.to, v.from, v.day)),
    onMap: action => {
      if (action === 'zoomIn') map.zoomIn();
      else if (action === 'zoomOut') map.zoomOut();
    },
  });
}

async function load() {
  clearTimeout(v?.timer);
  if (!v?.from || !v?.to) return;
  const mine = v;
  let ok = true;
  try {
    const trip = await api(`/api/trip?from=${encodeURIComponent(mine.from)}&to=${encodeURIComponent(mine.to)}`);
    if (v !== mine) return;
    mine.trip = trip;
  } catch {
    if (v !== mine) return;
    ok = !!mine.trip; // keep what is showing; with nothing yet, try again soon
  }
  render();
  mine.timer = setTimeout(load, ok ? REFRESH_MS : 10e3);
}

export default {
  mount({ from, to, day }) {
    if (!from && !to) {
      const last = store.get('lastTrip', null);
      if (last && (last.from || last.to)) return navigate(tripHash(last.from, last.to, day), { replace: true });
    }
    v = { from, to, day, trip: null, timer: 0, live: 0 };
    if (from || to) store.set('lastTrip', { from, to });
    if (from && to) addRecentSearch({ kind: 'trip', from, to });
    map.showStations({
      key: `trip:${from}>${to}`,
      stations: state.stations,
      selected: [from, to].filter(Boolean),
      fit: 'selected',
    });
    map.onStationClick(id => navigate(`#/station/${id}`));
    map.onTrainClick(n => navigate(`#/train/${n}`));
    render();
    load();
  },
  render,
  update() {
    // A live update may have moved a train past From: refetch, but not on every poll.
    if (!v?.trip || v.live) return;
    const mine = v;
    mine.live = setTimeout(() => { mine.live = 0; if (v === mine) load(); }, LIVE_DEBOUNCE_MS);
  },
  unmount() {
    if (v) { clearTimeout(v.timer); clearTimeout(v.live); }
    v = null;
  },
};
