// Base map styles. "Truck Art" is our own vector style on OpenFreeMap data: warm cream land,
// teal water, quiet roads and the rail network drawn in. Every style gets a mask that fades out
// everything beyond Pakistan's border (outline from Natural Earth, de facto boundaries).

const GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';
const OMT = { type: 'vector', url: 'https://tiles.openfreemap.org/planet' };
const NAME = ['coalesce', ['get', 'name:en'], ['get', 'name:latin'], ['get', 'name']];
const ESRI = layer => ({
  type: 'raster', tileSize: 256, maxzoom: 18, attribution: 'Tiles © Esri',
  tiles: [`https://server.arcgisonline.com/ArcGIS/rest/services/${layer}/MapServer/tile/{z}/{y}/{x}`],
});

export const STYLES = ['truck', 'satellite', 'streets'];

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
export function maskLayers(pk, fadeColor) {
  return {
    sources: {
      'pk-mask': { type: 'geojson', data: maskGeoJSON(pk) },
      'pk-outline': { type: 'geojson', data: pk },
    },
    layers: [
      { id: 'pk-mask', type: 'fill', source: 'pk-mask', paint: { 'fill-color': fadeColor, 'fill-opacity': 0.92 } },
      { id: 'pk-outline-casing', type: 'line', source: 'pk-outline', paint: { 'line-color': '#fff4dc', 'line-width': 5, 'line-opacity': 0.9 } },
      { id: 'pk-outline', type: 'line', source: 'pk-outline', paint: { 'line-color': '#b0306e', 'line-width': 1.8, 'line-dasharray': [3, 1.6] } },
    ],
  };
}

function truckArt(pk) {
  const inPk = ['within', pk];
  const halo = { 'text-halo-color': '#fff4dc', 'text-halo-width': 1.8 };
  return {
    version: 8,
    glyphs: GLYPHS,
    sources: { omt: OMT },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#f3deaf' } },
      { id: 'wood', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: ['==', ['get', 'class'], 'wood'], paint: { 'fill-color': '#cddc9c', 'fill-opacity': 0.5 } },
      { id: 'grass', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: ['in', ['get', 'class'], ['literal', ['grass', 'farmland', 'wetland']]], paint: { 'fill-color': '#e2e3ab', 'fill-opacity': 0.4 } },
      { id: 'sand', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: ['==', ['get', 'class'], 'sand'], paint: { 'fill-color': '#f1d595', 'fill-opacity': 0.55 } },
      { id: 'ice', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: ['in', ['get', 'class'], ['literal', ['ice', 'rock']]], paint: { 'fill-color': '#f4efe6', 'fill-opacity': 0.8 } },
      { id: 'urban', type: 'fill', source: 'omt', 'source-layer': 'landuse', minzoom: 7, filter: ['in', ['get', 'class'], ['literal', ['residential', 'suburb', 'neighbourhood', 'commercial', 'industrial', 'retail']]], paint: { 'fill-color': '#eecb8e', 'fill-opacity': 0.55 } },
      { id: 'park', type: 'fill', source: 'omt', 'source-layer': 'park', minzoom: 8, paint: { 'fill-color': '#cfe0a0', 'fill-opacity': 0.5 } },
      { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': '#8ecfd0' } },
      { id: 'river', type: 'line', source: 'omt', 'source-layer': 'waterway', filter: ['==', ['get', 'class'], 'river'], paint: { 'line-color': '#8ecfd0', 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.8, 10, 2.6, 14, 6] } },
      { id: 'canal', type: 'line', source: 'omt', 'source-layer': 'waterway', minzoom: 8, filter: ['in', ['get', 'class'], ['literal', ['canal', 'stream']]], paint: { 'line-color': '#a6dadb', 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 13, 2] } },
      { id: 'road-minor', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 9, filter: ['in', ['get', 'class'], ['literal', ['tertiary', 'minor', 'service']]], paint: { 'line-color': '#f0d9a8', 'line-width': ['interpolate', ['linear'], ['zoom'], 9, 0.5, 14, 3] }, layout: { 'line-cap': 'round' } },
      { id: 'road-mid', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 6, filter: ['in', ['get', 'class'], ['literal', ['primary', 'secondary']]], paint: { 'line-color': '#e8cd97', 'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.5, 12, 3] }, layout: { 'line-cap': 'round' } },
      { id: 'road-major-casing', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 5, filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk']]], paint: { 'line-color': '#d9b273', 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 1, 12, 5] }, layout: { 'line-cap': 'round' } },
      { id: 'road-major', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 5, filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk']]], paint: { 'line-color': '#fff3d6', 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.4, 12, 3] }, layout: { 'line-cap': 'round' } },
      { id: 'rail', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['==', ['get', 'class'], 'rail'], paint: { 'line-color': '#2b6b6b', 'line-opacity': 0.75, 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.8, 12, 2] } },
      { id: 'rail-ties', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 10, filter: ['==', ['get', 'class'], 'rail'], paint: { 'line-color': '#2b6b6b', 'line-opacity': 0.6, 'line-width': 5, 'line-dasharray': [0.15, 2.5] } },
      { id: 'province', type: 'line', source: 'omt', 'source-layer': 'boundary', minzoom: 4, filter: ['all', ['==', ['get', 'admin_level'], 4], ['!=', ['get', 'maritime'], 1]], paint: { 'line-color': '#c69c63', 'line-width': 0.9, 'line-dasharray': [3, 2] } },
      { id: 'sea-label', type: 'symbol', source: 'omt', 'source-layer': 'water_name', filter: ['in', ['get', 'class'], ['literal', ['ocean', 'sea', 'bay']]], layout: { 'text-field': NAME, 'text-font': ['Noto Sans Italic'], 'text-size': 13, 'text-letter-spacing': 0.15 }, paint: { 'text-color': '#2f7a80', ...halo } },
      { id: 'province-label', type: 'symbol', source: 'omt', 'source-layer': 'place', minzoom: 5, maxzoom: 9, filter: ['all', ['==', ['get', 'class'], 'state'], inPk], layout: { 'text-field': NAME, 'text-font': ['Noto Sans Bold'], 'text-size': 11, 'text-transform': 'uppercase', 'text-letter-spacing': 0.25 }, paint: { 'text-color': '#b0874f', ...halo } },
      { id: 'village-label', type: 'symbol', source: 'omt', 'source-layer': 'place', minzoom: 10, filter: ['all', ['in', ['get', 'class'], ['literal', ['village', 'suburb']]], inPk], layout: { 'text-field': NAME, 'text-font': ['Noto Sans Regular'], 'text-size': 11 }, paint: { 'text-color': '#5a4b62', ...halo } },
      { id: 'town-label', type: 'symbol', source: 'omt', 'source-layer': 'place', minzoom: 6.5, filter: ['all', ['==', ['get', 'class'], 'town'], inPk], layout: { 'text-field': NAME, 'text-font': ['Noto Sans Regular'], 'text-size': ['interpolate', ['linear'], ['zoom'], 7, 11, 12, 14], 'symbol-sort-key': ['get', 'rank'] }, paint: { 'text-color': '#3d2f45', ...halo } },
      { id: 'city-label', type: 'symbol', source: 'omt', 'source-layer': 'place', filter: ['all', ['==', ['get', 'class'], 'city'], inPk], layout: { 'text-field': NAME, 'text-font': ['Noto Sans Bold'], 'text-size': ['interpolate', ['linear'], ['zoom'], 5, 11.5, 10, 16], 'symbol-sort-key': ['get', 'rank'] }, paint: { 'text-color': '#1b1033', ...halo } },
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

// Returns a style object (or URL) plus the colour the outside-Pakistan fade should use.
export async function styleFor(name) {
  const pk = await loadPakistan();
  if (name === 'satellite') return { style: satellite(), fade: '#3a3427', englishLabels: false };
  if (name === 'streets') {
    const base = await (await fetch('https://tiles.openfreemap.org/styles/liberty')).json();
    return { style: base, fade: '#f4efe6', englishLabels: true };
  }
  return { style: truckArt(pk), fade: '#fbf6ec', englishLabels: false, maskBelow: 'sea-label' }; // labels are already Pakistan-only
}
