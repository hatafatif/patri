// App shell: data loading, the live feed, routing between views, language and the pickers.
import { t, esc, bdi, applyLang, setLang, getLang, clockMin, dur } from './i18n.js';
import { trainInfo, trainName, stationName } from './names.js';
import { openPicker, highlight } from './picker.js';
import * as map from './map.js';
import { badge, icon } from './ui.js';
import home from './views/home.js';
import train from './views/train.js';
import station from './views/station.js';
import trip from './views/trip.js';

const $ = s => document.querySelector(s);

export const state = {
  trains: [], byNumber: new Map(),
  stations: [], stationById: new Map(),
  runs: new Map(),
  connected: false,
};

async function getJSON(url) {
  for (;;) {
    const res = await fetch(url);
    if (res.status === 503) { await new Promise(r => setTimeout(r, 2000)); continue; }
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || res.statusText);
    return body;
  }
}
export const api = getJSON;

// ---- your stop, remembered per train
export function getStop(number) {
  try { return localStorage.getItem(`stop:${number}`); } catch { return null; }
}
export function setStop(number, id) {
  try { id ? localStorage.setItem(`stop:${number}`, id) : localStorage.removeItem(`stop:${number}`); } catch {}
}

export const navigate = hash => { if (location.hash !== hash) location.hash = hash; else route(); };
export const stationLabel = id => {
  const s = state.stationById.get(String(id));
  return s ? stationName(s.name, s.nameUr) : '';
};

// ---- pickers
export function openTrainPicker(anchor, selected) {
  const live = state.trains.filter(i => i.live), other = state.trains.filter(i => !i.live);
  openPicker({
    anchor,
    placeholder: t('searchTrains'),
    groups: [{ title: t('groupLive'), items: live }, { title: t('groupTimetable'), items: other }],
    key: i => i.number,
    selectedKey: selected,
    search: i => i.search,
    render: (i, tokens) => {
      const from = stationLabel(i.fromId) || i.from, to = i.to && (stationLabel(i.toId) || i.to);
      return `
      ${badge(i, 'sm')}
      <span class="opt-info">
        <b>${highlight(trainName(i), tokens)}</b>
        <span class="opt-route">${highlight(from, tokens)}${to ? ` <span class="arrow">➜</span> ${highlight(to, tokens)}` : ''}</span>
        ${i.departs != null ? `<span class="opt-sub">${bdi(clockMin(i.departs))} ➜ ${bdi(clockMin(i.arrives))}${i.arrives >= 1440 ? `<sup>+${Math.floor(i.arrives / 1440)}</sup>` : ''} · ${esc(dur(i.arrives - i.departs))}</span>` : ''}
      </span>
      <span class="pill ${i.live ? 't-live' : 't-none'}">${esc(t(i.live ? 'tagLive' : 'tagNoGps'))}</span>`;
    },
    onPick: i => navigate(`#/train/${i.number}`),
  });
}

export function openStationPicker(anchor, selected, onPick, title) {
  const list = [...state.stations].sort((a, b) => b.trainCount - a.trainCount || a.label.localeCompare(b.label));
  openPicker({
    anchor,
    title,
    placeholder: t('searchStations'),
    groups: [{ title: '', items: list }],
    key: s => s.id,
    selectedKey: selected,
    search: s => s.search,
    render: (s, tokens) => `
      <span class="station-ico">${icon.station}</span>
      <span class="opt-info"><b>${highlight(stationName(s.name, s.nameUr), tokens)}</b><span class="opt-sub">${highlight(s.cityLabel, tokens)}</span></span>
      <span class="opt-count">${bdi(s.trainCount)}</span>`,
    onPick,
  });
}

// ---- shell
function renderShell() {
  $('#appTitle').textContent = t('appTitle');
  document.title = t('appTitle');
  $('#tabs').innerHTML = [
    ['trains', '#/', icon.train, t('tabTrains')],
    ['stations', '#/station', icon.station, t('tabStations')],
    ['trip', '#/trip', icon.trip, t('tabTrip')],
  ].map(([id, href, ico, label]) => `<a href="${href}" data-tab="${id}">${ico}<span>${esc(label)}</span></a>`).join('');
  $('#lang').innerHTML = `
    <button type="button" data-lang="en" aria-pressed="${getLang() === 'en'}">EN</button>
    <button type="button" data-lang="ur" lang="ur" aria-pressed="${getLang() === 'ur'}">اردو</button>`;
  $('#lang').setAttribute('aria-label', t('language'));
  $('#mapTools').innerHTML = map.zoomControls();
  setConn(state.connected);
}

function setConn(on) {
  state.connected = on;
  const el = $('#conn');
  el.className = `conn ${on ? 'on' : ''}`;
  el.textContent = t(on ? 'live' : 'reconnecting');
}

// ---- live feed
let feed;
function connectFeed() {
  feed = new EventSource('/api/live');
  feed.addEventListener('status', e => setConn(JSON.parse(e.data).connected));
  feed.addEventListener('snapshot', e => {
    state.runs = new Map(JSON.parse(e.data).map(r => [r.id, r]));
    current?.view.update?.(null);
  });
  feed.addEventListener('position', e => {
    const run = JSON.parse(e.data);
    state.runs.set(run.id, run);
    current?.view.update?.(run);
  });
  feed.onerror = () => setConn(false);
}

// ---- routing: #/  #/train/27?stop=116  #/station/108  #/trip/129/108
let current = null;
function parse() {
  const h = location.hash.replace(/^#/, '');
  if (/^\d+$/.test(h)) return { view: 'train', params: { number: Number(h) } }; // links from the old app
  const [path, query] = h.split('?');
  const parts = path.split('/').filter(Boolean);
  const q = new URLSearchParams(query || '');
  if (parts[0] === 'train' && parts[1]) return { view: 'train', params: { number: Number(parts[1]), stop: q.get('stop'), run: q.get('run') } };
  if (parts[0] === 'station') return { view: 'station', params: { id: parts[1] || null } };
  if (parts[0] === 'trip') return { view: 'trip', params: { from: parts[1] || null, to: parts[2] || null } };
  return { view: 'home', params: {} };
}

const VIEWS = { home, train, station, trip };
export function route() {
  const { view, params } = parse();
  if (current) current.view.unmount?.();
  document.body.dataset.view = view;
  document.querySelectorAll('#tabs a').forEach(a => a.setAttribute('aria-current', String(a.dataset.tab === (view === 'train' || view === 'home' ? 'trains' : view))));
  current = { view: VIEWS[view], params };
  current.view.mount(params);
  $('#view').scrollTop = 0;
}

// ---- start
async function start() {
  applyLang();
  renderShell();
  const ready = map.initMap($('#map'));
  const [trains, stations] = await Promise.all([api('/api/trains'), api('/api/stations')]);
  state.trains = trains.map(trainInfo).sort((a, b) => a.number - b.number);
  state.byNumber = new Map(state.trains.map(i => [i.number, i]));
  state.stations = stations.map(s => ({
    ...s,
    get label() { return stationName(s.name, s.nameUr); },
    get cityLabel() { return stationName(s.city, ''); },
    search: [s.name, s.nameUr, s.city].join(' ').toLowerCase(),
  }));
  state.stationById = new Map(state.stations.map(s => [s.id, s]));
  for (const i of state.trains) i.search += ` ${[i.fromId, i.toId].map(id => state.stationById.get(id)?.nameUr ?? '').join(' ')}`;
  await ready;
  connectFeed();
  route();
}

$('#lang').addEventListener('click', e => {
  const b = e.target.closest('[data-lang]');
  if (!b || b.dataset.lang === getLang()) return;
  setLang(b.dataset.lang);
  renderShell();
  route();
});
$('#mapTools').addEventListener('click', async e => {
  const z = e.target.closest('[data-zoom]');
  if (z) (z.dataset.zoom === 'in' ? map.zoomIn : map.zoomOut)();
  const menuBtn = e.target.closest('[data-style-menu]');
  const menu = $('#mapTools .style-menu');
  if (menuBtn) {
    menu.hidden = !menu.hidden;
    menuBtn.setAttribute('aria-expanded', String(!menu.hidden));
  }
  const s = e.target.closest('[data-style]');
  if (s) {
    await map.setBaseStyle(s.dataset.style);
    $('#mapTools').innerHTML = map.zoomControls();
  }
});
document.addEventListener('pointerdown', e => {
  const menu = $('#mapTools .style-menu');
  if (menu && !menu.hidden && !e.target.closest('.style-switch')) menu.hidden = true;
});
addEventListener('hashchange', route);
addEventListener('resize', () => map.resize());
start().catch(e => {
  $('#view').innerHTML = `<p class="note err">${esc(e.message)}</p>`;
});
