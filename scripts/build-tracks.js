#!/usr/bin/env node
// Builds the real track shapes from OpenStreetMap: `npm run tracks` (needs build/timetable.json: `npm run build`).
//   1. Pakistan's rail lines (railway=rail) from the Overpass API, kept in build/osm-rail.json; `--fresh`
//      downloads them again. The public servers are often busy, so it retries across mirrors.
//   2. One rail network from them: ways join where they share a node; a loose end joins the nearest other way
//      within 50 m for free, or within 1 km at a higher cost (a few real gaps, like Lahore's Ravi crossing, are
//      that wide); stations snap only onto the main connected network, never onto a stray yard track.
//   3. For every train, the shortest path along the rails between each pair of consecutive stops, simplified to
//      within TOLERANCE_M. A pair with no rail near a station keeps the straight line.
//   -> public/data/tracks/<train>.json  { line: [[lon, lat], ...], stops: [index in line of each stop] }
//   -> public/data/rail.json            { lines: [[[lon, lat], ...], ...] }: every stretch a train uses, for the overview maps
// `--db data/trains.db` also checks the paths against our recorded GPS and prints how far off they are.
// Rail data © OpenStreetMap contributors, available under the Open Database License (ODbL).
const fs = require('fs');
const path = require('path');
const { Timetable } = require('../data');

const ROOT = path.join(__dirname, '..');
const OSM_FILE = path.join(ROOT, 'build', 'osm-rail.json');
const OUT_DIR = path.join(ROOT, 'public', 'data', 'tracks');
const NETWORK_FILE = path.join(ROOT, 'public', 'data', 'rail.json');
const TOLERANCE_M = 15;          // per-train lines
const NETWORK_TOLERANCE_M = 40;  // the overview network, drawn at country zoom
const FREE_GAP_KM = 0.05, MAX_GAP_KM = 1, GAP_COST = 3;
const SNAP_KM = 3;
const QUERY = '[out:json][timeout:300];area["ISO3166-1"="PK"][admin_level=2]->.pk;way["railway"="rail"](area.pk);out geom;';
const ENDPOINTS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
const args = process.argv.slice(2);
const flag = name => args.includes(name);
const option = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };

const rad = x => x * Math.PI / 180;
function km(a, b) { // [lon, lat] pairs
  const dLat = rad(b[1] - a[1]), dLon = rad(b[0] - a[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
const round = (p, d) => [Number(p[0].toFixed(d)), Number(p[1].toFixed(d))];

async function download() {
  for (let attempt = 0; attempt < 6; attempt++) {
    for (const url of ENDPOINTS) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'User-Agent': 'patri-tracks (https://patri.hataf.dev)', 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ data: QUERY }),
          signal: AbortSignal.timeout(400e3),
        });
        if (!res.ok) { console.log(`  ${url}: ${res.status}`); continue; }
        const json = await res.json();
        if (json.elements?.length > 100) return json;
      } catch (e) {
        console.log(`  ${url}: ${e.message}`);
      }
    }
    await new Promise(r => setTimeout(r, (attempt + 1) * 20e3));
  }
  throw new Error('Overpass is unavailable; try again later');
}

// ---- The rail network.
function buildNetwork(osm) {
  const coord = new Map(), adj = new Map(), wayOf = new Map();
  const link = (a, b, w) => { if (!adj.has(a)) adj.set(a, []); adj.get(a).push([b, w]); };
  const ways = osm.elements.filter(e => e.type === 'way' && e.nodes && e.geometry);
  ways.forEach((way, w) => {
    way.nodes.forEach((n, i) => {
      const g = way.geometry[i];
      if (!g) return;
      coord.set(n, [g.lon, g.lat]);
      if (!wayOf.has(n)) wayOf.set(n, w);
      if (i && coord.has(way.nodes[i - 1])) {
        const d = km(coord.get(way.nodes[i - 1]), coord.get(n));
        link(way.nodes[i - 1], n, d);
        link(n, way.nodes[i - 1], d);
      }
    });
  });
  // A grid of nodes for nearest-node searches; cells are ~5 km.
  const CELL = 0.05, grid = new Map();
  const cell = (x, y) => `${Math.floor(x / CELL)},${Math.floor(y / CELL)}`;
  for (const [id, c] of coord) { const k = cell(c[0], c[1]); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(id); }
  const near = (c, reach, keep) => {
    let best = null, bd = Infinity;
    const r = Math.ceil(reach / (CELL * 100)) + 1;
    for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) {
      for (const id of grid.get(`${Math.floor(c[0] / CELL) + dx},${Math.floor(c[1] / CELL) + dy}`) || []) {
        if (!keep(id)) continue;
        const d = km(c, coord.get(id));
        if (d < bd && d <= reach) { bd = d; best = id; }
      }
    }
    return best == null ? null : { id: best, km: bd };
  };
  // Join each loose end to the nearest node of another way.
  let joined = 0;
  for (const way of ways) {
    for (const n of [way.nodes[0], way.nodes.at(-1)]) {
      if ((adj.get(n) || []).length !== 1) continue;
      const own = wayOf.get(n), linked = new Set(adj.get(n).map(([v]) => v));
      const hit = near(coord.get(n), MAX_GAP_KM, id => id !== n && wayOf.get(id) !== own && !linked.has(id));
      if (!hit) continue;
      const cost = hit.km <= FREE_GAP_KM ? hit.km : hit.km * GAP_COST;
      link(n, hit.id, cost); link(hit.id, n, cost);
      joined++;
    }
  }
  // The main network: the largest connected piece.
  const comp = new Map();
  let main = null, mainSize = 0;
  for (const start of coord.keys()) {
    if (comp.has(start)) continue;
    const stack = [start];
    let size = 0;
    comp.set(start, start);
    while (stack.length) {
      const u = stack.pop();
      size++;
      for (const [v] of adj.get(u) || []) if (!comp.has(v)) { comp.set(v, start); stack.push(v); }
    }
    if (size > mainSize) { mainSize = size; main = start; }
  }
  const snap = c => near(c, SNAP_KM, id => comp.get(id) === main);
  return { coord, adj, snap, joined, ways: ways.length, nodes: coord.size, mainSize };
}

// A* along the rails; returns the node ids from `from` to `to`, or null.
function route(net, from, to) {
  const { coord, adj } = net, goal = coord.get(to);
  const g = new Map([[from, 0]]), prev = new Map(), done = new Set(), heap = [[km(coord.get(from), goal), from]];
  const push = x => {
    heap.push(x);
    for (let i = heap.length - 1; i;) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; }
  };
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      for (let i = 0; ;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };
  while (heap.length) {
    const [, u] = pop();
    if (u === to) break;
    if (done.has(u)) continue;
    done.add(u);
    for (const [v, w] of adj.get(u) || []) {
      const d = g.get(u) + w;
      if (d < (g.get(v) ?? Infinity)) { g.set(v, d); prev.set(v, u); push([d + km(coord.get(v), goal), v]); }
    }
  }
  if (!g.has(to)) return null;
  const ids = [to];
  while (ids[0] !== from) ids.unshift(prev.get(ids[0]));
  return ids;
}

// The rail pieces the trains use, each drawn once: the union of every routed stretch's edges, joined into
// lines that run from one junction or end to the next.
function networkLines(net, routes) {
  const adj = new Map();
  const add = (a, b) => { if (!adj.has(a)) adj.set(a, new Set()); adj.get(a).add(b); };
  for (const ids of routes) for (let i = 1; i < ids.length; i++) if (ids[i - 1] !== ids[i]) { add(ids[i - 1], ids[i]); add(ids[i], ids[i - 1]); }
  const seen = new Set(), lines = [];
  const edge = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const walk = (start, next) => {
    const ids = [start, next];
    seen.add(edge(start, next));
    while (adj.get(ids.at(-1)).size === 2) {
      const [x, y] = adj.get(ids.at(-1));
      const n = x === ids.at(-2) ? y : x;
      if (seen.has(edge(ids.at(-1), n))) break;
      seen.add(edge(ids.at(-1), n));
      ids.push(n);
    }
    lines.push(ids.map(id => net.coord.get(id)));
  };
  for (const [u, nbrs] of adj) if (nbrs.size !== 2) for (const v of nbrs) if (!seen.has(edge(u, v))) walk(u, v);
  for (const [u, nbrs] of adj) for (const v of nbrs) if (!seen.has(edge(u, v))) walk(u, v); // loops with no junction
  return lines;
}

// Douglas-Peucker in a local flat projection; keeps the first and last points.
function simplify(pts, toleranceM) {
  if (pts.length < 3) return pts;
  const lat0 = rad(pts[0][1]), kx = 111320 * Math.cos(lat0), ky = 110574;
  const xy = pts.map(p => [p[0] * kx, p[1] * ky]);
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [x1, y1] = xy[a], [x2, y2] = xy[b], dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    let worst = -1, wd = 0;
    for (let i = a + 1; i < b; i++) {
      const d = len ? Math.abs(dy * (xy[i][0] - x1) - dx * (xy[i][1] - y1)) / len : Math.hypot(xy[i][0] - x1, xy[i][1] - y1);
      if (d > wd) { wd = d; worst = i; }
    }
    if (worst > 0 && wd > toleranceM) { keep[worst] = 1; stack.push([a, worst], [worst, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}

// Metres from a point to a polyline.
function offBy(line, p) {
  const kx = 111320 * Math.cos(rad(p[1])), ky = 110574;
  let best = Infinity;
  for (let i = 1; i < line.length; i++) {
    const x1 = (line[i - 1][0] - p[0]) * kx, y1 = (line[i - 1][1] - p[1]) * ky;
    const x2 = (line[i][0] - p[0]) * kx, y2 = (line[i][1] - p[1]) * ky;
    const vx = x2 - x1, vy = y2 - y1, l2 = vx * vx + vy * vy;
    const t = l2 ? Math.max(0, Math.min(1, -(x1 * vx + y1 * vy) / l2)) : 0;
    best = Math.min(best, Math.hypot(x1 + t * vx, y1 + t * vy));
  }
  return best;
}

async function main() {
  const timetable = Timetable.fromRaw(JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'timetable.json'), 'utf8')));
  if (flag('--fresh') || !fs.existsSync(OSM_FILE)) {
    console.log('Downloading rail lines from OpenStreetMap (Overpass)…');
    fs.mkdirSync(path.dirname(OSM_FILE), { recursive: true });
    fs.writeFileSync(OSM_FILE, JSON.stringify(await download()));
  }
  const net = buildNetwork(JSON.parse(fs.readFileSync(OSM_FILE, 'utf8')));
  console.log(`Rail: ${net.ways} ways, ${net.nodes} nodes; ${net.joined} loose ends joined; main network ${net.mainSize} nodes`);

  // Each stretch between two stops is routed once and shared by every train (and direction) that runs it.
  const stretches = new Map(); // "a|b" with a < b -> { pts (a to b, raw), straight, used }
  const snapped = new Map();
  const snapOf = s => {
    if (!snapped.has(s.id)) snapped.set(s.id, Number.isFinite(s.lat) && Number.isFinite(s.lon) ? net.snap([s.lon, s.lat]) : null);
    return snapped.get(s.id);
  };
  function stretch(A, B) {
    const [a, b] = A.id < B.id ? [A, B] : [B, A];
    const key = `${a.id}|${b.id}`;
    if (!stretches.has(key)) {
      const sa = snapOf(a), sb = snapOf(b);
      const ids = sa && sb ? route(net, sa.id, sb.id) : null;
      const ends = [[a.lon, a.lat], [b.lon, b.lat]];
      stretches.set(key, ids ? { ids, pts: ids.map(id => net.coord.get(id)), straight: false } : { pts: ends.every(p => p.every(Number.isFinite)) ? ends : [], straight: true });
    }
    const s = stretches.get(key);
    return { ...s, pts: A.id === a.id ? s.pts : [...s.pts].reverse() };
  }

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let files = 0, bytes = 0, straight = new Set();
  for (const [number, stops] of timetable.routes) {
    if (stops.length < 2) continue;
    const line = [], at = [];
    stops.forEach((s, i) => {
      if (i === 0) { at.push(Number.isFinite(s.lat) ? (line.push(round([s.lon, s.lat], 5)), 0) : null); return; }
      const st = stretch(stops[i - 1], s);
      if (st.straight) straight.add(`${stops[i - 1].name} - ${s.name}`);
      const pts = simplify(st.pts, TOLERANCE_M).map(p => round(p, 5));
      // Each stretch starts where the last ended; the stop itself is the stretch's last point.
      line.push(...(line.length ? pts.slice(1) : pts));
      at.push(pts.length ? line.length - 1 : null);
    });
    const json = JSON.stringify({ line, stops: at });
    fs.writeFileSync(path.join(OUT_DIR, `${number}.json`), json);
    files++; bytes += json.length;
  }
  const network = networkLines(net, [...stretches.values()].filter(s => !s.straight).map(s => s.ids))
    .map(line => simplify(line, NETWORK_TOLERANCE_M).map(p => round(p, 4)));
  const netJson = JSON.stringify({ attribution: '© OpenStreetMap contributors, ODbL', lines: network });
  fs.writeFileSync(NETWORK_FILE, netJson);
  console.log(`Wrote ${files} train tracks to ${path.relative(ROOT, OUT_DIR)} (${Math.round(bytes / 1024)} KB, largest ${Math.round(Math.max(...fs.readdirSync(OUT_DIR).map(f => fs.statSync(path.join(OUT_DIR, f)).size)) / 1024)} KB)`);
  console.log(`Wrote the network (${network.length} lines, ${network.reduce((n, l) => n + l.length, 0)} points) to ${path.relative(ROOT, NETWORK_FILE)} (${Math.round(netJson.length / 1024)} KB)`);
  console.log(`${stretches.size} stretches routed; ${straight.size} kept straight (no rail within ${SNAP_KM} km of a station):`);
  for (const s of straight) console.log(`  ${s}`);

  const dbPath = option('--db');
  if (dbPath) {
    const { DatabaseSync } = require('node:sqlite');
    const db = new DatabaseSync(dbPath, { readOnly: true });
    const gps = new Map();
    for (const r of db.prepare('SELECT lat, lon, prev, next FROM positions WHERE prev IS NOT NULL AND next IS NOT NULL').iterate()) {
      const key = r.prev < r.next ? `${r.prev}|${r.next}` : `${r.next}|${r.prev}`;
      if (!stretches.has(key)) continue;
      if (!gps.has(key)) gps.set(key, []);
      const list = gps.get(key);
      if (list.length < 3000) list.push([r.lon, r.lat]);
    }
    const medians = [];
    for (const [key, pts] of gps) {
      const s = stretches.get(key);
      if (s.straight || pts.length < 20) continue;
      const line = simplify(s.pts, TOLERANCE_M);
      const d = pts.filter((_, i) => i % Math.ceil(pts.length / 200) === 0).map(p => offBy(line, p)).sort((x, y) => x - y);
      medians.push([d[Math.floor(d.length / 2)], key]);
    }
    medians.sort((x, y) => x[0] - y[0]);
    const q = f => medians[Math.floor((medians.length - 1) * f)][0].toFixed(0);
    console.log(`GPS check on ${medians.length} stretches: median distance from the track ${q(0.5)} m (90th percentile ${q(0.9)} m, worst ${q(1)} m)`);
    for (const [m, key] of medians.filter(([m]) => m > 100)) {
      const [a, b] = key.split('|').map(id => timetable.stations.get(id)?.name || id);
      console.log(`  off by ${m.toFixed(0)} m: ${a} - ${b}`);
    }
  }
}

main().catch(e => { console.error('Could not build the tracks:', e.message); process.exit(1); });
