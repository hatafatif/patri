#!/usr/bin/env node
// Web app: npm start, then open http://localhost:8787 (or this PC's IP from another device).
// Listens on the local network by default; HOST=127.0.0.1 npm start keeps it to this PC.
// Unlike the Vercel deployment, this keeps one live feed connection open and records history.
//
// Recorder mode (deploy/oracle/): run 24/7 on a small VM so the Vercel function can read
// recorded history from it (live positions still come from the feed). Env, all optional (nothing set = plain local behaviour):
//   RECORDER_KEY  every /api/* request must send header x-recorder-key; static files are not served
//   DATA_DIR      where trains.db lives (default ./data)
//   KEEP_DAYS     how long positions are kept (store.js, default 14)
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY  enable push alerts (push.js); without them /api/push-key is 503
// Besides history, this serves GET /api/replay (recorded runs of a train and its return train, thinned),
// GET /api/lastseen (each train's last recorded position), GET /api/push-key,
// and POST /api/watch and /api/unwatch (push alerts for one train, checked in alerts.js after every
// recorded position). POST bodies are JSON up to 8 KB.
// GET /healthz (no key) reports feed state, run count and last update.
const http = require('http');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const path = require('path');
const { connectLive, requestInstances, onPositions, normalize } = require('./lib');
const { Timetable } = require('./data');
const { Store } = require('./store');
const { createRoutes, decorate, sendJson, readJson } = require('./routes');
const { Alerts } = require('./alerts');
const { Pusher } = require('./push');

const PORT = Number(process.env.PORT) || 8787;
const HOST = process.env.HOST || '0.0.0.0';
const RECORDER_KEY = process.env.RECORDER_KEY || '';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const PUBLIC = path.join(__dirname, 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };

const timetable = new Timetable();
const store = new Store(path.join(DATA_DIR, 'trains.db'));
const pusher = new Pusher(store);
const alerts = new Alerts({ store, timetable, send: (...a) => pusher.send(...a) });
const MAX_WATCHES_PER_ENDPOINT = 10, MAX_WATCHES = 5000;

async function loadTimetable() {
  try {
    await timetable.load();
    console.log(`Timetables loaded: ${timetable.trains.length} trains, ${timetable.stations.size} stations`);
    if (socket.connected) joinFeed();
  } catch (e) {
    console.log('Could not load timetables, retrying in a minute:', e.message);
    setTimeout(loadTimetable, 60e3);
  }
}
setInterval(loadTimetable, 6 * 3600e3).unref();

// One upstream socket for everything. After any track-train request the feed streams every live
// run's position as an event named after the run ID.
const socket = connectLive();
const latest = new Map(); // run id -> decorated position
const known = new Map(); // run id -> train number, from track-train replies
// Once a minute: reload the watched runs and check "before" alerts for runs whose position has stopped arriving.
if (pusher.enabled) setInterval(() => alerts.tick(latest), 60e3).unref();

// One log line an hour, so journalctl shows the recorder is alive.
let recordedThisHour = 0;
setInterval(() => {
  console.log(`Recorded ${recordedThisHour} positions in the last hour (${latest.size} runs live)`);
  recordedThisHour = 0;
}, 3600e3).unref();

function update(id, pos) {
  const run = decorate(timetable, id, pos, known.get(id));
  if (!run) return null;
  const prev = latest.get(id);
  if (prev && prev.updatedAt > run.updatedAt) return prev;
  latest.set(id, run);
  store.record(id, run.train, run);
  recordedThisHour++;
  if (pusher.enabled) alerts.check(run);
  return run;
}

async function runsFor(train) {
  if (socket.connected) {
    const instances = await requestInstances(socket, train);
    for (const [id, raw] of Object.entries(instances)) {
      known.set(id, train);
      update(id, normalize(raw));
    }
  }
  return [...latest.values()].filter(r => r.train === train);
}

// Ask for every GPS train once, so all current runs (and which train each belongs to) are known
// straight away instead of trickling in from the feed.
let joining = false;
async function joinFeed() {
  if (joining) return;
  joining = true;
  for (const t of timetable.trains.filter(t => t.IsLive)) {
    if (!socket.connected) break;
    await runsFor(t.TrainNumber).catch(() => {});
    await new Promise(r => setTimeout(r, 300));
  }
  joining = false;
}

// Rejoining backs off exponentially (5 s, 10 s, 20 s ... up to 10 min) so a feed that keeps dropping
// doesn't get a burst of track-train requests on every reconnect. It resets once a connection has
// held for five minutes.
let rejoinDelay = 0, connectedAt = 0, rejoinTimer = null;
socket.on('connect', () => {
  console.log('Live feed connected');
  connectedAt = Date.now();
  if (!timetable.loadedAt) return;
  clearTimeout(rejoinTimer);
  rejoinTimer = setTimeout(joinFeed, rejoinDelay);
  rejoinDelay = Math.min(Math.max(rejoinDelay * 2, 5000), 10 * 60e3);
});
socket.on('disconnect', reason => {
  console.log('Live feed disconnected:', reason);
  clearTimeout(rejoinTimer);
  if (Date.now() - connectedAt > 5 * 60e3) rejoinDelay = 0;
});
socket.on('connect_error', e => console.log('Live feed connection error:', e.message));
onPositions(socket, (id, pos) => update(id, pos));

// Replay reads scan up to 90 days of positions, so they're kept 10 minutes (at most 20 entries, oldest dropped).
const replayCache = new Map(); // "7,8|7" -> { at, body }
function replay(trains, days) {
  const key = `${trains.join(',')}|${days}`;
  const hit = replayCache.get(key);
  if (hit && Date.now() - hit.at < 10 * 60e3) return hit.body;
  const body = store.replay(trains, days);
  replayCache.delete(key);
  replayCache.set(key, { at: Date.now(), body });
  if (replayCache.size > 20) replayCache.delete(replayCache.keys().next().value);
  return body;
}

const route = createRoutes(timetable, {
  snapshot: () => [...latest.values()],
  runsFor,
  history: run => store.history(run),
  lastSeen: () => store.lastSeen(),
  replay,
  pushKey: () => pusher.enabled ? [200, { publicKey: pusher.publicKey }] : [503, { error: 'Alerts are not configured' }],
  watch(w) {
    if (!pusher.enabled) return [503, { error: 'Alerts are not configured' }];
    if (!store.hasWatch(w.endpoint, w.train)) {
      if (store.countWatches(w.endpoint) >= MAX_WATCHES_PER_ENDPOINT) return [429, { error: 'Too many watches on this device' }];
      if (store.countWatches() >= MAX_WATCHES) return [429, { error: 'Too many watches' }];
    }
    store.upsertWatch(w);
    alerts.begin(w.endpoint, w.train, latest.get(w.run));
    alerts.refresh();
    return [200, { ok: true }];
  },
  unwatch(endpoint, train) {
    store.removeWatch(endpoint, train);
    alerts.refresh();
    return [200, { ok: true }];
  },
});

function serveStatic(res, pathname) {
  const file = path.normalize(path.join(PUBLIC, pathname === '/' ? 'index.html' : pathname));
  if (!file.startsWith(PUBLIC + path.sep)) return res.writeHead(403).end();
  fs.readFile(file, (err, data) => {
    if (err) return res.writeHead(404).end('Not found');
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }).end(data);
  });
}

function authorized(req) {
  const given = Buffer.from(String(req.headers['x-recorder-key'] || ''));
  const want = Buffer.from(RECORDER_KEY);
  return given.length === want.length && crypto.timingSafeEqual(given, want);
}

function health() {
  let lastUpdate = null;
  for (const r of latest.values()) if (lastUpdate === null || r.updatedAt > lastUpdate) lastUpdate = r.updatedAt;
  return { ok: true, feed: socket.connected, runs: latest.size, lastUpdate, timetable: !!timetable.loadedAt };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/healthz') return sendJson(res, [200, health()]);
  if (!url.pathname.startsWith('/api/')) {
    return RECORDER_KEY ? res.writeHead(404).end('Not found') : serveStatic(res, url.pathname);
  }
  if (RECORDER_KEY && !authorized(req)) return sendJson(res, [401, { error: 'Unauthorized' }]);
  if (!timetable.loadedAt) return sendJson(res, [503, { error: 'Timetables are still loading' }]);
  try {
    const name = url.pathname.slice(5);
    if (req.method === 'POST') return sendJson(res, await route.post(name, await readJson(req)));
    sendJson(res, await route(name, url.searchParams));
  } catch (e) {
    sendJson(res, [e.status || 502, { error: e.message }]);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Open http://localhost:${PORT}`);
  if (HOST === '0.0.0.0') {
    for (const addrs of Object.values(os.networkInterfaces())) {
      for (const a of addrs) if (a.family === 'IPv4' && !a.internal) console.log(`On your network: http://${a.address}:${PORT}`);
    }
  }
  loadTimetable();
});
