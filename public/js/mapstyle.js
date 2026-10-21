// Base map styles. "Sabz" is our own style on OpenFreeMap data: terrain relief, land, water, province borders and
// the rail network, coloured from the design tokens. Satellite and Streets are alternatives. Every style
// gets a mask that fades out everything beyond Pakistan's border (outline from Natural Earth, de facto boundaries).
import { mapPaint } from './components/index.js';

const GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';
const OMT = { type: 'vector', url: 'https://tiles.openfreemap.org/planet' };
const NAME = ['coalesce', ['get', 'name:en'], ['get', 'name:latin'], ['get', 'name']];
const ESRI = layer => ({
  type: 'raster', tileSize: 256, maxzoom: 18, attribution: 'Tiles © Esri',
  tiles: [`https://server.arcgisonline.com/ArcGIS/rest/services/${layer}/MapServer/tile/{z}/{y}/{x}`],
});

export const RELIEF = {
  url: '/data/relief.webp',
  // The zoom 7 tile edges the image was made for (scripts/build-relief.py): top left, top right, bottom right, bottom left.
  coordinates: [[59.0625, 38.822591], [78.75, 38.822591], [78.75, 21.943046], [59.0625, 21.943046]],
};

export const STYLES = ['sabz', 'satellite', 'streets'];

/**
 * The major cities drawn bigger and labelled in stations mode. `match` picks the city's main station by name
 * from the station list; `label` is the city name shown on the map; `names` are the base map's own spellings,
 * which the Sabz style hides so a city is not labelled twice.
 */
export const MAJORS = [
  { label: 'Peshawar', match: /^peshawar cantt/i, names: ['Peshawar'] },
  { label: 'Rawalpindi', match: /^rawalpindi$/i, names: ['Rawalpindi'] },
  { label: 'Lahore', match: /^lahore jn/i, names: ['Lahore'] },
  { label: 'Faisalabad', match: /^faisalabad$/i, names: ['Faisalabad'] },
  { label: 'Multan', match: /^multan cantt/i, names: ['Multan'] },
  { label: 'Sukkur', match: /^rohri jn/i, names: ['Sukkur', 'Rohri'] },
  { label: 'Hyderabad', match: /^hyderabad jn/i, names: ['Hyderabad'] },
  { label: 'Karachi', match: /^karachi cantt/i, names: ['Karachi'] },
];
const MAJOR_NAMES = MAJORS.flatMap(m => m.names);

const token = name => getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();

let pakistan = null;
export async function loadPakistan() {
  if (!pakistan) pakistan = await (await fetch('/data/pakistan.json')).json();
  return pakistan;
}

const area = ring => ring.reduce((s, [x1, y1], i) => { const [x2, y2] = ring[(i + 1) % ring.length]; return s + (x2 - x1) * (y2 + y1); }, 0);

// The world with Pakistan cut out, wound so the hole is a hole.
function maskGeoJSON(pk) {
  const holes = pk.geometry.coordinates.map(poly => poly[0]);
  let outer = [[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]];
  if (Math.sign(area(outer)) === Math.sign(area(holes[0]))) outer = outer.reverse();
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [outer, ...holes] } };
}

// Layers added on top of any base style: the fade and Pakistan's outline.
export function maskLayers(pk, fadeColor, fadeOpacity = 0.92) {
  return {
    sources: {
      'pk-mask': { type: 'geojson', data: maskGeoJSON(pk) },
      'pk-outline': { type: 'geojson', data: pk },
    },
    layers: [
      { id: 'pk-mask', type: 'fill', source: 'pk-mask', paint: { 'fill-color': fadeColor, 'fill-opacity': fadeOpacity } },
      { id: 'pk-outline-casing', type: 'line', source: 'pk-outline', paint: { 'line-color': token('surface'), 'line-width': 5, 'line-opacity': 0.9 } },
      { id: 'pk-outline', type: 'line', source: 'pk-outline', paint: { 'line-color': token('map-border'), 'line-width': 1.6, 'line-dasharray': [3, 1.6] } },
    ],
  };
}

function sabz(pk) {
  const p = mapPaint();
  const inPk = ['within', pk];
  const halo = { 'text-halo-color': token('surface'), 'text-halo-width': 1.6 };
  const muted = token('ink-muted');
  const hideMajors = ['!', ['in', NAME, ['literal', [...MAJOR_NAMES, 'Islamabad']]]];
  const roundLine = { 'line-cap': 'round', 'line-join': 'round' };
  const roads = ['literal', ['motorway', 'trunk', 'primary', 'secondary']];
  return {
    version: 8,
    glyphs: GLYPHS,
    sources: { omt: OMT, relief: { type: 'image', ...RELIEF } },
    layers: [
      { id: 'map-land', type: 'background', paint: { 'background-color': p.land['fill-color'] } },
      // Landcover is empty over Pakistan below about zoom 7 and patchy above it, so it sits under the relief and shows as the relief fades.
      { id: 'landcover-green', type: 'fill', source: 'omt', 'source-layer': 'landcover', minzoom: 7, filter: ['in', ['get', 'class'], ['literal', ['farmland', 'grass']]], paint: { 'fill-color': token('map-green') } },
      { id: 'landcover-wood', type: 'fill', source: 'omt', 'source-layer': 'landcover', minzoom: 7, filter: ['==', ['get', 'class'], 'wood'], paint: { 'fill-color': token('map-wood') } },
      { id: 'landcover-ice', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: ['==', ['get', 'class'], 'ice'], paint: { 'fill-color': token('map-ice') } },
      // Terrain relief, clipped to Pakistan: full strength for the country view, fading as OSM detail takes over.
      { id: 'relief', type: 'raster', source: 'relief', paint: { 'raster-opacity': ['interpolate', ['linear'], ['zoom'], 8, 1, 11, 0.3], 'raster-fade-duration': 0 } },
      { id: 'urban', type: 'fill', source: 'omt', 'source-layer': 'landuse', minzoom: 7, filter: ['in', ['get', 'class'], ['literal', ['residential', 'suburb', 'neighbourhood', 'commercial', 'industrial', 'retail']]], paint: { 'fill-color': token('map-urban'), 'fill-opacity': 0.9 } },
      { id: 'map-water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: p.water },
      { id: 'map-river', type: 'line', source: 'omt', 'source-layer': 'waterway', filter: ['==', ['get', 'class'], 'river'], paint: { 'line-color': p.water['fill-color'], 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.8, 10, 2.4, 14, 6] }, layout: roundLine },
      { id: 'map-canal', type: 'line', source: 'omt', 'source-layer': 'waterway', minzoom: 9, filter: ['in', ['get', 'class'], ['literal', ['canal', 'stream']]], paint: { 'line-color': p.water['fill-color'], 'line-width': ['interpolate', ['linear'], ['zoom'], 9, 0.5, 14, 2] } },
      { id: 'road-minor', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 10, filter: ['in', ['get', 'class'], ['literal', ['tertiary', 'minor', 'service']]], paint: { 'line-color': token('line-soft'), 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.5, 15, 3] }, layout: roundLine },
      { id: 'road-major', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 6, filter: ['in', ['get', 'class'], roads], paint: { 'line-color': token('line'), 'line-opacity': 0.8, 'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.4, 12, 2.4] }, layout: roundLine },
      { id: 'map-rail', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['==', ['get', 'class'], 'rail'], paint: { ...p.rail, 'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.7, 8, 1.4, 12, 2.2] } },
      { id: 'map-rail-ties', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 10, filter: ['==', ['get', 'class'], 'rail'], paint: { 'line-color': p.rail['line-color'], 'line-width': 5, 'line-dasharray': [0.15, 2.5] } },
      { id: 'map-border', type: 'line', source: 'omt', 'source-layer': 'boundary', minzoom: 4, filter: ['all', ['==', ['get', 'admin_level'], 4], ['!=', ['get', 'maritime'], 1]], paint: p.border },
      // The Arabian Sea, drawn above the fade over the neighbours (map.js puts the fade under this layer).
      { id: 'sea', type: 'fill', source: 'omt', 'source-layer': 'water', filter: ['==', ['get', 'class'], 'ocean'], paint: p.water },
      { id: 'sea-label', type: 'symbol', source: 'omt', 'source-layer': 'water_name', filter: ['in', ['get', 'class'], ['literal', ['ocean', 'sea', 'bay']]], layout: { 'text-field': NAME, 'text-font': ['Noto Sans Italic'], 'text-size': 13, 'text-letter-spacing': 0.15 }, paint: { 'text-color': muted, ...halo } },
      { id: 'province-label', type: 'symbol', source: 'omt', 'source-layer': 'place', minzoom: 5, maxzoom: 9, filter: ['all', ['==', ['get', 'class'], 'state'], inPk], layout: { 'text-field': NAME, 'text-font': ['Noto Sans Bold'], 'text-size': 11, 'text-transform': 'uppercase', 'text-letter-spacing': 0.25 }, paint: { 'text-color': token('map-border'), ...halo } },
      { id: 'village-label', type: 'symbol', source: 'omt', 'source-layer': 'place', minzoom: 10, filter: ['all', ['in', ['get', 'class'], ['literal', ['village', 'suburb']]], inPk], layout: { 'text-field': NAME, 'text-font': ['Noto Sans Regular'], 'text-size': 11 }, paint: { 'text-color': muted, ...halo } },
      { id: 'town-label', type: 'symbol', source: 'omt', 'source-layer': 'place', minzoom: 6.5, filter: ['all', ['==', ['get', 'class'], 'town'], inPk], layout: { 'text-field': NAME, 'text-font': ['Noto Sans Regular'], 'text-size': ['interpolate', ['linear'], ['zoom'], 7, 11, 12, 14], 'symbol-sort-key': ['get', 'rank'] }, paint: { 'text-color': token('ink'), ...halo } },
      // Our own labels draw the major cities (map.js), so the base map's copies of them are left out. Islamabad,
      // 15 km from Rawalpindi, appears once the map is zoomed in.
      { id: 'city-label', type: 'symbol', source: 'omt', 'source-layer': 'place', filter: ['all', ['==', ['get', 'class'], 'city'], inPk, hideMajors], layout: { 'text-field': NAME, 'text-font': ['Noto Sans Bold'], 'text-size': ['interpolate', ['linear'], ['zoom'], 5, 11, 10, 15], 'symbol-sort-key': ['get', 'rank'] }, paint: { ...p.cityLabel, 'text-color': muted } },
      { id: 'islamabad-label', type: 'symbol', source: 'omt', 'source-layer': 'place', minzoom: 9, filter: ['all', ['==', ['get', 'class'], 'city'], ['==', NAME, 'Islamabad']], layout: { 'text-field': NAME, 'text-font': ['Noto Sans Bold'], 'text-size': 15 }, paint: { ...p.cityLabel, 'text-color': muted } },
    ],
  };
}

function satellite() {
  return {
    version: 8,
    glyphs: GLYPHS,
    sources: { imagery: ESRI('World_Imagery'), roads: ESRI('Reference/World_Transportation'), places: ESRI('Reference/World_Boundaries_and_Places') },
    layers: [
      { id: 'imagery', type: 'raster', source: 'imagery' },
      { id: 'roads', type: 'raster', source: 'roads' },
      { id: 'places', type: 'raster', source: 'places' },
    ],
  };
}

let liberty = null;
// Returns a style object plus the colour the outside-Pakistan fade should use.
export async function styleFor(name) {
  const pk = await loadPakistan();
  if (name === 'satellite') return { style: satellite(), fade: token('sabz-900'), fadeOpacity: 0.8, englishLabels: false };
  if (name === 'streets') {
    liberty ||= fetch('https://tiles.openfreemap.org/styles/liberty').then(r => r.json()).catch(e => { liberty = null; throw e; });
    return { style: structuredClone(await liberty), fade: token('map-land'), fadeOpacity: 0.92, englishLabels: true };
  }
  return { style: sabz(pk), fade: token('map-outside'), fadeOpacity: 0.9, englishLabels: false, maskBelow: 'sea', outlineBelow: 'sea-label' }; // labels are already Pakistan-only
}
