// Records live positions and station passes in SQLite (Node's built-in node:sqlite), so the app
// can show speed charts, actual passing times and the trail since departure.
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const KEEP_DAYS = Number(process.env.KEEP_DAYS) || 14;
const MIN_GAP_S = 20; // keep at most one position per run every 20 s, plus every stop/start
const REPLAY_STEP = { 7: 120, 30: 300, 90: 900 }; // seconds between replay points, by days asked for

class Store {
  constructor(file) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    this.db = new DatabaseSync(file);
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      CREATE TABLE IF NOT EXISTS positions (
        run TEXT NOT NULL, train INTEGER NOT NULL, ts INTEGER NOT NULL,
        lat REAL NOT NULL, lon REAL NOT NULL, speed INTEGER NOT NULL, late INTEGER NOT NULL,
        prev TEXT, next TEXT,
        PRIMARY KEY (run, ts)
      ) WITHOUT ROWID;
      CREATE TABLE IF NOT EXISTS passes (
        run TEXT NOT NULL, train INTEGER NOT NULL, station TEXT NOT NULL, ts INTEGER NOT NULL, late INTEGER NOT NULL,
        PRIMARY KEY (run, station)
      ) WITHOUT ROWID;
      CREATE INDEX IF NOT EXISTS positions_train_ts ON positions(train, ts);
      CREATE TABLE IF NOT EXISTS watches (
        endpoint TEXT NOT NULL, train INTEGER NOT NULL, run TEXT NOT NULL, stop TEXT,
        p256dh TEXT NOT NULL, auth TEXT NOT NULL, lang TEXT NOT NULL DEFAULT 'en',
        created INTEGER NOT NULL, expires INTEGER NOT NULL, last_late INTEGER, done INTEGER DEFAULT 0,
        PRIMARY KEY (endpoint, train)
      );
      CREATE INDEX IF NOT EXISTS watches_run ON watches(run);
      CREATE TABLE IF NOT EXISTS sent (
        endpoint TEXT NOT NULL, train INTEGER NOT NULL, event TEXT NOT NULL, at INTEGER NOT NULL,
        PRIMARY KEY (endpoint, train, event)
      );
    `);
    this.insertPosition = this.db.prepare('INSERT OR IGNORE INTO positions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    this.insertPass = this.db.prepare('INSERT OR IGNORE INTO passes VALUES (?, ?, ?, ?, ?)');
    this.selectPositions = this.db.prepare('SELECT ts, lat, lon, speed FROM positions WHERE run = ? ORDER BY ts');
    this.selectPasses = this.db.prepare('SELECT station, ts, late FROM passes WHERE run = ? ORDER BY ts');
    // Bare columns next to MIN() take the row with the smallest ts, so each step keeps its first position.
    // The CAST matters: node:sqlite binds JS numbers as REAL, which would turn ts / ? into float division.
    this.selectReplay = this.db.prepare(`
      SELECT run, train, MIN(ts) AS ts, ROUND(lat, 4) AS lat, ROUND(lon, 4) AS lon, speed
      FROM positions WHERE train IN (?, ?) AND ts >= ? GROUP BY run, ts / CAST(? AS INTEGER) ORDER BY run, ts`);
    this.selectLastSeen = this.db.prepare(`
      SELECT p.train, p.ts, p.lat, p.lon, p.speed, p.prev, p.next
      FROM positions p JOIN (SELECT train, MAX(ts) AS ts FROM positions WHERE ts >= ? GROUP BY train) m
        ON p.train = m.train AND p.ts = m.ts`);
    this.upsertWatchStmt = this.db.prepare(`
      INSERT INTO watches (endpoint, train, run, stop, p256dh, auth, lang, created, expires, last_late, done)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      ON CONFLICT(endpoint, train) DO UPDATE SET run = excluded.run, stop = excluded.stop, p256dh = excluded.p256dh,
        auth = excluded.auth, lang = excluded.lang, created = excluded.created, expires = excluded.expires,
        last_late = excluded.last_late, done = 0`);
    this.lastSaved = new Map(); // run -> { ts, speed, prev }
    this.cleanup();
    setInterval(() => this.cleanup(), 6 * 3600e3).unref();
  }

  record(run, train, p) {
    const ts = Math.round(p.updatedAt / 1000);
    if (!ts || !Number.isFinite(p.lat) || !Number.isFinite(p.lon)) return;
    const last = this.lastSaved.get(run);
    if (last && ts <= last.ts) return;
    if (last && last.prev && p.prevStation && p.prevStation !== last.prev) {
      this.insertPass.run(run, train, p.prevStation, ts, p.lateBy);
    }
    const startedOrStopped = last && (last.speed === 0) !== (p.speed === 0);
    if (!last || ts - last.ts >= MIN_GAP_S || startedOrStopped) {
      this.insertPosition.run(run, train, ts, p.lat, p.lon, p.speed, p.lateBy, p.prevStation, p.nextStation);
      this.lastSaved.set(run, { ts, speed: p.speed, prev: p.prevStation });
    } else {
      last.prev = p.prevStation;
    }
  }

  history(run) {
    return {
      positions: this.selectPositions.all(run).map(r => [r.ts * 1000, r.lat, r.lon, r.speed]),
      passes: this.selectPasses.all(run).map(r => ({ station: r.station, at: r.ts * 1000, late: r.late })),
    };
  }

  // The recorded runs of one or two trains over the last `days` (7, 30 or 90), thinned to one point per
  // step so the download stays small. Runs are ordered by when they started.
  replay(trains, days) {
    const step = REPLAY_STEP[days];
    const to = Date.now(), from = to - days * 86400e3;
    const byRun = new Map();
    for (const r of this.selectReplay.all(trains[0], trains[1] ?? trains[0], Math.floor(from / 1000), step)) {
      if (!byRun.has(r.run)) byRun.set(r.run, { id: r.run, train: r.train, points: [] });
      byRun.get(r.run).points.push([r.ts * 1000, r.lat, r.lon, r.speed]);
    }
    const runs = [...byRun.values()].sort((a, b) => a.points[0][0] - b.points[0][0]);
    return { days, step, from, to, runs };
  }

  // Each train's most recent recorded position within keepDays, keyed by train number.
  lastSeen(keepDays = KEEP_DAYS) {
    const since = Math.floor(Date.now() / 1000) - keepDays * 86400;
    const out = {};
    for (const r of this.selectLastSeen.all(since)) {
      out[r.train] = { at: r.ts * 1000, lat: r.lat, lon: r.lon, speed: r.speed, prev: r.prev, next: r.next };
    }
    return out;
  }

  // Alert watches. Times are epoch ms. A watch lasts 3 days, or 12 h after it is marked done.
  upsertWatch({ endpoint, train, run, stop, p256dh, auth, lang, lastLate }) {
    const now = Date.now();
    this.upsertWatchStmt.run(endpoint, train, run, stop ?? null, p256dh, auth, lang, now, now + 3 * 86400e3, lastLate ?? null);
    // A fresh watch starts with a clean slate of sent events.
    this.db.prepare('DELETE FROM sent WHERE endpoint = ? AND train = ?').run(endpoint, train);
  }

  removeWatch(endpoint, train) {
    this.db.prepare('DELETE FROM watches WHERE endpoint = ? AND train = ?').run(endpoint, train);
    this.db.prepare('DELETE FROM sent WHERE endpoint = ? AND train = ?').run(endpoint, train);
  }

  removeEndpoint(endpoint) {
    this.db.prepare('DELETE FROM watches WHERE endpoint = ?').run(endpoint);
    this.db.prepare('DELETE FROM sent WHERE endpoint = ?').run(endpoint);
  }

  watchesForRun(run) {
    return this.db.prepare('SELECT * FROM watches WHERE run = ? AND done = 0 AND expires > ?').all(run, Date.now());
  }

  hasWatches(run) {
    return !!this.db.prepare('SELECT 1 FROM watches WHERE run = ? AND done = 0 LIMIT 1').get(run);
  }

  countWatches(endpoint) {
    const where = endpoint ? ' AND endpoint = ?' : '';
    const stmt = this.db.prepare('SELECT COUNT(*) AS n FROM watches WHERE expires > ?' + where);
    return (endpoint ? stmt.get(Date.now(), endpoint) : stmt.get(Date.now())).n;
  }

  hasWatch(endpoint, train) {
    return !!this.db.prepare('SELECT 1 FROM watches WHERE endpoint = ? AND train = ?').get(endpoint, train);
  }

  // Records an event as sent. Returns false if it had been sent already.
  markSent(endpoint, train, event, at = Date.now()) {
    return this.db.prepare('INSERT OR IGNORE INTO sent VALUES (?, ?, ?, ?)').run(endpoint, train, event, at).changes > 0;
  }

  wasSent(endpoint, train, event) {
    return !!this.db.prepare('SELECT 1 FROM sent WHERE endpoint = ? AND train = ? AND event = ?').get(endpoint, train, event);
  }

  // Latest time (epoch ms) any delay alert went out for this watch, or 0.
  lastDelaySent(endpoint, train) {
    return this.db.prepare("SELECT MAX(at) AS at FROM sent WHERE endpoint = ? AND train = ? AND event LIKE 'delay:%'").get(endpoint, train).at || 0;
  }

  setLastLate(endpoint, train, late) {
    this.db.prepare('UPDATE watches SET last_late = ? WHERE endpoint = ? AND train = ?').run(late, endpoint, train);
  }

  markDone(endpoint, train) {
    this.db.prepare('UPDATE watches SET done = 1, expires = MIN(expires, ?) WHERE endpoint = ? AND train = ?')
      .run(Date.now() + 12 * 3600e3, endpoint, train);
  }

  cleanup() {
    const cutoff = Math.floor(Date.now() / 1000) - KEEP_DAYS * 86400;
    this.db.prepare('DELETE FROM positions WHERE ts < ?').run(cutoff);
    this.db.prepare('DELETE FROM watches WHERE expires < ?').run(Date.now());
    this.db.prepare('DELETE FROM sent WHERE NOT EXISTS (SELECT 1 FROM watches w WHERE w.endpoint = sent.endpoint AND w.train = sent.train)').run();
  }
}

module.exports = { Store };
