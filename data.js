// Timetable model: trains, routes and stations, plus the views built from them (picker summaries,
// station boards and A-to-B trips). Times are minutes after midnight PKT on the day a run left its
// first station, so 1500 means 1:00 AM the next day.
const { getTrains, getRoute } = require('./lib');

const DAY = 1440;
const PKT_OFFSET = 5 * 3600e3; // Pakistan Standard Time is UTC+5 all year

// Epoch ms of midnight PKT on the day containing `ms`.
function pktMidnight(ms = Date.now()) {
  const d = new Date(ms + PKT_OFFSET);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - PKT_OFFSET;
}

// Upstream Urdu names that are wrong: another station's name, Latin text, or Sindhi letters the Urdu font lacks.
const URDU_FIXES = {
  170: 'پشاور کینٹ', // was شجاع آباد (Shujabad)
  143: 'حافظ آباد', // was "sadi"
  211: 'باندھی', // was ٻانڌي
};

const toMinutes = t => {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

function haversineKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

// The API's DayCount is unreliable (it often stays 0 after midnight), so days are counted from
// the clock going backwards along the route instead.
function analyseRoute(raw) {
  const stops = [];
  let day = 0, last = null, km = 0, prevPoint = null;
  const place = t => {
    let m = toMinutes(t);
    if (m == null) return null;
    if (last != null && m + day * DAY < last - 30) day++;
    m += day * DAY;
    last = m;
    return m;
  };
  for (const s of raw) {
    const arr = place(s.ArrivalTime);
    const dep = place(s.DepartureTime);
    const point = s.Latitude && s.Longitude ? { lat: s.Latitude, lon: s.Longitude } : null;
    if (point && prevPoint) km += haversineKm(prevPoint, point);
    if (point) prevPoint = point;
    stops.push({
      id: String(s.StationDetailsId),
      name: s.StationName,
      nameUr: URDU_FIXES[s.StationDetailsId] ?? s.StationNameUR,
      city: s.City,
      lat: s.Latitude || null,
      lon: s.Longitude || null,
      arr,
      dep,
      km: Math.round(km * 10) / 10,
    });
  }
  return stops;
}

class Timetable {
  constructor() {
    this.trains = [];
    this.byNumber = new Map();
    this.routes = new Map(); // train number -> analysed stops
    this.stations = new Map(); // station id -> { id, name, ..., trains: [{ number, index }] }
    this.loadedAt = 0;
  }

  // Everything upstream that the timetable is built from, as plain JSON: { fetchedAt, trains, routes }.
  static async fetchRaw() {
    const trains = await getTrains();
    const routes = {};
    for (let i = 0; i < trains.length; i += 4) {
      await Promise.all(
        trains.slice(i, i + 4).map(async t => {
          routes[t.TrainNumber] = await getRoute(t.TrainId).catch(() => []);
        })
      );
    }
    return { fetchedAt: Date.now(), trains, routes };
  }

  static fromRaw(raw) {
    const timetable = new Timetable();
    timetable.loadRaw(raw);
    return timetable;
  }

  async load() {
    this.loadRaw(await Timetable.fetchRaw());
  }

  loadRaw({ fetchedAt, trains, routes: rawRoutes }) {
    const routes = new Map(trains.map(t => [t.TrainNumber, analyseRoute(rawRoutes[t.TrainNumber] || [])]));
    const stations = new Map();
    for (const [number, stops] of routes) {
      stops.forEach((s, index) => {
        if (!stations.has(s.id)) {
          stations.set(s.id, { id: s.id, name: s.name, nameUr: s.nameUr, city: s.city, lat: s.lat, lon: s.lon, trains: [] });
        }
        stations.get(s.id).trains.push({ number, index });
      });
    }
    this.trains = trains;
    this.byNumber = new Map(trains.map(t => [t.TrainNumber, t]));
    this.routes = routes;
    this.stations = stations;
    this.loadedAt = fetchedAt;
  }

  // Train list for the picker, with first departure, last arrival and journey length.
  trainList() {
    return this.trains.map(t => {
      const stops = this.routes.get(t.TrainNumber) || [];
      const first = stops[0], last = stops[stops.length - 1];
      const departs = first ? first.dep ?? first.arr : null;
      const arrives = last ? last.arr ?? last.dep : null;
      return {
        number: t.TrainNumber,
        id: t.TrainId,
        name: t.TrainName,
        nameUr: t.TrainNameUR,
        description: t.TrainDescription,
        live: Boolean(t.IsLive),
        up: Boolean(t.IsUp),
        departs,
        arrives,
        stops: stops.length,
        fromId: first?.id ?? null,
        toId: last?.id ?? null,
      };
    });
  }

  stationList() {
    return [...this.stations.values()].map(({ trains, ...s }) => ({ ...s, trainCount: trains.length }));
  }

  // Which train a live run belongs to. Run IDs look like <train number><day><month>, e.g. 271710.
  // Cargo trains are not in the passenger list, so they come back as null.
  trainForRun(id) {
    for (const k of [4, 3]) {
      const number = Number(id.slice(0, -k));
      const day = Number(id.slice(-k, -2)), month = Number(id.slice(-2));
      if (this.byNumber.has(number) && day >= 1 && day <= 31 && month >= 1 && month <= 12) return number;
    }
    return null;
  }

  // Epoch ms of midnight PKT on the day the run left its first station.
  runDate(id, number) {
    const suffix = id.slice(String(number).length);
    const day = Number(suffix.slice(0, -2)), month = Number(suffix.slice(-2));
    const now = new Date(Date.now() + PKT_OFFSET);
    let year = now.getUTCFullYear();
    let date = Date.UTC(year, month - 1, day) - PKT_OFFSET;
    if (date - Date.now() > 2 * 86400e3) date = Date.UTC(year - 1, month - 1, day) - PKT_OFFSET; // a December run seen in January
    return date;
  }

  // Where a run is along its route: last station passed, next station and km still to go to each stop.
  progress(stops, run) {
    const prevIdx = stops.findIndex(s => s.id === run.prevStation);
    const nextIdx = stops.findIndex(s => s.id === run.nextStation);
    const next = stops[nextIdx];
    const toNext = next && next.lat ? haversineKm(run, next) : null;
    const kmTo = i => (nextIdx >= 0 && toNext != null && i >= nextIdx ? toNext + (stops[i].km - next.km) : null);
    return { prevIdx, nextIdx, kmTo };
  }

  // Trains due at a station in the next five hours (and any still at the platform).
  board(stationId, runs, now = Date.now()) {
    const station = this.stations.get(stationId);
    if (!station) return null;
    const midnight = pktMidnight(now);
    const nowMin = (now - midnight) / 60000;
    const rows = [];
    for (const { number, index } of station.trains) {
      const train = this.byNumber.get(number);
      const stops = this.routes.get(number);
      const stop = stops[index];
      const first = index === 0, last = index === stops.length - 1;
      const time = first ? stop.dep ?? stop.arr : stop.arr ?? stop.dep;
      if (time == null) continue;
      for (const offset of [0, -1, -2]) {
        const date = midnight + offset * 86400e3;
        const sched = offset * DAY + time; // minutes after today's midnight
        const run = runs.find(r => r.train === number && r.date === date && !r.suspect);
        const late = run ? run.lateBy : 0;
        const est = sched + late;
        if (est < nowMin - 20 || est > nowMin + 300) continue;
        let kmAway = null, atPlatform = false;
        if (run) {
          const p = this.progress(stops, run);
          kmAway = p.kmTo(index);
          const here = stop.lat ? haversineKm(run, stop) : Infinity;
          atPlatform = here < 1.5 && run.speed === 0;
          if (p.prevIdx >= index && !atPlatform) continue; // already gone
        } else if (est < nowMin - 5) {
          continue;
        }
        rows.push({
          number,
          trainId: train.TrainId,
          name: train.TrainName,
          nameUr: train.TrainNameUR,
          up: Boolean(train.IsUp),
          gps: Boolean(train.IsLive),
          kind: first ? 'starts' : last ? 'ends' : 'passes',
          origin: stops[0].name,
          originUr: stops[0].nameUr,
          dest: stops[stops.length - 1].name,
          destUr: stops[stops.length - 1].nameUr,
          sched,
          est,
          late: run ? late : null,
          runId: run ? run.id : null,
          kmAway: kmAway == null ? null : Math.round(kmAway),
          atPlatform,
        });
      }
    }
    rows.sort((a, b) => a.est - b.est);
    return { station: { id: station.id, name: station.name, nameUr: station.nameUr, lat: station.lat, lon: station.lon }, now: nowMin, rows };
  }

  // Every train that stops at a station, by scheduled time there (dep for starts and passes, arr for ends).
  stationTimetable(stationId) {
    const station = this.stations.get(stationId);
    if (!station) return null;
    const place = s => ({ id: s.id, name: s.name, nameUr: s.nameUr });
    const rows = [];
    for (const { number, index } of station.trains) {
      const train = this.byNumber.get(number);
      const stops = this.routes.get(number);
      const stop = stops[index];
      const first = index === 0, last = index === stops.length - 1;
      const time = last && !first ? stop.arr ?? stop.dep : stop.dep ?? stop.arr;
      if (time == null) continue;
      rows.push({
        number,
        name: train.TrainName,
        nameUr: train.TrainNameUR,
        up: Boolean(train.IsUp),
        gps: Boolean(train.IsLive),
        kind: first ? 'starts' : last ? 'ends' : 'passes',
        time: ((time % DAY) + DAY) % DAY,
        before: stops.slice(0, index).map(s => s.id), // for the client: has a live run already passed this stop
        origin: place(stops[0]),
        dest: place(stops[stops.length - 1]),
      });
    }
    rows.sort((a, b) => a.time - b.time || a.number - b.number);
    return { station: { id: station.id, name: station.name, nameUr: station.nameUr }, rows };
  }

  // Direct trains from one station to another, with today's live status where there is one.
  trip(fromId, toId, runs, now = Date.now()) {
    const from = this.stations.get(fromId), to = this.stations.get(toId);
    if (!from || !to) return null;
    const midnight = pktMidnight(now);
    const nowMin = (now - midnight) / 60000;
    const toIndex = new Map(to.trains.map(t => [t.number, t.index]));
    const rows = [];
    for (const { number, index: fi } of from.trains) {
      const ti = toIndex.get(number);
      if (ti == null || ti <= fi) continue;
      const stops = this.routes.get(number);
      const dep = stops[fi].dep ?? stops[fi].arr;
      const arr = stops[ti].arr ?? stops[ti].dep;
      if (dep == null || arr == null) continue;
      const train = this.byNumber.get(number);
      const depClock = dep % DAY;
      // The run that leaves `from` today departed its first station `floor(dep / DAY)` days earlier.
      const date = midnight - Math.floor(dep / DAY) * 86400e3;
      const run = runs.find(r => r.train === number && r.date === date && !r.suspect);
      let passed = false;
      if (run) passed = this.progress(stops, run).prevIdx >= fi;
      rows.push({
        number,
        trainId: train.TrainId,
        name: train.TrainName,
        nameUr: train.TrainNameUR,
        up: Boolean(train.IsUp),
        gps: Boolean(train.IsLive),
        dep: depClock,
        arr: depClock + (arr - dep),
        duration: arr - dep,
        stopsBetween: ti - fi - 1,
        late: run ? run.lateBy : null,
        runId: run ? run.id : null,
        passedFrom: passed,
        leavesIn: !run && depClock > nowMin ? depClock - nowMin : null,
      });
    }
    rows.sort((a, b) => a.dep - b.dep);
    return {
      from: { id: from.id, name: from.name, nameUr: from.nameUr },
      to: { id: to.id, name: to.name, nameUr: to.nameUr },
      now: nowMin,
      rows,
    };
  }
}

module.exports = { Timetable, pktMidnight, haversineKm, DAY };
