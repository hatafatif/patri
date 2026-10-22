// The map: MapLibre, kept to Pakistan, in the Sabz base style (see mapstyle.js) or satellite or streets.
// One map for the whole app. app.js creates its container once and moves it into the backdrop of each
// screen it paints; views drive it through the functions below. Colours come from the tokens through
// MapMarkers.mapPaint(); labels on it are MapMarkers.trainMarker() and mapLabel() DOM markers.
//
// API CONTRACT (views code against this; every call made before the map has loaded is remembered and
// applied once it has):
//   initMap(el)                 create the map in el (in the DOM); resolves when the style and overlays are ready
//   resize()                    the container moved or changed size
//   setInsets()                 re-read --panel-visible and keep the current content inside the visible area
//   setLang()                   the language changed: re-label what is drawn
//   zoomIn(), zoomOut()
//   cycleStyle() -> name        next base style: sabz -> satellite -> streets -> sabz, remembered in localStorage mapStyle
//   locate() -> Promise<{ ok: true, station } | { ok: false, reason: 'denied' | 'unavailable' }>
//                               fly to the station nearest the rider and select it; keep the view when it fails
//   onUserMove(fn)              the rider dragged, pinched or zoomed the map (Following turns off)
//   onStationClick(fn(id))      a station dot was tapped
//   onTrainClick(fn(number))    a running-train dot was tapped
//   setTrains(list)             [{ number, lat, lon, title, toward? }], title already localised, toward the next station
//                               as [lon, lat]; drawn in stations mode only: yellow count pills at zoom <= 6, a locomotive
//                               and coach along the track when zoomed in (hover shows the title), empty in train mode
//   showStations({ key, stations, selected?, fit? })
//                               stations mode (Home, Search, From → To, Station): every station a small dot, the major
//                               cities bigger and labelled, running trains, the rail network, selected ids drawn as selected with a mapLabel 'selected'.
//                               fit: 'country' | 'selected' | 'keep'; applied only when key changes.
//   showTrain({ key, stops, passedIdx, position, marker, next?, mine?, follow, lastSeen? })
//                               train mode (Train page, All stops): the route from the stop coordinates, done solid and
//                               ahead dashed, the trainMarker at position, mapLabel 'next' and 'yourstop'. A new key fits
//                               the train (follow) or the whole route; later calls update in place. With no position,
//                               lastSeen { lat, lon, label } puts a faded (stale) trainMarker there; it is never followed.
//   setFollow(on)               keep the train centred in the visible area
//   showWholeRoute()            fit every stop into the visible area and stop following
//   showReplay({ key, stops })  replay mode: the whole route (dashed) fitted in view and no other markers; the page then
//                               drives the trains with setReplayFrame
//   setReplayFrame(trains)      [{ id, lat, lon, facing, label, trail }]; one trainMarker per id and a fading trail
//                               ([lon, lat] pairs ending at the train); called every animation frame
//   clear()                     remove every overlay
//
// Notes: the city labels drawn by MapLibre itself stay in English in both languages (it cannot shape Urdu without
// its RTL-text plugin); the DOM labels (mapLabel, trainMarker) carry the language. Stations are
// { id, name, nameUr, lat, lon }; stops are the same, in route order.
/* global maplibregl */
import { mapPaint, mapLabel, trainMarker, trainImages } from './components/index.js';
import { loadNetwork, headingsAt, bearing } from './track.js';
import { stationName } from './names.js';
import { haversineKm } from './eta.js';
import { t } from './i18n.js';
import { styleFor, maskLayers, loadPakistan, STYLES, MAJORS } from './mapstyle.js';
import { lockToPakistan } from './maplock.js';

const PAKISTAN = [[60.8, 23.6], [77.9, 37.1]];
const EMPTY = { type: 'FeatureCollection', features: [] };
const TWEEN_MS = 900;
const REACHES = [8, 2, 0.5]; // km of track read for the heading, by zoom step (map.js layers: below 9, 9-11, above 11)
const hoverable = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

const line = pts => ({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: pts.map(p => [p.lon, p.lat]) } });
const points = list => ({
  type: 'FeatureCollection',
  features: list.map(p => ({ type: 'Feature', properties: p.props || {}, geometry: { type: 'Point', coordinates: [p.lon, p.lat] } })),
});
const located = s => s && Number.isFinite(s.lat) && Number.isFinite(s.lon);

// The feed has a station or two with latitude and longitude swapped; put them right so they land in Pakistan.
function sane(s) {
  if (!located(s)) return null;
  if (s.lat > 45 && s.lon < 45) return { ...s, lat: s.lon, lon: s.lat };
  return s.lat > 15 && s.lat < 45 && s.lon > 50 && s.lon < 90 ? s : null;
}

let map, loaded = false, readyResolve;
let readyPromise = new Promise(r => { readyResolve = r; });
let styleName = 'sabz';
try {
  const saved = localStorage.getItem('mapStyle');
  styleName = saved === 'truck' ? 'sabz' : STYLES.includes(saved) ? saved : 'sabz';
} catch {}
let styleInfo = null;

// Overlay data survives a change of base style, which wipes sources and layers.
const SOURCES = ['route-ahead', 'route-done', 'replay-trail', 'route-stops', 'stations', 'majors', 'stations-selected', 'trains', 'rail-network'];
const data = Object.fromEntries(SOURCES.map(id => [id, EMPTY]));
const put = (id, value) => { data[id] = value; map?.getSource(id)?.setData(value); };

// What the views last asked for. Everything is drawn from these, so a call made before the map loads (or an
// overlay lost to a style change) is not lost.
let mode = null; // 'stations' | 'train' | 'replay' | null
let sIntent = null; // { key, stations, selected, fit }
let tIntent = null; // { key, stops, passedIdx, position, marker, next, mine, follow, lastSeen }
let rIntent = null; // { key, stops }
let located_ = null; // station id picked by locate(), kept until the stations key changes
let stationSig = '', byId = new Map(), allStations = [];
let fitPending = false; // a fit is waiting for the container to have a size
let keyDirty = false; // a key changed and the map has not drawn it yet
let camera = null; // { type: 'country' | 'selected' | 'route' | 'train' }: what the camera keeps in view
let userMoved = false, followBroken = false;
let lastFitSig = '', refitTimer = 0, hasFitted = false;
let moveHandler = () => {}, clickHandler = () => {}, trainClickHandler = () => {};
let trainList = [];
let hovered = null;
let network = null; // the rail network, once loaded

export const ready = () => readyPromise;

// ---- Visible area -------------------------------------------------------------------------------------------

function sized() {
  const el = map?.getContainer();
  return !!el && el.clientWidth > 80 && el.clientHeight > 80;
}

// Padding that keeps content in the part of the map the panel and the floating buttons don't cover.
function padding() {
  const el = map.getContainer(), r = el.getBoundingClientRect();
  const panel = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--panel-visible')) || 0;
  const covered = Math.max(0, r.bottom - (innerHeight - panel));
  const rtl = document.documentElement.dir === 'rtl';
  const side = 16, controls = 60; // the zoom, layers and locate buttons sit on the inline-end side
  const w = r.width, h = r.height;
  // Phone pages with the floating Home/Back pill and search button (frame() adds p-screen--back) keep content below them.
  let top = el.closest('.p-screen--back') ? 68 : 24, bottom = covered + 24, left = rtl ? controls : side, right = rtl ? side : controls;
  // Never ask for more padding than the box can give.
  bottom = Math.min(bottom, h * 0.65);
  top = Math.min(top, h * 0.15);
  left = Math.min(left, w * 0.25);
  right = Math.min(right, w * 0.25);
  return { top, bottom, left, right };
}
const fitSig = () => { const p = padding(); const el = map.getContainer(); return `${Math.round(p.bottom)}|${el.clientWidth}x${el.clientHeight}|${document.documentElement.dir}`; };

function boundsOf(pts) {
  return pts.reduce((b, p) => b.extend([p.lon, p.lat]), new maplibregl.LngLatBounds([pts[0].lon, pts[0].lat], [pts[0].lon, pts[0].lat]));
}

// The camera target for what we are keeping in view, from the latest data.
function target() {
  if (!camera) return null;
  if (camera.type === 'country') return { bounds: PAKISTAN, maxZoom: 7 };
  if (camera.type === 'selected') {
    const pts = selectedStations();
    if (!pts.length) return { bounds: PAKISTAN, maxZoom: 7 };
    return pts.length === 1 ? { center: [pts[0].lon, pts[0].lat], zoom: 10 } : { bounds: boundsOf(pts), maxZoom: 11 };
  }
  const stops = ((mode === 'replay' ? rIntent : tIntent)?.stops || []).map(sane).filter(Boolean);
  if (camera.type === 'train' && tIntent?.position) return { center: [tIntent.position.lon, tIntent.position.lat], zoom: camera.zoom || 9 };
  if (camera.type === 'route' || camera.type === 'train') {
    if (stops.length) return stops.length === 1 ? { center: [stops[0].lon, stops[0].lat], zoom: 9 } : { bounds: boundsOf(stops), maxZoom: 10 };
  }
  return null;
}

function applyCamera(duration = 600) {
  if (!map) return;
  const goal = target();
  // Nothing to fit yet (the stops haven't arrived) or no size yet: fit as soon as there is.
  if (!goal || !sized()) { fitPending = true; return; }
  map.resize();
  const first = !hasFitted;
  const opts = { padding: padding(), duration: first ? 0 : duration, essential: true };
  fitPending = false;
  hasFitted = true;
  lastFitSig = fitSig();
  // fitBounds adds the map's own padding (left by any earlier easeTo with padding) to the padding it is given,
  // so make the visible-area padding the map's own first and fit with none on top.
  map.setPadding(opts.padding);
  if (goal.bounds) map.fitBounds(goal.bounds, { ...opts, padding: 0, maxZoom: goal.maxZoom });
  else map.easeTo({ ...opts, center: goal.center, zoom: goal.zoom });
}

// The visible area changed (panel snap, resize, a drag of the sheet): keep the content in view unless the rider moved the map.
function scheduleRefit() {
  clearTimeout(refitTimer);
  refitTimer = setTimeout(() => {
    if (!map || !loaded) return;
    if (fitPending) return applyCamera(0);
    if (!userMoved && camera && sized() && fitSig() !== lastFitSig) applyCamera(300);
  }, 120);
}

// ---- DOM markers --------------------------------------------------------------------------------------------

const markers = new Map(); // slot -> { marker, html, key }

function labelEl(html) {
  const el = document.createElement('div');
  el.innerHTML = html;
  el.style.pointerEvents = 'none';
  return el;
}

// Put the marker for a slot at lngLat with this markup; reuse it when only the position or text changed.
function place(slot, lngLat, html, { anchor = 'bottom', offset = [0, -12], z = 2, root = false } = {}) {
  const key = `${anchor}|${offset}`;
  let m = markers.get(slot);
  if (m && m.key !== key) { m.marker.remove(); markers.delete(slot); m = null; }
  if (!m) {
    let el;
    if (root) { // the root of the markup is the element (the train marker's centre is its dot)
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      el = tmp.firstElementChild;
      el.style.pointerEvents = 'none';
    } else el = labelEl(html);
    el.style.zIndex = z;
    m = { marker: new maplibregl.Marker({ element: el, anchor, offset }).setLngLat(lngLat).addTo(map), html, key };
    markers.set(slot, m);
    return m;
  }
  if (m.html !== html && !root) { // a root marker (the train) is updated in place by drawTrain
    m.html = html;
    m.marker.getElement().innerHTML = html;
  }
  if (lngLat) m.marker.setLngLat(lngLat);
  return m;
}

function dropMarkers(keep = () => false) {
  for (const [slot, m] of markers) {
    if (keep(slot)) continue;
    if (slot === 'train') { cancelAnimationFrame(tween); trainAt = null; }
    m.marker.remove();
    markers.delete(slot);
  }
}

// ---- Overlays -----------------------------------------------------------------------------------------------

async function addOverlays() {
  const pk = await loadPakistan();
  const p = mapPaint();
  if (styleInfo.englishLabels) {
    const name = ['coalesce', ['get', 'name:en'], ['get', 'name:latin'], ['get', 'name']];
    for (const l of map.getStyle().layers) if (l.type === 'symbol' && l.layout && l.layout['text-field']) map.setLayoutProperty(l.id, 'text-field', name);
  }
  const mask = maskLayers(pk, styleInfo.fade, styleInfo.fadeOpacity);
  for (const [id, src] of Object.entries(mask.sources)) map.addSource(id, src);
  // The fade goes under the sea and the outline over it, so the sea shows through but Pakistan's border stays on top.
  mask.layers.forEach(l => map.addLayer(l, l.id === 'pk-mask' ? styleInfo.maskBelow : (styleInfo.outlineBelow ?? styleInfo.maskBelow)));
  for (const id of SOURCES) {
    const extra = id === 'replay-trail' ? { lineMetrics: true } : id === 'trains' ? { cluster: true, clusterMaxZoom: 6, clusterRadius: 36 } : {};
    map.addSource(id, { type: 'geojson', data: data[id], ...extra });
  }
  const imgs = await trainImages();
  for (const [name, img] of [['train-cluster', imgs.cluster], ['train-loco', imgs.loco], ['train-coach', imgs.coach]]) {
    if (!map.hasImage(name)) map.addImage(name, img, { pixelRatio: 2 });
  }
  const round = { 'line-cap': 'round', 'line-join': 'round' };
  const ring = p.station['circle-color'];
  const surface = p.cityLabel['text-halo-color'];
  const grow = (a, b, c) => ['interpolate', ['linear'], ['zoom'], 4, a, 9, b, 13, c];

  map.addLayer({ id: 'rail-network', type: 'line', source: 'rail-network', paint: p.railNetwork, layout: round });
  map.addLayer({ id: 'route-ahead', type: 'line', source: 'route-ahead', paint: p.routeAhead, layout: { 'line-join': 'round' } });
  map.addLayer({ id: 'route-done-casing', type: 'line', source: 'route-done', paint: p.routeDoneCasing, layout: round });
  map.addLayer({ id: 'route-done', type: 'line', source: 'route-done', paint: p.routeDone, layout: round });
  map.addLayer({ id: 'replay-trail-casing', type: 'line', source: 'replay-trail', paint: p.replayTrailCasing, layout: round });
  map.addLayer({ id: 'replay-trail', type: 'line', source: 'replay-trail', paint: p.replayTrail, layout: round });
  map.addLayer({
    id: 'route-stops', type: 'circle', source: 'route-stops',
    paint: { 'circle-radius': 3.5, 'circle-color': ['case', ['get', 'passed'], p.routeDone['line-color'], surface], 'circle-stroke-color': ['case', ['get', 'passed'], surface, ring], 'circle-stroke-width': 1.5 },
  });
  // Small stations show once the map is zoomed in; the major cities show at every zoom.
  const fadeIn = ['interpolate', ['linear'], ['zoom'], 7.5, 0, 8.5, 1];
  map.addLayer({ id: 'stations', type: 'circle', source: 'stations', minzoom: 7.5, paint: { ...p.station, 'circle-radius': grow(2, 3, 4.5), 'circle-stroke-color': surface, 'circle-stroke-width': 1, 'circle-opacity': fadeIn, 'circle-stroke-opacity': fadeIn } });
  map.addLayer({ id: 'majors', type: 'circle', source: 'majors', paint: { ...p.majorCity, 'circle-radius': grow(4.5, 5.5, 7) } });
  if (styleName === 'sabz') {
    // Latin glyphs only; MapLibre can't shape Urdu here, so city labels are English in both languages.
    map.addLayer({
      id: 'major-labels', type: 'symbol', source: 'majors',
      layout: {
        'text-field': ['get', 'label'], 'text-font': ['Noto Sans Bold'], 'text-size': ['interpolate', ['linear'], ['zoom'], 4, 11.5, 10, 15],
        'text-variable-anchor': ['top', 'bottom', 'right', 'left'], 'text-radial-offset': 0.8, 'symbol-sort-key': ['get', 'rank'],
      },
      paint: p.cityLabel,
    });
  }
  map.addLayer({ id: 'stations-selected', type: 'circle', source: 'stations-selected', paint: p.selectedStation });
  // Trains: count pills while zoomed out, a coach and the locomotive pulling it when zoomed in (coach first, so the loco is on top).
  const single = ['!', ['has', 'point_count']];
  const place_ = { 'icon-rotation-alignment': 'map', 'icon-allow-overlap': true, 'icon-ignore-placement': true, 'icon-size': ['interpolate', ['linear'], ['zoom'], 7, 0.9, 10, 1.1, 13, 1.4] };
  const heading = k => ['step', ['zoom'], ['get', `${k}0`], 9, ['get', `${k}1`], 11, ['get', `${k}2`]];
  map.addLayer({
    id: 'trains-cluster', type: 'symbol', source: 'trains', filter: ['has', 'point_count'],
    layout: { 'icon-image': 'train-cluster', 'text-field': ['get', 'point_count_abbreviated'], 'text-font': ['Noto Sans Bold'], 'text-size': 12.5, 'text-offset': [0.75, 0], 'icon-allow-overlap': true, 'icon-ignore-placement': true, 'text-allow-overlap': true, 'text-ignore-placement': true },
    paint: p.trainClusterText,
  });
  map.addLayer({ id: 'trains-coach', type: 'symbol', source: 'trains', filter: single, layout: { ...place_, 'icon-image': 'train-coach', 'icon-anchor': 'top', 'icon-rotate': heading('b') } });
  map.addLayer({ id: 'trains-loco', type: 'symbol', source: 'trains', filter: single, layout: { ...place_, 'icon-image': 'train-loco', 'icon-anchor': 'bottom', 'icon-rotate': heading('a') } });
  // Invisible and wide, so a finger hits a station.
  map.addLayer({ id: 'stations-hit', type: 'circle', source: 'stations', minzoom: 8, paint: { 'circle-radius': 16, 'circle-color': ring, 'circle-opacity': 0 } });
  map.addLayer({ id: 'trains-hit', type: 'circle', source: 'trains', filter: ['!', ['has', 'point_count']], paint: { 'circle-radius': 14, 'circle-color': ring, 'circle-opacity': 0 } });
  map.addLayer({ id: 'majors-hit', type: 'circle', source: 'majors', paint: { 'circle-radius': 16, 'circle-color': ring, 'circle-opacity': 0 } });
}

// ---- Drawing the two modes ----------------------------------------------------------------------------------

function stationOf(id) { return byId.get(String(id)); }
const nameOf = s => stationName(s.name, s.nameUr);
const selectedIds = () => [...new Set([...(sIntent?.selected || []).map(String), ...(located_ ? [located_] : [])])];
const selectedStations = () => selectedIds().map(stationOf).filter(Boolean);

function drawStations() {
  const list = sIntent.stations.map(sane).filter(Boolean);
  const sig = list.map(s => s.id).join(',');
  if (sig !== stationSig) {
    stationSig = sig;
    byId = new Map(list.map(s => [String(s.id), s]));
    put('stations', points(list.map(s => ({ ...s, props: { id: String(s.id) } }))));
    const majors = MAJORS.map((m, i) => ({ m, s: list.find(s => m.match.test(nameClean(s.name))), i })).filter(x => x.s);
    put('majors', points(majors.map(({ m, s, i }) => ({ ...s, props: { id: String(s.id), label: m.label, rank: i } }))));
  }
  const sel = selectedStations();
  put('stations-selected', points(sel));
  put('trains', trainPoints());
  put('rail-network', railLines());
  put('route-ahead', EMPTY); put('route-done', EMPTY); put('route-stops', EMPTY);
  dropMarkers(slot => slot.startsWith('sel:') || slot === 'hover');
  for (const [slot, m] of markers) if (slot.startsWith('sel:') && !sel.some(s => `sel:${s.id}` === slot)) { m.marker.remove(); markers.delete(slot); }
  for (const s of sel) place(`sel:${s.id}`, [s.lon, s.lat], mapLabel({ title: nameOf(s), kind: 'selected' }), { anchor: 'bottom', offset: [0, -14], z: 3 });
  if (hovered && sel.some(s => `station:${s.id}` === hovered)) hideHover();
  if (hovered?.startsWith('train:') && !trainList.some(x => `train:${x.number}` === hovered)) hideHover();
}

const railLines = () => (network ? { type: 'FeatureCollection', features: network.lines.map(l => ({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: l } })) } : EMPTY);

// a0..a2: the track ahead of the train and b0..b2 the track behind, at the three reaches; without track, straight at the next station.
function headingProps(x) {
  const at = [x.lon, x.lat], toward = Array.isArray(x.toward) ? x.toward : null;
  const hs = network ? headingsAt(network, at, toward, REACHES) : null;
  const fallback = toward ? bearing(at, toward) : 0;
  const props = {};
  REACHES.forEach((_, i) => { props[`a${i}`] = hs ? hs[i].ahead : fallback; props[`b${i}`] = hs ? hs[i].behind : fallback; });
  return props;
}

const trainPoints = () => points(trainList.map(sane).filter(Boolean).map(x => ({ ...x, props: { number: String(x.number), title: x.title || '', ...headingProps(x) } })));

const nameClean = s => String(s ?? '').replace(/\s+/g, ' ').trim();

let trainAt = null, tween = 0;
function moveTrain(to, jump) {
  const m = markers.get('train')?.marker;
  if (!m) return;
  cancelAnimationFrame(tween);
  if (jump || !trainAt) { m.setLngLat(to); trainAt = to; return; }
  const from = trainAt, start = performance.now();
  trainAt = to;
  const step = now => {
    const k = Math.min(1, (now - start) / TWEEN_MS);
    m.setLngLat([from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k]);
    if (k < 1) tween = requestAnimationFrame(step);
  };
  tween = requestAnimationFrame(step);
}

function drawTrain(keyChanged) {
  const { stops, passedIdx = -1, position, next, mine, follow, lastSeen } = tIntent;
  const all = stops.map(sane);
  const pts = all.filter(Boolean);
  const cut = pts.filter(s => all.indexOf(s) <= passedIdx);
  const after = pts.filter(s => all.indexOf(s) > passedIdx);
  const live = located(position) ? { lat: position.lat, lon: position.lon } : null;
  const stale = !live && located(lastSeen);
  const pos = live || (stale ? { lat: lastSeen.lat, lon: lastSeen.lon } : null);
  const marker = stale ? lastSeen.label : tIntent.marker;
  const nextStop = next && Number.isInteger(next.idx) ? all[next.idx] : null;
  const facing = pos && nextStop && nextStop.lon < pos.lon ? 'left' : 'right';
  const done = live ? [...cut, live] : passedIdx >= 0 ? cut : [];
  const rest = live ? [live, ...after] : passedIdx >= 0 ? [...cut.slice(-1), ...after] : pts;
  put('route-done', done.length > 1 ? line(done) : EMPTY);
  put('route-ahead', rest.length > 1 ? line(rest) : EMPTY);
  put('route-stops', points(pts.map(s => ({ ...s, props: { passed: all.indexOf(s) <= passedIdx } }))));
  put('stations', EMPTY); put('majors', EMPTY); put('stations-selected', EMPTY); put('trains', EMPTY); put('rail-network', EMPTY);
  stationSig = '';
  hideHover();
  dropMarkers(slot => slot === 'train' || slot === 'next' || slot === 'mine');

  const stopAt = i => (Number.isInteger(i) ? all[i] : null);
  const nx = next && stopAt(next.idx), my = mine && stopAt(mine.idx);
  if (nx) place('next', [nx.lon, nx.lat], mapLabel({ title: next.title, sub: next.sub, kind: 'next' }), { anchor: 'bottom', offset: [0, -12], z: 2 });
  else dropMarkers(s => s !== 'next');
  if (my) place('mine', [my.lon, my.lat], mapLabel({ title: mine.title, sub: mine.sub, kind: 'yourstop' }), { anchor: 'top', offset: [0, 12], z: 2 });
  else dropMarkers(s => s !== 'mine');

  if (pos) {
    const to = [pos.lon, pos.lat];
    const m = markers.get('train');
    if (!m) { place('train', to, trainMarker({ label: marker || '', facing, stale }), { anchor: 'center', offset: [0, 0], z: 4, root: true }); trainAt = to; markers.get('train').label = marker || ''; markers.get('train').facing = facing; markers.get('train').stale = stale; }
    else {
      if (m.label !== (marker || '')) { m.label = marker || ''; const b = m.marker.getElement().querySelector('.p-trainmarker__label bdi'); if (b) b.textContent = m.label; }
      if (m.facing !== facing) { m.facing = facing; m.marker.getElement().classList.toggle('p-trainmarker--left', facing === 'left'); }
      if (m.stale !== stale) { m.stale = stale; m.marker.getElement().classList.toggle('p-trainmarker--stale', stale); }
      moveTrain(to, keyChanged);
    }
  } else dropMarkers(slot => slot !== 'train');

  if (keyChanged) {
    followBroken = false;
    userMoved = false;
    camera = follow && live ? { type: 'train', zoom: 9 } : { type: 'route' };
    applyCamera(600);
  } else if (follow && live && !followBroken && camera?.type === 'train') {
    // Ease along with the marker's tween so the train stays centred while it moves.
    if (sized()) map.easeTo({ center: [pos.lon, pos.lat], padding: padding(), duration: TWEEN_MS, easing: x => x, essential: true });
  } else if (follow && live && !followBroken) {
    camera = { type: 'train', zoom: Math.max(map.getZoom(), 8) };
    userMoved = false;
    applyCamera(600);
  } else if (!follow && camera?.type === 'train') camera = null;
}

// ---- Replay -------------------------------------------------------------------------------------------------

const TRAIL_MS = 80; // setData on a line-metrics source is costly; the trail refreshes at most this often
let trailPending = null, trailTimer = 0, trailAt = 0;

function flushTrail() {
  trailTimer = 0;
  if (!trailPending) return;
  const fc = trailPending;
  trailPending = null;
  trailAt = performance.now();
  if (loaded && mode === 'replay') put('replay-trail', fc);
}

function queueTrail(fc) {
  trailPending = fc;
  if (trailTimer) return;
  const wait = TRAIL_MS - (performance.now() - trailAt);
  if (wait <= 0) flushTrail(); else trailTimer = setTimeout(flushTrail, wait);
}

// Leaving replay (or any redraw outside it): no trail, no replay markers, nothing queued.
function leaveReplay() {
  clearTimeout(trailTimer);
  trailTimer = 0; trailPending = null;
  if (data['replay-trail'] !== EMPTY) put('replay-trail', EMPTY);
}

function drawReplay(keyChanged) {
  const stops = rIntent.stops.map(sane).filter(Boolean);
  put('route-ahead', stops.length > 1 ? line(stops) : EMPTY);
  put('route-done', EMPTY);
  put('route-stops', points(stops.map(s => ({ ...s, props: { passed: false } }))));
  put('stations', EMPTY); put('majors', EMPTY); put('stations-selected', EMPTY); put('trains', EMPTY); put('rail-network', EMPTY);
  stationSig = '';
  hideHover();
  dropMarkers(slot => slot.startsWith('replay:'));
  if (keyChanged) {
    userMoved = false;
    camera = { type: 'route' };
    applyCamera(600);
  } else if (fitPending) applyCamera(0);
}

function sync() {
  if (!loaded) return;
  const keyChanged = keyDirty;
  keyDirty = false;
  if (mode !== 'replay') leaveReplay();
  if (mode === 'stations') {
    drawStations();
    if (keyChanged) {
      userMoved = false;
      camera = sIntent.fit === 'country' ? { type: 'country' } : sIntent.fit === 'selected' ? { type: 'selected' } : null;
      if (camera) applyCamera(600);
    } else if (fitPending) applyCamera(0);
  } else if (mode === 'train') {
    drawTrain(keyChanged);
    if (fitPending && !keyChanged) applyCamera(0);
  } else if (mode === 'replay') {
    drawReplay(keyChanged);
  } else {
    for (const id of ['route-ahead', 'route-done', 'route-stops', 'stations', 'majors', 'stations-selected', 'trains', 'rail-network']) put(id, EMPTY);
    stationSig = '';
    dropMarkers();
  }
}

// ---- Hover and taps -----------------------------------------------------------------------------------------

function hideHover() {
  hovered = null;
  const m = markers.get('hover');
  if (m) { m.marker.remove(); markers.delete('hover'); }
  if (map) map.getCanvas().style.cursor = '';
}

async function zoomCluster(id, at) {
  try {
    const zoom = await map.getSource('trains').getClusterExpansionZoom(id);
    map.easeTo({ center: at, zoom: Math.min(zoom + 0.5, 16), essential: true });
  } catch {}
}

function nearestAt(point) {
  const fs = map.queryRenderedFeatures([[point.x - 16, point.y - 16], [point.x + 16, point.y + 16]], { layers: ['trains-cluster', 'trains-hit', 'stations-hit', 'majors-hit'] });
  let best = null, bd = Infinity;
  for (const f of fs) {
    const p = map.project(f.geometry.coordinates);
    const d = (p.x - point.x) ** 2 + (p.y - point.y) ** 2;
    if (d < bd) { bd = d; best = f; }
  }
  if (!best || bd > 18 * 18) return null;
  if (best.layer.id === 'trains-cluster') return { kind: 'cluster', id: best.properties.cluster_id, at: best.geometry.coordinates };
  return best.layer.id === 'trains-hit' ? { kind: 'train', id: best.properties.number, title: best.properties.title, at: best.geometry.coordinates } : { kind: 'station', id: best.properties.id };
}

function bindEvents() {
  map.on('movestart', e => {
    if (!e.originalEvent) return;
    userMoved = true;
    followBroken = true;
    moveHandler();
  });
  map.on('click', e => {
    if (mode !== 'stations') return;
    const hit = nearestAt(e.point);
    if (!hit) return;
    if (hit.kind === 'cluster') return zoomCluster(hit.id, hit.at);
    if (hit.kind === 'train') trainClickHandler(hit.id); else clickHandler(hit.id);
  });
  if (hoverable()) {
    map.on('mousemove', e => {
      if (mode !== 'stations') return;
      const hit = nearestAt(e.point);
      const key = hit && `${hit.kind}:${hit.id}`;
      if (key === hovered) return;
      if (!hit) return hideHover();
      hovered = key;
      map.getCanvas().style.cursor = 'pointer';
      if (hit.kind === 'cluster') { const m = markers.get('hover'); if (m) { m.marker.remove(); markers.delete('hover'); } return; }
      if (hit.kind === 'train') {
        place('hover', hit.at, mapLabel({ title: hit.title, sub: t('clickForTrain'), kind: 'hover' }), { anchor: 'bottom', offset: [0, -12], z: 5 });
        return;
      }
      const id = hit.id, s = stationOf(id);
      if (!s || selectedIds().includes(id)) { const m = markers.get('hover'); if (m) { m.marker.remove(); markers.delete('hover'); } return; }
      place('hover', [s.lon, s.lat], mapLabel({ title: nameOf(s), sub: t('clickForStation'), kind: 'hover' }), { anchor: 'bottom', offset: [0, -12], z: 5 });
    });
    map.getCanvas().addEventListener('mouseleave', hideHover);
  }
}

// ---- Public API ---------------------------------------------------------------------------------------------

export async function initMap(el) {
  styleInfo = await styleFor(styleName);
  map = new maplibregl.Map({
    container: el,
    style: styleInfo.style,
    center: [69.3, 30.4],
    zoom: 4.4,
    minZoom: 3,
    attributionControl: { compact: true, customAttribution: ['Relief: <a href="https://registry.opendata.aws/terrain-tiles/">Terrain Tiles</a>', 'Rail lines © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'] },
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
  });
  map.touchZoomRotate.disableRotation();
  lockToPakistan(map, { bounds: PAKISTAN, outline: await loadPakistan(), visible: padding });
  // The compact attribution opens expanded and covers the south of the map on a phone; start it closed (the ⓘ opens it).
  map.once('load', () => map.getContainer().querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show'));
  bindEvents();
  loadNetwork().then(net => { network = net; if (loaded && mode === 'stations') { put('trains', trainPoints()); put('rail-network', railLines()); } });
  // The container can be sized after the map exists (the panel lays out late on phones): refit once it has real size.
  new ResizeObserver(() => { map.resize(); scheduleRefit(); }).observe(el);
  await new Promise(resolve => map.once('style.load', resolve));
  await addOverlays();
  loaded = true;
  readyResolve();
  sync();
  return readyPromise;
}

export const resize = () => { map?.resize(); if (map && loaded && fitPending) scheduleRefit(); };
export const setInsets = () => { if (map && loaded) scheduleRefit(); };

export function setLang() {
  if (!loaded) return;
  sync(); // DOM labels are rebuilt from the station names in the new language
}

export function zoomIn() { userMoved = true; map?.zoomIn(); }
export function zoomOut() { userMoved = true; map?.zoomOut(); }

let styling = Promise.resolve();
export function cycleStyle() {
  styleName = STYLES[(STYLES.indexOf(styleName) + 1) % STYLES.length];
  try { localStorage.setItem('mapStyle', styleName); } catch {}
  const name = styleName;
  styling = styling.then(async () => {
    await readyPromise;
    styleInfo = await styleFor(name);
    if (name !== styleName) return; // cycled again meanwhile
    loaded = false;
    map.setStyle(styleInfo.style, { diff: false });
    await new Promise(resolve => map.once('style.load', resolve));
    await addOverlays();
    loaded = true;
    sync();
  }).catch(e => console.error('map style:', e));
  return name;
}
export const baseStyle = () => styleName;

export function onUserMove(fn) { moveHandler = fn || (() => {}); }
export function onStationClick(fn) { clickHandler = fn || (() => {}); }
export function onTrainClick(fn) { trainClickHandler = fn || (() => {}); }
export function setTrains(list) {
  trainList = Array.isArray(list) ? list : [];
  if (loaded && mode === 'stations') put('trains', trainPoints());
}

export async function locate() {
  let pos;
  try {
    pos = await new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject({ code: 0 });
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000, maximumAge: 60000 });
    });
  } catch (e) {
    return { ok: false, reason: e && e.code === 1 ? 'denied' : 'unavailable' };
  }
  const here = { lat: pos.coords.latitude, lon: pos.coords.longitude };
  let best = null, bd = Infinity;
  for (const s of allStations) {
    const d = haversineKm(here, s);
    if (d < bd) { bd = d; best = s; }
  }
  if (!best) return { ok: false, reason: 'unavailable' };
  located_ = String(best.id);
  userMoved = false;
  if (mode === 'stations') {
    camera = { type: 'selected' };
    if (loaded) { drawStations(); applyCamera(900); }
  } else if (loaded) {
    camera = null;
    map.flyTo({ center: [best.lon, best.lat], zoom: 10, padding: padding(), essential: true });
  }
  return { ok: true, station: best };
}

export function showStations({ key, stations = [], selected = [], fit = 'keep' } = {}) {
  const changed = !(mode === 'stations' && sIntent && sIntent.key === key);
  if (changed) located_ = null;
  mode = 'stations';
  sIntent = { key, stations, selected, fit };
  allStations = stations.map(sane).filter(Boolean);
  if (changed) keyDirty = true;
  sync();
}

export function showTrain({ key, stops = [], passedIdx = -1, position = null, marker = '', next, mine, follow = false, lastSeen = null } = {}) {
  const changed = !(mode === 'train' && tIntent && tIntent.key === key);
  mode = 'train';
  tIntent = { key, stops, passedIdx, position, marker, next, mine, follow, lastSeen };
  if (changed) keyDirty = true;
  sync();
}

export function showReplay({ key, stops = [] } = {}) {
  const changed = !(mode === 'replay' && rIntent && rIntent.key === key);
  mode = 'replay';
  rIntent = { key, stops };
  if (changed) keyDirty = true;
  sync();
}

export function setReplayFrame(trains) {
  if (mode !== 'replay' || !loaded) return;
  const list = Array.isArray(trains) ? trains : [];
  const ids = new Set(list.map(x => `replay:${x.id}`));
  for (const [slot, m] of markers) if (slot.startsWith('replay:') && !ids.has(slot)) { m.marker.remove(); markers.delete(slot); }
  const trails = [];
  for (const x of list) {
    const slot = `replay:${x.id}`, at = [x.lon, x.lat], label = x.label || '', facing = x.facing === 'left' ? 'left' : 'right';
    let m = markers.get(slot);
    if (!m) {
      m = place(slot, at, trainMarker({ label, facing }), { anchor: 'center', offset: [0, 0], z: 4, root: true });
      m.label = label; m.facing = facing;
    } else {
      m.marker.setLngLat(at);
      if (m.label !== label) { m.label = label; const b = m.marker.getElement().querySelector('.p-trainmarker__label bdi'); if (b) b.textContent = label; }
      if (m.facing !== facing) { m.facing = facing; m.marker.getElement().classList.toggle('p-trainmarker--left', facing === 'left'); }
    }
    if (Array.isArray(x.trail) && x.trail.length >= 2) trails.push({ type: 'Feature', properties: { id: String(x.id) }, geometry: { type: 'LineString', coordinates: x.trail } });
  }
  queueTrail({ type: 'FeatureCollection', features: trails });
}

export function setFollow(on) {
  if (!tIntent) return;
  tIntent.follow = !!on;
  if (on) {
    followBroken = false;
    userMoved = false;
    camera = { type: 'train', zoom: Math.max(map?.getZoom() || 0, 8) };
    if (loaded && located(tIntent.position)) applyCamera(600);
  } else if (camera?.type === 'train') camera = null;
}

export function showWholeRoute() {
  if (tIntent) tIntent.follow = false;
  userMoved = false;
  camera = { type: 'route' };
  if (loaded) applyCamera(600);
}

export function clear() {
  mode = null; sIntent = null; tIntent = null; rIntent = null; located_ = null; camera = null; fitPending = false; keyDirty = false;
  sync();
}
