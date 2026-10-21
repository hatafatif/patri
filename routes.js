// The JSON API, shared by the local server (server.js) and the Vercel function (api/index.js).
// `source` supplies the live data: snapshot() -> every current run, runsFor(train) -> that train's
// runs, history(run) -> recorded positions and station passes.
const TIMETABLE = 'public, s-maxage=3600, stale-while-revalidate=86400'; // changes only with a deploy
const LIVE = 'public, s-maxage=15, stale-while-revalidate=30';
// History only grows; a minute's staleness is fine and lets one recorder read serve everyone on that train.
const HISTORY = 'public, s-maxage=60, stale-while-revalidate=300';

// A raw position with the train and departure date it belongs to. Runs we can't place (cargo
// trains) come back as null; delays over a day are flagged as suspect and hidden by default.
function decorate(timetable, id, pos, train = timetable.trainForRun(id)) {
  if (train == null) return null;
  return { id, train, date: timetable.runDate(id, train), suspect: Math.abs(pos.lateBy) > 1440, ...pos };
}

function createRoutes(timetable, source) {
  // Resolves to [status, body, cacheControl].
  return async function route(name, q) {
    switch (name) {
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
      case 'trip': {
        const trip = timetable.trip(q.get('from'), q.get('to'), await source.snapshot());
        return trip ? [200, trip, LIVE] : [404, { error: 'Unknown station' }];
      }
      default:
        return [404, { error: 'Not found' }];
    }
  };
}

function sendJson(res, [status, body, cache = 'no-store']) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': cache }).end(JSON.stringify(body));
}

module.exports = { createRoutes, decorate, sendJson };
