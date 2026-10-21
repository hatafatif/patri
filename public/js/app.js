// App shell: data, the live feed, hash routing, history-aware back, language, phone/web layout, and painting
// screens (with the one MapLibre map inside them). Views render through the screen templates and call paint().
import { t, getLang, setLang } from './i18n.js';
import { trainInfo, stationName } from './names.js';
import { bindScreen } from './screens/index.js';
import { paint as paintInto } from './render.js';
import * as map from './map.js';
import { registerWorker } from './alerts.js';
import { trainNo, trainTitle } from './screens/_format.js';
import home from './views/home.js';
import search from './views/search.js';
import trip from './views/trip.js';
import train from './views/train.js';
import station from './views/station.js';

const root = document.getElementById('app');

export const state = {
  trains: [], byNumber: new Map(),
  stations: [], stationById: new Map(),
  runs: new Map(),
  /** The feed, for the AppBar's LiveIndicator: 'off' until the first read, then 'on' or 'reconnecting'. */
  live: 'off',
};

// ---- API: relative /api/... calls, so the same files work on the local server and on Vercel.
async function getJSON(url) {
  for (let tries = 0; ; tries++) {
    const res = await fetch(url);
    if (res.status === 503 && tries < 10) { await new Promise(r => setTimeout(r, 2000)); continue; }
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || res.statusText);
    return body;
  }
}
const cache = new Map();
/**
 * Fetches JSON. { cache: true } keeps the answer for the session; use it for the timetable endpoints
 * (/api/route), never for live ones (/api/board, /api/trip, /api/runs, /api/history).
 */
export function api(url, { cache: keep = false } = {}) {
  if (keep && cache.has(url)) return cache.get(url);
  const p = getJSON(url);
  if (keep) { cache.set(url, p); p.catch(() => cache.delete(url)); }
  return p;
}

// ---- Remembered things (localStorage). Values are JSON, except the older plain keys below.
export const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; }
  },
  set(key, value) {
    try { value == null ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
};
// My trains: followed trains (localStorage myTrains, set by the FollowButton), then recently viewed ones.
export const followedTrains = () => store.get('myTrains', []).map(Number).filter(n => state.byNumber.has(n));
export const isFollowed = n => followedTrains().includes(Number(n));
export function setFollowed(n, on) {
  const list = store.get('myTrains', []).map(Number).filter(x => x !== Number(n));
  store.set('myTrains', on ? [...list, Number(n)] : list);
}
export const recentTrains = () => store.get('recentTrains', []).map(Number).filter(n => state.byNumber.has(n));
export function addRecentTrain(n) {
  store.set('recentTrains', [Number(n), ...store.get('recentTrains', []).map(Number).filter(x => x !== Number(n))].slice(0, 5));
}
// Recent searches: trips and stations, newest first ({ kind: 'trip', from, to } | { kind: 'station', id }).
export const recentSearches = () => store.get('recentSearches', []);
export function addRecentSearch(item) {
  const key = i => (i.kind === 'trip' ? `trip:${i.from}>${i.to}` : `station:${i.id}`);
  store.set('recentSearches', [item, ...recentSearches().filter(i => key(i) !== key(item))].slice(0, 6));
}
// Saved stations (the Station page's star).
export const savedStations = () => store.get('savedStations', []).map(String).filter(id => state.stationById.has(id));
export const isSaved = id => savedStations().includes(String(id));
export function setSaved(id, on) {
  const list = store.get('savedStations', []).map(String).filter(x => x !== String(id));
  store.set('savedStations', on ? [...list, String(id)] : list);
}

export const stationLabel = id => {
  const s = state.stationById.get(String(id));
  return s ? stationName(s.name, s.nameUr) : '';
};

// ---- Layout: the phone sheet under 940px, the web sidebar from 940px (the Panel's own breakpoint).
const wide = matchMedia('(min-width: 940px)');
export const layout = () => (wide.matches ? 'web' : 'phone');

// ---- Painting. The first paint of a page is fresh; later ones morph the DOM (render.js).
const canvas = document.createElement('div');
canvas.className = 'p-screen__canvas';
let freshNext = true;
let unbind = null;
let mapStarted = false;

/**
 * Paints a screen template's HTML into the app and wires it.
 * @param {string} html - <Name>Screen(data, { layout: layout(), standin: false }).
 * @param {object} [handlers] - bindScreen() handlers (onFollow, onShare, onMap, …) plus data for the speed chart.
 */
export function paint(html, handlers = {}) {
  const fresh = paintInto(root, html, { fresh: freshNext });
  freshNext = false;
  const backdrop = root.querySelector('.p-screen__backdrop');
  if (backdrop && canvas.parentElement !== backdrop) backdrop.appendChild(canvas);
  unbind?.();
  unbind = bindScreen(root, {
    onLang: switchLang,
    ...handlers,
    onSnap: snap => { map.setInsets(); handlers.onSnap?.(snap); },
  });
  watchDock();
  if (!mapStarted && canvas.isConnected) {
    mapStarted = true;
    map.initMap(canvas).catch(e => console.error('map:', e));
  }
  map.resize();
  map.setInsets();
  if (fresh) root.querySelector('.p-panel__body')?.scrollTo(0, 0);
}

// The web Train page docks the speed chart over the bottom of the map; the map ends above it (screens.css
// reads --dock-size), and the dock's height changes with the language and when fonts arrive.
const dockObserver = typeof ResizeObserver === 'function'
  ? new ResizeObserver(([entry]) => root.style.setProperty('--dock-size', `${Math.ceil(entry.target.offsetHeight)}px`))
  : null;
function watchDock() {
  const dock = root.querySelector('.p-screen__dock');
  dockObserver?.disconnect();
  if (dock) {
    root.style.setProperty('--dock-size', `${Math.ceil(dock.offsetHeight)}px`);
    dockObserver?.observe(dock);
  } else root.style.removeProperty('--dock-size');
}

// ---- Language: the AppBar's LanguageToggle switches the whole app, remembered in localStorage lang.
function switchLang(lang) {
  setLang(lang); // sets <html lang dir>
  map.setLang();
  current?.view.render?.();
}

// ---- Live positions: polled, since the hosted version has no long-lived connection to stream from.
// Upstream positions change every 10-30 s, so this loses nothing. Paused while the tab is hidden.
export const FRESH_MS = 3 * 3600e3; // a run not heard from for 3 hours is not running
const POLL_MS = 15000;
let pollTimer = 0, polling = false;
async function poll() {
  clearTimeout(pollTimer);
  if (polling) return;
  polling = true;
  const before = state.live;
  try {
    const runs = await api('/api/snapshot');
    const changed = runs.filter(r => !(state.runs.get(r.id)?.updatedAt >= r.updatedAt));
    state.runs = new Map(runs.map(r => [r.id, r]));
    state.live = 'on';
    if (before !== state.live) current?.view.render?.();
    if (changed.length) current?.view.update?.(changed);
  } catch {
    state.live = 'reconnecting';
    if (before !== state.live) current?.view.render?.();
  } finally {
    polling = false;
    if (!document.hidden) pollTimer = setTimeout(poll, POLL_MS);
  }
}
/** Running trains for the map: number, position and a localised title. Never filtered or sorted by lateness. */
export function mapTrains() {
  const out = [];
  for (const r of state.runs.values()) {
    const info = state.byNumber.get(r.train);
    if (r.suspect || !info || !(Date.now() - r.updatedAt < FRESH_MS) || !Number.isFinite(r.lat) || !Number.isFinite(r.lon)) continue;
    out.push({ number: r.train, lat: r.lat, lon: r.lon, title: `${trainNo(info)} ${trainTitle(info)}` });
  }
  return out;
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) clearTimeout(pollTimer);
  else poll();
});

// ---- Routing.
//   #/  #/search[?q=&pick=from|to]  #/trip[/<from>/<to>][?day=tomorrow]  #/train/<n>[?run=]
//   #/train/<n>/stops[?pick=1]  #/station/<id>.  Old links keep working: #27 is #/train/27.
export function parse(hash = location.hash) {
  const h = hash.replace(/^#/, '');
  if (/^\d+$/.test(h)) return { view: 'train', params: { number: Number(h) }, legacy: `#/train/${h}` };
  const [path, query] = h.split('?');
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  const q = new URLSearchParams(query || '');
  if (parts[0] === 'search') return { view: 'search', params: { q: q.get('q') || '', pick: ['from', 'to'].includes(q.get('pick')) ? q.get('pick') : null } };
  // A trip with only To set is #/trip/-/<to>.
  const id = x => (x && x !== '-' ? x : null);
  if (parts[0] === 'trip') return { view: 'trip', params: { from: id(parts[1]), to: id(parts[2]), day: q.get('day') === 'tomorrow' ? 'tomorrow' : 'today' } };
  if (parts[0] === 'train' && parts[1]) {
    return { view: 'train', params: { number: Number(parts[1]), stops: parts[2] === 'stops', pick: q.get('pick') === '1', run: q.get('run') } };
  }
  if (parts[0] === 'station') return { view: 'station', params: { id: parts[1] || null } };
  return { view: 'home', params: {} };
}

// The hashes visited in this tab, so a back button can tell whether there is somewhere to go back to.
const trail = [];
let replacing = false;

/** Goes to a hash. { replace: true } replaces the current history entry instead of adding one. */
export function navigate(hash, { replace = false } = {}) {
  if (location.hash === hash || (!location.hash && hash === '#/')) return route();
  if (replace) { replacing = true; location.replace(hash); } else location.hash = hash;
}
/** True when this tab has an earlier page of the app to go back to. */
export const canGoBack = () => trail.length > 1;
/** Back in history when there is history, otherwise to fallback (Home by default), replacing this entry. */
export function goBack(fallback = '#/') {
  if (canGoBack()) history.back();
  else navigate(fallback, { replace: true });
}
/**
 * Finishes a pick (a station for From → To): goes back to the page the pick was
 * opened from and replaces it with hash, so history holds the updated page once. Without history it
 * simply replaces this entry with hash.
 */
let pendingReturn = null;
export function returnTo(hash) {
  if (canGoBack()) { pendingReturn = hash; history.back(); }
  else navigate(hash, { replace: true });
}
/** Rewrites the current hash without routing (a search query, a ?stop= that has been applied). */
export function replaceHash(hash) {
  if (location.hash === hash) return;
  history.replaceState(history.state, '', hash);
  if (trail.length) trail[trail.length - 1] = hash;
}
// Back buttons in the screens are links to a fallback; with history they go back instead.
document.addEventListener('click', e => {
  const a = e.target.closest?.('a.p-screen__back, a.p-pageheader__back');
  if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (canGoBack()) { e.preventDefault(); history.back(); }
});

const VIEWS = { home, search, trip, train, station };
let current = null;
function route() {
  const hash = location.hash || '#/';
  const { view, params, legacy } = parse(hash);
  if (legacy) return navigate(legacy, { replace: true });
  if (pendingReturn) {
    // Landed back on the page a pick was opened from: replace it with the updated page, without mounting it.
    if (trail.length > 1 && trail[trail.length - 2] === hash) trail.pop();
    const next = pendingReturn;
    pendingReturn = null;
    return navigate(next, { replace: true });
  }
  if (replacing) { replacing = false; trail[trail.length ? trail.length - 1 : 0] = hash; }
  else if (trail.length > 1 && trail[trail.length - 2] === hash) trail.pop();
  else if (trail[trail.length - 1] !== hash) trail.push(hash);
  current?.view.unmount?.();
  map.onUserMove(() => {});
  map.onStationClick(() => {});
  map.onTrainClick(() => {});
  current = { name: view, view: VIEWS[view], params };
  freshNext = true;
  current.view.mount(params);
}

// ---- Start.
async function start() {
  const [trains, stations] = await Promise.all([api('/api/trains'), api('/api/stations')]);
  state.trains = trains.map(trainInfo).sort((a, b) => a.number - b.number);
  state.byNumber = new Map(state.trains.map(i => [i.number, i]));
  state.stations = stations.map(s => ({
    ...s,
    search: [s.name, s.nameUr, s.city].join(' ').toLowerCase(),
  }));
  state.stationById = new Map(state.stations.map(s => [s.id, s]));
  for (const i of state.trains) i.search += ` ${[i.fromId, i.toId].map(id => state.stationById.get(id)?.nameUr ?? '').join(' ')}`;
  await poll();
  route();
}

addEventListener('hashchange', route);
// The service worker (push alerts) registers after the first paint and never blocks it.
addEventListener('load', () => setTimeout(() => registerWorker().catch(() => {}), 0));
wide.addEventListener('change', () => { freshNext = true; current?.view.render?.(); });
start().catch(e => {
  console.error(e);
  root.textContent = t('loadFailed');
  setTimeout(() => location.reload(), 8000);
});
