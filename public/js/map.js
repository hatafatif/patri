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
//   showStations({ key, stations, selected?, fit? })
//                               stations mode (Home, Search, From → To, Station): every station a small dot, the major
//                               cities bigger and labelled, selected ids drawn as selected with a mapLabel 'selected'.
//                               fit: 'country' | 'selected' | 'keep'; applied only when key changes.
//   showTrain({ key, stops, passedIdx, position, marker, next?, mine?, follow })
//                               train mode (Train page, All stops): the route from the stop coordinates, done solid and
//                               ahead dashed, the trainMarker at position, mapLabel 'next' and 'yourstop'. A new key fits
//                               the train (follow) or the whole route; later calls update in place.
//   setFollow(on)               keep the train centred in the visible area
//   showWholeRoute()            fit every stop into the visible area and stop following
//   clear()                     remove every overlay
//
// Notes: the city labels drawn by MapLibre itself stay in English in both languages (it cannot shape Urdu without
// its RTL-text plugin); the DOM labels (mapLabel, trainMarker) carry the language. Stations are
// { id, name, nameUr, lat, lon }; stops are the same, in route order.
/* global maplibregl */
import { mapPaint, mapLabel, trainMarker } from './components/index.js';
import { stationName } from './names.js';
import { haversineKm } from './eta.js';
import { t } from './i18n.js';
import { styleFor, maskLayers, loadPakistan, STYLES, MAJORS } from './mapstyle.js';

const PAKISTAN = [[60.8, 23.6], [77.9, 37.1]];
const LIMITS = [[35.0, 0.0], [105.0, 60.0]]; // wide enough that a tall phone can still fit all of Pakistan above the sheet
const EMPTY = { type: 'FeatureCollection', features: [] };
const TWEEN_MS = 900;
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
const SOURCES = ['route-ahead', 'route-done', 'route-stops', 'stations', 'majors', 'stations-selected'];
const data = Object.fromEntries(SOURCES.map(id => [id, EMPTY]));
const put = (id, value) => { data[id] = value; map?.getSource(id)?.setData(value); };

// What the views last asked for. Everything is drawn from these, so a call made before the map loads (or an
// overlay lost to a style change) is not lost.
let mode = null; // 'stations' | 'train' | null
let sIntent = null; // { key, stations, selected, fit }
let tIntent = null; // { key, stops, passedIdx, position, marker, next, mine, follow }
let located_ = null; // station id picked by locate(), kept until the stations key changes
let stationSig = '', byId = new Map(), allStations = [];
let fitPending = false; // a fit is waiting for the container to have a size
let keyDirty = false; // a key changed and the map has not drawn it yet
let camera = null; // { type: 'country' | 'selected' | 'route' | 'train' }: what the camera keeps in view
let userMoved = false, followBroken = false;
let lastFitSig = '', refitTimer = 0, hasFitted = false;
let moveHandler = () => {}, clickHandler = () => {};
let hovered = null;

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
  let top = 24, bottom = covered + 24, left = rtl ? controls : side, right = rtl ? side : controls;
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
  const stops = (tIntent?.stops || []).map(sane).filter(Boolean);
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
  for (const id of SOURCES) map.addSource(id, { type: 'geojson', data: data[id] });
  const round = { 'line-cap': 'round', 'line-join': 'round' };
  const ring = p.station['circle-color'];
  const surface = p.cityLabel['text-halo-color'];
  const grow = (a, b, c) => ['interpolate', ['linear'], ['zoom'], 4, a, 9, b, 13, c];

  map.addLayer({ id: 'route-ahead', type: 'line', source: 'route-ahead', paint: p.routeAhead, layout: { 'line-join': 'round' } });
  map.addLayer({ id: 'route-done-casing', type: 'line', source: 'route-done', paint: p.routeDoneCasing, layout: round });
  map.addLayer({ id: 'route-done', type: 'line', source: 'route-done', paint: p.routeDone, layout: round });
  map.addLayer({
    id: 'route-stops', type: 'circle', source: 'route-stops',
    paint: { 'circle-radius': 3.5, 'circle-color': ['case', ['get', 'passed'], p.routeDone['line-color'], surface], 'circle-stroke-color': ['case', ['get', 'passed'], surface, ring], 'circle-stroke-width': 1.5 },
  });
  // Small stations show once the map is zoomed in; the major cities show at every zoom.
  const fadeIn = ['interpolate', ['linear'], ['zoom'], 6.5, 0, 7.5, 1];
  map.addLayer({ id: 'stations', type: 'circle', source: 'stations', minzoom: 6.5, paint: { ...p.station, 'circle-radius': grow(2, 3, 4.5), 'circle-stroke-color': surface, 'circle-stroke-width': 1, 'circle-opacity': fadeIn, 'circle-stroke-opacity': fadeIn } });
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
  // Invisible and wide, so a finger hits a station.
  map.addLayer({ id: 'stations-hit', type: 'circle', source: 'stations', minzoom: 7, paint: { 'circle-radius': 16, 'circle-color': ring, 'circle-opacity': 0 } });
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
  put('route-ahead', EMPTY); put('route-done', EMPTY); put('route-stops', EMPTY);
  dropMarkers(slot => slot.startsWith('sel:') || slot === 'hover');
  for (const [slot, m] of markers) if (slot.startsWith('sel:') && !sel.some(s => `sel:${s.id}` === slot)) { m.marker.remove(); markers.delete(slot); }
  for (const s of sel) place(`sel:${s.id}`, [s.lon, s.lat], mapLabel({ title: nameOf(s), kind: 'selected' }), { anchor: 'bottom', offset: [0, -14], z: 3 });
  if (hovered && sel.some(s => String(s.id) === hovered)) hideHover();
}

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
  const { stops, passedIdx = -1, position, marker, next, mine, follow } = tIntent;
  const all = stops.map(sane);
  const pts = all.filter(Boolean);
  const cut = pts.filter(s => all.indexOf(s) <= passedIdx);
  const after = pts.filter(s => all.indexOf(s) > passedIdx);
  const pos = located(position) ? { lat: position.lat, lon: position.lon } : null;
  const done = pos ? [...cut, pos] : passedIdx >= 0 ? cut : [];
  const rest = pos ? [pos, ...after] : passedIdx >= 0 ? [...cut.slice(-1), ...after] : pts;
  put('route-done', done.length > 1 ? line(done) : EMPTY);
  put('route-ahead', rest.length > 1 ? line(rest) : EMPTY);
  put('route-stops', points(pts.map(s => ({ ...s, props: { passed: all.indexOf(s) <= passedIdx } }))));
  put('stations', EMPTY); put('majors', EMPTY); put('stations-selected', EMPTY);
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
    if (!m) { place('train', to, trainMarker({ label: marker || '' }), { anchor: 'center', offset: [0, 0], z: 4, root: true }); trainAt = to; markers.get('train').label = marker || ''; }
    else {
      if (m.label !== (marker || '')) { m.label = marker || ''; const b = m.marker.getElement().querySelector('.p-trainmarker__label bdi'); if (b) b.textContent = m.label; }
      moveTrain(to, keyChanged);
    }
  } else dropMarkers(slot => slot !== 'train');

  if (keyChanged) {
    followBroken = false;
    userMoved = false;
    camera = follow && pos ? { type: 'train', zoom: 9 } : { type: 'route' };
    applyCamera(600);
  } else if (follow && pos && !followBroken && camera?.type === 'train') {
    // Ease along with the marker's tween so the train stays centred while it moves.
    if (sized()) map.easeTo({ center: [pos.lon, pos.lat], padding: padding(), duration: TWEEN_MS, easing: x => x, essential: true });
  } else if (follow && pos && !followBroken) {
    camera = { type: 'train', zoom: Math.max(map.getZoom(), 8) };
    userMoved = false;
    applyCamera(600);
  } else if (!follow && camera?.type === 'train') camera = null;
}

function sync() {
  if (!loaded) return;
  const keyChanged = keyDirty;
  keyDirty = false;
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
  } else {
    for (const id of ['route-ahead', 'route-done', 'route-stops', 'stations', 'majors', 'stations-selected']) put(id, EMPTY);
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

function nearestAt(point) {
  const fs = map.queryRenderedFeatures([[point.x - 16, point.y - 16], [point.x + 16, point.y + 16]], { layers: ['stations-hit', 'majors-hit'] });
  let best = null, bd = Infinity;
  for (const f of fs) {
    const p = map.project(f.geometry.coordinates);
    const d = (p.x - point.x) ** 2 + (p.y - point.y) ** 2;
    if (d < bd) { bd = d; best = f; }
  }
  return best && bd <= 18 * 18 ? best.properties.id : null;
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
    const id = nearestAt(e.point);
    if (id) clickHandler(id);
  });
  if (hoverable()) {
    map.on('mousemove', e => {
      if (mode !== 'stations') return;
      const id = nearestAt(e.point);
      if (id === hovered) return;
      if (!id) return hideHover();
      hovered = id;
      map.getCanvas().style.cursor = 'pointer';
      const s = stationOf(id);
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
    maxBounds: LIMITS,
    attributionControl: { compact: true },
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
  });
  map.touchZoomRotate.disableRotation();
  bindEvents();
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

export function showTrain({ key, stops = [], passedIdx = -1, position = null, marker = '', next, mine, follow = false } = {}) {
  const changed = !(mode === 'train' && tIntent && tIntent.key === key);
  mode = 'train';
  tIntent = { key, stops, passedIdx, position, marker, next, mine, follow };
  if (changed) keyDirty = true;
  sync();
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
  mode = null; sIntent = null; tIntent = null; located_ = null; camera = null; fitPending = false; keyDirty = false;
  sync();
}
