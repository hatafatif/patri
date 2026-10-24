// Vercel function for every /api/* route (vercel.json rewrites them here). Serverless, so there is
// no feed connection to keep open and no history: the timetable is fetched at build time
// (scripts/build-timetable.js) and live positions are read on demand, then cached briefly here and
// at the edge so all viewers share one read every 15 seconds.
//
// Recorder: when RECORDER_URL and RECORDER_KEY are set, recorded history (the speed chart and actual
// passing times) comes from the always-on recorder (server.js in recorder mode, see deploy/oracle/).
// Live positions are always read from the upstream feed directly, so the recorder is only asked when a
// Train page opens. If it is down or slow, history() returns nothing, exactly as without a recorder.
// The recorder also owns push alerts and "last seen": /api/lastseen, /api/push-key, /api/watch and
// /api/unwatch are proxied to it (4 s timeout, status and body forwarded). Without a recorder,
// lastseen is {} and the other three answer 503. The recorder also serves /api/replay (recorded runs
// for the journey time-lapse, 8 s timeout); without one it answers 503.
const { fetchLiveRuns, normalize } = require('../lib');
const { Timetable } = require('../data');
const { createRoutes, decorate, sendJson, readJson } = require('../routes');

const timetable = Timetable.fromRaw(require('../build/timetable.json'));
const liveTrains = timetable.trains.filter(t => t.IsLive).map(t => t.TrainNumber);

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

// Forwards a request to the recorder and returns its [status, body], whatever the status.
async function recorderForward(method, path, body) {
  try {
    const res = await fetch(RECORDER_URL + path, {
      method,
      headers: { 'x-recorder-key': RECORDER_KEY, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(4000),
    });
    return [res.status, await res.json().catch(() => ({ error: `recorder answered ${res.status}` }))];
  } catch (e) {
    console.error('Recorder request failed:', path, e.message);
    return [502, { error: 'Alerts are not reachable right now' }];
  }
}

async function recorderHistory(run) {
  try {
    return await recorderGet(`/api/history?run=${encodeURIComponent(run)}`, 4000);
  } catch (e) {
    console.error('Recorder history failed:', e.message);
    return { positions: [], passes: [] };
  }
}

// One read asks for every live train at once, so reads are kept to one per 15 s per instance (the
// edge cache in routes.js shares them further). Failures back off from 2 s to a minute, serving the
// last good snapshot meanwhile, so an upstream outage isn't retried on every request.
let cached = { at: 0, runs: null };
let pending = null, failures = 0, retryAt = 0;

function snapshot() {
  const now = Date.now();
  if (cached.runs && now - cached.at < 15000) return cached.runs;
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

const alertsSource = useRecorder ? {
  lastSeen: async () => {
    const [status, body] = await recorderForward('GET', '/api/lastseen');
    if (status !== 200) throw new Error(body.error || `recorder answered ${status}`);
    return body;
  },
  pushKey: () => recorderForward('GET', '/api/push-key'),
  watch: clean => recorderForward('POST', '/api/watch', {
    subscription: { endpoint: clean.endpoint, keys: { p256dh: clean.p256dh, auth: clean.auth } },
    train: clean.train, run: clean.run, stop: clean.stop, lang: clean.lang, rules: clean.rules,
  }),
  unwatch: (endpoint, train) => recorderForward('POST', '/api/unwatch', { endpoint, train }),
} : {};

const route = createRoutes(timetable, {
  snapshot,
  runsFor: async train => (await snapshot()).filter(r => r.train === train),
  history: run => useRecorder ? recorderHistory(run) : { positions: [], passes: [] },
  ...alertsSource,
  ...(useRecorder ? { replay: (trains, days) => recorderGet(`/api/replay?trains=${trains.join(',')}&days=${days}`, 8000) } : {}),
});

// Vercel may already have parsed the body into req.body; otherwise read the stream. At most 8 KB.
async function bodyOf(req) {
  if (Number(req.headers['content-length']) > 8 * 1024) throw Object.assign(new Error('Body too large'), { status: 413 });
  if (req.body === undefined) return readJson(req);
  const body = typeof req.body === 'string' ? JSON.parse(req.body || 'null') : req.body;
  if (JSON.stringify(body ?? null).length > 8 * 1024) throw Object.assign(new Error('Body too large'), { status: 413 });
  return body;
}

module.exports = async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const name = url.searchParams.get('path') || url.pathname.replace(/^\/api\/?/, '');
  try {
    if (req.method === 'POST') return sendJson(res, await route.post(name, await bodyOf(req)));
    sendJson(res, await route(name, url.searchParams));
  } catch (e) {
    sendJson(res, [e.status || (e instanceof SyntaxError ? 400 : 502), { error: e.message }]);
  }
};
