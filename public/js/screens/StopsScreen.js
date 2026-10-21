// StopsScreen: the Train page's All stops list.
import { t, getLang, dur } from '../i18n.js';
import { AppBar, PageHeader, StatusChip, StopTimeline } from '../components/index.js';
import { frame, body, row, note, notice } from './_layout.js';
import { place, trainTitle, trainNo, route, time, km, delayStatus } from './_format.js';
import { derive, trainMapFor } from './TrainScreen.js';

/**
 * Train page › All stops: the Panel at full height with a PageHeader (back, "All 16 stops"), the delay,
 * and the full StopTimeline with km, halts, expected and scheduled times, where the train is and the
 * rider's stop. Takes the same data as TrainScreen.
 *
 * With `run` null it lists the stops with their scheduled times and no train row. With `pick: true` it is
 * the choose-your-stop page: the title is "Choose your stop", and every stop the rider can choose (the
 * upcoming ones, or all of them without a run) is a link to #/train/N?stop=ID (the whole row is the tap
 * target); the current stop shows as yours without Change.
 */

/** One row per stop plus the train row, in route order. */
function rowsOf(data, d) {
  const { stops, run, train } = data;
  const { passedIdx, nextIdx, mineIdx, lastIdx, haltOf } = d;
  const pick = !!data.pick;
  const halt = s => { const h = haltOf(s); return h ? t('halt', { d: dur(h) }) : ''; };
  const join = (...parts) => parts.filter(Boolean).join(' · ');
  const hrefOf = s => `#/train/${train.number}?stop=${encodeURIComponent(s.id)}${data.runId ? `&run=${encodeURIComponent(data.runId)}` : ''}`;
  const out = [];
  if (run && passedIdx < 0) out.push({ kind: 'train', name: d.trainText(true) });
  stops.forEach((s, i) => {
    const name = place(s);
    const passed = run && i <= passedIdx;
    const mine = i === mineIdx;
    // Only stops ahead can be chosen: all of them without a run.
    const link = pick && !passed ? { href: hrefOf(s) } : {};
    const change = !pick ? { change: true } : {};
    if (passed) {
      const sched = d.schedOf(s);
      const at = sched != null ? { time: { expected: time(sched, d.ref) } } : {};
      const kmText = i === 0 ? join(t('start'), km(0)) : i === passedIdx ? join(km(s.km), t('lastPassed')) : km(s.km);
      if (mine) out.push({ kind: 'yourstop', name, sub: join(t('yourStop'), km(s.km)), ...at, ...change });
      else out.push({ kind: 'passed', name, sub: kmText, ...at });
      if (i === passedIdx) out.push({ kind: 'train', name: d.trainText(true) });
      return;
    }
    const tm = d.both(i);
    const time_ = tm ? { time: tm } : {};
    if (mine) out.push({ kind: 'yourstop', name, sub: join(t('yourStop'), km(s.km)), ...time_, ...change, ...link });
    else if (i === lastIdx) out.push({ kind: 'final', name, sub: join(t('end'), km(s.km)), ...time_, ...link });
    else if (run && i === nextIdx) out.push({ kind: 'next', name, sub: join(t('nextStop'), km(s.km), halt(s)), ...time_, ...link });
    else out.push({ kind: 'stop', name, sub: join(i === 0 ? t('start') : '', km(s.km), halt(s)), ...time_, ...link });
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
  const pick = !!data.pick;
  const title = pick ? t('chooseStop') : t('allStopsN', { n: stops.length });
  const header = PageHeader({
    title,
    subtitle: d.first ? `${trainNo(train)} ${trainTitle(train)} · ${route(d.first, d.last)}` : `${trainNo(train)} ${trainTitle(train)}`,
    // On the web the AppBar's back link goes to the train, so the header has no back of its own.
    actions: web ? [] : [{ kind: 'back', href: `#/train/${train.number}${data.runId ? `?run=${encodeURIComponent(data.runId)}` : ''}`, label: t('back') }],
  });
  const content = body(
    header,
    data.notice != null ? notice(data.notice) : '',
    ...(d.first ? [
      row(StatusChip(delayStatus(run ? run.late : null, { gps: run ? run.gps : data.gps !== false }))),
      pick ? note(t('pickStopHint')) : '',
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
