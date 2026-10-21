#!/usr/bin/env node
// Nightly archive: node archive.js (the patri-archive systemd timer runs it at 00:45 PKT).
// Each finished Pakistan day (UTC+5) is written once into a small SQLite file with the same two
// tables as trains.db (positions, passes), gzipped, and PUT to an Oracle Object Storage bucket
// through a write-only pre-authenticated URL as daily/YYYY-MM-DD.db.gz. Together the files are the
// full history, kept forever, even though the live DB only keeps KEEP_DAYS.
// Restore a day: download the object, gunzip it, then open it with any SQLite tool, or ATTACH it
// to another database. Progress lives in ARCHIVE_STATE, so a failed day is retried next run.
// Env:
//   DATA_DIR             where trains.db lives (default ./data)
//   ARCHIVE_URL          required: the PAR URL ending in /o/ (never logged); no URL = nothing to do
//   ARCHIVE_STATE        progress file (default $DATA_DIR/archive-state.json)
//   ARCHIVE_CAP_BYTES    stop before the bucket would pass this total (default 8 GiB)
//   ARCHIVE_HEARTBEAT_URL optional Healthchecks.io-style ping URL; /fail is appended on errors
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const ARCHIVE_URL = process.env.ARCHIVE_URL || '';
const STATE_FILE = process.env.ARCHIVE_STATE || path.join(DATA_DIR, 'archive-state.json');
const CAP = Number(process.env.ARCHIVE_CAP_BYTES) || 8 * 1024 ** 3;
const HEARTBEAT = (process.env.ARCHIVE_HEARTBEAT_URL || '').replace(/\/+$/, '');
const MAX_BACK_DAYS = 90;
const PKT_S = 5 * 3600;

const log = (...a) => console.log(new Date().toISOString(), ...a);
const dayOf = ts => new Date((ts + PKT_S) * 1000).toISOString().slice(0, 10);
const dayStart = day => Date.parse(day + 'T00:00:00Z') / 1000 - PKT_S; // unix s of 00:00 PKT
const addDays = (day, n) => dayOf(dayStart(day) + n * 86400 + 3600);

class Failure extends Error {}

async function ping(suffix = '') {
  if (!HEARTBEAT) return;
  try { await fetch(HEARTBEAT + suffix, { signal: AbortSignal.timeout(10e3) }); } catch {}
}

function readState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { return null; }
}

function writeState(state) {
  const tmp = STATE_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state));
  fs.renameSync(tmp, STATE_FILE);
}

function openLive() {
  const file = path.join(DATA_DIR, 'trains.db');
  try { return new DatabaseSync(file, { readOnly: true }); } catch (e) {
    if (!/option|readOnly/i.test(e.message)) throw e;
    return new DatabaseSync(file); // older Node without readOnly; we still never write to it
  }
}

// Copies one day's rows into a new SQLite file; returns the row counts.
function buildDay(live, day, file) {
  const from = dayStart(day), to = from + 86400;
  const out = new DatabaseSync(file);
  try {
    out.exec(`
      CREATE TABLE positions (
        run TEXT NOT NULL, train INTEGER NOT NULL, ts INTEGER NOT NULL,
        lat REAL NOT NULL, lon REAL NOT NULL, speed INTEGER NOT NULL, late INTEGER NOT NULL,
        prev TEXT, next TEXT,
        PRIMARY KEY (run, ts)
      ) WITHOUT ROWID;
      CREATE TABLE passes (
        run TEXT NOT NULL, train INTEGER NOT NULL, station TEXT NOT NULL, ts INTEGER NOT NULL, late INTEGER NOT NULL,
        PRIMARY KEY (run, station)
      ) WITHOUT ROWID;
    `);
    const insP = out.prepare('INSERT OR IGNORE INTO positions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const insS = out.prepare('INSERT OR IGNORE INTO passes VALUES (?, ?, ?, ?, ?)');
    const selP = live.prepare('SELECT * FROM positions WHERE ts >= ? AND ts < ?');
    const selS = live.prepare('SELECT * FROM passes WHERE ts >= ? AND ts < ?');
    let positions = 0, passes = 0;
    out.exec('BEGIN');
    for (const r of selP.iterate(from, to)) {
      insP.run(r.run, r.train, r.ts, r.lat, r.lon, r.speed, r.late, r.prev, r.next);
      positions++;
    }
    for (const r of selS.iterate(from, to)) {
      insS.run(r.run, r.train, r.station, r.ts, r.late);
      passes++;
    }
    out.exec('COMMIT');
    return { positions, passes };
  } finally {
    out.close();
  }
}

async function upload(name, body) {
  let last = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    if (attempt > 1) await new Promise(r => setTimeout(r, 2000 * 3 ** (attempt - 2)));
    try {
      const res = await fetch(ARCHIVE_URL + name, {
        method: 'PUT', body, headers: { 'Content-Type': 'application/gzip' }, signal: AbortSignal.timeout(300e3),
      });
      if (res.ok) return;
      last = `HTTP ${res.status}`;
      if (res.status < 500) break; // a client error won't fix itself
    } catch (e) {
      last = `network error (${e.cause?.code || e.name})`; // not e.message: it could echo the URL
    }
    log(`upload of ${name} failed: ${last}` + (attempt < 3 ? ', retrying' : ''));
  }
  throw new Failure(`upload of ${name} failed: ${last}`);
}

async function main() {
  if (!ARCHIVE_URL) return log('ARCHIVE_URL not set; nothing to do');
  const live = openLive();
  const today = dayOf(Date.now() / 1000);
  const yesterday = addDays(today, -1);
  let state = readState();
  let first;
  if (state?.lastDay) {
    first = addDays(state.lastDay, 1);
  } else {
    state = { lastDay: null, uploadedBytes: 0, files: 0 };
    const min = live.prepare('SELECT MIN(ts) AS ts FROM positions').get().ts;
    if (min == null) return log('no recorded data yet; nothing to do');
    first = dayOf(min);
    const oldest = addDays(today, -MAX_BACK_DAYS);
    if (first < oldest) first = oldest;
  }
  if (first > yesterday) log('already up to date');

  for (let day = first; day <= yesterday; day = addDays(day, 1)) {
    const name = `daily/${day}.db.gz`;
    const tmp = path.join(DATA_DIR, `archive-${day}.db`);
    try {
      const { positions, passes } = buildDay(live, day, tmp);
      const rows = `${positions}/${passes}`;
      if (!positions && !passes) {
        log(`${day} rows ${rows} no data`);
      } else {
        const gz = zlib.gzipSync(fs.readFileSync(tmp), { level: 9 });
        if (state.uploadedBytes + gz.length > CAP) {
          throw new Failure(`${day} rows ${rows} ${gz.length} bytes: would pass the ${CAP} byte cap (${state.uploadedBytes} used); stopping`);
        }
        await upload(name, gz);
        state.uploadedBytes += gz.length;
        state.files++;
        log(`${day} rows ${rows} ${gz.length} bytes uploaded ${name}`);
      }
      state.lastDay = day;
      writeState(state);
    } finally {
      for (const f of [tmp, tmp + '-journal']) fs.rmSync(f, { force: true });
    }
  }
  live.close();
  await ping();
}

main().catch(async e => {
  log('ERROR', e instanceof Failure ? e.message : (ARCHIVE_URL ? `${e.name}: ${e.message}`.replaceAll(ARCHIVE_URL, '[url]') : `${e.name}: ${e.message}`));
  await ping('/fail');
  process.exit(1);
});
