// Vercel function for every /api/* route (vercel.json rewrites them here). Serverless, so there is
// no feed connection to keep open and no history: the timetable is fetched at build time
// (scripts/build-timetable.js) and live positions are read on demand, then cached briefly here and
// at the edge so all viewers share one read every 15 seconds.
//
// Recorder: when RECORDER_URL and RECORDER_KEY are set, live positions and recorded history come
// from the always-on recorder (server.js in recorder mode, see deploy/oracle/). If it is down, slow
// or has an empty feed, snapshot() falls back to reading the upstream feed directly, and history()
// returns nothing, exactly as without a recorder.
const { fetchLiveRuns, normalize } = require('../lib');
const { Timetable } = require('../data');
const { createRoutes, decorate, sendJson } = require('../routes');

const timetable = Timetable.fromRaw(require('../build/timetable.json'));
const liveTrains = timetable.trains.filter(t => t.IsLive).map(t => t.TrainNumber);

// One read asks for every live train at once, so reads are kept to one per 15 s per instance (the
// edge cache in routes.js shares them further). Failures back off from 2 s to a minute, serving the
// last good snapshot meanwhile, so an upstream outage isn't retried on every request.
const RECORDER_URL = (process.env.RECORDER_URL || '').replace(/\/+$/, '');
const RECORDER_KEY = process.env.RECORDER_KEY || '';
const useRecorder = !!(RECORDER_URL && RECORDER_KEY);

async function recorderGet(path, timeoutMs) {
  const res = await fetch(RECORDER_URL + path, {
    headers: { 'x-recorder-key': RECORDER_KEY },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`recorder answered ${res.status}`);
  return res.json();
}

async function recorderHistory(run) {
  try {
    return await recorderGet(`/api/history?run=${encodeURIComponent(run)}`, 4000);
  } catch (e) {
    console.error('Recorder history failed:', e.message);
    return { positions: [], passes: [] };
  }
}

let cached = { at: 0, runs: null };
let pending = null, failures = 0, retryAt = 0;
let recorderPending = null;

// Already-decorated runs from the recorder, or null when it can't help. Shares the 15 s cache.
function recorderSnapshot() {
  recorderPending ??= recorderGet('/api/snapshot', 3000)
    .then(runs => {
      if (!Array.isArray(runs) || !runs.length) return null;
      cached = { at: Date.now(), runs };
      return runs;
    })
    .catch(e => { console.error('Recorder snapshot failed:', e.message); return null; })
    .finally(() => { recorderPending = null; });
  return recorderPending;
}

async function snapshot() {
  const now = Date.now();
  if (cached.runs && now - cached.at < 15000) return cached.runs;
  if (useRecorder) {
    const runs = await recorderSnapshot();
    if (runs) return runs;
  }
  return upstreamSnapshot();
}

function upstreamSnapshot() {
  const now = Date.now();
  if (now < retryAt) {
    if (cached.runs) return cached.runs;
    throw new Error('The live feed is unavailable, retrying shortly');
  }
  pending ??= fetchLiveRuns(liveTrains)
    .then(raw => {
      const runs = Object.entries(raw).map(([id, p]) => decorate(timetable, id, normalize(p))).filter(Boolean);
      cached = { at: Date.now(), runs };
      failures = 0;
      return runs;
    })
    .catch(e => {
      retryAt = Date.now() + Math.min(2000 * 2 ** failures++, 60000);
      if (cached.runs) return cached.runs;
      throw e;
    })
    .finally(() => { pending = null; });
  return pending;
}

const route = createRoutes(timetable, {
  snapshot,
  runsFor: async train => (await snapshot()).filter(r => r.train === train),
  history: run => useRecorder ? recorderHistory(run) : { positions: [], passes: [] },
});

module.exports = async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const name = url.searchParams.get('path') || url.pathname.replace(/^\/api\/?/, '');
  try {
    sendJson(res, await route(name, url.searchParams));
  } catch (e) {
    sendJson(res, [502, { error: e.message }]);
  }
};
