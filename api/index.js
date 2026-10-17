// Vercel function for every /api/* route (vercel.json rewrites them here). Serverless, so there is
// no feed connection to keep open and no history: the timetable is fetched at build time
// (scripts/build-timetable.js) and live positions are read on demand, then cached briefly here and
// at the edge so all viewers share one read every 15 seconds.
const { fetchLiveRuns, normalize } = require('../lib');
const { Timetable } = require('../data');
const { createRoutes, decorate, sendJson } = require('../routes');

const timetable = Timetable.fromRaw(require('../build/timetable.json'));
const liveTrains = timetable.trains.filter(t => t.IsLive).map(t => t.TrainNumber);

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

const route = createRoutes(timetable, {
  snapshot,
  runsFor: async train => (await snapshot()).filter(r => r.train === train),
  history: () => ({ positions: [], passes: [] }),
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
