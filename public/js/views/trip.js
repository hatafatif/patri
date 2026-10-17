// Trip planner: direct trains between two stations, with journey length and today's live status.
import { t, esc, bdi, clockMin, dur, delayText, delayTone } from '../i18n.js';
import { trainName, stationName } from '../names.js';
import { state, api, navigate, openStationPicker } from '../app.js';
import * as map from '../map.js';
import { chipBadge, icon } from '../ui.js';

const $ = s => document.querySelector(s);
const phone = () => matchMedia('(max-width: 800px)').matches;
const routes = new Map();
let v = null;

const saved = () => { try { return JSON.parse(localStorage.getItem('lastTrip')) || {}; } catch { return {}; } };
const label = id => { const s = state.stationById.get(id); return s ? stationName(s.name, s.nameUr) : ''; };

function todayHTML(r) {
  if (r.runId != null && r.late != null) {
    const text = Math.abs(r.late) < 1 ? t('todayOnTime') : t('todayRunning', { d: delayText(r.late) });
    return `<span class="pill t-${delayTone(r.late)}">${esc(text)}</span>`;
  }
  if (r.leavesIn != null && r.leavesIn < 12 * 60) return `<span class="pill t-royal">${esc(t('leavesIn', { d: dur(r.leavesIn) }))}${r.gps ? '' : ` · ${esc(t('tagNoGps'))}`}</span>`;
  return `<span class="pill t-none">${esc(t(r.gps ? 'liveTracking' : 'tagNoGps'))}</span>`;
}

function cardHTML(r, fastest) {
  const info = state.byNumber.get(r.number);
  const days = Math.floor(r.arr / 1440);
  return `<li><a class="trip-card ${r.number === v.focus ? 'focus' : ''}" data-train="${r.number}" href="#/train/${r.number}?stop=${encodeURIComponent(r.passedFrom ? v.to : v.from)}${r.runId ? `&run=${r.runId}` : ''}">
    ${r.duration === fastest ? `<span class="fastest">${esc(t('fastest'))}</span>` : ''}
    <span class="trip-times"><b>${bdi(clockMin(r.dep))}</b><span class="trip-line"><span></span>${esc(dur(r.duration))}<span></span></span><b>${bdi(clockMin(r.arr))}${days ? `<sup>+${days}</sup>` : ''}</b></span>
    <span class="board-name">${chipBadge(info)}<b>${esc(trainName(info))}</b><span class="opt-sub">· ${esc(t('stopsBetween', { n: r.stopsBetween }))}</span></span>
    ${todayHTML(r)}
  </a></li>`;
}

function render() {
  if (!v) return;
  const field = (which, id) => `<button type="button" class="trip-field" data-field="${which}">
      <span class="trip-label">${esc(t(which))}</span><b>${esc(id ? label(id) : t('chooseStation'))}</b></button>`;
  const rows = [...(v.result?.rows || [])];
  if (v.sort === 'fast') rows.sort((a, b) => a.duration - b.duration);
  const fastest = rows.length ? Math.min(...rows.map(r => r.duration)) : null;
  let list;
  if (!v.from || !v.to) list = `<p class="note">${esc(t('pickBoth'))}</p>`;
  else if (!v.result) list = `<p class="note">${esc(t('loading'))}</p>`;
  else if (!rows.length) list = `<p class="note">${esc(t('noTrips'))}</p>`;
  else list = `<div class="section-head"><h2>${esc(t('tripsCount', { n: rows.length }))}</h2>
      <label class="sort"><select id="tripSort">
        <option value="dep" ${v.sort === 'dep' ? 'selected' : ''}>${esc(t('byDeparture'))}</option>
        <option value="fast" ${v.sort === 'fast' ? 'selected' : ''}>${esc(t('fastestFirst'))}</option>
      </select></label></div>
    <ul class="trips">${rows.map(r => cardHTML(r, fastest)).join('')}</ul>`;
  $('#view').innerHTML = `
    <div class="pad">
      <section class="framed"><div class="framed-in trip-form">
        <div class="trip-fields">${field('from', v.from)}${field('to', v.to)}</div>
        <button type="button" class="round-btn saffron big" data-swap aria-label="${esc(t('swap'))}">${icon.swap}</button>
      </div></section>
    </div>
    <div class="pad-x">${list}</div>`;
}

async function showRoute(number) {
  if (!v || !v.from || !v.to) return;
  v.focus = number;
  document.querySelectorAll('.trip-card').forEach(c => c.classList.toggle('focus', Number(c.dataset.train) === number));
  if (!routes.has(number)) routes.set(number, await api(`/api/route?train=${number}`));
  if (!v || v.focus !== number) return;
  const stops = routes.get(number);
  const a = stops.findIndex(s => s.id === v.from), b = stops.findIndex(s => s.id === v.to);
  const part = stops.slice(a, b + 1);
  map.setRoute(part, part.length - 1, null);
  const from = state.stationById.get(v.from), to = state.stationById.get(v.to);
  map.setPins([from, to].filter(s => s?.lat).map((s, i) => ({ kind: 'end', lat: s.lat, lon: s.lon, label: `${t(i ? 'to' : 'from')} · ${stationName(s.name, s.nameUr)}` })));
}

async function load() {
  if (!v.from || !v.to) {
    map.clearRoute();
    const s = state.stationById.get(v.from || v.to);
    map.setPins(s?.lat ? [{ kind: 'end', lat: s.lat, lon: s.lon, label: stationName(s.name, s.nameUr) }] : []);
    return render();
  }
  try { localStorage.setItem('lastTrip', JSON.stringify({ from: v.from, to: v.to })); } catch {}
  render();
  const key = `${v.from}>${v.to}`;
  const result = await api(`/api/trip?from=${encodeURIComponent(v.from)}&to=${encodeURIComponent(v.to)}`).catch(() => ({ rows: [] }));
  if (!v || `${v.from}>${v.to}` !== key) return;
  v.result = result;
  render();
  const from = state.stationById.get(v.from), to = state.stationById.get(v.to);
  map.fitTo([from, to], phone() ? { top: 40, bottom: 40, left: 40, right: 120 } : { top: 80, bottom: 80, left: 90, right: 220 });
  if (result.rows.length) showRoute(result.rows[0].number);
  else map.setPins([from, to].filter(s => s?.lat).map((s, i) => ({ kind: 'end', lat: s.lat, lon: s.lon, label: `${t(i ? 'to' : 'from')} · ${stationName(s.name, s.nameUr)}` })));
}

const go = () => navigate(`#/trip/${v.from || ''}${v.to ? `/${v.to}` : ''}`.replace(/\/$/, ''));

function onClick(e) {
  const f = e.target.closest('[data-field]');
  if (f) {
    const which = f.dataset.field;
    return openStationPicker(f, v[which], s => { v[which] = s.id; go(); }, t(which));
  }
  if (e.target.closest('[data-swap]')) { [v.from, v.to] = [v.to, v.from]; return go(); }
}
function onOver(e) {
  const c = e.target.closest('.trip-card');
  if (c && Number(c.dataset.train) !== v.focus) showRoute(Number(c.dataset.train));
}
function onChange(e) {
  if (e.target.id === 'tripSort') { v.sort = e.target.value; render(); }
}

export default {
  mount(params) {
    const last = saved();
    if (!params.from && !params.to && last.from && last.to) return navigate(`#/trip/${last.from}/${last.to}`);
    v = { from: params.from, to: params.to, sort: 'dep', result: null, focus: null };
    $('#view').addEventListener('click', onClick);
    $('#view').addEventListener('pointerover', onOver);
    $('#view').addEventListener('change', onChange);
    map.setDots([]);
    map.setTrain(null);
    load();
  },
  unmount() {
    $('#view').removeEventListener('click', onClick);
    $('#view').removeEventListener('pointerover', onOver);
    $('#view').removeEventListener('change', onChange);
    map.clearRoute();
    map.setPins([]);
    v = null;
  },
};
