// Home: every running train on the map, coloured by delay, with a filterable list.
import { t, esc, bdi, delayTone, delayText } from '../i18n.js';
import { trainName } from '../names.js';
import { state, navigate, openTrainPicker, stationLabel } from '../app.js';
import * as map from '../map.js';
import { badge, delayPill, dotColor, icon } from '../ui.js';

const $ = s => document.querySelector(s);
let filter = 'all', sort = 'least', timer = 0, pending = false;

function running() {
  return [...state.runs.values()].filter(r => !r.suspect && state.byNumber.has(r.train) && Date.now() - r.updatedAt < 3 * 3600e3);
}

function where(run, info) {
  const prev = stationLabel(run.prevStation), next = stationLabel(run.nextStation);
  if (run.speed <= 3 && run.prevStation === info.fromId) return t('notDepartedAt', { station: prev });
  if (run.speed <= 3 && prev) return t('stoppedAt', { station: prev });
  return [prev, next].filter(Boolean).join(' ➜ ');
}

function rowsHTML(runs) {
  const list = runs.filter(r => filter === 'all' || delayTone(r.lateBy) === filter);
  list.sort((a, b) => (sort === 'least' ? a.lateBy - b.lateBy : sort === 'most' ? b.lateBy - a.lateBy : a.train - b.train));
  return list.map(r => {
    const info = state.byNumber.get(r.train);
    const speed = r.speed > 3 ? t('kmh', { n: r.speed }) : t(r.prevStation === info.fromId ? 'waiting' : 'stopped');
    return `<a class="run-row" href="#/train/${r.train}?run=${r.id}">
      ${badge(info, 'sm')}
      <span class="opt-info"><b>${esc(trainName(info))}</b><span class="opt-sub">${esc(where(r, info))}</span></span>
      <span class="run-side">${delayPill(r.lateBy)}<span class="opt-sub">${esc(speed)}</span></span>
    </a>`;
  }).join('');
}

function render() {
  const runs = running();
  const counts = { all: runs.length, ontime: 0, late: 0, vlate: 0 };
  runs.forEach(r => counts[delayTone(r.lateBy)]++);
  const chip = (id, label, color) => `<button type="button" class="filter ${filter === id ? 'on' : ''}" data-filter="${id}" aria-pressed="${filter === id}">${color ? `<span class="dot" style="background:${color}"></span>` : ''}${esc(label)} ${bdi(counts[id])}</button>`;
  $('#view').innerHTML = `
    <div class="pad">
      <button type="button" class="find-btn" id="findTrain">
        <span class="find-ico">${icon.search}</span>
        <span class="opt-info"><b>${esc(t('findTrain'))}</b><span class="opt-sub">${esc(t('findTrainSub', { n: state.trains.length }))}</span></span>
      </button>
    </div>
    <div class="section-head">
      <h2>${esc(t('runningNow', { n: runs.length }))}</h2>
      <label class="sort"><span class="sr">Sort</span><select id="sort">
        <option value="least" ${sort === 'least' ? 'selected' : ''}>${esc(t('sortLeast'))}</option>
        <option value="most" ${sort === 'most' ? 'selected' : ''}>${esc(t('sortMost'))}</option>
        <option value="number" ${sort === 'number' ? 'selected' : ''}>${esc(t('sortNumber'))}</option>
      </select></label>
    </div>
    <div class="filters" role="group">
      ${chip('all', t('all'))}${chip('ontime', t('onTime'), '#1fa35b')}${chip('late', t('underHour'), '#ffb000')}${chip('vlate', t('overHour'), '#e63946')}
    </div>
    <div class="run-list" id="runList">${rowsHTML(runs)}</div>`;
  $('#mapLegend').innerHTML = `
    <b>${esc(t('legendTitle', { n: runs.length }))}</b>
    <span><span class="dot" style="background:#1fa35b"></span>${esc(t('legendOnTime'))}</span>
    <span><span class="dot" style="background:#ffb000"></span>${esc(t('underHour'))}</span>
    <span><span class="dot" style="background:#e63946"></span>${esc(t('overHour'))}</span>`;
  drawDots(runs);
}

function drawDots(runs) {
  map.setDots(runs.map(r => {
    const info = state.byNumber.get(r.train);
    return {
      lat: r.lat, lon: r.lon, color: dotColor(r.lateBy), key: `${r.train}|${r.id}`,
      html: `<b>${esc(trainName(info))} ${esc(info.label)}</b><br>${esc(delayText(r.lateBy))} · ${r.speed > 3 ? esc(t('kmh', { n: r.speed })) : esc(t('stopped'))}`,
    };
  }));
}

// Live updates: refresh the list, counts and legend in place (a full render would close an open menu).
function refresh() {
  if (timer) { pending = true; return; }
  const runs = running();
  const list = $('#runList');
  if (list) list.innerHTML = rowsHTML(runs);
  const counts = { all: runs.length, ontime: 0, late: 0, vlate: 0 };
  runs.forEach(r => counts[delayTone(r.lateBy)]++);
  document.querySelectorAll('[data-filter] bdi').forEach(b => { b.textContent = counts[b.closest('[data-filter]').dataset.filter]; });
  const h2 = $('#view .section-head h2');
  if (h2) h2.textContent = t('runningNow', { n: runs.length });
  const legend = $('#mapLegend b');
  if (legend) legend.textContent = t('legendTitle', { n: runs.length });
  drawDots(runs);
  timer = setTimeout(() => { timer = 0; if (pending) { pending = false; refresh(); } }, 2000);
}

function onClick(e) {
  if (e.target.closest('#findTrain')) openTrainPicker(e.target.closest('#findTrain'));
  const f = e.target.closest('[data-filter]');
  if (f) { filter = f.dataset.filter; render(); }
}
function onChange(e) {
  if (e.target.id === 'sort') { sort = e.target.value; refresh(); }
}

export default {
  mount() {
    $('#mapLegend').hidden = false;
    map.clearRoute();
    map.setPins([]);
    map.setTrain(null);
    map.onDotClick(key => { const [num, run] = key.split('|'); navigate(`#/train/${num}?run=${run}`); });
    map.fitPakistan();
    $('#view').addEventListener('click', onClick);
    $('#view').addEventListener('change', onChange);
    render();
  },
  update() { refresh(); },
  unmount() {
    $('#view').removeEventListener('click', onClick);
    $('#view').removeEventListener('change', onChange);
    $('#mapLegend').hidden = true;
    map.setDots([]);
    clearTimeout(timer);
    timer = 0;
  },
};
