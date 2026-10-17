// Station board: trains due in the next five hours with live times, and approaching trains on the map.
import { t, esc, bdi, clockMin, dur, delayText } from '../i18n.js';
import { trainInfo, trainName, stationName } from '../names.js';
import { state, api, navigate, openStationPicker, stationLabel } from '../app.js';
import { openShare } from '../share.js';
import * as map from '../map.js';
import { chipBadge, delayPill, dotColor, icon } from '../ui.js';

const $ = s => document.querySelector(s);
const phone = () => matchMedia('(max-width: 800px)').matches;
let v = null, refreshTimer = 0, dotTimer = 0;

function lastStation() {
  try { return localStorage.getItem('lastStation'); } catch { return null; }
}

function rowHTML(r) {
  const info = state.byNumber.get(r.number) || trainInfo(r);
  const live = r.runId != null;
  const time = clockMin(r.est);
  const schedChanged = live && Math.abs(r.est - r.sched) >= 1;
  const other = r.kind === 'starts' ? stationName(r.dest, r.destUr) : stationName(r.origin, r.originUr);
  const routeText = r.kind === 'starts' ? t('departsTo', { x: other }) : r.kind === 'ends' ? t('arrivesFrom', { x: other })
    : t('passesFromTo', { a: stationName(r.origin, r.originUr), b: stationName(r.dest, r.destUr) });
  let note;
  if (r.atPlatform) note = r.kind === 'ends' ? t('atPlatform') : `${t('atPlatform')} · ${t('leavingNow')}`;
  else if (live && r.kmAway != null) note = `${t('kmAway', { km: r.kmAway })} · ${t('inTime', { d: dur(r.est - v.board.now) })}`;
  else if (!r.gps) note = t('trainNoGps');
  else if (r.kind === 'starts') note = t('startsHere');
  else note = t('noLivePos');
  return `<a class="board-row ${live ? '' : 'timetable'}" href="#/train/${r.number}?stop=${encodeURIComponent(v.id)}${r.runId ? `&run=${r.runId}` : ''}">
    <span class="board-time"><b>${bdi((live && !r.atPlatform && schedChanged ? '~' : '') + time)}</b>${schedChanged ? `<s>${bdi(clockMin(r.sched))}</s>` : ''}</span>
    <span class="opt-info">
      <span class="board-name">${chipBadge(info)}<b>${esc(trainName(info))}</b></span>
      <span class="opt-sub teal">${esc(routeText)}</span>
      <span class="opt-sub">${esc(note)}</span>
    </span>
    ${delayPill(r.late, phone())}
  </a>`;
}

function render() {
  if (!v) return;
  const st = v.id ? state.stationById.get(v.id) : null;
  if (!st) {
    $('#view').innerHTML = `<div class="pad"><section class="prompt-card">
      <span class="prompt-ico">${icon.station}</span>
      <span class="opt-info"><b>${esc(t('chooseStation'))}</b></span>
      <button type="button" class="btn royal" data-pick-station>${esc(t('chooseStation'))}</button>
    </section></div>`;
    $('#mapLegend').hidden = true;
    return;
  }
  const rows = (v.board?.rows || []).filter(r => v.filter === 'all' || (v.filter === 'arr' ? r.kind !== 'starts' : r.kind !== 'ends'));
  const seg = (id, label) => `<button type="button" data-filter="${id}" aria-pressed="${v.filter === id}" class="${v.filter === id ? 'on' : ''}">${esc(label)}</button>`;
  $('#view').innerHTML = `
    <div class="pad">
      <div class="train-head">
        <span class="badge badge-lg station">${icon.station}</span>
        <button type="button" class="title-btn" data-pick-station>
          <b>${esc(stationName(st.name, st.nameUr))} ${icon.chevron}</b>
          <span class="opt-sub teal">${v.board ? esc(t('trainsNext', { n: v.board.rows.length })) : esc(t('loading'))}</span>
        </button>
        <button type="button" class="round-btn saffron" id="shareBtn" aria-label="${esc(t('share'))}">${icon.share}</button>
      </div>
      <div class="seg-row">
        <div class="segmented" role="group">${seg('all', t('all'))}${seg('arr', t('arriving'))}${seg('dep', t('departing'))}</div>
        ${v.board ? `<span class="opt-sub">${esc(t('nowAt', { time: clockMin(v.board.now) }))}</span>` : ''}
      </div>
    </div>
    <div class="board">${v.board ? rows.map(rowHTML).join('') || `<p class="note">${esc(t('noTrainsSoon'))}</p>` : `<p class="note">${esc(t('loading'))}</p>`}</div>`;
  drawMap(false);
}

function approaching() {
  return (v.board?.rows || []).filter(r => r.runId && !r.atPlatform).map(r => ({ r, run: state.runs.get(r.runId) })).filter(x => x.run);
}

function drawMap(fit) {
  const st = state.stationById.get(v.id);
  if (!st) return;
  const near = approaching();
  map.setPins(st.lat ? [{ kind: 'station', lat: st.lat, lon: st.lon, label: stationName(st.name, st.nameUr) }] : []);
  map.setDots(near.map(({ r, run }) => {
    const info = state.byNumber.get(r.number);
    return {
      lat: run.lat, lon: run.lon, color: dotColor(r.late), key: `${r.number}|${r.runId}`,
      html: `<b>${esc(trainName(info))} ${esc(info.label)}</b><br>${esc(t('kmAway', { km: r.kmAway ?? '?' }))} · ${esc(delayText(r.late))}`,
    };
  }));
  $('#mapLegend').hidden = !near.length;
  $('#mapLegend').innerHTML = `<b>${esc(t('headingTo', { n: near.length, station: stationName(st.name, st.nameUr) }))}</b>
    <span><span class="dot" style="background:#1fa35b"></span>${esc(t('onTime'))}</span>
    <span><span class="dot" style="background:#ffb000"></span>${esc(t('underHour'))}</span>
    <span><span class="dot" style="background:#e63946"></span>${esc(t('overHour'))}</span>`;
  if (fit && st.lat) {
    const pts = [st, ...near.map(x => x.run)];
    if (pts.length > 1) map.fitTo(pts, phone() ? 40 : { top: 90, bottom: 90, left: 90, right: 200 });
    else map.fitTo([{ lat: st.lat - 0.3, lon: st.lon - 0.3 }, { lat: st.lat + 0.3, lon: st.lon + 0.3 }], 40);
  }
}

async function load(fit) {
  if (!v?.id) return;
  const id = v.id;
  const board = await api(`/api/board?station=${encodeURIComponent(id)}`).catch(() => null);
  if (!v || v.id !== id) return;
  v.board = board;
  render();
  if (fit) drawMap(true);
}

function onClick(e) {
  const pick = e.target.closest('[data-pick-station]');
  if (pick) return openStationPicker(pick, v.id, s => navigate(`#/station/${s.id}`));
  const f = e.target.closest('[data-filter]');
  if (f) { v.filter = f.dataset.filter; return render(); }
  if (e.target.closest('#shareBtn')) {
    const st = state.stationById.get(v.id);
    const url = `${location.origin}/#/station/${v.id}`;
    openShare({ anchor: e.target.closest('#shareBtn'), title: t('shareTitle', { name: stationLabel(v.id) }), url: () => url, message: () => t('shareStation', { station: stationName(st.name, st.nameUr), url }) });
  }
}

export default {
  mount(params) {
    const id = params.id || lastStation();
    if (!params.id && id) return navigate(`#/station/${id}`);
    try { if (id) localStorage.setItem('lastStation', id); } catch {}
    v = { id, filter: 'all', board: null };
    $('#view').addEventListener('click', onClick);
    map.clearRoute();
    map.setTrain(null);
    map.onDotClick(key => { const [num, run] = key.split('|'); navigate(`#/train/${num}?stop=${encodeURIComponent(v.id)}&run=${run}`); });
    render();
    load(true);
    refreshTimer = setInterval(() => load(false), 30e3);
  },
  update() {
    if (!v?.board || dotTimer) return;
    dotTimer = setTimeout(() => { dotTimer = 0; if (v) drawMap(false); }, 2000);
  },
  unmount() {
    $('#view').removeEventListener('click', onClick);
    clearInterval(refreshTimer);
    clearTimeout(dotTimer);
    dotTimer = 0;
    $('#mapLegend').hidden = true;
    map.setDots([]);
    map.setPins([]);
    v = null;
  },
};
