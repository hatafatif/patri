// MapMarkers: the train marker, the map label cards and the MapLibre paint values drawn on the map.
import { bdi, cx, trainIcon, icon } from './_shared.js';

/**
 * The followed train's marker: a 40px yellow badge holding the little green locomotive, with a dark ring and halo, and a dark label beside it. Anchor the marker at its centre, which is the badge.
 * @typedef {object} TrainMarkerProps
 * @property {string} label - The text beside the badge, such as "28 DN · 105 km/h". Already localised.
 * @property {'left' | 'right'} [facing='right'] - Which way the locomotive points, so it can face the way the train travels on the map.
 * @property {boolean} [stale=false] - true fades the marker (class p-trainmarker--stale): the train is shown where it was last seen, not where it is.
 */
export function trainMarker({ label = '', facing = 'right', stale = false } = {}) {
  return `<div class="${cx('p-trainmarker', facing === 'left' && 'p-trainmarker--left', stale && 'p-trainmarker--stale')}"><span class="p-trainmarker__dot">${trainIcon()}</span><span class="p-trainmarker__label">${bdi(label)}</span></div>`;
}

/**
 * A label card on the map: the next stop, your stop, the selected station or the one under the pointer.
 * @typedef {object} MapLabelProps
 * @property {string} title - The station name. Already localised.
 * @property {string} [sub] - A second line, such as "~12:40 PM". Already localised.
 * @property {'next' | 'yourstop' | 'selected' | 'hover'} kind - next and hover are light with a sabz-700 border; yourstop and selected are dark with a yellow title.
 */
export function mapLabel({ title = '', sub, kind = 'next' } = {}) {
  const k = ['next', 'yourstop', 'selected', 'hover'].includes(kind) ? kind : 'next';
  return `<div class="${cx('p-maplabel', `p-maplabel--${k}`)}"><span class="p-maplabel__title">${bdi(title)}</span>${sub ? `<span class="p-maplabel__sub">${bdi(sub)}</span>` : ''}</div>`;
}

// A token's hex colour (#rgb or #rrggbb) as rgba(), for a fade to transparent.
function withAlpha(hex, a) {
  let h = String(hex).trim().replace('#', '');
  if (h.length === 3) h = [...h].map(c => c + c).join('');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/**
 * MapLibre paint values read from the design tokens when called, so a token change reaches the map. Pass them as the paint of a layer: station and majorCity to circle layers, rail, routeDone, routeDoneCasing, routeAhead and border to line layers, land and water to fill layers, cityLabel to a symbol layer.
 * @typedef {object} MapPaintResult
 * @property {Record<string, unknown>} station - Small station dot, map-station, radius 2.5; shown when the map is zoomed in.
 * @property {Record<string, unknown>} majorCity - Surface fill, ink stroke 2, radius 5.5.
 * @property {Record<string, unknown>} selectedStation - A zard-500 fill inside a sabz-700 ring.
 * @property {Record<string, unknown>} trainDot - A running train on the Home and Station maps: a zard-500 dot with a sabz-900 ring, radius 5.
 * @property {Record<string, unknown>} rail - Rail lines with no train selected, map-rail.
 * @property {Record<string, unknown>} routeDoneCasing - The white casing under the route done, width 8.
 * @property {Record<string, unknown>} routeDone - The route the train has covered: sabz-700, width 5.
 * @property {Record<string, unknown>} routeAhead - The route still to run: sabz-700, width 3, dashed.
 * @property {Record<string, unknown>} replayTrail - The fading trail behind a replayed train: zard-500, width 5, a line-gradient from transparent (tail) to opaque (train); the source needs lineMetrics.
 * @property {Record<string, unknown>} replayTrailCasing - Under replayTrail: sabz-900, width 9, fading the same way, so the yellow reads on the light map like the marker's ring.
 * @property {Record<string, unknown>} railNetwork - The rail lines trains run on, under the stations on the overview maps: sabz-700 at 55%, 1.2px at zoom 5 widening to 4px at zoom 12.
 * @property {Record<string, unknown>} trainClusterText - The count on a trainImages().cluster pill: sabz-900.
 * @property {Record<string, unknown>} cityLabel - Text paint for major city labels: ink with a surface halo.
 * @property {Record<string, unknown>} land - Land fill, map-land.
 * @property {Record<string, unknown>} water - Water fill, map-water.
 * @property {Record<string, unknown>} border - Province and country borders, map-border, dashed.
 */
export function mapPaint() {
  const css = getComputedStyle(document.documentElement);
  const v = name => css.getPropertyValue(`--${name}`).trim();
  return {
    station: { 'circle-color': v('map-station'), 'circle-radius': 2.5 },
    majorCity: { 'circle-color': v('surface'), 'circle-stroke-color': v('ink'), 'circle-stroke-width': 2, 'circle-radius': 5.5 },
    selectedStation: { 'circle-color': v('zard-500'), 'circle-stroke-color': v('sabz-700'), 'circle-stroke-width': 3, 'circle-radius': 7 },
    trainDot: { 'circle-color': v('zard-500'), 'circle-stroke-color': v('sabz-900'), 'circle-stroke-width': 2, 'circle-radius': 5 },
    rail: { 'line-color': v('map-rail'), 'line-width': 1.5 },
    routeDoneCasing: { 'line-color': v('surface'), 'line-width': 8 },
    routeDone: { 'line-color': v('sabz-700'), 'line-width': 5 },
    routeAhead: { 'line-color': v('sabz-700'), 'line-width': 3, 'line-dasharray': [2, 2] },
    // Both fade in over the oldest 40% of the trail only, so the yellow never sits half-transparent on the dark casing.
    railNetwork: { 'line-color': v('sabz-700'), 'line-opacity': 0.55, 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 1.2, 9, 2.5, 12, 4] },
    trainClusterText: { 'text-color': v('sabz-900') },
    replayTrail: { 'line-width': 5, 'line-gradient': ['interpolate', ['linear'], ['line-progress'], 0, withAlpha(v('zard-500'), 0), 0.4, v('zard-500'), 1, v('zard-500')] },
    replayTrailCasing: { 'line-width': 9, 'line-gradient': ['interpolate', ['linear'], ['line-progress'], 0, withAlpha(v('sabz-900'), 0), 0.4, withAlpha(v('sabz-900'), 0.9), 1, withAlpha(v('sabz-900'), 0.9)] },
    cityLabel: { 'text-color': v('ink'), 'text-halo-color': v('surface'), 'text-halo-width': 1.5 },
    land: { 'fill-color': v('map-land') },
    water: { 'fill-color': v('map-water') },
    border: { 'line-color': v('map-border'), 'line-width': 1, 'line-dasharray': [3, 2] },
  };
}

const svgImage = svg => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '))}`;
});

// Draws on a canvas at twice the size (the images are added with pixelRatio 2) and returns its pixels.
function draw(w, h, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = w * 2;
  canvas.height = h * 2;
  const g = canvas.getContext('2d');
  g.scale(2, 2);
  paint(g);
  return g.getImageData(0, 0, w * 2, h * 2);
}

/**
 * The overview maps' train images, drawn from the tokens, for map.addImage(name, image, { pixelRatio: 2 }).
 * - `cluster`: a zard-500 pill with a sabz-900 ring and the locomotive in sabz-900, 50×26, with room on its right for the
 *   count (a symbol's text, trainClusterText paint, text-offset [0.75, 0]).
 * - `loco`: a top-down locomotive pointing up: sabz-900 body, zard-500 nose and windscreen, a surface outline. 16×22;
 *   anchor it at the bottom, which is the coupling.
 * - `coach`: the coach behind it: a sabz-700 body with zard-500 windows and a surface outline. 16×22; anchor it at the top.
 * Rotate the loco to the track ahead and the coach to the track behind (track.js headingsAt), and the train bends at
 * the coupling on a curve.
 * @returns {Promise<{ cluster: ImageData, loco: ImageData, coach: ImageData }>}
 */
export async function trainImages() {
  const css = getComputedStyle(document.documentElement);
  const v = name => css.getPropertyValue(`--${name}`).trim();
  const ink = v('sabz-900'), green = v('sabz-700'), yellow = v('zard-500'), surface = v('surface');
  const glyph = await svgImage(icon.train.replace('stroke="currentColor"', `stroke="${ink}"`).replace('stroke-width="2"', 'stroke-width="2.4"'));
  const outline = (g, path) => { g.lineJoin = 'round'; g.lineWidth = 3; g.strokeStyle = surface; g.stroke(path); };
  const cluster = draw(50, 26, g => {
    g.beginPath();
    g.roundRect(1, 1, 48, 24, 12);
    g.fillStyle = yellow; g.fill();
    g.lineWidth = 2; g.strokeStyle = ink; g.stroke();
    g.drawImage(glyph, 7, 5, 16, 16);
  });
  const loco = draw(16, 22, g => {
    // Nose at the top, rear 1.5px above the image's bottom edge: the coupling.
    const body = new Path2D();
    body.moveTo(-5, 20); body.lineTo(-5, 9); body.quadraticCurveTo(-5, 2, 0, 2); body.quadraticCurveTo(5, 2, 5, 9); body.lineTo(5, 20); body.closePath();
    g.translate(8, 0);
    outline(g, body);
    g.fillStyle = ink; g.fill(body);
    g.save(); g.clip(body); g.fillStyle = yellow; g.fillRect(-6, 1, 12, 6); g.restore();
    g.fillStyle = yellow; g.fillRect(-3, 9, 6, 1.6);
  });
  const coach = draw(16, 22, g => {
    const body = new Path2D();
    body.roundRect(-5, 2, 10, 18, 2.5);
    g.translate(8, 0);
    outline(g, body);
    g.fillStyle = green; g.fill(body);
    g.fillStyle = yellow;
    for (const y of [5.5, 10.2, 14.9]) g.fillRect(-2.5, y, 5, 1.6);
  });
  return { cluster, loco, coach };
}

/**
 * A single entry point for the registry, so the component can be called by name as Patri.MapMarkers. It dispatches to trainMarker or mapLabel.
 * @typedef {object} MapMarkersProps
 * @property {'train' | 'label'} type - train renders trainMarker; label renders mapLabel.
 * @property {string} [label] - For type train: the text beside the dot.
 * @property {string} [title] - For type label: the station name.
 * @property {string} [sub] - For type label: a second line.
 * @property {'next' | 'yourstop' | 'selected' | 'hover'} [kind='next'] - For type label: the card style.
 */
export function MapMarkers({ type, ...rest } = {}) {
  return type === 'train' ? trainMarker(rest) : mapLabel(rest);
}
