// SpeedChart: the train's speed since it left, as an inline SVG with a hover or tap readout.
import { esc, bdi } from './_shared.js';
import { t, clock } from '../i18n.js';

const H = 120;       // viewBox height; the width is 1000 and the SVG stretches to the plot box
const MOVING = 3;    // km/h: above this the train counts as moving

// Average of the moving points and the top speed; null when there is nothing to show.
function stats(points) {
  const moving = points.filter(p => p[1] > MOVING);
  if (!moving.length) return null;
  return {
    avg: Math.round(moving.reduce((s, p) => s + p[1], 0) / moving.length),
    top: Math.round(Math.max(...points.map(p => p[1]))),
  };
}

/**
 * The train's speed since it left: a line and area over time, dashed marks where it stopped at stations, a dot for now, and the average and top speed above. Fewer than two points shows an empty message instead.
 * @typedef {object} SpeedChartProps
 * @property {[number, number][]} points - Speed samples as [milliseconds since the epoch, km/h], oldest first.
 * @property {{ ms: number, name: string }[]} [stops=[]] - Stations the train has passed, with the time and the localised name. Names that would overlap are skipped.
 * @property {number} [now] - Milliseconds since the epoch for the right edge of the chart. Defaults to the last point; never earlier than it.
 * @property {string} [title] - Replaces the default heading ("Speed today"), such as "Speed so far". Already localised.
 * @property {boolean} [stats=true] - false hides the average and top speed, for illustrative points. They are only ever worked out from the points passed in; with fewer than two points there is no chart and no stats either way.
 */
export function SpeedChart({ points = [], stops = [], now, title, stats: showStats = true } = {}) {
  const s = points.length >= 2 ? stats(points) : null;
  const heading = title || t('speedToday');
  const head = `<div class="p-speedchart__head"><span class="p-speedchart__title">${esc(heading)}</span>${s && showStats ? `<b class="p-speedchart__avg">${bdi(s.avg)} <small>${esc(t('kmh', { n: '' }).trim())} ${esc(t('avg'))}</small></b><span class="p-speedchart__top">${esc(t('top', { n: s.top }))}</span>` : ''}</div>`;
  if (!s) return `<div class="p-speedchart">${head}<p class="p-speedchart__empty">${esc(t('noHistory'))}</p></div>`;

  const last = points[points.length - 1];
  const x0 = points[0][0];
  const x1 = Math.max(now ?? last[0], last[0], x0 + 1);
  const yMax = Math.max(120, s.top + 10);
  const X = ms => ((ms - x0) / (x1 - x0)) * 1000;
  const Y = v => H - 4 - (v / yMax) * (H - 12);
  const pts = points.map(p => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`);
  const line = `M${pts.join(' L')}`;
  const area = `${line} L${X(last[0]).toFixed(1)},${H} L0,${H} Z`;

  // Station marks, skipping any that would crowd the one before.
  const marks = [];
  for (const stop of [...stops].sort((a, b) => a.ms - b.ms)) {
    const x = X(stop.ms) / 10;
    if (x < 8 || x > 92) continue;
    if (marks.length && x - marks[marks.length - 1].x < 13) continue;
    marks.push({ x, name: stop.name });
  }

  const nowX = X(last[0]) / 10, nowY = (Y(last[1]) / H) * 100;
  const pct = n => n.toFixed(2);
  return `<div class="p-speedchart">${head}
    <div class="p-speedchart__plot" data-x0="${x0}" data-x1="${x1}">
      <svg class="p-speedchart__svg" viewBox="0 0 1000 ${H}" preserveAspectRatio="none" role="img" aria-label="${esc(heading)}">
        <path class="p-speedchart__grid" d="M0,${Y(50).toFixed(1)} L1000,${Y(50).toFixed(1)} M0,${Y(100).toFixed(1)} L1000,${Y(100).toFixed(1)}"/>
        <path class="p-speedchart__area" d="${area}"/>
        <path class="p-speedchart__line" d="${line}"/>
      </svg>
      ${marks.map(m => `<span class="p-speedchart__mark" style="--x:${pct(m.x)}%"></span>`).join('')}
      <span class="p-speedchart__cursor" hidden></span>
      <span class="p-speedchart__now" style="--x:${pct(nowX)}%;--y:${pct(nowY)}%"></span>
      <span class="p-speedchart__tip" hidden></span>
    </div>
    <div class="p-speedchart__axis">
      <div class="p-speedchart__stations">${marks.map(m => `<span class="p-speedchart__station" style="--x:${pct(m.x)}%">${bdi(m.name)}</span>`).join('')}</div>
      <div class="p-speedchart__ticks"><span class="p-speedchart__tick">${bdi(clock(x0))}</span><span class="p-speedchart__tick p-speedchart__tick--end">${esc(t('now'))}</span></div>
    </div>
  </div>`;
}

// bindSpeedChart(root, points) takes the same points the chart was drawn from, so it has no handlers typedef.
// It adds a cursor line and a tip with the clock time and speed under the pointer, and returns unbind().
export function bindSpeedChart(root, points = []) {
  const plots = root.matches?.('.p-speedchart__plot') ? [root] : [...root.querySelectorAll('.p-speedchart__plot')];
  const undo = [];
  for (const plot of plots) {
    if (!points.length) break;
    const x0 = Number(plot.dataset.x0), x1 = Number(plot.dataset.x1);
    const cursor = plot.querySelector('.p-speedchart__cursor'), tip = plot.querySelector('.p-speedchart__tip');
    const hide = () => { cursor.hidden = tip.hidden = true; };
    const show = e => {
      const r = plot.getBoundingClientRect();
      let f = (e.clientX - r.left) / r.width;
      if (document.documentElement.dir === 'rtl') f = 1 - f;
      const ms = x0 + Math.min(Math.max(f, 0), 1) * (x1 - x0);
      let best = points[0];
      for (const p of points) if (Math.abs(p[0] - ms) < Math.abs(best[0] - ms)) best = p;
      const at = ((best[0] - x0) / (x1 - x0)) * 100;
      cursor.hidden = tip.hidden = false;
      cursor.style.insetInlineStart = `${at}%`;
      tip.style.insetInlineStart = `${Math.min(Math.max(at, 14), 86)}%`;
      tip.innerHTML = `${bdi(clock(best[0]))} · ${best[1] > MOVING ? bdi(t('kmh', { n: Math.round(best[1]) })) : esc(t('stopped'))}`;
    };
    // A finger lifts as soon as it taps, so touch keeps the readout until the next tap elsewhere.
    const leave = e => { if (e.pointerType === 'mouse') hide(); };
    const outside = e => { if (!plot.contains(e.target)) hide(); };
    plot.addEventListener('pointerdown', show);
    plot.addEventListener('pointermove', show);
    plot.addEventListener('pointerleave', leave);
    document.addEventListener('pointerdown', outside);
    undo.push(() => {
      plot.removeEventListener('pointerdown', show);
      plot.removeEventListener('pointermove', show);
      plot.removeEventListener('pointerleave', leave);
      document.removeEventListener('pointerdown', outside);
    });
  }
  return () => undo.forEach(fn => fn());
}
