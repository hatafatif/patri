// Keeps Pakistan in view. MapLibre's maxBounds bounds the whole container, the part under the phone panel too,
// so it had to be far wider than Pakistan. This works in the visible area instead (what the panel and the map
// buttons leave uncovered), through MapLibre's transformCameraUpdate hook, which every camera change goes
// through: drags, pinches, scrolls, easeTo, flyTo and fitBounds.
//
// Per axis, in the visible area: while Pakistan's bounding box fits, it stays centred and can't be dragged
// aside; zoomed in past that, the view stays inside the box and its middle stays on Pakistani ground (the
// box's corners are India, Iran and Afghanistan). The map can't zoom out much past the whole country.
/* global maplibregl */

const SLACK = 0.5; // how far, in zoom levels, the map may zoom out past the whole country

// Web Mercator, 0..1 across the world, y downwards.
const mx = lng => (lng + 180) / 360;
const my = lat => (1 - Math.asinh(Math.tan((lat * Math.PI) / 180)) / Math.PI) / 2;
const lngOf = x => x * 360 - 180;
const latOf = y => (Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180) / Math.PI;
// One axis: the box [lo, hi] centred when it fits in the visible span (before + after around the centre v),
// otherwise v kept so the span stays inside the box.
const axis = (v, lo, hi, before, after) => (hi - lo <= before + after ? (lo + hi + before - after) / 2 : Math.min(Math.max(v, lo + before), hi - after));

function inside([x, y], rings) {
  let hit = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
    }
  }
  return hit;
}

function nearest([x, y], rings) {
  let best = [x, y], bd = Infinity;
  for (const ring of rings) {
    for (let i = 1; i < ring.length; i++) {
      const [ax, ay] = ring[i - 1], [bx, by] = ring[i];
      const dx = bx - ax, dy = by - ay, len = dx * dx + dy * dy;
      const k = len ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len)) : 0;
      const px = ax + k * dx, py = ay + k * dy, d = (px - x) ** 2 + (py - y) ** 2;
      if (d < bd) { bd = d; best = [px, py]; }
    }
  }
  return best;
}

/**
 * @param {maplibregl.Map} map
 * @param {{ bounds: [[number, number], [number, number]], outline: object, visible: () => { top: number, bottom: number, left: number, right: number } }} opts
 *   bounds: Pakistan's [[west, south], [east, north]]; outline: its GeoJSON Feature; visible: the padding around the visible area, in px.
 */
export function lockToPakistan(map, { bounds, outline, visible }) {
  const [[w, s], [e, n]] = bounds;
  const box = { x0: mx(w), x1: mx(e), y0: my(n), y1: my(s) };
  const g = outline.geometry;
  const rings = (g.type === 'Polygon' ? [g.coordinates] : g.coordinates).flat().map(r => r.map(([a, b]) => [mx(a), my(b)]));

  map.transformCameraUpdate = tr => {
    const W = tr.width, H = tr.height;
    if (W < 80 || H < 80) return {};
    // The screen point the camera centre sits at (the middle of the transform's padded area), and how far the
    // visible area reaches from it on each side.
    const p = tr.padding, v = visible();
    const cx = p.left + (W - p.left - p.right) / 2, cy = p.top + (H - p.top - p.bottom) / 2;
    const left = cx - v.left, right = W - v.right - cx, up = cy - v.top, down = H - v.bottom - cy;
    if (left + right < 40 || up + down < 40) return {};

    const fit = tr.zoom + Math.log2(Math.min((left + right) / ((box.x1 - box.x0) * tr.worldSize), (up + down) / ((box.y1 - box.y0) * tr.worldSize)));
    const zoom = Math.max(tr.zoom, fit - SLACK);
    const ws = tr.worldSize * 2 ** (zoom - tr.zoom);
    const a = { x0: box.x0 * ws, x1: box.x1 * ws, y0: box.y0 * ws, y1: box.y1 * ws };
    let x = mx(tr.center.lng) * ws, y = my(tr.center.lat) * ws;

    if (a.x1 - a.x0 > left + right || a.y1 - a.y0 > up + down) {
      const mid = [(x + (right - left) / 2) / ws, (y + (down - up) / 2) / ws];
      if (!inside(mid, rings)) {
        const q = nearest(mid, rings);
        x += (q[0] - mid[0]) * ws;
        y += (q[1] - mid[1]) * ws;
      }
    }
    x = axis(x, a.x0, a.x1, left, right);
    y = axis(y, a.y0, a.y1, up, down);

    const center = new maplibregl.LngLat(lngOf(x / ws), latOf(y / ws));
    if (zoom === tr.zoom && Math.abs(center.lng - tr.center.lng) < 1e-9 && Math.abs(center.lat - tr.center.lat) < 1e-9) return {};
    // Gestures add up their movement in this private copy of the camera (maplibre-gl 4.7.1). Clamp it too, or
    // dragging back after hitting the edge would do nothing until the overshoot was undone.
    const req = map._requestedCameraState;
    if (req) { req.zoom = zoom; req.center = center; }
    return { center, zoom };
  };
}
