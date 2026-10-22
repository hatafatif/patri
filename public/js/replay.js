// Journey replay: turns /api/replay (a train's and its return train's recorded runs) into what the map
// draws at any moment of the period. Pure functions, no DOM; the Train page's replay view drives them.
import { pktMidnight } from './i18n.js';

export const PERIODS = [7, 30, 90];
export const PLAY_MS = 60000; // a whole period plays in about a minute
const DAY = 86400e3;
// Recorded points are at most 15 min apart (the 90-day step); a longer gap means the recorder heard nothing,
// so the train is left off the map then rather than drawn gliding across it.
const GAP_MS = 45 * 60e3;

/** First index in pts whose time is after ms (pts sorted by time). */
function after(pts, ms) {
  let lo = 0, hi = pts.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (pts[mid][0] <= ms) lo = mid + 1; else hi = mid;
  }
  return lo;
}

/**
 * The replay model, or null when nothing was recorded. It starts at the first recording rather than at
 * the start of the period, so a period with only a few days recorded doesn't play empty days first.
 * @param {{ from: number, to: number, runs: { id: string, train: number, points: [number, number, number, number][] }[] }} body
 *   /api/replay: points are [ms, lat, lon, km/h], sorted by time.
 * @returns {{ from: number, to: number, runs: { id: string, train: number, pts: number[][], start: number, end: number }[], days: { start: number, recorded: boolean }[] } | null}
 */
export function prepare(body) {
  const runs = (body?.runs || [])
    .filter(r => r.points?.length)
    .map(r => ({ id: r.id, train: r.train, pts: r.points, start: r.points[0][0], end: r.points.at(-1)[0] }))
    .sort((a, b) => a.start - b.start);
  if (!runs.length) return null;
  const from = Math.min(...runs.map(r => r.start));
  const to = Math.max(from + 60e3, ...runs.map(r => r.end));
  // One entry per Pakistan day in the period; recorded when some run was on the move that day.
  const days = [];
  for (let start = pktMidnight(from); start < to; start += DAY) {
    days.push({ start, recorded: runs.some(r => r.start < start + DAY && r.end >= start) });
  }
  return { from, to, runs, days };
}

/** The replay time after dtMs of real time at play speed; it loops back to the start at the end. */
export function advance(model, at, dtMs) {
  const next = at + dtMs * (model.to - model.from) / PLAY_MS;
  return next > model.to ? model.from : next;
}

/** How far back each train's trail reaches: a twelfth of the period, kept between 4 and 12 hours, so it reads at play speed. */
const trailMs = model => Math.min(12 * 3600e3, Math.max(4 * 3600e3, (model.to - model.from) / 12));

/** Which way the train is heading at index i: the first point ahead (else behind) at least ~500 m east or west. */
function facingAt(pts, i) {
  const here = pts[Math.min(i, pts.length - 1)][2];
  for (let j = i; j < Math.min(pts.length, i + 12); j++) if (Math.abs(pts[j][2] - here) > 0.005) return pts[j][2] < here ? 'left' : 'right';
  for (let j = i - 1; j >= Math.max(0, i - 12); j--) if (Math.abs(pts[j][2] - here) > 0.005) return pts[j][2] > here ? 'left' : 'right';
  return 'right';
}

/**
 * Every train on the move at time `at`, for map.setReplayFrame: where it is (interpolated between
 * recorded points), its speed, which way it faces and its trail as [lon, lat] pairs ending at the train.
 * @returns {{ id: string, train: number, lat: number, lon: number, speed: number, facing: 'left' | 'right', trail: [number, number][] }[]}
 */
export function frameAt(model, at) {
  const out = [];
  const back = trailMs(model);
  for (const r of model.runs) {
    if (at < r.start || at > r.end) continue;
    const { pts } = r;
    const i = Math.max(1, Math.min(pts.length - 1, after(pts, at)));
    const a = pts[i - 1], b = pts[i];
    if (b[0] - a[0] > GAP_MS) continue;
    const k =b[0] > a[0] ? Math.min(1, Math.max(0, (at - a[0]) / (b[0] - a[0]))) : 0;
    const lat = a[1] + (b[1] - a[1]) * k, lon = a[2] + (b[2] - a[2]) * k;
    const trail = pts.slice(after(pts, at - back), i).map(p => [p[2], p[1]]);
    trail.push([lon, lat]);
    out.push({ id: r.id, train: r.train, lat, lon, speed: Math.round(a[3] + (b[3] - a[3]) * k), facing: facingAt(pts, i), trail });
  }
  return out;
}
