// Speed-over-time chart for a run, from the recorded positions ([ts, lat, lon, speed]).
import { t, esc, bdi, clock, dur } from './i18n.js';
import { speedStats } from './eta.js';

export function chartHTML(positions, passes, stationLabel) {
  const stats = speedStats(positions);
  const head = `<div class="chart-stats">
      <span class="chart-title">${esc(t('speedToday'))}</span>
      ${stats ? `<b class="chart-avg">${bdi(stats.avg)} <small>${esc(t('kmh', { n: '' }).trim())} ${esc(t('avg'))}</small></b>
      <span class="chart-sub">${esc(t('top', { n: stats.top }))} · ${esc(t('stoppedFor', { d: dur(stats.stoppedMin) }))}</span>` : ''}
    </div>`;
  if (!stats) return `${head}<p class="chart-empty">${esc(t('noHistory'))}</p>`;

  const x0 = positions[0][0];
  const x1 = Math.max(Date.now(), positions[positions.length - 1][0]);
  const yMax = Math.max(120, stats.top + 10);
  const X = ts => ((ts - x0) / (x1 - x0)) * 1000;
  const Y = v => 116 - (v / yMax) * 108;
  const pts = positions.map(p => `${X(p[0]).toFixed(1)},${Y(p[3]).toFixed(1)}`);
  const linePath = `M${pts.join(' L')}`;
  const area = `${linePath} L${X(positions[positions.length - 1][0]).toFixed(1)},116 L0,116 Z`;

  // Station names under the chart, skipping ones that would overlap.
  const marks = [];
  for (const p of passes) {
    const x = X(p.at) / 10;
    if (x < 3 || x > 97) continue;
    if (marks.length && x - marks[marks.length - 1].x < 13) continue;
    marks.push({ x, name: stationLabel(p.station) });
  }

  return `${head}
    <div class="chart-plot" data-x0="${x0}" data-x1="${x1}">
      <svg viewBox="0 0 1000 120" preserveAspectRatio="none" role="img" aria-label="${esc(t('speedToday'))}">
        <path d="M0,${Y(50).toFixed(1)} L1000,${Y(50).toFixed(1)} M0,${Y(100).toFixed(1)} L1000,${Y(100).toFixed(1)}" class="chart-grid"/>
        <path d="${area}" class="chart-area"/>
        <path d="${linePath}" class="chart-line"/>
      </svg>
      ${marks.map(m => `<span class="chart-mark" style="inset-inline-start:${m.x}%"></span>`).join('')}
      <span class="chart-cursor" hidden></span>
      <span class="chart-tip" hidden></span>
    </div>
    <div class="chart-axis">
      ${marks.map(m => `<span class="chart-station" style="inset-inline-start:${m.x}%">${esc(m.name)}</span>`).join('')}
      <span class="chart-tick tick-start">${bdi(clock(x0))}</span><span class="chart-tick tick-end">${esc(t('now'))}</span>
    </div>`;
}

// Hover readout: time and speed under the pointer.
export function bindChart(root, positions) {
  root.querySelectorAll('.chart-plot').forEach(plot => {
    const x0 = Number(plot.dataset.x0), x1 = Number(plot.dataset.x1);
    const cursor = plot.querySelector('.chart-cursor'), tip = plot.querySelector('.chart-tip');
    const rtl = document.documentElement.dir === 'rtl';
    plot.addEventListener('pointermove', e => {
      const r = plot.getBoundingClientRect();
      let f = (e.clientX - r.left) / r.width;
      if (rtl) f = 1 - f;
      const ts = x0 + f * (x1 - x0);
      let best = positions[0];
      for (const p of positions) if (Math.abs(p[0] - ts) < Math.abs(best[0] - ts)) best = p;
      const pct = ((best[0] - x0) / (x1 - x0)) * 100;
      cursor.hidden = tip.hidden = false;
      cursor.style.insetInlineStart = `${pct}%`;
      tip.style.insetInlineStart = `${Math.min(Math.max(pct, 12), 88)}%`;
      tip.innerHTML = `${bdi(clock(best[0]))} · ${best[3] > 3 ? bdi(t('kmh', { n: best[3] })) : esc(t('stopped'))}`;
    });
    plot.addEventListener('pointerleave', () => { cursor.hidden = tip.hidden = true; });
  });
}
