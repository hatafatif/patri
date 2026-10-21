// StopsScreen: the Train page's All stops list.
import { t, getLang, dur } from '../i18n.js';
import { AppBar, PageHeader, StatusChip, StopTimeline } from '../components/index.js';
import { frame, body, row, note, notice } from './_layout.js';
import { place, trainTitle, trainNo, route, time, km, delayStatus } from './_format.js';
import { derive, trainMapFor } from './TrainScreen.js';

/**
 * Train page › All stops: the Panel at full height with a PageHeader (back, "All 16 stops"), the delay,
 * and the full StopTimeline with km, halts, expected and scheduled times, and where the train is.
 * Takes the same data as TrainScreen.
 *
 * With `run` null it lists the stops with their scheduled times and no train row.
 */

/** One row per stop plus the train row, in route order. */
function rowsOf(data, d) {
  const { stops, run, train } = data;
  const { passedIdx, nextIdx, lastIdx, haltOf } = d;
  const halt = s => { const h = haltOf(s); return h ? t('halt', { d: dur(h) }) : ''; };
  const join = (...parts) => parts.filter(Boolean).join(' · ');
  const out = [];
  if (run && passedIdx < 0) out.push({ kind: 'train', name: d.trainText(true) });
  stops.forEach((s, i) => {
    const name = place(s);
    const passed = run && i <= passedIdx;
    if (passed) {
      const sched = d.schedOf(s);
      const at = sched != null ? { time: { expected: time(sched, d.ref) } } : {};
      const kmText = i === 0 ? join(t('start'), km(0)) : i === passedIdx ? join(km(s.km), t('lastPassed')) : km(s.km);
      out.push({ kind: 'passed', name, sub: kmText, ...at });
      if (i === passedIdx) out.push({ kind: 'train', name: d.trainText(true) });
      return;
    }
    const tm = d.both(i);
    const time_ = tm ? { time: tm } : {};
    if (i === lastIdx) out.push({ kind: 'final', name, sub: join(t('end'), km(s.km)), ...time_ });
    else if (run && i === nextIdx) out.push({ kind: 'next', name, sub: join(t('nextStop'), km(s.km), halt(s)), ...time_ });
    else out.push({ kind: 'stop', name, sub: join(i === 0 ? t('start') : '', km(s.km), halt(s)), ...time_ });
  });
  return out;
}

/**
 * @param {import('./TrainScreen.js').TrainScreenData} data
 * @param {import('./_layout.js').ScreenOptions} [options]
 * @returns {string}
 */
export function StopsScreen(data, options = {}) {
  const web = options.layout === 'web';
  const d = derive(data);
  const { train, run, stops } = data;
  const title = t('allStopsN', { n: stops.length });
  const header = PageHeader({
    title,
    subtitle: d.first ? `${trainNo(train)} ${trainTitle(train)} · ${route(d.first, d.last)}` : `${trainNo(train)} ${trainTitle(train)}`,
    // No back of its own: the Panel's top bar (phone) or the AppBar (web) links back to the train.
  });
  const content = body(
    header,
    data.notice != null ? notice(data.notice) : '',
    ...(d.first ? [
      row(StatusChip(delayStatus(run ? run.late : null, { gps: run ? run.gps : data.gps !== false }))),
      !run ? note(t('timetableTimes')) : '',
      StopTimeline({ mode: 'full', rows: rowsOf(data, d), legend: !!run }),
    ] : [note(t('loading'))]),
  );
  const map = options.standin === false ? '' : trainMapFor(data, web ? 'web' : 'phone');
  if (!web) {
    return frame({ name: 'stops', options, snap: 'full', label: title, map, body: content,
      back: { href: `#/train/${train.number}${data.runId ? `?run=${encodeURIComponent(data.runId)}` : ''}`, label: t('back') } });
  }
  return frame({
    name: 'stops', options, snap: 'full', label: title,
    map,
    body: AppBar({ live: data.live, lang: getLang(), back: { href: `#/train/${train.number}`, label: trainTitle(train) } }) + content,
  });
}
