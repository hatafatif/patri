#!/usr/bin/env node
// Web app: npm start, then open http://localhost:8787 (or this PC's IP from another device).
// Listens on the local network by default; HOST=127.0.0.1 npm start keeps it to this PC.
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { connectLive, requestInstances, onPositions, normalize } = require('./lib');
const { Timetable } = require('./data');
const { Store } = require('./store');

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
const clients = new Set();

function decorate(id, pos) {
  const train = known.get(id) ?? timetable.trainForRun(id);
  if (train == null) return null; // cargo trains and anything we can't place
  return { id, train, date: timetable.runDate(id, train), suspect: Math.abs(pos.lateBy) > 1440, ...pos };
}

function update(id, pos) {
  const run = decorate(id, pos);
  if (!run) return null;
  const prev = latest.get(id);
  if (prev && prev.updatedAt > run.updatedAt) return prev;
  latest.set(id, run);
  store.record(id, run.train, run);
  return run;
}

const send = (res, event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
const broadcast = (event, data) => { for (const res of clients) send(res, event, data); };

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

socket.on('connect', () => {
  console.log('Live feed connected');
  broadcast('status', { connected: true });
  if (timetable.loadedAt) joinFeed();
});
socket.on('disconnect', reason => {
  console.log('Live feed disconnected:', reason);
  broadcast('status', { connected: false });
});
socket.on('connect_error', e => console.log('Live feed connection error:', e.message));
onPositions(socket, (id, pos) => {
  const run = update(id, pos);
  if (run && latest.get(id) === run) broadcast('position', run);
});

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }).end(JSON.stringify(body));
}

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
  const q = url.searchParams;
  const p = url.pathname;

  if (!p.startsWith('/api/')) return serveStatic(res, p);
  if (p === '/api/live') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    send(res, 'status', { connected: socket.connected });
    send(res, 'snapshot', [...latest.values()]);
    clients.add(res);
    const keepAlive = setInterval(() => res.write(': ping\n\n'), 25000);
    req.on('close', () => {
      clearInterval(keepAlive);
      clients.delete(res);
    });
    return;
  }
  if (!timetable.loadedAt) return json(res, 503, { error: 'Timetables are still loading' });

  try {
    if (p === '/api/trains') return json(res, 200, timetable.trainList());
    if (p === '/api/stations') return json(res, 200, timetable.stationList());
    if (p === '/api/route') {
      const stops = timetable.routes.get(Number(q.get('train')));
      return stops ? json(res, 200, stops) : json(res, 404, { error: 'Unknown train' });
    }
    if (p === '/api/runs') return json(res, 200, await runsFor(Number(q.get('train'))));
    if (p === '/api/history') return json(res, 200, store.history(q.get('run') || ''));
    if (p === '/api/board') {
      const board = timetable.board(q.get('station'), [...latest.values()]);
      return board ? json(res, 200, board) : json(res, 404, { error: 'Unknown station' });
    }
    if (p === '/api/trip') {
      const trip = timetable.trip(q.get('from'), q.get('to'), [...latest.values()]);
      return trip ? json(res, 200, trip) : json(res, 404, { error: 'Unknown station' });
    }
    json(res, 404, { error: 'Not found' });
  } catch (e) {
    json(res, 502, { error: e.message });
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
