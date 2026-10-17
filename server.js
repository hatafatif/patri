#!/usr/bin/env node
// Web app: npm start, then open http://localhost:8787 (or this PC's IP from another device).
// Listens on the local network by default; HOST=127.0.0.1 npm start keeps it to this PC.
// Unlike the Vercel deployment, this keeps one live feed connection open and records history.
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { connectLive, requestInstances, onPositions, normalize } = require('./lib');
const { Timetable } = require('./data');
const { Store } = require('./store');
const { createRoutes, decorate, sendJson } = require('./routes');

const PORT = Number(process.env.PORT) || 8787;
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC = path.join(__dirname, 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };

const timetable = new Timetable();
const store = new Store(path.join(__dirname, 'data', 'trains.db'));

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

function update(id, pos) {
  const run = decorate(timetable, id, pos, known.get(id));
  if (!run) return null;
  const prev = latest.get(id);
  if (prev && prev.updatedAt > run.updatedAt) return prev;
  latest.set(id, run);
  store.record(id, run.train, run);
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

const route = createRoutes(timetable, {
  snapshot: () => [...latest.values()],
  runsFor,
  history: run => store.history(run),
});

function serveStatic(res, pathname) {
  const file = path.normalize(path.join(PUBLIC, pathname === '/' ? 'index.html' : pathname));
  if (!file.startsWith(PUBLIC + path.sep)) return res.writeHead(403).end();
  fs.readFile(file, (err, data) => {
    if (err) return res.writeHead(404).end('Not found');
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }).end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (!url.pathname.startsWith('/api/')) return serveStatic(res, url.pathname);
  if (!timetable.loadedAt) return sendJson(res, [503, { error: 'Timetables are still loading' }]);
  try {
    sendJson(res, await route(url.pathname.slice(5), url.searchParams));
  } catch (e) {
    sendJson(res, [502, { error: e.message }]);
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
