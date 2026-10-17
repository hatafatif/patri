// MapLibre map kept to Pakistan, with a choice of base style (see mapstyle.js) and our overlays:
// route, trail, stops, train dots and labelled pins.
/* global maplibregl */
import { esc, t } from './i18n.js';
import { styleFor, maskLayers, loadPakistan, STYLES } from './mapstyle.js';

const PAKISTAN = [[60.5, 23.3], [78.0, 37.4]];
const LIMITS = [[54.5, 19.5], [84.0, 41.0]];
const EMPTY = { type: 'FeatureCollection', features: [] };
const line = pts => ({ type: 'Feature', geometry: { type: 'LineString', coordinates: pts.map(p => [p.lon, p.lat]) } });
const points = list => ({
  type: 'FeatureCollection',
  features: list.map(p => ({ type: 'Feature', properties: p.props || {}, geometry: { type: 'Point', coordinates: [p.lon, p.lat] } })),
});

let map, ready, popup, styleInfo;
let styleName = 'truck';
try { if (STYLES.includes(localStorage.getItem('mapStyle'))) styleName = localStorage.getItem('mapStyle'); } catch {}
let trainMarker = null, tween = 0;
let pinMarkers = [];
let dotHandler = () => {};
let moveHandler = () => {};
// Overlay data survives a change of base style, which wipes sources and layers.
const data = { 'route-rest': EMPTY, 'route-done': EMPTY, trail: EMPTY, 'route-stops': EMPTY, dots: EMPTY };
const put = (id, value) => { data[id] = value; map?.getSource(id)?.setData(value); };

async function addOverlays() {
  const pk = await loadPakistan();
  if (styleInfo.englishLabels) {
    const name = ['coalesce', ['get', 'name:en'], ['get', 'name:latin'], ['get', 'name']];
    for (const l of map.getStyle().layers) if (l.type === 'symbol' && l.layout && l.layout['text-field']) map.setLayoutProperty(l.id, 'text-field', name);
  }
  const mask = maskLayers(pk, styleInfo.fade);
  for (const [id, src] of Object.entries(mask.sources)) map.addSource(id, src);
  mask.layers.forEach(l => map.addLayer(l, styleInfo.maskBelow));
  for (const id of Object.keys(data)) map.addSource(id, { type: 'geojson', data: data[id] });
  const round = { 'line-cap': 'round', 'line-join': 'round' };
  map.addLayer({ id: 'route-rest-casing', type: 'line', source: 'route-rest', paint: { 'line-color': '#ffffff', 'line-width': 7, 'line-opacity': 0.95 }, layout: round });
  map.addLayer({ id: 'route-rest', type: 'line', source: 'route-rest', paint: { 'line-color': '#0f6e6e', 'line-width': 3, 'line-dasharray': [2, 1.6] } });
  map.addLayer({ id: 'route-done-casing', type: 'line', source: 'route-done', paint: { 'line-color': '#ffffff', 'line-width': 10 }, layout: round });
  map.addLayer({ id: 'route-done', type: 'line', source: 'route-done', paint: { 'line-color': '#e0218a', 'line-width': 5 }, layout: round });
  map.addLayer({ id: 'trail-casing', type: 'line', source: 'trail', paint: { 'line-color': '#1b1033', 'line-width': 7, 'line-opacity': 0.35 }, layout: round });
  map.addLayer({ id: 'trail', type: 'line', source: 'trail', paint: { 'line-color': '#ffb000', 'line-width': 3.5 }, layout: round });
  map.addLayer({
    id: 'route-stops', type: 'circle', source: 'route-stops',
    paint: { 'circle-radius': 4.5, 'circle-color': ['case', ['get', 'passed'], '#e0218a', '#fff4dc'], 'circle-stroke-color': ['case', ['get', 'passed'], '#ffffff', '#0f6e6e'], 'circle-stroke-width': 2 },
  });
  map.addLayer({
    id: 'dots', type: 'circle', source: 'dots',
    paint: { 'circle-radius': ['case', ['boolean', ['feature-state', 'hover'], false], 10, 7.5], 'circle-color': ['get', 'color'], 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2.5 },
  });
}

export async function initMap(el) {
  styleInfo = await styleFor(styleName);
  map = new maplibregl.Map({
    container: el,
    style: styleInfo.style,
    bounds: PAKISTAN,
    maxBounds: LIMITS,
    fitBoundsOptions: { padding: 20 },
    attributionControl: { compact: true },
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
  });
  map.touchZoomRotate.disableRotation();
  popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 14, className: 'dot-popup' });
  let hovered = null;
  map.on('mousemove', 'dots', e => {
    map.getCanvas().style.cursor = 'pointer';
    const f = e.features[0];
    if (hovered !== null) map.setFeatureState({ source: 'dots', id: hovered }, { hover: false });
    hovered = f.id;
    map.setFeatureState({ source: 'dots', id: hovered }, { hover: true });
    popup.setLngLat(f.geometry.coordinates).setHTML(f.properties.html).addTo(map);
  });
  map.on('mouseleave', 'dots', () => {
    map.getCanvas().style.cursor = '';
    if (hovered !== null && map.getSource('dots')) map.setFeatureState({ source: 'dots', id: hovered }, { hover: false });
    hovered = null;
    popup.remove();
  });
  map.on('click', 'dots', e => dotHandler(e.features[0].properties.key));
  map.on('dragstart', () => moveHandler());
  ready = new Promise(resolve => {
    map.on('style.load', () => addOverlays().then(resolve));
  });
  return ready;
}

export const mapReady = () => ready;
export const baseStyle = () => styleName;

export async function setBaseStyle(name) {
  if (!STYLES.includes(name) || name === styleName) return;
  styleName = name;
  try { localStorage.setItem('mapStyle', name); } catch {}
  styleInfo = await styleFor(name);
  popup?.remove();
  map.setStyle(styleInfo.style, { diff: false });
}

export const onDotClick = fn => { dotHandler = fn; };
export const onUserMove = fn => { moveHandler = fn; };
export const resize = () => map && map.resize();
export const zoomIn = () => map.zoomIn();
export const zoomOut = () => map.zoomOut();

export function setRoute(stops, passedIdx = -1, train = null) {
  const located = stops.filter(s => s.lat);
  const cut = located.filter(s => stops.indexOf(s) <= passedIdx);
  const after = located.filter(s => stops.indexOf(s) > passedIdx);
  const done = train ? [...cut, train] : passedIdx >= 0 ? cut : [];
  const rest = train ? [train, ...after] : passedIdx >= 0 ? [...cut.slice(-1), ...after] : located;
  put('route-done', done.length > 1 ? line(done) : EMPTY);
  put('route-rest', rest.length > 1 ? line(rest) : EMPTY);
  put('route-stops', points(located.map(s => ({ ...s, props: { passed: stops.indexOf(s) <= passedIdx } }))));
}

export const setTrail = pts => put('trail', pts.length > 1 ? line(pts) : EMPTY);

export function clearRoute() {
  for (const id of ['route-rest', 'route-done', 'trail', 'route-stops']) put(id, EMPTY);
}

export function setDots(dots) {
  put('dots', {
    type: 'FeatureCollection',
    features: dots.map((d, i) => ({ type: 'Feature', id: i + 1, properties: { color: d.color, key: d.key, html: d.html }, geometry: { type: 'Point', coordinates: [d.lon, d.lat] } })),
  });
  if (!dots.length && popup) popup.remove();
}

export function setTrain(pos, jump = false) {
  if (!pos) {
    if (trainMarker) trainMarker.remove();
    trainMarker = null;
    return;
  }
  const to = [pos.lon, pos.lat];
  if (!trainMarker) {
    const el = document.createElement('div');
    el.className = 'train-pin';
    trainMarker = new maplibregl.Marker({ element: el }).setLngLat(to).addTo(map);
    return;
  }
  cancelAnimationFrame(tween);
  if (jump) return trainMarker.setLngLat(to);
  const from = trainMarker.getLngLat(), start = performance.now();
  const step = now => {
    const k = Math.min(1, (now - start) / 900);
    trainMarker.setLngLat([from.lng + (to[0] - from.lng) * k, from.lat + (to[1] - from.lat) * k]);
    if (k < 1) tween = requestAnimationFrame(step);
  };
  tween = requestAnimationFrame(step);
}

// Labelled pins: kind 'stop' (your stop), 'station' or 'end' (trip ends).
export function setPins(pins) {
  pinMarkers.forEach(m => m.remove());
  pinMarkers = pins.map(p => {
    const el = document.createElement('div');
    el.className = `pin pin-${p.kind}`;
    el.innerHTML = `<span class="pin-dot"></span>${p.label ? `<span class="pin-label">${esc(p.label)}</span>` : ''}`;
    return new maplibregl.Marker({ element: el }).setLngLat([p.lon, p.lat]).addTo(map);
  });
}

export function fitTo(pts, padding = 60, animate = true) {
  const valid = pts.filter(p => p && p.lat);
  if (!valid.length) return;
  const b = valid.reduce((acc, p) => acc.extend([p.lon, p.lat]), new maplibregl.LngLatBounds([valid[0].lon, valid[0].lat], [valid[0].lon, valid[0].lat]));
  map.fitBounds(b, { padding, maxZoom: 10, duration: animate ? 600 : 0 });
}

export const fitPakistan = (padding = 20) => map.fitBounds(PAKISTAN, { padding, duration: 600 });
export const panTo = pos => map.easeTo({ center: [pos.lon, pos.lat], duration: 800 });

const STYLE_LABEL = { truck: 'styleTruck', satellite: 'styleSatellite', streets: 'styleStreets' };

export function zoomControls() {
  return `<button type="button" class="round-btn" data-zoom="in" aria-label="${esc(t('zoomIn'))}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
    <button type="button" class="round-btn" data-zoom="out" aria-label="${esc(t('zoomOut'))}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg></button>
    <span class="style-switch">
      <button type="button" class="round-btn alt" data-style-menu aria-haspopup="true" aria-expanded="false" aria-label="${esc(t('mapStyle'))}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/></svg></button>
      <span class="style-menu" role="menu" hidden>
        ${STYLES.map(s => `<button type="button" role="menuitemradio" data-style="${s}" aria-checked="${s === styleName}">${esc(t(STYLE_LABEL[s]))}</button>`).join('')}
      </span>
    </span>`;
}
