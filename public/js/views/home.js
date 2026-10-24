// Home (#/): the station map, the search field (the way into Search), My trains and Running now.
import { HomeScreen } from '../screens/index.js';
import { place } from '../screens/_format.js';
import { t } from '../i18n.js';
import { loadLastSeen, lastSeenOf, lastSeenText } from '../lastseen.js';
import {
  state, FRESH_MS, mapTrains, paint, layout, navigate, followedTrains, recentTrains, stationLabel,
} from '../app.js';
import * as map from '../map.js';

const MAX_MINE = 6;

let timer = 0, noticeTimer = 0, notice = '', unfocus = null, mounted = false;

const liveRuns = () => [...state.runs.values()]
  .filter(r => !r.suspect && state.byNumber.has(r.train) && Date.now() - r.updatedAt < FRESH_MS);

/** Where a run is: between its previous and next station, stopped at one, or not yet departed. */
function whereOf(run, info) {
  const prev = state.stationById.get(String(run.prevStation));
  const next = state.stationById.get(String(run.nextStation));
  if (prev && run.speed <= 3 && run.prevStation === info.fromId) return { kind: 'notDeparted', at: prev };
  if (prev && run.speed <= 3) return { kind: 'stopped', at: prev };
  if (prev && next) return { kind: 'between', from: prev, to: next };
  const at = prev || next;
  return at ? { kind: 'stopped', at } : null;
}

function data() {
  const runs = liveRuns();
  const newest = new Map(); // the newest live run of each train
  for (const r of runs) if (!(newest.get(r.train)?.updatedAt >= r.updatedAt)) newest.set(r.train, r);

  const followed = followedTrains();
  const numbers = [...followed, ...recentTrains().filter(n => !followed.includes(n))]
    .slice(0, Math.max(followed.length, MAX_MINE));
  if (numbers.some(n => !newest.has(n))) loadLastSeen(render);
  const myTrains = numbers.map(n => {
    const train = state.byNumber.get(n), run = newest.get(n);
    const rec = run ? null : lastSeenOf(n);
    return {
      ...(rec ? { lastSeen: lastSeenText(rec, { short: true }) } : {}),
      train, where: run ? whereOf(run, train) : null, late: run ? run.lateBy : null, gps: run ? true : train.live,
      ...(run ? { runId: run.id } : {}),
    };
  });
  const running = runs.map(r => {
    const train = state.byNumber.get(r.train);
    return { train, where: whereOf(r, train), late: r.lateBy, gps: true, runId: r.id };
  });
  return { live: state.live, myTrains, running, runningCount: running.length, notice };
}

const handlers = {
  // Typing is Search's job; the field only hands over what was typed.
  onSearch: value => navigate(`#/search?q=${encodeURIComponent(value)}`),
  onMap(action) {
    if (action === 'layers') map.cycleStyle();
    else if (action === 'zoomIn') map.zoomIn();
    else if (action === 'zoomOut') map.zoomOut();
    else if (action === 'locate') locate();
  },
};

async function locate() {
  const r = await map.locate();
  if (!mounted) return;
  say(r.ok ? t('nearestStation', { station: stationLabel(r.station.id) || place(r.station) })
    : t(r.reason === 'denied' ? 'locateDenied' : 'locateUnavailable'));
}
function say(text) {
  notice = text;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { notice = ''; render(); }, 5000);
  render();
}

function render() {
  map.setTrains(mapTrains());
  if (!mounted) return;
  clearTimeout(timer);
  timer = 0;
  paint(HomeScreen(data(), { layout: layout(), standin: false }), handlers);
}
const later = (ms = 1000) => { if (mounted && !timer) timer = setTimeout(render, ms); };

export default {
  mount() {
    mounted = true;
    notice = '';
    map.showStations({ key: 'home', stations: state.stations, fit: 'country' });
    map.onStationClick(id => navigate(`#/station/${id}`));
    map.onTrainClick((n, run) => navigate(`#/train/${n}${run ? `?run=${encodeURIComponent(run)}` : ''}`));
    // Focusing the search field opens Search, where the typing happens.
    const root = document.getElementById('app');
    const onFocus = e => { if (e.target.closest?.('.p-searchfield__input')) navigate('#/search'); };
    root.addEventListener('focusin', onFocus);
    unfocus = () => root.removeEventListener('focusin', onFocus);
    render();
  },
  render,
  update() { later(); },
  unmount() {
    mounted = false;
    clearTimeout(timer);
    clearTimeout(noticeTimer);
    timer = noticeTimer = 0;
    unfocus?.();
    unfocus = null;
  },
};
