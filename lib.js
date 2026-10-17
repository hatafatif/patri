// Client for the Track My Train backend, reconstructed from the app's Hermes bundle
// (see ~/projects/track-my-train-mod/hermes/decompiled.js: request helper ~424898,
// socket setup ~1037725, track-train ~1009022).
const { io } = require('socket.io-client');

const API_BASE = 'https://app-api.pakraillive.com/api/';
const SOCKET_URL = 'https://cotrolroomapi.pakraillive.com/'; // "cotrol" is the app's own spelling
// The app hard-codes its key in apiKeyHeader()/socketKeyHeader(); here it comes from the environment (see .env.example).
const API_KEY = process.env.PAKRAIL_API_KEY;
if (!API_KEY) throw new Error('PAKRAIL_API_KEY is not set: copy .env.example to .env and fill it in');

async function api(path) {
  const res = await fetch(API_BASE + path, {
    headers: { 'x-api-key': API_KEY, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  const body = await res.json();
  if (!body.IsSuccess) throw new Error(`${path}: ${body.ErrorMessage || 'request failed'}`);
  return body.Response;
}

// Every train, with an IsLive flag for the ones that have GPS tracking.
const getTrains = () => api('Train/GetLiveTrains');

// Ordered stops with schedule and coordinates. Takes TrainId, not TrainNumber.
async function getRoute(trainId) {
  const stops = (await api(`Train/GetTrainStationsByTrainId?id=${encodeURIComponent(trainId)}`)) || [];
  return stops.sort((a, b) => a.OrderNumber - b.OrderNumber);
}

// Only the API key is required; we don't send the app's tmt-platform/tmt-app-version headers.
// Reconnect attempts back off from 1 s to a minute apart.
function connectLive(options = {}) {
  return io(SOCKET_URL, {
    transports: ['websocket'],
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 60000,
    timeout: 5000,
    extraHeaders: { 'x-api-key': API_KEY },
    ...options,
  });
}

// One-shot read of every live run for the given trains: connect, ask for all of them at once, close.
// Resolves to { [instanceId]: rawPosition }. Replies aren't tagged with their train, but the run IDs
// inside them are, so the requests can all be in flight together (about a second in total).
function fetchLiveRuns(trainNumbers, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const socket = connectLive({ reconnection: false });
    const runs = {};
    let replies = 0;
    const finish = err => {
      clearTimeout(timer);
      socket.close();
      if (err && !Object.keys(runs).length) reject(err);
      else resolve(runs);
    };
    const timer = setTimeout(() => finish(new Error('No reply from the live feed')), timeoutMs);
    socket.on('connect_error', finish);
    socket.on('track-train', data => {
      Object.assign(runs, data || {});
      if (++replies === trainNumbers.length) finish();
    });
    socket.on('connect', () => {
      for (const n of trainNumbers) socket.emit('track-train', { trainId: Number(n) });
    });
  });
}

// The reply to track-train isn't tagged with the train it answers, so requests go one at a time.
let queue = Promise.resolve();

// Resolves to { [instanceId]: rawPosition } for each live run of the train (often two:
// yesterday's and today's departure). Takes TrainNumber, which is what the app sends as trainId.
function requestInstances(socket, trainNumber, timeoutMs = 15000) {
  const run = () =>
    new Promise((resolve, reject) => {
      const onData = data => {
        clearTimeout(timer);
        resolve(data || {});
      };
      const timer = setTimeout(() => {
        socket.off('track-train', onData);
        reject(new Error('No reply to track-train'));
      }, timeoutMs);
      socket.once('track-train', onData);
      socket.emit('track-train', { trainId: Number(trainNumber) });
    });
  const result = queue.then(run, run);
  queue = result.catch(() => {});
  return result;
}

// After track-train the server streams every live run's position as an event named after its
// instance ID, roughly every 10 seconds per run.
function onPositions(socket, callback) {
  socket.onAny((event, data) => {
    if (/^\d+$/.test(event) && data && typeof data === 'object') callback(event, normalize(data));
  });
}

// track-train replies use "locomitiveNo", broadcasts use "loc"; late_by is in minutes.
function normalize(p) {
  return {
    lat: Number(p.lat),
    lon: Number(p.lon),
    loco: p.loc ?? p.locomitiveNo ?? null,
    speed: Number(p.sp) || 0,
    lateBy: Number(p.late_by) || 0,
    prevStation: p.prev_st != null ? String(p.prev_st) : null,
    nextStation: p.next_st != null ? String(p.next_st) : null,
    nextEta: p.NextStationETA || null,
    status: p.st ?? null,
    updatedAt: Number(p.last_updated) * 1000,
  };
}

module.exports = { getTrains, getRoute, connectLive, fetchLiveRuns, requestInstances, onPositions, normalize };
