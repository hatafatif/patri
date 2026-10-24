// StopsScreen: the Train page's All stops list.
import { t, dur } from '../i18n.js';
import { PageHeader, StatusChip, StopTimeline, Button } from '../components/index.js';
import { frame, body, row, note, notice, navBar } from './_layout.js';
import { place, trainTitle, trainNo, route, time, approx, km, delayStatus } from './_format.js';
import { derive, trainMapFor } from './TrainScreen.js';

/**
 * Train page › All stops: the Panel at full height with a PageHeader (back, "All 16 stops"), the delay,
 * and the full StopTimeline with km, halts, expected and scheduled times, and where the train is.
 * Takes the same data as TrainScreen.
 *
 * With `run` null it lists the stops with their scheduled times and no train row. With `pick: true` it is
 * the choose-a-stop-for-alerts page: the title is "Choose your stop for alerts", a "Whole journey, no stop"
 * button comes first, and every stop ahead is a link (the whole row is the tap target); the view turns
 * a tap into the alert. Passed stops are shown but cannot be chosen.
 */

/** One row per stop plus the train row, in route order. */
function rowsOf(data, d) {
  const { stops, run, train } = data;
  const { passedIdx, nextIdx, lastIdx, haltOf } = d;
  const pick = !!data.pick;
  const hrefOf = s => `#/train/${train.number}?stop=${encodeURIComponent(s.id)}${data.runId ? `&run=${encodeURIComponent(data.runId)}` : ''}`;
  const halt = s => { const h = haltOf(s); return h ? t('halt', { d: dur(h) }) : ''; };
  const join = (...parts) => parts.filter(Boolean).join(' · ');
  const out = [];
  if (run && passedIdx < 0) out.push({ kind: 'train', name: d.trainText(true) });
  stops.forEach((s, i) => {
    const name = place(s);
    const passed = run && i <= passedIdx;
    if (passed) {
      // When it was there, and the timetable time struck through when that differs.
      const b = d.behind(i), sched = d.schedOf(s);
      const at = b ? { time: {
        expected: (b.approx ? approx : time)(b.at, d.ref),
        ...(sched != null && Math.round(b.at) !== sched ? { scheduled: time(sched, d.ref) } : {}),
      } } : {};
      const kmText = i === 0 ? join(t('start'), km(0)) : i === passedIdx ? join(km(s.km), t('lastPassed')) : km(s.km);
      out.push({ kind: 'passed', name, sub: kmText, ...at });
      if (i === passedIdx) out.push({ kind: 'train', name: d.trainText(true) });
      return;
    }
    const tm = d.both(i);
    const time_ = tm ? { time: tm } : {};
    const link = pick ? { href: hrefOf(s) } : {};
    if (i === lastIdx) out.push({ kind: 'final', name, sub: join(t('end'), km(s.km)), ...time_, ...link });
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
  const title = pick ? t('alertsChooseStop') : t('allStopsN', { n: stops.length });
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
      pick ? note(t('pickStopHint')) : '',
      pick ? Button({ label: t('alertsSkipStop'), variant: 'secondary', full: true, className: 'p-alerts-whole' }) : '',
      !run ? note(t('timetableTimes')) : '',
      StopTimeline({ mode: 'full', rows: rowsOf(data, d), legend: !!run }),
    ] : [note(t('loading'))]),
  );
  const map = options.standin === false ? '' : trainMapFor(data, web ? 'web' : 'phone');
  const backHref = `#/train/${train.number}${data.runId ? `?run=${encodeURIComponent(data.runId)}` : ''}`;
  if (!web) {
    return frame({ name: 'stops', options, snap: 'full', label: title, map, body: content, back: { href: backHref, label: t('back') } });
  }
  return frame({
    name: 'stops', options, snap: 'full', label: title,
    map,
    body: navBar(data.live, backHref) + content,
  });
}
