// Real track shapes, built from OpenStreetMap by scripts/build-tracks.js, and the geometry the map needs from them:
// a train's route split where the train is, and which way the rails run under a train.
//   /data/tracks/<train>.json  { line: [[lon, lat], ...], stops: [index in line of each stop, or null] }
//   /data/rail.json            { lines: [[[lon, lat], ...], ...] }: every stretch a train uses, joined at junctions
// Rail data © OpenStreetMap contributors (ODbL).

const rad = x => x * Math.PI / 180;
const deg = x => x * 180 / Math.PI;

/** Compass bearing in degrees (0 = north, clockwise) from a to b, both [lon, lat]. */
export function bearing(a, b) {
  const y = Math.sin(rad(b[0] - a[0])) * Math.cos(rad(b[1]));
  const x = Math.cos(rad(a[1])) * Math.sin(rad(b[1])) - Math.sin(rad(a[1])) * Math.cos(rad(b[1])) * Math.cos(rad(b[0] - a[0]));
  return (deg(Math.atan2(y, x)) + 360) % 360;
}

function km(a, b) {
  const dLat = rad(b[1] - a[1]), dLon = rad(b[0] - a[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

const angleBetween = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
const MAX_BEND = 40; // degrees between locomotive and coach

// The nearest point to p on segment a-b, in a flat projection around p: { t (0-1 along a-b), d (degrees of latitude) }.
function nearestOn(a, b, p) {
  const k = Math.cos(rad(p[1]));
  const ax = (a[0] - p[0]) * k, ay = a[1] - p[1], vx = (b[0] - a[0]) * k, vy = b[1] - a[1];
  const l2 = vx * vx + vy * vy;
  const t = l2 ? Math.max(0, Math.min(1, -(ax * vx + ay * vy) / l2)) : 0;
  return { t, d: Math.hypot(ax + t * vx, ay + t * vy) };
}
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

const fetchJson = url => fetch(url).then(r => (r.ok ? r.json() : null)).catch(() => null);
const tracks = new Map();

/** A train's track, or null when it has none (the map then joins the stops with straight lines). Fetched once per train. */
export function loadTrack(number) {
  if (!tracks.has(number)) tracks.set(number, fetchJson(`/data/tracks/${number}.json`));
  return tracks.get(number);
}

/**
 * The route split at the train: `done` runs from the first stop to the train, `rest` from the train to the last stop,
 * both as [lon, lat] lists. The train is placed at the nearest point of the track between the last stop passed
 * (`passedIdx`, -1 before the first) and the next stop that has a place on the track. Without a position the split is
 * at the last stop passed.
 */
export function splitTrack(track, passedIdx, pos) {
  const { line, stops } = track;
  const from = passedIdx >= 0 ? stops[passedIdx] ?? 0 : 0;
  if (!pos) return { done: passedIdx >= 0 ? line.slice(0, from + 1) : [], rest: line.slice(from) };
  let to = line.length - 1;
  for (let j = passedIdx + 1; j < stops.length; j++) if (stops[j] != null && stops[j] > from) { to = stops[j]; break; }
  const p = [pos.lon, pos.lat];
  let best = { i: from, t: 0, d: Infinity };
  for (let i = from; i < Math.max(from + 1, to); i++) {
    if (i + 1 >= line.length) break;
    const n = nearestOn(line[i], line[i + 1], p);
    if (n.d < best.d) best = { i, t: n.t, d: n.d };
  }
  if (best.d === Infinity) return { done: line.slice(0, from + 1), rest: line.slice(from) };
  const at = lerp(line[best.i], line[best.i + 1], best.t);
  return { done: [...line.slice(0, best.i + 1), at], rest: [at, ...line.slice(best.i + 1)] };
}

let network = null;

/**
 * The rail network for the overview maps, with what headingsAt needs: the lines, a coarse grid of their segments and,
 * for every line end, the lines that meet there. Fetched once.
 */
export function loadNetwork() {
  network ??= fetchJson('/data/rail.json').then(raw => {
    if (!raw?.lines) return null;
    const lines = raw.lines, grid = new Map(), ends = new Map();
    const cell = p => `${Math.floor(p[0] * 10)},${Math.floor(p[1] * 10)}`; // ~10 km cells
    lines.forEach((line, l) => {
      for (let i = 1; i < line.length; i++) {
        // A long segment is listed in every cell along it, so a nearby train always finds it.
        const n = Math.ceil(km(line[i - 1], line[i]) / 5) + 1;
        for (let s = 0; s <= n; s++) {
          const k = cell(lerp(line[i - 1], line[i], s / n));
          if (!grid.has(k)) grid.set(k, new Set());
          grid.get(k).add(l * 100000 + i);
        }
      }
      for (const [end, at] of [[line[0], 0], [line.at(-1), line.length - 1]]) {
        const k = `${end[0]},${end[1]}`;
        if (!ends.has(k)) ends.set(k, []);
        ends.get(k).push({ l, at });
      }
    });
    return { lines, grid, ends, cell };
  });
  return network;
}

/**
 * Which way the rails run under a train, looking `reach` km ahead of it (towards `toward`, usually the next station)
 * and behind it: { ahead, behind } bearings in degrees, for each reach. Null when no rail is within ~2 km.
 * The overview map points the locomotive along `ahead` and the coach along `behind`, so a train on a curve bends at
 * the coupling.
 * @param {object} net - loadNetwork()'s result.
 * @param {[number, number]} pos - The train, [lon, lat].
 * @param {[number, number] | null} toward - Where it is heading, [lon, lat], to tell ahead from behind.
 * @param {number[]} reaches - Distances in km.
 * @returns {{ ahead: number, behind: number }[] | null}
 */
export function headingsAt(net, pos, toward, reaches) {
  const { lines, grid, ends, cell } = net;
  let best = null;
  const [cx, cy] = cell(pos).split(',').map(Number);
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
    for (const code of grid.get(`${cx + dx},${cy + dy}`) || []) {
      const l = Math.floor(code / 100000), i = code % 100000;
      const n = nearestOn(lines[l][i - 1], lines[l][i], pos);
      if (!best || n.d < best.d) best = { l, i, t: n.t, d: n.d };
    }
  }
  if (!best || best.d > 0.02) return null;
  const line = lines[best.l], here = lerp(line[best.i - 1], line[best.i], best.t);
  // Forward along the line is towards higher indices; flip when the train is heading the other way.
  const along = bearing(line[best.i - 1], line[best.i]);
  const dir = toward && angleBetween(along, bearing(here, toward)) > 90 ? -1 : 1;

  // Walks `dist` km from `here` along the rails in direction d, crossing junctions onto the straightest line.
  function walk(dist, d) {
    let l = best.l, i = d > 0 ? best.i : best.i - 1, at = here, left = dist, prevBearing = d > 0 ? along : (along + 180) % 360;
    for (let guard = 0; guard < 10000; guard++) {
      const pts = lines[l];
      if (i < 0 || i >= pts.length) {
        const end = pts[d > 0 ? pts.length - 1 : 0];
        const next = (ends.get(`${end[0]},${end[1]}`) || []).filter(e => e.l !== l);
        if (!next.length) return at;
        const pick = next
          .map(e => ({ ...e, b: e.at === 0 ? bearing(lines[e.l][0], lines[e.l][1]) : bearing(lines[e.l].at(-1), lines[e.l].at(-2)) }))
          .sort((a, b) => angleBetween(a.b, prevBearing) - angleBetween(b.b, prevBearing))[0];
        l = pick.l; d = pick.at === 0 ? 1 : -1; i = pick.at === 0 ? 1 : lines[l].length - 2;
        continue;
      }
      const target = pts[i], step = km(at, target);
      if (step >= left) return lerp(at, target, step ? left / step : 0);
      left -= step;
      if (step > 0) prevBearing = bearing(at, target);
      at = target;
      i += d;
    }
    return at;
  }
  const facing = dir > 0 ? along : (along + 180) % 360;
  return reaches.map(r => {
    const a = walk(r, dir), b = walk(r, -dir);
    const ahead = km(here, a) > 0.01 ? bearing(here, a) : facing;
    let behind = km(b, here) > 0.01 ? bearing(b, here) : facing;
    // A coupling bends only so far; a sharper angle is a junction the walk took, not the train.
    const turn = ((behind - ahead + 540) % 360) - 180;
    if (Math.abs(turn) > MAX_BEND) behind = (ahead + Math.sign(turn) * MAX_BEND + 360) % 360;
    return { ahead, behind };
  });
}
