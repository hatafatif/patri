// Where a train is, when it will reach each stop, and what it is doing right now.
// Stop times (arr/dep) are minutes after midnight PKT on the day the run left its first station.

export function haversineKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function progress(stops, run) {
  const prevIdx = stops.findIndex(s => s.id === run.prevStation);
  const nextIdx = stops.findIndex(s => s.id === run.nextStation);
  const next = stops[nextIdx];
  const toNext = next && next.lat ? haversineKm(run, next) : null;
  // Last station passed: the one before "next" if the feed's prev is missing.
  const passedIdx = prevIdx >= 0 ? prevIdx : nextIdx - 1;
  const kmTo = i => (nextIdx >= 0 && toNext != null && i >= nextIdx ? toNext + (stops[i].km - next.km) : null);
  return { prevIdx, nextIdx, passedIdx, kmTo };
}

// Average speed over the last 30 minutes of movement, ignoring stops.
export function recentSpeed(positions, now = Date.now()) {
  const recent = positions.filter(p => p[0] > now - 30 * 60e3 && p[3] > 3);
  if (recent.length < 5) return null;
  return recent.reduce((sum, p) => sum + p[3], 0) / recent.length;
}

// Clock time "HH:MM" from the feed -> epoch ms nearest to `near`.
function etaToMs(hhmm, near) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(near + 5 * 3600e3);
  let ms = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h, m) - 5 * 3600e3;
  while (ms - near > 12 * 3600e3) ms -= 86400e3;
  while (near - ms > 12 * 3600e3) ms += 86400e3;
  return ms;
}

const NEAR_KM = 0.5;      // the recorded track is "at" a station within this, ~1-2 min off the recorded pass
const ROUGH_KM = 2;       // farther than this, the track says nothing about the station
const GAP_MS = 45 * 60e3; // a longer silence in the track hides when the train got there (or left)

/**
 * When the train was at stop i, a stop it has passed. A recorded pass is exact. Without one, the recorded
 * track: the first moment near the stop (the last, for the first stop, as it left), unless the recording
 * was silent just before (after) it. Failing both, the timetable plus the delay recorded at the next stop
 * on, else the delay now: a guess, so approx is true.
 */
function passedTime(stops, i, run, positions, passes) {
  const s = stops[i];
  const pass = passes.find(x => x.station === s.id);
  if (pass) return { passedMs: pass.at, approx: false };
  if (s.lat && s.lon) {
    const near = p => (Math.abs(p[1] - s.lat) < 0.03 && Math.abs(p[2] - s.lon) < 0.03 ? haversineKm({ lat: p[1], lon: p[2] }, s) : Infinity);
    const heard = (a, b) => !!positions[a] && !!positions[b] && positions[b][0] - positions[a][0] <= GAP_MS;
    if (i === 0) {
      // Gone from the first stop: the last point near it, provided a later point is clear of it.
      const j = positions.findLastIndex(p => near(p) < NEAR_KM * 2);
      if (j >= 0 && heard(j, j + 1) && positions.slice(j + 1).some(p => near(p) > ROUGH_KM)) return { passedMs: positions[j][0], approx: false };
    } else {
      let k = positions.findIndex(x => near(x) < NEAR_KM);
      if (k < 0) for (let x = 0; x < positions.length; x++) if (near(positions[x]) < ROUGH_KM && (k < 0 || near(positions[x]) < near(positions[k]))) k = x;
      if (k >= 0 && heard(k - 1, k)) return { passedMs: positions[k][0], approx: false };
    }
  }
  const sched = s.dep != null && (i === 0 || s.arr == null) ? s.dep : s.arr;
  if (sched == null) return { passedMs: null, approx: false };
  const later = stops.slice(i + 1).map(x => passes.find(y => y.station === x.id)).find(Boolean);
  const late = later?.late ?? run.lateBy ?? 0;
  return { passedMs: run.date + (sched + late) * 60e3, approx: true };
}

// Estimated time at every stop. Two estimates, and the later one wins:
//  - timetable: the scheduled time plus the current delay (trains rarely make time up);
//  - distance: km to go at the recent average speed, plus 2 min per stop on the way. Only used
//    for the next ~120 km, where the current pace says something.
// Any extra delay the distance estimate adds is carried forward, so times never run backwards.
export function estimates(stops, run, positions = [], passes = [], now = Date.now()) {
  const p = progress(stops, run);
  const speed = recentSpeed(positions, now);
  let extra = 0;
  return stops.map((s, i) => {
    const sched = s.arr ?? s.dep;
    const schedMs = sched == null ? null : run.date + sched * 60e3;
    if (i <= p.passedIdx) return { i, passed: true, schedMs, ...passedTime(stops, i, run, positions, passes) };
    const km = p.kmTo(i);
    if (schedMs == null) return { i, passed: false, schedMs, estMs: null, km, speed };
    let timetable = schedMs + run.lateBy * 60e3;
    if (i === p.nextIdx && run.nextEta) timetable = etaToMs(run.nextEta, timetable);
    let estMs = timetable, byDistance = null;
    if (speed && km != null && km < 120) {
      byDistance = now + (km / speed) * 3600e3 + Math.max(0, i - p.nextIdx) * 2 * 60e3;
      estMs = Math.max(estMs, byDistance);
    }
    estMs = Math.max(estMs, timetable + extra);
    extra = Math.max(extra, estMs - timetable);
    return { i, passed: false, schedMs, estMs, km, speed, byDistance };
  });
}

// Plain-language state of a run, for the status line.
export function status(stops, run, positions = [], now = Date.now()) {
  const p = progress(stops, run);
  const prev = stops[p.prevIdx], next = stops[p.nextIdx];
  const last = stops[stops.length - 1];
  const ageMin = (now - run.updatedAt) / 60e3;
  const nearest = [prev, next].filter(s => s && s.lat).sort((a, b) => haversineKm(run, a) - haversineKm(run, b))[0];
  if (p.prevIdx === stops.length - 1 || (last && last.lat && haversineKm(run, last) < 1.5 && p.nextIdx < 0)) {
    return { kind: 'done', station: last };
  }
  if (ageMin > 10) return { kind: 'lost', minutes: ageMin, station: nearest };
  if (run.speed > 3) return { kind: 'run', speed: run.speed, from: prev, to: next };
  // Stopped: how long for, from the recorded history.
  const lastMoving = [...positions].reverse().find(x => x[3] > 3);
  const stoppedMin = lastMoving ? (now - lastMoving[0]) / 60e3 : null;
  const origin = stops[0];
  if (p.passedIdx <= 0 && origin && origin.lat && haversineKm(run, origin) < 2 && !lastMoving) {
    return { kind: 'wait', station: origin, dueMs: run.date + (origin.dep ?? 0) * 60e3 };
  }
  const near = nearest && haversineKm(run, nearest) < 1.5 ? nearest : null;
  return near ? { kind: 'stopAt', station: near, minutes: stoppedMin } : { kind: 'stopBetween', from: prev, to: next, minutes: stoppedMin };
}
