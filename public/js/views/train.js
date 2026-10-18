// The Train page (#/train/<n>) and All stops (#/train/<n>/stops[?pick=1]): both render through the
// screen templates from the same data, so the map keeps its view when you move between them.
import { t, clock, delayText, isUrdu } from '../i18n.js';
import { trainName } from '../names.js';
import {
  state, api, paint, layout, navigate, returnTo, replaceHash,
  getStop, setStop, isFollowed, setFollowed, addRecentTrain,
} from '../app.js';
import { TrainScreen, StopsScreen } from '../screens/index.js';
import { place, trainNo, time } from '../screens/_format.js';
import { estimates, status, progress } from '../eta.js';
import { share } from '../share.js';
import * as map from '../map.js';

const REPAINT_MS = 1000;   // debounce for repaints caused by live updates
const TICK_MS = 30000;     // countdowns and "Updated 1 min ago" move
const NOTICE_MS = 3000;
const SUSPECT_FRESH_MS = 15 * 60e3;

let v = null; // per-mount state
let renderTimer = 0, tickTimer = 0, noticeTimer = 0, retryTimer = 0;
let offClick = null;
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
  const myStop = getStop(v.number) || undefined;
  const data = {
    live: state.live, train: info, stops, run: null, gps: !!info.live,
    myStop, followed: isFollowed(v.number), following: v.following, notice: v.notice,
    returnTrain: returnTrainOf(info) || undefined, pick: v.params.pick, runId: run?.id,
  };
  const out = { data, run, hist, ests: null, prog: null, st: null };
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
      ? { passed: true, ...(e.passedMs != null ? { at: toMin(e.passedMs) } : {}) }
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

/** Puts the train on the map: the route, the train, the next stop and your stop. */
function drawMap(c) {
  const { data, run } = c;
  const { stops } = v;
  if (!stops.length) return;
  const mineIdx = data.myStop ? stops.findIndex(s => s.id === data.myStop) : -1;
  const join = (...p) => p.filter(Boolean).join(' · ');
  const approx = ms => `~${clock(ms)}`;
  let next, mine, passedIdx = -1, position = null, marker = '';
  if (run) {
    const { passedIdx: pi, nextIdx, kmToNext } = c.prog;
    passedIdx = pi;
    position = { lat: run.lat, lon: run.lon };
    marker = `${trainNo(v.info)} · ${t('kmh', { n: run.speed })}`;
    const estMs = i => c.ests[i]?.estMs;
    if (nextIdx >= 0) {
      const sub = join(estMs(nextIdx) != null && approx(estMs(nextIdx)), t('km', { n: Math.round(kmToNext) }));
      next = { idx: nextIdx, title: place(stops[nextIdx]), sub: nextIdx === mineIdx ? join(t('yourStop'), sub) : sub };
    }
    if (mineIdx > passedIdx && mineIdx !== nextIdx && mineIdx >= 0) {
      mine = { idx: mineIdx, title: place(stops[mineIdx]), sub: join(t('yourStop'), estMs(mineIdx) != null && approx(estMs(mineIdx))) };
    }
  } else if (mineIdx >= 0) {
    const s = stops[mineIdx];
    const sched = s.arr ?? s.dep;
    mine = { idx: mineIdx, title: place(s), sub: join(t('yourStop'), sched != null && time(sched)) };
  }
  map.showTrain({ key: `train:${v.number}:${run?.id || 'timetable'}`, stops, passedIdx, position, marker, next, mine, follow: v.following && !!run });
}

function render() {
  if (!v) return;
  const c = compute();
  const options = { layout: layout(), standin: false };
  const html = v.params.stops ? StopsScreen(c.data, options) : TrainScreen(c.data, options);
  paint(html, handlers(c.data));
  drawMap(c);
  ensureHistory(c.run);
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

/** The pick-stop URL part that keeps the run, for links and navigation. */
const runParam = () => (v.params.run ? `?run=${encodeURIComponent(v.params.run)}` : '');

function handlers(data) {
  return {
    data,
    onFollow: followed => setFollowed(v.number, followed),
    onShare: onShare,
    onChangeStop: () => navigate(`#/train/${v.number}/stops?pick=1${v.params.run ? `&run=${encodeURIComponent(v.params.run)}` : ''}`),
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
  const mineIdx = c.data.myStop ? v.stops.findIndex(s => s.id === c.data.myStop) : -1;
  const mine = mineIdx >= 0 ? v.stops[mineIdx] : null;
  const e = run && mine ? c.ests[mineIdx] : null;
  const name = `${trainName(v.info)} ${v.info.label}${isUrdu() ? '' : v.info.up ? 'UP' : 'DN'}`;
  const delay = run ? delayText(run.lateBy ?? 0) : t('timetable');
  const url = `${location.origin}/#/train/${v.number}${mine ? `?stop=${mine.id}` : ''}`;
  const ahead = mine && e && !e.passed && e.estMs != null;
  const text = ahead
    ? t('shareMsg', { name, delay, stop: place(mine), time: clock(e.estMs), url })
    : t('shareMsgNoStop', { name, delay, url });
  const result = await share({ title: t('shareTitle', { name: trainName(v.info) }), text, url });
  if (v !== token) return;
  if (result === 'copied') flash(t('linkCopied'));
  else if (result === 'failed') flash(t('copyFailed'));
}

/** Taps on a stop in pick mode choose it without leaving a trace in history. */
function onPick(e) {
  const a = e.target.closest?.('.p-stoptimeline a[href*="?stop="]');
  if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const id = new URL(a.href).hash.match(/[?&]stop=([^&]+)/)?.[1];
  if (!id || !v) return;
  e.preventDefault();
  setStop(v.number, decodeURIComponent(id));
  returnTo(`#/train/${v.number}${runParam()}`);
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
  } catch {
    if (v === token) retryTimer = setTimeout(() => { if (v === token) load(); }, 5000);
  }
}

export default {
  mount(params) {
    const info = state.byNumber.get(params.number);
    if (!info) { navigate(`#/search?q=${params.number}`, { replace: true }); return; }
    addRecentTrain(params.number);
    // An old shared link (#/train/27?stop=116) sets your stop; the URL then drops it, so coming back
    // later doesn't override a newer choice.
    if (params.stop) {
      setStop(params.number, params.stop);
      replaceHash(`#/train/${params.number}${params.run ? `?run=${encodeURIComponent(params.run)}` : ''}`);
    }
    const same = keep?.number === params.number ? keep : null;
    keep = null;
    v = {
      number: params.number, info, params, stops: same?.stops || [], fetched: same?.fetched || [], hist: same?.hist || EMPTY,
      loadingHist: null, lastPrev: same?.lastPrev ?? null, following: true, notice: '',
    };
    const app = document.getElementById('app');
    app.addEventListener('click', onPick);
    offClick = () => app.removeEventListener('click', onPick);
    map.onUserMove(() => { if (v?.following) { v.following = false; map.setFollow(false); render(); } });
    clearInterval(tickTimer);
    tickTimer = setInterval(render, TICK_MS);
    render();
    load();
  },
  render,
  update(changed) {
    if (!v || !v.stops.length) return;
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
    offClick?.();
    offClick = null;
    clearTimeout(renderTimer); clearInterval(tickTimer); clearTimeout(noticeTimer); clearTimeout(retryTimer);
    renderTimer = tickTimer = noticeTimer = retryTimer = 0;
    // Moving between this train's Train and All stops pages keeps the map and the data as they are; anywhere else clears the map.
    if (v && new RegExp(`^#/train/${v.number}(/|\\?|$)`).test(location.hash)) keep = { number: v.number, stops: v.stops, fetched: v.fetched, hist: v.hist, lastPrev: v.lastPrev };
    else map.clear();
    v = null;
  },
};
