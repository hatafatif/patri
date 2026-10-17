// Following a train: status, your-stop countdown, stops with ETAs, speed chart, trail and share.
import { t, esc, bdi, clock, dur, ago, delayText, monthName, pktMidnight, isUrdu } from '../i18n.js';
import { trainName, stationName } from '../names.js';
import { state, api, openTrainPicker, getStop, setStop, stationLabel } from '../app.js';
import { openPicker } from '../picker.js';
import { openShare } from '../share.js';
import { estimates, status, progress } from '../eta.js';
import { chartHTML, bindChart } from '../chart.js';
import * as map from '../map.js';
import { badge, delayPill, icon } from '../ui.js';

const $ = s => document.querySelector(s);
const phone = () => matchMedia('(max-width: 800px)').matches;
let v = null; // per-mount state
let ticker = 0, renderTimer = 0;

const stopLabel = s => stationName(s.name, s.nameUr);

function runsOfTrain() {
  return [...state.runs.values()].filter(r => r.train === v.number).sort((a, b) => b.date - a.date);
}

function runLabel(run) {
  const d = new Date(run.date + 5 * 3600e3);
  return t('departedOn', { day: d.getUTCDate(), month: monthName(d.getUTCMonth()) });
}

function statusHTML(st, run) {
  const chip = (cls, ico, text) => `<span class="pill ${cls}">${ico}${esc(text)}</span>`;
  const between = (a, b) => (a && b ? `${stopLabel(a)} ➜ ${stopLabel(b)}` : '');
  let main, sub = '';
  if (st.kind === 'run') { main = chip('t-ontime pulse-chip', '<span class="live-dot"></span>', t('stRunningShort', { speed: st.speed })); sub = between(st.from, st.to); }
  else if (st.kind === 'stopAt') { main = chip('t-late', icon.stop, t('stStoppedAt', { station: stopLabel(st.station) })); sub = st.minutes ? t('stFor', { d: dur(st.minutes) }) : ''; }
  else if (st.kind === 'stopBetween') { main = chip('t-late', icon.stop, t('stStoppedBetween')); sub = [between(st.from, st.to), st.minutes ? t('stFor', { d: dur(st.minutes) }) : ''].filter(Boolean).join(' · '); }
  else if (st.kind === 'wait') { main = chip('t-teal', icon.clock, t('stNotDeparted')); sub = t('stWasDue', { station: stopLabel(st.station), time: clock(st.dueMs) }); }
  else if (st.kind === 'done') { main = chip('t-royal', icon.flag, t('stArrived', { station: stopLabel(st.station) })); }
  else { main = chip('t-vlate', icon.signalOff, t('stLost', { d: dur(st.minutes) })); sub = st.station ? t('stLastSeen', { station: stopLabel(st.station) }) : ''; }
  return `<div class="status">${main}${delayPill(run.lateBy)}<span class="status-sub">${esc(sub)}${sub ? ' · ' : ''}<span data-ago>${esc(ago(run.updatedAt))}</span></span></div>`;
}

function myStopHTML(run, ests) {
  const idx = v.stops.findIndex(s => s.id === v.myStop);
  if (idx < 0) {
    return `<section class="prompt-card">
      <span class="prompt-ico">${icon.pin}</span>
      <span class="opt-info"><b>${esc(t('promptStop'))}</b><span class="opt-sub">${esc(t('promptStopSub'))}</span></span>
      <button type="button" class="btn royal" data-pick-stop>${esc(t('chooseStop'))}</button>
    </section>`;
  }
  const s = v.stops[idx];
  const e = ests?.[idx];
  let big, sub;
  if (!run || !e) {
    const sched = s.arr ?? s.dep;
    big = sched != null ? clock(pktMidnight() + sched * 60e3) : '';
    sub = esc(t('timetable'));
  } else if (e.passed) {
    big = '';
    sub = esc(t('passedYourStop', { time: clock(e.passedMs ?? e.schedMs + run.lateBy * 60e3) }));
  } else {
    big = dur((e.estMs - Date.now()) / 60e3);
    sub = esc([t('arrivesAt', { time: clock(e.estMs) }), e.km != null && t('kmToGo', { km: Math.round(e.km) })].filter(Boolean).join(' · '));
  }
  return `<section class="framed" aria-label="${esc(t('yourStop'))}"><div class="framed-in">
    <span class="framed-head"><span>${esc(t('yourStop'))} · <b class="saffron">${esc(stopLabel(s))}</b></span><button type="button" class="link-btn light" data-pick-stop>${esc(t('change'))}</button></span>
    ${big ? `<b class="countdown">${esc(big)}</b>` : ''}
    <span class="framed-sub">${sub}</span>
  </div></section>`;
}

function stopsHTML(run, ests) {
  const p = run ? progress(v.stops, run) : { passedIdx: -1 };
  const hidden = v.showEarlier ? 0 : Math.max(0, p.passedIdx - 1);
  const rows = [];
  v.stops.forEach((s, i) => {
    if (i < hidden) return;
    const e = ests?.[i];
    const sched = s.arr ?? s.dep;
    if (sched == null) return;
    const schedMs = (run ? run.date : pktMidnight()) + sched * 60e3;
    const cls = [e?.passed ? 'passed' : '', run && i === p.nextIdx ? 'next' : '', s.id === v.myStop ? 'mine' : ''].join(' ');
    let sub = '';
    if (e?.passed) sub = e.passedMs ? t('passedAt', { time: clock(e.passedMs) }) : '';
    else if (run && i === p.nextIdx) sub = [t('nextStop'), e?.km != null && t('km', { n: Math.round(e.km) }), e?.estMs && t('inTime', { d: dur((e.estMs - Date.now()) / 60e3) })].filter(Boolean).join(' · ');
    else if (e?.km != null) sub = t('km', { n: Math.round(e.km) });
    if (i === v.stops.length - 1) sub = [t('lastStop'), sub].filter(Boolean).join(' · ');
    if (s.id === v.myStop) sub = [t('yourStop'), sub].filter(Boolean).join(' · ');
    const showEst = e && !e.passed && e.estMs && Math.abs(e.estMs - schedMs) >= 60e3;
    const how = showEst && e.speed ? t('etaHow', { sched: clock(schedMs), late: dur(run.lateBy), km: Math.round(e.km ?? 0), speed: Math.round(e.speed) }) : '';
    rows.push(`<li class="stop ${cls}">
      <span class="dia" aria-hidden="true"></span>
      <span class="opt-info"><b>${esc(stopLabel(s))}</b>${sub ? `<span class="opt-sub">${esc(sub)}</span>` : ''}
        ${!e?.passed && s.id !== v.myStop ? `<button type="button" class="set-stop" data-set-stop="${esc(s.id)}" aria-label="${esc(t('setMyStop'))}">${icon.pin}<span>${esc(t('setMyStop'))}</span></button>` : ''}</span>
      <span class="stop-time" ${how ? `title="${esc(how)}"` : ''}>
        <b>${bdi((showEst ? '~' : '') + clock(showEst ? e.estMs : e?.passed && e.passedMs ? e.passedMs : schedMs))}</b>
        ${showEst ? `<s>${bdi(clock(schedMs))}</s>` : ''}
      </span>
    </li>`);
    if (run && i === p.passedIdx && i < v.stops.length - 1 && run.speed > 3) {
      rows.push(`<li class="here"><span class="here-mark" aria-hidden="true"></span><span>${esc(t('trainHere', { speed: run.speed }))}</span></li>`);
    }
  });
  return `<div class="section-head"><h2>${esc(t('stopsN', { n: v.stops.length }))}</h2>
      ${p.passedIdx > 1 ? `<button type="button" class="link-btn" data-earlier>${esc(v.showEarlier ? t('hideEarlier') : t('showEarlier', { n: p.passedIdx - 1 }))}</button>` : ''}</div>
    <ol class="stops">${rows.join('')}</ol>`;
}

function render() {
  if (!v) return;
  const info = v.info;
  const all = runsOfTrain();
  const visible = all.filter(r => !r.suspect || v.showSuspect);
  if (!visible.find(r => r.id === v.runId)) v.runId = visible[0]?.id ?? null;
  const run = visible.find(r => r.id === v.runId) || null;
  const ests = run && v.stops.length ? estimates(v.stops, run, v.history.positions, v.history.passes) : null;
  const hiddenCount = all.length - visible.length;

  const header = `<a class="back-link" href="#/"><span class="arrow">←</span> ${esc(t('allTrains'))}</a>
    <div class="train-head">
      ${badge(info, 'lg')}
      <button type="button" class="title-btn" id="pickTrain"><b>${esc(trainName(info))}</b><span class="opt-sub teal">${esc(stationLabel(info.fromId))} <span class="arrow">➜</span> ${esc(stationLabel(info.toId))}</span></button>
      <button type="button" class="round-btn saffron" id="shareBtn" aria-label="${esc(t('share'))}">${icon.share}</button>
    </div>`;
  const runChips = visible.length > 1 ? `<div class="filters">${visible.map(r => `<button type="button" class="filter ${r.id === v.runId ? 'on' : ''}" data-run="${esc(r.id)}">${esc(runLabel(r))}</button>`).join('')}</div>` : '';
  const hiddenNote = hiddenCount ? `<div class="note-dashed">${esc(t('hiddenRuns', { n: hiddenCount }))} <button type="button" class="link-btn" data-suspect>${esc(t('showAnyway'))}</button></div>` : '';
  let body;
  if (!v.stops.length) body = `<p class="note">${esc(t('loading'))}</p>`;
  else if (!run) body = `<p class="note">${esc(t(info.live ? 'noLiveRun' : 'noGpsTrain'))}</p>${myStopHTML(null, null)}${stopsHTML(null, null)}`;
  else body = `${statusHTML(status(v.stops, run, v.history.positions), run)}${myStopHTML(run, ests)}<section class="chart-card">${chartHTML(v.history.positions, v.history.passes, stationLabel)}</section>${stopsHTML(run, ests)}`;
  $('#view').innerHTML = `<div class="pad">${header}${runChips}${hiddenNote}</div><div class="pad-x">${body}</div>`;

  const chart = $('#mapChart');
  chart.hidden = !run || phone();
  if (run) {
    chart.innerHTML = chartHTML(v.history.positions, v.history.passes, stationLabel);
    bindChart(chart, v.history.positions);
    bindChart($('#view'), v.history.positions);
  }
  $('#mapChips').innerHTML = run ? `
    <button type="button" class="map-chip ${v.follow ? 'on' : ''}" data-follow aria-pressed="${v.follow}">${v.follow ? icon.check : ''}${esc(t('following'))}</button>
    <button type="button" class="map-chip ${v.trail ? 'on-light' : ''}" data-trail aria-pressed="${v.trail}"><span class="trail-swatch"></span>${esc(t('trail'))}</button>` : '';
  drawMap(run, false);
}

function drawMap(run, jump) {
  const p = run ? progress(v.stops, run) : { passedIdx: -1 };
  map.setRoute(v.stops, p.passedIdx, run);
  map.setTrain(run, jump);
  map.setTrail(v.trail && run ? v.history.positions.map(x => ({ lat: x[1], lon: x[2] })) : []);
  const mine = v.stops.find(s => s.id === v.myStop);
  map.setPins(mine && mine.lat ? [{ kind: 'stop', lat: mine.lat, lon: mine.lon, label: `${stopLabel(mine)} · ${t('yourStop')}` }] : []);
  if (run && v.follow && !jump) map.panTo(run);
}

function fit() {
  const pad = phone() ? 30 : { top: 80, bottom: 220, left: 80, right: 60 };
  map.fitTo(v.stops, pad, false);
}

function scheduleRender() {
  if (renderTimer) return;
  renderTimer = setTimeout(() => { renderTimer = 0; render(); }, 800);
}

function openStopPicker(anchor) {
  const run = runsOfTrain().find(r => r.id === v.runId);
  const ests = run ? estimates(v.stops, run, v.history.positions, v.history.passes) : null;
  const items = v.stops.map((s, i) => ({ s, i, e: ests?.[i] }));
  const upcoming = items.filter(x => !x.e?.passed), passed = items.filter(x => x.e?.passed);
  openPicker({
    anchor,
    title: t('chooseStop'),
    placeholder: t('searchStations'),
    groups: [{ title: t('comingUp', { n: upcoming.length }), items: upcoming }, { title: t('alreadyPassed', { n: passed.length }), items: passed }],
    key: x => x.s.id,
    selectedKey: v.myStop,
    search: x => [x.s.name, x.s.nameUr, x.s.city].join(' ').toLowerCase(),
    render: x => {
      const sched = x.s.arr ?? x.s.dep;
      const ms = x.e?.estMs ?? (run ? run.date : pktMidnight()) + sched * 60e3;
      return `<span class="dia" aria-hidden="true"></span>
        <span class="opt-info"><b>${esc(stopLabel(x.s))}</b><span class="opt-sub">${x.e?.km != null ? esc(t('km', { n: Math.round(x.e.km) })) : ''}</span></span>
        <span class="stop-time"><b>${bdi((x.e?.estMs ? '~' : '') + clock(ms))}</b>${x.e?.estMs ? `<span class="opt-sub">${esc(t('inTime', { d: dur((x.e.estMs - Date.now()) / 60e3) }))}</span>` : ''}</span>`;
    },
    onPick: x => { v.myStop = x.s.id; setStop(v.number, x.s.id); render(); },
  });
}

function share(anchor) {
  const run = runsOfTrain().find(r => r.id === v.runId);
  const mine = v.stops.find(s => s.id === v.myStop);
  const ests = run ? estimates(v.stops, run, v.history.positions, v.history.passes) : null;
  const e = ests && mine ? ests[v.stops.indexOf(mine)] : null;
  const name = `${trainName(v.info)} ${v.info.label}${isUrdu() ? '' : v.info.up ? 'UP' : 'DN'}`;
  openShare({
    anchor,
    title: t('shareTitle', { name: trainName(v.info) }),
    stopName: mine ? stopLabel(mine) : null,
    url: include => `${location.origin}/#/train/${v.number}${include && mine ? `?stop=${mine.id}` : ''}`,
    message: (url, include) => {
      const delay = run ? delayText(run.lateBy) : t('timetable');
      return include && mine && e && !e.passed
        ? t('shareMsg', { name, delay, stop: stopLabel(mine), time: clock(e.estMs), url })
        : t('shareMsgNoStop', { name, delay, url });
    },
  });
}

function onClick(e) {
  const el = e.target;
  if (el.closest('#pickTrain')) return openTrainPicker(el.closest('#pickTrain'), v.number);
  if (el.closest('#shareBtn')) return share(el.closest('#shareBtn'));
  if (el.closest('[data-pick-stop]')) return openStopPicker(el.closest('[data-pick-stop]'));
  const set = el.closest('[data-set-stop]');
  if (set) { v.myStop = set.dataset.setStop; setStop(v.number, v.myStop); return render(); }
  const r = el.closest('[data-run]');
  if (r) { v.runId = r.dataset.run; return loadHistory().then(() => { render(); const run = runsOfTrain().find(x => x.id === v.runId); if (run) map.panTo(run); }); }
  if (el.closest('[data-earlier]')) { v.showEarlier = !v.showEarlier; return render(); }
  if (el.closest('[data-suspect]')) { v.showSuspect = true; return render(); }
}
function onChips(e) {
  if (e.target.closest('[data-follow]')) { v.follow = !v.follow; render(); }
  if (e.target.closest('[data-trail]')) { v.trail = !v.trail; render(); }
}

async function loadHistory() {
  v.history = v.runId ? await api(`/api/history?run=${encodeURIComponent(v.runId)}`) : { positions: [], passes: [] };
}

export default {
  async mount(params) {
    const info = state.byNumber.get(params.number);
    if (!info) { $('#view').innerHTML = `<p class="note err">Unknown train ${esc(params.number)}</p>`; return; }
    const same = v && v.number === params.number;
    v = {
      number: params.number, info,
      stops: same ? v.stops : [], history: same ? v.history : { positions: [], passes: [] },
      runId: params.run || (same ? v.runId : null),
      myStop: params.stop || getStop(params.number),
      showEarlier: false, showSuspect: false, follow: same ? v.follow : true, trail: same ? v.trail : true,
    };
    if (params.stop) setStop(params.number, params.stop);
    $('#view').addEventListener('click', onClick);
    $('#mapChips').addEventListener('click', onChips);
    map.setDots([]);
    map.onUserMove(() => { if (v?.follow) { v.follow = false; render(); } });
    render();
    const token = v;
    const [stops, runs] = await Promise.all([api(`/api/route?train=${params.number}`), api(`/api/runs?train=${params.number}`).catch(() => [])]);
    if (v !== token) return;
    v.stops = stops;
    runs.forEach(r => state.runs.set(r.id, r));
    const visible = runsOfTrain().filter(r => !r.suspect);
    if (!visible.find(r => r.id === v.runId)) v.runId = visible[0]?.id ?? null;
    await loadHistory();
    if (v !== token) return;
    render();
    fit();
    const run = runsOfTrain().find(r => r.id === v.runId);
    if (run) drawMap(run, true);
    v.lastPrev = run?.prevStation ?? null;
    clearInterval(ticker);
    ticker = setInterval(() => {
      const r = runsOfTrain().find(x => x.id === v?.runId);
      const el = document.querySelector('[data-ago]');
      if (r && el) el.textContent = ago(r.updatedAt);
    }, 1000);
  },
  update(run) {
    if (!v || !v.stops.length) return;
    if (run && run.train !== v.number) return;
    if (run && run.id === v.runId) {
      const last = v.history.positions[v.history.positions.length - 1];
      if (!last || run.updatedAt > last[0]) v.history.positions.push([run.updatedAt, run.lat, run.lon, run.speed]);
      if (v.lastPrev && run.prevStation && run.prevStation !== v.lastPrev) v.history.passes.push({ station: run.prevStation, at: run.updatedAt, late: run.lateBy });
      v.lastPrev = run.prevStation;
      map.setTrain(run, false);
      if (v.follow) map.panTo(run);
    }
    scheduleRender();
  },
  unmount() {
    $('#view').removeEventListener('click', onClick);
    $('#mapChips').removeEventListener('click', onChips);
    $('#mapChips').innerHTML = '';
    $('#mapChart').hidden = true;
    map.onUserMove(() => {});
    map.setTrain(null);
    map.setPins([]);
    map.clearRoute();
    clearInterval(ticker);
    clearTimeout(renderTimer);
    renderTimer = 0;
    v = null;
  },
};
