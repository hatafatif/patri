// The JSON API, shared by the local server (server.js) and the Vercel function (api/index.js).
// `source` supplies the live data: snapshot() -> every current run, runsFor(train) -> that train's
// runs, history(run) -> recorded positions and station passes. Optional parts: replay(trains, days) ->
// the recorded runs of those trains, thinned (a source without it answers 503), and the alerts ones:
// lastSeen() -> { train: last position }, pushKey() -> [status, body], watch(clean) and
// unwatch(endpoint, train) -> [status, body]. A source without them answers as "no alerts here".
// route(name, query) handles GET; route.post(name, body) handles POST (watch, unwatch).
const TIMETABLE = 'public, s-maxage=3600, stale-while-revalidate=86400'; // changes only with a deploy
const LIVE = 'public, s-maxage=15, stale-while-revalidate=30';
// History only grows; a minute's staleness is fine and lets one recorder read serve everyone on that train.
const HISTORY = 'public, s-maxage=60, stale-while-revalidate=300';
const REPLAY = 'public, s-maxage=1800, stale-while-revalidate=86400'; // thinned runs of the last 7-90 days; half an hour behind is fine
const LASTSEEN = 'public, s-maxage=300, stale-while-revalidate=600';
const PUSHKEY = 'public, s-maxage=86400';
const NO_ALERTS = [503, { error: 'Alerts are not available' }];
const MAX_BODY = 8 * 1024;

// A raw position with the train and departure date it belongs to. Runs we can't place (cargo
// trains) come back as null; delays over a day are flagged as suspect and hidden by default.
function decorate(timetable, id, pos, train = timetable.trainForRun(id)) {
  if (train == null) return null;
  return { id, train, date: timetable.runDate(id, train), suspect: Math.abs(pos.lateBy) > 1440, ...pos };
}

const B64URL = /^[A-Za-z0-9_-]+$/;

// A watch request body, checked. Returns { clean } or { error }.
function validateWatch(timetable, body) {
  const bad = error => ({ error });
  if (!body || typeof body !== 'object') return bad('Bad request body');
  const { subscription, train, run, stop, lang = 'en' } = body;
  const endpoint = subscription?.endpoint;
  if (typeof endpoint !== 'string' || endpoint.length > 1000) return bad('Bad endpoint');
  try {
    if (new URL(endpoint).protocol !== 'https:') return bad('Bad endpoint');
  } catch {
    return bad('Bad endpoint');
  }
  const { p256dh, auth } = subscription.keys || {};
  for (const k of [p256dh, auth]) {
    if (typeof k !== 'string' || !k || k.length > 200 || !B64URL.test(k)) return bad('Bad subscription keys');
  }
  if (!Number.isInteger(train) || !timetable.byNumber.get(train)?.IsLive) return bad('Unknown or untracked train');
  if (typeof run !== 'string' || !run || run.length > 40 || timetable.trainForRun(run) !== train) return bad('Bad run');
  if (stop != null && (typeof stop !== 'string' || !timetable.routes.get(train).some(s => s.id === stop))) return bad('Stop is not on this train’s route');
  if (lang !== 'en' && lang !== 'ur') return bad('Bad lang');
  return { clean: { endpoint, p256dh, auth, train, run, stop: stop ?? null, lang } };
}

// Reads a JSON request body of at most MAX_BODY bytes. Rejects with an error carrying .status.
function readJson(req, limit = MAX_BODY) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0, failed = false;
    const fail = (status, message) => { failed = true; reject(Object.assign(new Error(message), { status })); };
    req.on('data', c => {
      if (failed) return; // keep draining so the 413 can still be delivered
      size += c.length;
      if (size > limit) return fail(413, 'Body too large');
      chunks.push(c);
    });
    req.on('end', () => {
      if (failed) return;
      try { resolve(JSON.parse(Buffer.concat(chunks).toString() || 'null')); } catch { fail(400, 'Bad JSON'); }
    });
    req.on('error', e => fail(400, e.message));
  });
}

function createRoutes(timetable, source) {
  // Resolves to [status, body, cacheControl].
  async function route(name, q) {
    switch (name) {
      case 'lastseen':
        return [200, source.lastSeen ? await source.lastSeen() : {}, LASTSEEN];
      case 'replay': {
        if (!source.replay) return [503, { error: 'Replay is not available' }];
        const trains = (q.get('trains') || '').split(',').map(Number);
        const days = Number(q.get('days'));
        const ok = trains.length <= 2 && trains.every(n => timetable.byNumber.has(n)) && [7, 30, 90].includes(days);
        return ok ? [200, await source.replay(trains, days), REPLAY] : [400, { error: 'Bad replay request' }];
      }
      case 'push-key': {
        if (!source.pushKey) return NO_ALERTS;
        const [status, body] = await source.pushKey();
        return status === 200 ? [200, body, PUSHKEY] : [status, body];
      }
      case 'trains':
        return [200, timetable.trainList(), TIMETABLE];
      case 'stations':
        return [200, timetable.stationList(), TIMETABLE];
      case 'route': {
        const stops = timetable.routes.get(Number(q.get('train')));
        return stops ? [200, stops, TIMETABLE] : [404, { error: 'Unknown train' }];
      }
      case 'snapshot':
        return [200, await source.snapshot(), LIVE];
      case 'runs':
        return [200, await source.runsFor(Number(q.get('train'))), LIVE];
      case 'history':
        return [200, await source.history(q.get('run') || ''), HISTORY];
      case 'board': {
        const board = timetable.board(q.get('station'), await source.snapshot());
        return board ? [200, board, LIVE] : [404, { error: 'Unknown station' }];
      }
      case 'timetable': {
        const tt = timetable.stationTimetable(q.get('station'));
        return tt ? [200, tt, TIMETABLE] : [404, { error: 'Unknown station' }];
      }
      case 'trip': {
        const trip = timetable.trip(q.get('from'), q.get('to'), await source.snapshot());
        return trip ? [200, trip, LIVE] : [404, { error: 'Unknown station' }];
      }
      default:
        return [404, { error: 'Not found' }];
    }
  }

  route.post = async function post(name, body) {
    if (name === 'watch') {
      const { clean, error } = validateWatch(timetable, body);
      if (error) return [400, { error }];
      return source.watch ? source.watch(clean) : NO_ALERTS;
    }
    if (name === 'unwatch') {
      const endpoint = body?.endpoint;
      if (typeof endpoint !== 'string' || endpoint.length > 1000 || !Number.isInteger(body.train)) return [400, { error: 'Bad request body' }];
      return source.unwatch ? source.unwatch(endpoint, body.train) : NO_ALERTS;
    }
    return [404, { error: 'Not found' }];
  };

  return route;
}

function sendJson(res, [status, body, cache = 'no-store']) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': cache }).end(JSON.stringify(body));
}

module.exports = { createRoutes, decorate, sendJson, readJson };
