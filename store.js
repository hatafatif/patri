// Records live positions and station passes in SQLite (Node's built-in node:sqlite), so the app
// can show speed charts, actual passing times and the trail since departure.
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const KEEP_DAYS = 14;
const MIN_GAP_S = 20; // keep at most one position per run every 20 s, plus every stop/start

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
    `);
    this.insertPosition = this.db.prepare('INSERT OR IGNORE INTO positions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    this.insertPass = this.db.prepare('INSERT OR IGNORE INTO passes VALUES (?, ?, ?, ?, ?)');
    this.selectPositions = this.db.prepare('SELECT ts, lat, lon, speed FROM positions WHERE run = ? ORDER BY ts');
    this.selectPasses = this.db.prepare('SELECT station, ts, late FROM passes WHERE run = ? ORDER BY ts');
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

  cleanup() {
    const cutoff = Math.floor(Date.now() / 1000) - KEEP_DAYS * 86400;
    this.db.prepare('DELETE FROM positions WHERE ts < ?').run(cutoff);
  }
}

module.exports = { Store };
