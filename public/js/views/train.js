// The Train page (#/train/<n>), All stops (#/train/<n>/stops) and Journey replay (#/train/<n>/replay): all render
// through the screen templates from the same data, so the map keeps its view when you move between them.
import { t, clock, delayText, isUrdu } from '../i18n.js';
import { PERIODS, prepare, advance, frameAt } from '../replay.js';
import { trainName } from '../names.js';
import {
  state, api, paint, layout, navigate, returnTo, previousHash,
  isFollowed, setFollowed, addRecentTrain,
} from '../app.js';
import { TrainScreen, StopsScreen, ReplayScreen, AlertsScreen } from '../screens/index.js';
import { syncReplayBar } from '../components/index.js';
import { place, trainNo, trainTitle, dateLabel } from '../screens/_format.js';
import { estimates, status, progress } from '../eta.js';
import { share } from '../share.js';
import { loadPhotos, trainPhoto } from '../photos.js';
import { loadLastSeen, lastSeenOf, lastSeenText, agoText } from '../lastseen.js';
import { supported, blocked, watching, enable, disable, rulesOfWatch, choicesOfRules, rulesOfChoices } from '../alerts.js';
import { loadTrack } from '../track.js';
import * as map from '../map.js';

const REPAINT_MS = 1000;   // debounce for repaints caused by live updates
const TICK_MS = 30000;     // countdowns and "Updated 1 min ago" move
const NOTICE_MS = 3000;
const SUSPECT_FRESH_MS = 15 * 60e3;

let v = null; // per-mount state
let renderTimer = 0, tickTimer = 0, noticeTimer = 0, retryTimer = 0;
let offClick = null;
let after = null; // what an alerts attempt left for the train page that follows: 'blocked' or 'failed'
let keep = null; // what the next mount may reuse when the same train's other page follows

const isoDate = ms => new Date(ms + 5 * 3600e3).toISOString().slice(0, 10);
const EMPTY = { id: null, positions: [], passes: [] };

/** This train's runs, newest first: the live snapshot, plus any that /api/runs gave and that are still fresh. */
function runsOfTrain() {
  const all = new Map();
  for (const r of v.fetched) if (state.runs.has(r.id) || Date.now() - r.updatedAt < SUSPECT_FRESH_MS) all.set(r.id, r);
  for (const r of state.runs.values()) if (r.train === v.number) all.set(r.id, r);
  return [...all.values()].sort((a, b) => b.date - a.date);
}

/** Which run to show, which others to offer, and how many suspect runs stay hidden. */
function pickRun() {
  const all = runsOfTrain();
  const asked = v.params.run ? all.find(r => r.id === v.params.run) : null;
  const clean = all.filter(r => !r.suspect);
  const run = asked || clean[0] || null;
  const offered = clean.slice(0, 3);
  if (run && !offered.includes(run)) offered.push(run);
  offered.sort((a, b) => b.date - a.date);
  const hidden = all.filter(r => r.suspect && r !== run);
  return { run, offered: offered.slice(0, 3), hidden };
}

/** The train running the other way: the next or previous number if it fits, else the closest that swaps the ends. */
function returnTrainOf(info) {
  const swaps = o => o.number !== info.number && o.fromId === info.toId && o.toId === info.fromId;
  const twin = state.byNumber.get(info.number % 2 ? info.number + 1 : info.number - 1);
  if (twin && swaps(twin)) return twin;
  return state.trains.filter(o => swaps(o) && o.up !== info.up).sort((a, b) => Math.abs(a.number - info.number) - Math.abs(b.number - info.number))[0] || null;
}

/** Everything the screens need, worked out from the route, the run and its history. */
function compute() {
  const { info, stops } = v;
  const { run, offered, hidden } = pickRun();
  const hist = run && v.hist.id === run.id ? v.hist : EMPTY;
  const data = {
    live: state.live, train: info, stops, run: null, gps: !!info.live,
    followed: isFollowed(v.number), following: v.following, notice: v.notice,
    photo: trainPhoto(v.number) || undefined,
    returnTrain: returnTrainOf(info) || undefined, runId: run?.id, pick: v.params.pick,
  };
  data.alerts = alertsOf(run);
  const out = { data, run, hist, ests: null, prog: null, st: null, lastSeen: null };
  if (!run && stops.length) {
    // No live location: the last place the monitor recorded the train, if any.
    loadLastSeen(scheduleRender);
    const rec = lastSeenOf(v.number);
    if (rec) {
      data.lastSeen = lastSeenText(rec);
      out.lastSeen = { lat: rec.lat, lon: rec.lon, label: `${trainNo(v.info)} · ${agoText(rec.at)}` };
    }
  }
  if (!run || !stops.length) return out;

  const ests = estimates(stops, run, hist.positions, hist.passes);
  const p = progress(stops, run);
  const st = status(stops, run, hist.positions);
  const toMin = ms => (ms - run.date) / 60000;
  const passedIdx = Math.max(-1, p.passedIdx);
  const nextIdx = p.nextIdx;
  let kmDone = passedIdx >= 0 ? stops[passedIdx].km : 0;
  let kmToNext = 0;
  if (nextIdx >= 0) {
    const k = ests[nextIdx]?.km;
    if (k != null) { kmToNext = k; kmDone = Math.max(0, stops[nextIdx].km - k); } else kmToNext = Math.max(0, stops[nextIdx].km - kmDone);
  }
  Object.assign(data, {
    run: {
      speed: run.speed, late: run.lateBy ?? 0, updatedAt: toMin(run.updatedAt), date: isoDate(run.date), gps: true,
      status: { kind: st.kind, station: st.station, minutes: st.minutes },
    },
    now: toMin(Date.now()),
    ests: ests.map(e => (e.passed
      ? { passed: true, ...(e.passedMs != null ? { at: toMin(e.passedMs), ...(e.approx ? { approx: true } : {}) } : {}) }
      : { passed: false, ...(e.estMs != null ? { est: toMin(e.estMs) } : {}) })),
    progress: { passedIdx, nextIdx, kmDone, kmToNext },
    speed: {
      points: hist.positions.map(x => [x[0], x[3]]),
      stops: hist.passes.filter(x => stops.some(s => s.id === x.station)).map(x => ({ ms: x.at, id: x.station })),
      now: Date.now(),
    },
    details: run.loco ? { locomotive: run.loco } : undefined,
    runs: offered.length > 1 ? offered.map(r => ({ id: r.id, date: isoDate(r.date) })) : undefined,
    hiddenRuns: hidden.length ? { count: hidden.length, href: `#/train/${v.number}?run=${encodeURIComponent(hidden[0].id)}` } : undefined,
  });
  Object.assign(out, { ests, prog: { passedIdx, nextIdx, kmToNext }, st });
  return out;
}

/** The Alerts card's state: why alerts can't be set, whether they are on, or that they can be turned on. */
function alertsOf(run) {
  if (!supported()) return { state: 'unsupported' };
  if (!run || !state.byNumber.get(v.number)?.live) return { state: 'nolive' };
  if (v.blocked || blocked()) return { state: 'blocked' };
  const w = watching(v.number);
  if (!w) return { state: 'off' };
  const s = w.stop && v.stops.find(x => x.id === w.stop);
  const q = [w.stop && `stop=${encodeURIComponent(w.stop)}`, run && `run=${encodeURIComponent(run.id)}`].filter(Boolean).join('&');
  return {
    state: 'on', ...(s ? { stopName: place(s) } : {}),
    ...(v.stops.length ? { chosen: choicesOfRules(rulesOfWatch(w, v.stops), v.stops, w.stop) } : {}),
    href: `#/train/${v.number}/alerts${q ? `?${q}` : ''}`,
  };
}

// ---- Alerts page (#/train/<n>/alerts?stop=&run=)

/** The rider's station on this page: the one ?stop= names if it is on the route, else null. */
const stopOf = () => v.stops.find(x => x.id === v.params.stop) || null;

/** The kinds the page offers, in its order. `c` is compute()'s result for the shown run. */
function offeredOf(c, stop) {
  const si = stop ? v.stops.indexOf(stop) : -1;
  const out = [];
  if (stop) out.push('before', 'reach');
  if (stop && si !== v.stops.length - 1) out.push('leave');
  if (c.st?.kind === 'wait') out.push('start');
  out.push('delay');
  if (!stop || si !== v.stops.length - 1) out.push('end');
  return out;
}

/** Keeps the page's choices (v.form) for the same station; starts them from the saved watch or the defaults. */
function ensureForm(c, stop) {
  const id = stop?.id ?? null;
  if (v.form && v.form.stop === id) return v.form;
  const w = watching(v.number);
  if (w && w.run === c.run?.id && (w.stop ?? null) === id) {
    const chosen = choicesOfRules(rulesOfWatch(w, v.stops), v.stops, id);
    v.form = { stop: id, on: new Set(chosen.map(x => x.kind)), minutes: chosen.find(x => x.kind === 'before')?.min ?? 15 };
  } else {
    v.form = { stop: id, on: new Set(id ? ['before', 'reach', 'delay'] : ['start', 'delay', 'end']), minutes: 15 };
  }
  return v.form;
}

/** AlertsPageData for the page: see screens/AlertsScreen.js. */
function alertsPageOf(c) {
  const stop = stopOf();
  const runPart = c.run ? `run=${encodeURIComponent(c.run.id)}` : '';
  const base = {
    state: c.data.alerts.state, stop, first: v.stops[0], last: v.stops.at(-1),
    pickHref: `#/train/${v.number}/stops?pick=1${runPart ? `&${runPart}` : ''}`,
    backHref: `#/train/${v.number}${runPart ? `?${runPart}` : ''}`,
    choices: [], minutes: 15, late: c.run ? c.run.lateBy ?? 0 : null,
  };
  if (base.state !== 'off' && base.state !== 'on') return base;
  const form = ensureForm(c, stop);
  const si = stop ? v.stops.indexOf(stop) : -1;
  const est = i => c.data.ests?.[i]?.est;
  const halt = s => { const h = (s.dep ?? s.arr) - (s.arr ?? s.dep); return Number.isFinite(h) ? h : 0; };
  const atOf = kind => {
    const e = kind === 'end' ? est(v.stops.length - 1) : kind === 'before' || kind === 'leave' ? est(si) : undefined;
    if (e == null) return undefined;
    return kind === 'leave' ? e + halt(v.stops[si]) : e;
  };
  const choices = offeredOf(c, stop).map(kind => {
    const at = atOf(kind);
    return { kind, on: form.on.has(kind), ...(at != null ? { at } : {}) };
  });
  return { ...base, choices, minutes: form.minutes, ...(v.alertsNotice ? { notice: v.alertsNotice } : {}) };
}

function renderAlerts(c, options) {
  // Without the route there are no stations to offer: the Train page's loading note stands in.
  const html = v.stops.length ? AlertsScreen({ ...c.data, alertsPage: alertsPageOf(c) }, options) : TrainScreen(c.data, options);
  paint(html, {
    ...handlers(c.data),
    onToggle(name, checked) {
      if (!v.form) return;
      if (checked) v.form.on.add(name); else v.form.on.delete(name);
      v.alertsNotice = '';
      render();
    },
    onSegment(value, group) {
      if (!group?.classList.contains('p-alerts-minutes') || !v.form) return;
      v.form.minutes = Number(value);
      render();
    },
  });
  drawMap(c);
  ensureHistory(c.run);
}

/** Puts the train on the map: the route, the train and the next stop. */
function drawMap(c) {
  const { data, run } = c;
  const { stops } = v;
  if (!stops.length) return;
  const join = (...p) => p.filter(Boolean).join(' · ');
  const approx = ms => `~${clock(ms)}`;
  let next, passedIdx = -1, position = null, marker = '';
  if (run) {
    const { passedIdx: pi, nextIdx, kmToNext } = c.prog;
    passedIdx = pi;
    position = { lat: run.lat, lon: run.lon };
    marker = `${trainNo(v.info)} · ${t('kmh', { n: run.speed })}`;
    const estMs = i => c.ests[i]?.estMs;
    if (nextIdx >= 0) {
      const sub = join(estMs(nextIdx) != null && approx(estMs(nextIdx)), t('km', { n: Math.round(kmToNext) }));
      next = { idx: nextIdx, title: place(stops[nextIdx]), sub };
    }
  }
  map.showTrain({ key: `train:${v.number}:${run?.id || 'timetable'}`, stops, passedIdx, position, marker, next, follow: v.following && !!run, lastSeen: c.lastSeen, track: v.track || null });
}

function render() {
  if (!v) return;
  const c = compute();
  const options = { layout: layout(), standin: false };
  if (v.params.alerts) { renderAlerts(c, options); return; }
  if (v.params.replay) { renderReplay(c, options); return; }
  const html = v.params.stops ? StopsScreen(c.data, options) : TrainScreen(c.data, options);
  paint(html, handlers(c.data));
  drawMap(c);
  ensureHistory(c.run);
}

// ---- Journey replay (#/train/<n>/replay)

const timeText = ms => `${dateLabel(isoDate(ms))} · ${clock(ms)}`;

/** The readout's speed: this train's newest run (two can overlap on long journeys), or "Between journeys". */
function speedText(frame) {
  const mine = frame.findLast(x => x.train === v.number);
  return mine ? t('kmh', { n: mine.speed }) : t('replayIdle');
}

function replayOf() {
  const rp = v.replay, m = rp.model;
  const r = returnTrainOf(v.info);
  const out = {
    state: rp.state, days: rp.days,
    periods: PERIODS.map(n => ({ value: String(n), label: t('nDays', { n }), href: `#/train/${v.number}/replay?days=${n}${v.params.run ? `&run=${encodeURIComponent(v.params.run)}` : ''}` })),
    ...(r ? { returnName: `${trainNo(r)} ${trainTitle(r)}` } : {}),
  };
  if (rp.state === 'ready') {
    out.since = t('replaySince', { date: dateLabel(isoDate(m.from)) });
    out.bar = { playing: rp.playing, at: rp.at, from: m.from, to: m.to, days: m.days, time: timeText(rp.at), speed: speedText(frameAt(m, rp.at)), label: t('replayTime') };
  }
  return out;
}

/** Draws the map and the bar for the replay time `at`. */
function drawFrame() {
  const rp = v.replay;
  if (rp.state !== 'ready') return;
  const f = frameAt(rp.model, rp.at);
  map.setReplayFrame(f.map(x => ({
    id: x.id, lat: x.lat, lon: x.lon, facing: x.facing, trail: x.trail,
    label: `${trainNo(state.byNumber.get(x.train) || v.info)} · ${t('kmh', { n: x.speed })}`,
  })));
  syncReplayBar(document.getElementById('app'), { at: rp.at, time: timeText(rp.at), speed: speedText(f), playing: rp.playing });
}

function loop(now) {
  const rp = v?.replay;
  if (!rp || !rp.playing) return;
  rp.raf = requestAnimationFrame(loop);
  const dt = Math.min(100, now - (rp.last || now));
  rp.last = now;
  rp.at = advance(rp.model, rp.at, dt);
  drawFrame();
}

function startLoop() {
  const rp = v.replay;
  cancelAnimationFrame(rp.raf);
  rp.last = 0;
  rp.raf = requestAnimationFrame(loop);
}

function renderReplay(c, options) {
  const data = { ...c.data, replay: replayOf() };
  paint(ReplayScreen(data, options), {
    ...handlers(data),
    onReplayToggle() {
      const rp = v.replay;
      rp.playing = !rp.playing;
      if (rp.playing) startLoop(); else cancelAnimationFrame(rp.raf);
      drawFrame();
    },
    onReplayScrub(ms) {
      v.replay.at = ms;
      drawFrame();
    },
  });
  map.showReplay({ key: `replay:${v.number}:${v.replay.days}`, stops: v.stops, track: v.track || null });
  drawFrame();
}

/** Loads the recorded journeys of this train and its return train (live data, so never cached). */
function loadReplay() {
  const token = v, rp = v.replay;
  const r = returnTrainOf(v.info);
  const trains = [v.number, r?.number].filter(Boolean).join(',');
  api(`/api/replay?trains=${trains}&days=${rp.days}`).then(body => {
    if (v !== token) return;
    rp.model = prepare(body);
    rp.state = rp.model ? 'ready' : 'empty';
    if (rp.model) rp.at = rp.model.from;
    render();
    if (rp.model && rp.playing) startLoop();
  }, () => {
    if (v !== token) return;
    rp.state = 'failed';
    render();
  });
}

function scheduleRender() {
  if (renderTimer) return;
  renderTimer = setTimeout(() => { renderTimer = 0; render(); }, REPAINT_MS);
}

/** Loads the recorded positions and passes of the run being shown (empty on Vercel, then live updates fill it in). */
function ensureHistory(run) {
  if (!run || v.hist.id === run.id || v.loadingHist === run.id) return;
  const token = v, id = run.id;
  v.loadingHist = id;
  api(`/api/history?run=${encodeURIComponent(id)}`).catch(() => null).then(h => {
    if (v !== token) return;
    v.loadingHist = null;
    const positions = (h?.positions || []).slice();
    const passes = (h?.passes || []).slice();
    const now = state.runs.get(id) || run;
    if (!positions.length) positions.push([now.updatedAt, now.lat, now.lon, now.speed]);
    v.hist = { id, positions, passes };
    v.lastPrev = now.prevStation ?? null;
    render();
  });
}

function handlers(data) {
  return {
    data,
    onFollow: followed => setFollowed(v.number, followed),
    onShare: onShare,
    onFollowing: on => { v.following = on; map.setFollow(on); },
    onMap: action => {
      if (action === 'zoomIn') map.zoomIn();
      else if (action === 'zoomOut') map.zoomOut();
      else if (action === 'wholeRoute') { v.following = false; map.showWholeRoute(); render(); }
    },
  };
}

function flash(text) {
  v.notice = text;
  render();
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { if (v) { v.notice = ''; render(); } }, NOTICE_MS);
}

async function onShare() {
  const token = v;
  const c = compute();
  const { run } = c;
  const name = `${trainName(v.info)} ${v.info.label}${isUrdu() ? '' : v.info.up ? 'UP' : 'DN'}`;
  const delay = run ? delayText(run.lateBy ?? 0) : t('timetable');
  const url = `${location.origin}/#/train/${v.number}`;
  const text = t('shareMsgNoStop', { name, delay, url });
  const result = await share({ title: t('shareTitle', { name: trainName(v.info) }), text, url });
  if (v !== token) return;
  if (result === 'copied') flash(t('linkCopied'));
  else if (result === 'failed') flash(t('copyFailed'));
}

/** Taps on the alerts controls: station links on the picker, Save and Turn off on the Alerts page, Turn off on the Train page. */
async function onAlertsClick(e) {
  if (!v || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const target = e.target;
  const pickLink = v.params.pick && target.closest?.('a.p-stoptimeline__name[href*="/alerts"], a.p-alerts-whole');
  if (pickLink) {
    e.preventDefault();
    const href = pickLink.getAttribute('href');
    // From an Alerts page: go back to it and replace it with the new station. Otherwise replace the picker.
    if (/^#\/train\/\d+\/alerts/.test(previousHash() || '')) returnTo(href);
    else navigate(href, { replace: true });
    return;
  }
  const save = v.params.alerts && target.closest?.('.p-alerts-save');
  const off = target.closest?.('.p-alerts-off');
  if (!save && !off) return;
  e.preventDefault();
  const token = v, number = v.number;
  if (off && !v.params.alerts) { await disable(number); if (v === token) render(); return; }
  const c = compute();
  const runId = c.run?.id;
  const trainHash = `#/train/${number}${runId ? `?run=${encodeURIComponent(runId)}` : ''}`;
  if (off) { await disable(number); if (v === token) returnTo(trainHash); return; }
  if (!v.stops.length) return;
  const stop = stopOf();
  const form = ensureForm(c, stop);
  const rules = rulesOfChoices({ on: form.on, minutes: form.minutes, offered: offeredOf(c, stop), stop: stop?.id ?? null, stops: v.stops });
  if (!rules.length) {
    v.alertsNotice = t('alertsPickOne');
    render();
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => { if (v === token) { v.alertsNotice = ''; render(); } }, NOTICE_MS);
    return;
  }
  // enable() starts inside this click: the browser's permission prompt needs the tap.
  try { await enable(number, runId, stop?.id ?? null, rules); after = null; } catch (err) { after = err === 'blocked' ? 'blocked' : 'failed'; console.error('alerts:', err); }
  if (v === token) returnTo(trainHash);
}

async function load() {
  const token = v;
  try {
    const [stops, runs] = await Promise.all([
      api(`/api/route?train=${v.number}`, { cache: true }),
      api(`/api/runs?train=${v.number}`).catch(() => []),
    ]);
    if (v !== token) return;
    v.stops = stops;
    v.fetched = runs;
    render();
    if (v.replay) loadReplay();
  } catch {
    if (v === token) retryTimer = setTimeout(() => { if (v === token) load(); }, 5000);
  }
}

export default {
  mount(params) {
    const info = state.byNumber.get(params.number);
    if (!info) { navigate(`#/search?q=${params.number}`, { replace: true }); return; }
    addRecentTrain(params.number);
    const same = keep?.number === params.number ? keep : null;
    keep = null;
    v = {
      replay: params.replay ? {
        days: params.days, state: 'loading', model: null, at: 0,
        playing: !matchMedia('(prefers-reduced-motion: reduce)').matches, raf: 0, last: 0,
      } : null,
      number: params.number, info, params, stops: same?.stops || [], track: same?.track || null, fetched: same?.fetched || [], hist: same?.hist || EMPTY,
      loadingHist: null, lastPrev: same?.lastPrev ?? null, following: true, notice: '', form: null, alertsNotice: '',
    };
    const app = document.getElementById('app');
    app.addEventListener('click', onAlertsClick);
    offClick = () => app.removeEventListener('click', onAlertsClick);
    map.onUserMove(() => { if (v?.following) { v.following = false; map.setFollow(false); render(); } });
    clearInterval(tickTimer);
    tickTimer = setInterval(render, TICK_MS);
    if (after === 'blocked') v.blocked = true;
    render();
    if (after === 'failed') flash(t('alertsFailed'));
    after = null;
    loadPhotos().then(() => { if (v) render(); });
    load();
    if (!v.track) {
      const token = v;
      loadTrack(v.number).then(track => { if (v === token && track) { v.track = track; render(); } });
    }
  },
  render,
  update(changed) {
    if (!v || v.replay || !v.stops.length) return;
    const mine = changed.filter(r => r.train === v.number);
    if (!mine.length) return;
    const { run } = pickRun();
    const r = run && mine.find(x => x.id === run.id);
    if (r && v.hist.id === r.id) {
      const last = v.hist.positions.at(-1);
      if (!last || r.updatedAt > last[0]) v.hist.positions.push([r.updatedAt, r.lat, r.lon, r.speed]);
      if (v.lastPrev && r.prevStation && r.prevStation !== v.lastPrev) v.hist.passes.push({ station: r.prevStation, at: r.updatedAt, late: r.lateBy });
      v.lastPrev = r.prevStation ?? v.lastPrev;
    }
    scheduleRender();
  },
  unmount() {
    if (v?.replay) cancelAnimationFrame(v.replay.raf);
    offClick?.();
    offClick = null;
    clearTimeout(renderTimer); clearInterval(tickTimer); clearTimeout(noticeTimer); clearTimeout(retryTimer);
    renderTimer = tickTimer = noticeTimer = retryTimer = 0;
    // Moving between this train's Train and All stops pages keeps the map and the data as they are; anywhere else clears the map.
    if (v && new RegExp(`^#/train/${v.number}(/|\\?|$)`).test(location.hash)) keep = { number: v.number, stops: v.stops, track: v.track, fetched: v.fetched, hist: v.hist, lastPrev: v.lastPrev };
    else map.clear();
    v = null;
  },
};
