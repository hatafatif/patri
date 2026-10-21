// Station page: the board of next trains through one station (/api/board), with the map zoomed to it.
import { StationScreen } from '../screens/index.js';
import { trainInfo } from '../names.js';
import { place } from '../screens/_format.js';
import { t } from '../i18n.js';
import { loadLastSeen, lastSeenOf, lastSeenText } from '../lastseen.js';
import { share } from '../share.js';
import { loadPhotos, cityPhoto } from '../photos.js';
import { state, api, FRESH_MS, paint, layout, navigate, mapTrains, addRecentSearch, isSaved, setSaved } from '../app.js';
import * as map from '../map.js';

const REFRESH_MS = 30e3;
const LIVE_DEBOUNCE_MS = 5e3;
const NOTICE_MS = 3e3;

let v = null;

// The timetable changes only with a deploy: fetched once per station.
const timetables = new Map();

// The newest live run of a train that has not yet passed this stop (its last station is one before it).
function liveRunTo(r) {
  let best = null;
  for (const run of state.runs.values()) {
    if (run.train === r.number && !run.suspect && Date.now() - run.updatedAt < FRESH_MS && !(best && best.updatedAt >= run.updatedAt)) best = run;
  }
  return best && r.before.includes(best.prevStation) ? best : null;
}

const lastStation = () => { try { return localStorage.getItem('lastStation'); } catch { return null; } };

function data() {
  const { id, board } = v;
  const station = state.stationById.get(id);
  // The board's clock moves on between fetches, so "Updated … ago" keeps counting.
  if (board?.rows.some(r => r.late == null || r.gps === false)) loadLastSeen(render);
  const now = board ? board.now + (Date.now() - v.fetchedAt) / 60000 : 0;
  const tt = timetables.get(id);
  return {
    view: v.view,
    loadingTimetable: !tt,
    timetable: (tt?.rows || []).map(r => {
      const run = liveRunTo(r);
      return {
        train: state.byNumber.get(r.number) || trainInfo(r),
        kind: r.kind,
        origin: r.origin,
        dest: r.dest,
        time: r.time,
        ...(run ? { late: run.lateBy, gps: true, runId: run.id } : {}),
      };
    }),
    live: state.live,
    station,
    saved: isSaved(id),
    now,
    updatedAt: board ? board.now : 0,
    loading: !board,
    notice: v.notice,
    photo: cityPhoto(station) || undefined,
    // The board's order (expected time); never sorted or filtered by lateness.
    rows: (board?.rows || []).map(r => {
      const rec = r.late == null || r.gps === false ? lastSeenOf(r.number) : null;
      return {
        train: state.byNumber.get(r.number) || trainInfo(r),
        kind: r.kind,
        origin: { name: r.origin, nameUr: r.originUr },
        dest: { name: r.dest, nameUr: r.destUr },
        sched: r.sched, est: r.est, late: r.late, gps: r.gps,
        runId: r.runId, kmAway: r.kmAway, atPlatform: r.atPlatform,
        ...(rec ? { lastSeen: lastSeenText(rec, { short: true }) } : {}),
      };
    }),
  };
}

function render() {
  if (!v) return;
  map.setTrains(mapTrains());
  paint(StationScreen(data(), { layout: layout(), standin: false }), {
    onFollow: saved => { setSaved(v.id, saved); render(); },
    onShare,
    onMap: action => {
      if (action === 'zoomIn') map.zoomIn();
      else if (action === 'zoomOut') map.zoomOut();
      else if (action === 'layers') map.cycleStyle();
    },
  });
}

async function onShare() {
  const mine = v;
  const s = state.stationById.get(mine.id);
  const name = place(s);
  const url = `${location.origin}/#/station/${mine.id}`;
  const result = await share({ title: name, text: t('shareStation', { station: name, url }), url });
  if (v !== mine) return;
  const text = result === 'copied' ? t('linkCopied') : result === 'failed' ? t('copyFailed') : '';
  if (!text) return;
  mine.notice = text;
  render();
  clearTimeout(mine.noticeTimer);
  mine.noticeTimer = setTimeout(() => { if (v === mine) { mine.notice = ''; render(); } }, NOTICE_MS);
}

async function loadTimetable() {
  const mine = v;
  if (!mine || mine.view !== 'timetable' || timetables.has(mine.id)) return;
  try {
    const tt = await api(`/api/timetable?station=${encodeURIComponent(mine.id)}`);
    timetables.set(mine.id, tt);
  } catch {
    if (v === mine) setTimeout(() => { if (v === mine) loadTimetable(); }, 10e3);
    return;
  }
  if (v === mine) render();
}

async function load() {
  clearTimeout(v?.timer);
  if (!v) return;
  const mine = v;
  try {
    const board = await api(`/api/board?station=${encodeURIComponent(mine.id)}`);
    if (v !== mine) return;
    mine.board = board;
    mine.fetchedAt = Date.now();
  } catch {
    if (v !== mine) return;
  }
  render();
  // Repaint at least every 30 s, so the "Updated … ago" chip moves even when a fetch fails; retry sooner with nothing to show.
  mine.timer = setTimeout(load, mine.board ? REFRESH_MS : 10e3);
}

export default {
  mount(params) {
    const id = params.id || lastStation();
    if (!id || !state.stationById.has(id)) return navigate('#/search', { replace: true });
    if (!params.id) return navigate(`#/station/${id}`, { replace: true });
    try { localStorage.setItem('lastStation', id); } catch {}
    addRecentSearch({ kind: 'station', id });
    v = { id, view: params.view === 'timetable' ? 'timetable' : 'next', board: null, fetchedAt: 0, notice: '', timer: 0, live: 0, noticeTimer: 0 };
    map.showStations({ key: `station:${id}`, stations: state.stations, selected: [id], fit: 'selected' });
    map.onStationClick(other => { if (v && other !== v.id) navigate(`#/station/${other}`); });
    map.onTrainClick(n => navigate(`#/train/${n}`));
    render();
    loadPhotos().then(() => { if (v) render(); });
    load();
    loadTimetable();
  },
  render,
  update() {
    // The board's times follow the live trains: refetch, but not on every poll.
    if (!v?.board || v.live) return;
    const mine = v;
    mine.live = setTimeout(() => { mine.live = 0; if (v === mine) load(); }, LIVE_DEBOUNCE_MS);
  },
  unmount() {
    if (v) { clearTimeout(v.timer); clearTimeout(v.live); clearTimeout(v.noticeTimer); }
    v = null;
  },
};
