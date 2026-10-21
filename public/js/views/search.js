// Search (#/search?q=&pick=from|to): one box for trains (number or name) and stations (name or city, English
// or Urdu). With pick=from|to it chooses a station for From → To and returns to the trip page.
import { SearchScreen } from '../screens/index.js';
import { place } from '../screens/_format.js';
import { t } from '../i18n.js';
import { loadLastSeen, lastSeenOf, lastSeenText } from '../lastseen.js';
import {
  state, mapTrains, paint, layout, navigate, replaceHash, returnTo, store, setFollowed, isFollowed,
  recentSearches, addRecentSearch, savedStations,
} from '../app.js';
import * as map from '../map.js';

const FRESH_MS = 3 * 3600e3;
const MAX_TRAINS = 20, MAX_STATIONS = 8;
// The main station of each major city, matched by name (ids differ between feeds).
const MAIN = [/^peshawar cantt/, /^rawalpindi$/, /^lahore jn/, /^faisalabad/, /^multan cantt/, /^quetta/, /^rohri jn/, /^hyderabad jn/, /^karachi cantt/];

let query = '', pick = null, timer = 0, mounted = false, unlisten = null;

const words = q => q.toLowerCase().trim().split(/\s+/).filter(Boolean);
const hashFor = () => `#/search${[query && `q=${encodeURIComponent(query)}`, pick && `pick=${pick}`].filter(Boolean).map((p, i) => (i ? '&' : '?') + p).join('')}`;

/** Where picking this station leads in pick mode: the trip page with that side set, the other side as remembered. */
function pickHref(id) {
  const { from = null, to = null } = store.get('lastTrip', {}) || {};
  return pick === 'from' ? `#/trip/${id}${to ? `/${to}` : ''}` : `#/trip/${from || '-'}/${id}`;
}
const stationRow = station => ({ station, href: pick ? pickHref(station.id) : `#/station/${station.id}` });

/** Trains for the words: exact number first, then numbers that start with it, then the rest by number. Never by lateness. */
function findTrains(ws, q) {
  const rank = i => (String(i.number) === q || i.label === q ? 0 : String(i.number).startsWith(q) || i.label.startsWith(q) ? 1 : 2);
  return state.trains.filter(i => ws.every(w => i.search.includes(w)))
    .sort((a, b) => rank(a) - rank(b) || a.number - b.number)
    .slice(0, MAX_TRAINS);
}
/** Stations for the words: names that start with the query first, then other matches, busier stations first. */
function findStations(ws, q) {
  const rank = s => (place(s).toLowerCase().startsWith(q) || s.name.toLowerCase().trim().startsWith(q) ? 0 : 1);
  return state.stations.filter(s => ws.every(w => s.search.includes(w)))
    .sort((a, b) => rank(a) - rank(b) || (b.trainCount || 0) - (a.trainCount || 0))
    .slice(0, MAX_STATIONS);
}

function liveRunOf(number) {
  let best = null;
  for (const r of state.runs.values()) {
    if (r.train === number && !r.suspect && Date.now() - r.updatedAt < FRESH_MS && !(best && best.updatedAt >= r.updatedAt)) best = r;
  }
  return best;
}

function trainRow(info) {
  const run = liveRunOf(info.number);
  if (!run) loadLastSeen(render);
  const rec = run ? null : lastSeenOf(info.number);
  return {
    ...(rec ? { lastSeen: lastSeenText(rec, { short: true }) } : {}),
    train: info,
    from: state.stationById.get(info.fromId) || { name: info.from },
    to: state.stationById.get(info.toId) || { name: info.to },
    late: run ? run.lateBy : null, gps: run ? true : info.live, followed: isFollowed(info.number),
    ...(run ? { runId: run.id } : {}),
  };
}

function data() {
  const q = query.trim().toLowerCase(), ws = words(query);
  const base = { query, mode: pick ? 'pick' : 'all', recent: [], hint: !q && !pick };
  if (pick) {
    base.pickLabel = t(pick);
    base.backHref = '#/trip';
    base.trains = [];
  }
  if (q) {
    return {
      ...base,
      trains: pick ? [] : findTrains(ws, q).map(trainRow),
      stations: findStations(ws, q).map(stationRow),
      stationsFirst: !/^\d+$/.test(q),
    };
  }
  const saved = savedStations().map(id => state.stationById.get(id)).filter(Boolean).map(stationRow);
  if (pick) {
    const main = MAIN.map(re => state.stations.find(s => re.test(place(s).toLowerCase()))).filter(Boolean).map(stationRow);
    return { ...base, trains: [], saved, main };
  }
  const recent = recentSearches().map(r => {
    if (r.kind === 'station') { const station = state.stationById.get(String(r.id)); return station && { kind: 'station', station }; }
    const from = state.stationById.get(String(r.from)), to = state.stationById.get(String(r.to));
    return from && to && { kind: 'trip', from, to };
  }).filter(Boolean);
  return { ...base, trains: [], recent, saved };
}

const handlers = {
  onSearch(value) { setQuery(value); },
  onClear() { setQuery(''); },
  onFollow(followed, btn) {
    const href = btn.closest('.p-trainrow')?.querySelector('a')?.getAttribute('href') || '';
    const n = Number(href.match(/#\/train\/(\d+)/)?.[1]);
    if (n) setFollowed(n, followed);
    render();
  },
  onMap(action) {
    if (action === 'zoomIn') map.zoomIn();
    else if (action === 'zoomOut') map.zoomOut();
  },
};

function setQuery(value) {
  query = value;
  replaceHash(hashFor()); // Back returns to this query
  render();
}

function render() {
  if (!mounted) return;
  map.setTrains(mapTrains());
  clearTimeout(timer);
  timer = 0;
  paint(SearchScreen(data(), { layout: layout(), standin: false }), handlers);
}

/** Puts the caret at the end of the search box. */
function focusInput() {
  const input = document.querySelector('#app .p-searchfield__input');
  if (!input) return;
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
}

// Station rows: in pick mode a tap finishes the pick; otherwise it is remembered as a recent search.
function onClick(e) {
  const a = e.target.closest?.('a.p-linkrow');
  if (!a || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const href = a.getAttribute('href');
  if (pick && href.startsWith('#/trip')) { e.preventDefault(); returnTo(href); return; }
  const id = href.match(/^#\/station\/(.+)$/)?.[1];
  if (id) addRecentSearch({ kind: 'station', id: decodeURIComponent(id) });
}

export default {
  mount(params) {
    mounted = true;
    query = params.q || '';
    pick = params.pick || null;
    map.showStations({ key: 'search', stations: state.stations, fit: 'keep' });
    map.onStationClick(id => navigate(`#/station/${id}`));
    map.onTrainClick(n => navigate(`#/train/${n}`));
    const root = document.getElementById('app');
    root.addEventListener('click', onClick);
    unlisten = () => root.removeEventListener('click', onClick);
    render();
    focusInput();
  },
  render,
  update() { if (mounted && !timer) timer = setTimeout(render, 1000); },
  unmount() {
    mounted = false;
    clearTimeout(timer);
    timer = 0;
    unlisten?.();
    unlisten = null;
  },
};
