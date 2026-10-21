// TrainScreen: everything about one train, with the map following it.
import { t, getLang, dur, delayText } from '../i18n.js';
import {
  AppBar, PageHeader, Card, StatusChip, StatusStrip, StopTimeline, JourneyProgress, Button, SpeedChart, DetailGrid, LinkRow,
  MapToggle, SegmentedControl, Photo, statusTone,
} from '../components/index.js';
import { frame, body, cards, stack, row, fill, note, notice, mapButton, backButton } from './_layout.js';
import { place, cityOf, trainTitle, trainNo, badgeOf, route, time, approx, km, kmNum, dayTime, dayApprox, dateLabel, delayStatus } from './_format.js';
import { trainMap } from './_map-standin.js';

/**
 * The Train page: the map following the train, and the Panel with the PageHeader, the Right now card
 * (status, stops around the train, progress, See all stops), speed so far, About this train and the
 * return train. Web: the same content in the sidebar, the speed chart docked along the bottom of the map.
 * The same data renders StopsScreen.
 *
 * With `run` null (no live run now, or a train without GPS) the page is in timetable mode: a Right now card
 * with a "Timetable" or "No GPS" chip, your stop with its scheduled time, About this train and the return
 * train; no speed card. With no `stops` yet it shows the header and a loading note.
 * @typedef {object} TrainScreenData
 * @property {'on' | 'reconnecting' | 'off'} live - The feed state, for the web sidebar's AppBar.
 * @property {import('./_format.js').ScreenTrain} train
 * @property {TrainStop[]} stops - The route, first to last (/api/route?train=N). Empty while it loads.
 * @property {TrainRun | null} run - The live run, or null for timetable mode.
 * @property {boolean} [gps=true] - Whether the train has GPS at all. Only read when run is null: it picks "no live run" or "no GPS" and the chip.
 * @property {number} [now] - Minutes after midnight on the run's first day. Needed with a run.
 * @property {{ passed: boolean, est?: number, at?: number }[]} [ests] - One per stop, as eta.js estimates() gives them, in minutes: passed stops show their timetable time (at, when known, is when the train passed); the rest have an expected time (est may be missing). Needed with a run.
 * @property {{ passedIdx: number, nextIdx: number, kmDone: number, kmToNext: number }} [progress] - eta.js progress(): the last stop passed (-1 before departure), the next stop (-1 once arrived or unknown), km run so far and km to the next stop. Needed with a run.
 * @property {string} [myStop] - The rider's stop id.
 * @property {boolean} followed - Whether the train is in My trains.
 * @property {{ points: [number, number][], stops: { ms: number, id: string }[], now: number, illustrative?: boolean }} [speed] - SpeedChart input: [ms, km/h] samples, the stations passed (by stop id) and now in ms. Needed with a run.
 * @property {{ locomotive?: string }} [details] - Extra facts for About this train.
 * @property {import('../components/Photo.js').PhotoProps} [photo] - A photo of this train (or a general one) for About this train.
 * @property {import('./_format.js').ScreenTrain} [returnTrain] - The train running the other way.
 * @property {{ id: string, date: string }[]} [runs] - The runs worth choosing between, newest first (two or three). More than one shows a SegmentedControl of links ("Left Sun 18 Oct"), each to #/train/N?run=id.
 * @property {string} [runId] - The id of the run shown, for the SegmentedControl and for links that keep the run.
 * @property {{ count: number, href: string }} [hiddenRuns] - Suspect runs that are not shown: a note and a "Show anyway" link to href.
 * @property {boolean} [following=true] - The MapToggle's state.
 * @property {string} [notice] - Short feedback under the PageHeader ("Link copied"). Pass '' when there is none, so the live region exists before the text arrives.
 * @property {boolean} [pick] - StopsScreen only: choose-your-stop mode.
 */
/**
 * The live run of a train.
 * @typedef {object} TrainRun
 * @property {number} speed - km/h.
 * @property {number} late - Delay in minutes.
 * @property {number} updatedAt - When it last reported, minutes after midnight on the first day.
 * @property {string} date - The day it left, 'YYYY-MM-DD'.
 * @property {boolean} gps - Whether it has GPS.
 * @property {{ kind: 'run' | 'stopAt' | 'stopBetween' | 'wait' | 'done' | 'lost', station?: import('./_format.js').ScreenStation, minutes?: number }} [status] - eta.js status(): what the train is doing. Without it the strip says "Running · N km/h".
 */
/**
 * One stop on the route, as /api/route gives it.
 * @typedef {object} TrainStop
 * @property {string} id
 * @property {string} name
 * @property {string} [nameUr]
 * @property {string} [city]
 * @property {string} [cityUr]
 * @property {number} km - Distance from the first stop.
 * @property {number | null} arr - Scheduled arrival, minutes after midnight on the first day (null at the first stop).
 * @property {number | null} dep - Scheduled departure (null at the last stop).
 */
/** A stop's halt in minutes, or 0 when it is under 5 min (a shorter halt is not worth showing). */
const haltOf = s => (s && s.arr != null && s.dep != null && s.dep - s.arr >= 5 ? s.dep - s.arr : 0);
/** A stop's scheduled time, or null. */
const schedOf = s => s?.arr ?? s?.dep ?? null;

/**
 * What both screens work out from the data: the stops that matter, the expected time at a stop, the
 * stops between the rider's stop and the end. Private to the two screens (StopsScreen imports it).
 * Safe on partial data: no stops, no run, no estimate for a stop, a stop without a scheduled time.
 * @param {TrainScreenData} data
 */
export function derive(data) {
  const { stops, run } = data;
  const ests = data.ests || [];
  const progress = run && data.progress ? data.progress : { passedIdx: -1, nextIdx: -1, kmDone: 0, kmToNext: 0 };
  const now = data.now ?? 0;
  // The rider's now, for days on times ("Tomorrow 2:50 AM"); without a run, times count from the first day.
  const ref = run && data.now != null ? data.now : undefined;
  const first = stops[0], last = stops.at(-1);
  const { nextIdx, passedIdx } = progress;
  const mineIdx = data.myStop ? stops.findIndex(s => s.id === data.myStop) : -1;
  const est = i => (ests[i]?.est != null && !ests[i].passed ? ests[i].est : null);
  const inTime = i => (est(i) != null ? t('inTime', { d: dur(est(i) - now) }) : '');
  /** The expected time alone ("~1:20 PM"), or the scheduled time when there is no estimate. */
  const exp = i => (est(i) != null ? { expected: approx(est(i), ref) } : schedOf(stops[i]) != null ? { expected: time(schedOf(stops[i]), ref) } : undefined);
  /** Expected and scheduled, the scheduled one struck through when it differs. */
  const both = i => {
    const sched = schedOf(stops[i]);
    if (est(i) == null) return exp(i);
    return { expected: approx(est(i), ref), ...(sched != null && Math.round(est(i)) !== sched ? { scheduled: time(sched, ref) } : {}) };
  };

  /** The train's own row on the timeline: where it is, in words that stay true whatever it is doing. */
  const trainText = full => {
    const st = run?.status;
    let text;
    if (st?.kind === 'stopAt') text = t('stStoppedAt', { station: place(st.station) });
    else if (st?.kind === 'stopBetween') text = t('stStoppedBetween');
    else if (st?.kind === 'wait') text = t('stNotDeparted');
    else if (st?.kind === 'done') text = t('stArrived', { station: place(st.station ?? last) });
    else if (st?.kind === 'lost') text = t('stLost', { d: dur(st.minutes) });
    else if (!full && nextIdx >= 0) text = t('trainHereKm', { km: kmNum(progress.kmToNext), station: place(stops[nextIdx]) });
    else text = t('trainHere', { speed: run?.speed ?? 0 });
    return full && progress.kmDone > 0 ? `${text} · ${km(progress.kmDone)}` : text;
  };

  return {
    first, last, nextIdx, passedIdx, mineIdx, est, now, ref, run, progress, stops,
    lastIdx: stops.length - 1,
    next: stops[nextIdx], prev: stops[passedIdx], mine: mineIdx >= 0 ? stops[mineIdx] : null,
    totalKm: last?.km ?? 0,
    nextHalt: haltOf(stops[nextIdx]),
    haltOf, schedOf, inTime, exp, both, trainText,
  };
}

/**
 * The map stand-in for the train page (phone and web), shared with StopsScreen. Preview only: it draws
 * nothing without a live run and a next stop, and views never call it (standin: false).
 */
export function trainMapFor(data, layout) {
  const d = derive(data);
  if (!data.run || !d.next || !d.prev) return '';
  const train = { label: `${trainNo(data.train)} · ${t('kmh', { n: data.run.speed })}` };
  const when = d.est(d.nextIdx) != null ? approx(d.est(d.nextIdx), d.ref) : '';
  const join = (...p) => p.filter(Boolean).join(' · ');
  if (layout !== 'web') {
    return trainMap({ layout, train, next: { title: place(d.next), sub: join(when, km(d.progress.kmToNext)) } });
  }
  return trainMap({
    layout, train,
    next: { title: place(d.next), sub: join(when, d.inTime(d.nextIdx), km(d.progress.kmToNext)) },
    ...(d.mine && d.mineIdx > d.nextIdx && d.est(d.mineIdx) != null ? { yourStop: { title: place(d.mine), sub: `${t('yourStop')} · ${approx(d.est(d.mineIdx), d.ref)}` } } : {}),
  });
}

/** The speed chart card (the chart carries its own title, so there is no SectionHeader above it). */
function speedCard(data) {
  const { speed, stops } = data;
  if (!data.run || !speed) return '';
  return Card({
    body: SpeedChart({
      title: t('speedSoFar'),
      stats: !speed.illustrative,
      points: speed.points,
      stops: speed.stops.map(s => ({ ms: s.ms, name: place(stops.find(x => x.id === s.id)) })),
      now: speed.now,
    }),
  });
}

/** The Right now rows: where it started, the stop just passed, the next stop, your stop, a collapsed middle and the last stop. */
function timelineRows(data, d) {
  const { train, run } = data;
  const { stops, lastIdx, passedIdx, nextIdx, mineIdx, progress, ref } = d;
  const stopsHref = `#/train/${train.number}/stops`;
  const join = (...p) => p.filter(Boolean).join(' · ');
  // A stop behind the train: when it passed (recorded, else the timetable), with its day.
  const passedAt = i => data.ests?.[i]?.at ?? d.schedOf(stops[i]);
  const behind = i => (passedAt(i) != null ? { time: { expected: dayTime(passedAt(i), ref) } } : {});
  // A stop ahead: the expected time with its day, and the countdown.
  const ahead = i => {
    const e = d.est(i), s = d.schedOf(stops[i]);
    const expected = e != null ? dayApprox(e, ref) : s != null ? dayTime(s, ref) : null;
    return { ...(expected ? { time: { expected } } : {}), ...(d.inTime(i) ? { countdown: d.inTime(i) } : {}) };
  };
  const planned = i => {
    const e = d.est(i), s = d.schedOf(stops[i]);
    return e != null && s != null && Math.round(e) !== s ? t('plannedAt', { time: time(s, ref) }) : '';
  };
  const moving = run.speed > 0 && !['stopAt', 'stopBetween', 'wait', 'done', 'lost'].includes(run.status?.kind);
  const away = moving ? t('kmAwayNow', { km: kmNum(progress.kmToNext), speed: run.speed }) : t('kmAway', { km: kmNum(progress.kmToNext) });
  const rows = [];

  if (run.status?.kind === 'done' || passedIdx >= lastIdx) {
    rows.push({ kind: 'passed', label: t('startedFrom'), name: place(d.first), ...behind(0) });
    rows.push({ kind: 'final', label: t('lastStop'), name: place(d.last), ...behind(lastIdx) });
    return rows;
  }
  if (passedIdx >= 0) rows.push({ kind: 'passed', label: t('startedFrom'), name: place(d.first), ...behind(0) });
  else rows.push({ kind: 'next', label: t('startsFrom'), name: place(d.first), ...ahead(0) });
  let tail = 0; // the furthest stop shown so far
  if (passedIdx > 0) {
    rows.push({ kind: 'passed', label: t('lastPassed'), name: place(d.prev), ...behind(passedIdx) });
    tail = passedIdx;
  }
  if (nextIdx > 0 && nextIdx < lastIdx) {
    const mineNext = nextIdx === mineIdx;
    rows.push({
      kind: mineNext ? 'yourstop' : 'next', label: t(mineNext ? 'yourStop' : 'nextStop'), name: place(d.next),
      sub: join(away, d.nextHalt ? t('halt', { d: dur(d.nextHalt) }) : ''),
      ...ahead(nextIdx), ...(mineNext ? { change: true } : {}),
    });
    tail = nextIdx;
  }
  if (mineIdx > tail && mineIdx < lastIdx) {
    rows.push({ kind: 'yourstop', label: t('yourStop'), name: place(d.mine), ...ahead(mineIdx), change: true });
    tail = mineIdx;
  }
  const more = lastIdx - tail - 1;
  if (more > 0) rows.push({ kind: 'more', name: t('moreStops', { n: more }), href: stopsHref });
  const mineLast = mineIdx === lastIdx;
  rows.push({
    kind: mineLast ? 'yourstop' : 'final',
    label: mineLast ? `${t('yourStop')} · ${t('lastStop')}` : t('lastStop'),
    name: place(d.last),
    sub: join(nextIdx === lastIdx ? away : '', planned(lastIdx)),
    ...ahead(lastIdx), ...(mineLast ? { change: true } : {}),
  });
  return rows;
}

/** The status strip's running text, from what the train is doing. */
function runningText(run, d) {
  const st = run.status;
  if (st?.kind === 'stopAt') return t('stStoppedAt', { station: place(st.station) });
  if (st?.kind === 'stopBetween') return t('stStoppedBetween');
  if (st?.kind === 'wait') return t('stNotDeparted');
  if (st?.kind === 'done') return t('stArrived', { station: place(st.station ?? d.last) });
  if (st?.kind === 'lost') return t('stLost', { d: dur(st.minutes) });
  return t('stRunningShort', { speed: run.speed });
}

/** Your stop, when there is none to show in the timeline: a prompt to choose one, or a line that you passed it. */
function yourStopPrompt(data, d) {
  const { train, run } = data;
  const pickHref = `#/train/${train.number}/stops?pick=1${data.runId ? `&run=${encodeURIComponent(data.runId)}` : ''}`;
  if (!d.mine) {
    return stack(
      Button({ label: t('chooseStop'), href: pickHref, variant: 'secondary', full: true }),
      note(t('promptStopSub')),
    );
  }
  // Passed your stop (a stop ahead is already a row of the timeline).
  if (run && d.mineIdx <= d.passedIdx) {
    const at = data.ests?.[d.mineIdx]?.at ?? (d.schedOf(d.mine) != null ? d.schedOf(d.mine) + run.late : null);
    return row(
      fill(note(at != null ? t('passedYourStop', { time: time(at, d.ref) }) : `${t('yourStop')} · ${place(d.mine)}`)),
      Button({ label: t('change'), href: pickHref, variant: 'link' }),
    );
  }
  return '';
}

/** Right now: status, the stops around the train, progress and the link to all stops. */
function rightNow(data, d) {
  const { train, run, now } = data;
  const { first } = d;
  const stopsHref = `#/train/${train.number}/stops`;
  const seeAll = Button({ label: t('seeAllStopsN', { n: d.stops.length }), href: stopsHref, variant: 'primary', icon: 'chevronEnd', full: true });

  if (!run) {
    // Timetable mode: no live run, so no position, estimates or progress.
    const gps = data.gps !== false;
    const mineRow = d.mine
      ? StopTimeline({ mode: 'card', rows: [{ kind: 'yourstop', label: t('yourStop'), name: place(d.mine), time: d.exp(d.mineIdx), change: true }] })
      : '';
    return Card({
      tone: 'key', header: t('rightNow'),
      body: stack(
        row(StatusChip(delayStatus(null, { gps }))),
        note(t(gps ? 'noLiveRun' : 'noGpsTrain')),
        mineRow,
        d.mine ? note(t('timetableTimes')) : yourStopPrompt(data, d),
        seeAll,
      ),
    });
  }

  const ago = now - run.updatedAt;
  const done = run.status?.kind === 'done';
  return Card({
    tone: 'key', header: t('rightNow'),
    body: stack(
      StatusStrip({
        running: { text: runningText(run, d) },
        delay: { tone: statusTone(run.late), text: delayText(run.late) },
        updated: t('updated', { ago: ago < 1 ? t('justNow') : t('ago', { d: dur(ago) }) }),
      }),
      StopTimeline({ mode: 'card', rows: timelineRows(data, d) }),
      JourneyProgress({
        fraction: d.totalKm > 0 ? Math.min(1, Math.max(0, d.progress.kmDone / d.totalKm)) : 0,
        start: '',
        end: t('kmOf', { done: kmNum(done ? d.totalKm : d.progress.kmDone), total: kmNum(d.totalKm) }),
        train: true,
        moving: run.speed > 0 && !['stopAt', 'stopBetween', 'wait', 'done', 'lost'].includes(run.status?.kind),
      }),
      yourStopPrompt(data, d),
      seeAll,
    ),
  });
}

/** About this train, then the return train link, 12px apart. */
function about(data, d) {
  const { train, run, details, returnTrain } = data;
  const scheduled = d.last.arr != null && d.first.dep != null ? dur(d.last.arr - d.first.dep) : '';
  const items = [
    { label: t('detailNumber'), value: trainNo(train) },
    { label: t('detailUrduName'), value: train.nameUr, lang: 'ur' },
    { label: t('detailDirection'), value: t('directionTo', { dir: t(train.up ? 'upDir' : 'down'), x: cityOf(d.last) }) },
    ...(details?.locomotive ? [{ label: t('detailLocomotive'), value: details.locomotive }] : []),
    { label: t('detailDistance'), value: d.totalKm ? km(d.totalKm) : '' },
    { label: t('detailScheduledTime'), value: scheduled },
    ...(run ? [{ label: t('detailThisRun'), value: t('leftOn', { date: dateLabel(run.date) }) }] : []),
    { label: t('liveTracking'), value: (run ? run.gps : data.gps !== false) ? t('gps') : t('timetable') },
  ].filter(i => i.value);
  return cards(
    Card({ header: t('aboutTrain'), body: data.photo ? stack(Photo(data.photo), DetailGrid({ items })) : DetailGrid({ items }) }),
    returnTrain ? LinkRow({ href: `#/train/${returnTrain.number}`, eyebrow: t('returnShort'), label: `${trainNo(returnTrain)} ${trainTitle(returnTrain)}` }) : '',
  );
}

/** The PageHeader of the Train page. */
function header(data, d) {
  const { train } = data;
  return PageHeader({
    leading: { badge: badgeOf(train, 'md') },
    title: train.name, titleUr: train.nameUr,
    ...(d.first && d.last ? { subtitle: route(d.first, d.last) } : {}),
    actions: [{ kind: 'follow', followed: data.followed, name: trainTitle(train) }, { kind: 'share', label: t('share') }],
  });
}

/** Which run, when more than one is worth showing, and the note about suspect runs that are hidden. */
function runChoice(data) {
  const { train, runs, runId, hiddenRuns } = data;
  const parts = [];
  if (runs && runs.length > 1) {
    parts.push(SegmentedControl({
      label: t('whichRun'), value: runId,
      options: runs.map(r => ({ value: r.id, label: t('leftOn', { date: dateLabel(r.date) }), href: `#/train/${train.number}?run=${encodeURIComponent(r.id)}` })),
    }));
  }
  if (hiddenRuns?.count) {
    parts.push(row(
      fill(note(t('hiddenRuns', { n: hiddenRuns.count }))),
      Button({ label: t('showAnyway'), href: hiddenRuns.href, variant: 'link' }),
    ));
  }
  return parts.length ? cards(...parts) : '';
}

/**
 * @param {TrainScreenData} data
 * @param {import('./_layout.js').ScreenOptions} [options]
 * @returns {string}
 */
export function TrainScreen(data, options = {}) {
  const web = options.layout === 'web';
  const d = derive(data);
  const label = trainTitle(data.train);
  const following = MapToggle({ on: data.following !== false, label: t('following') });
  const wholeRoute = mapButton('wholeRoute');
  const map = options.standin === false ? '' : trainMapFor(data, web ? 'web' : 'phone');
  const status = data.notice != null ? notice(data.notice) : '';
  // Without the route there is nothing to show but the header and a loading note.
  const content = d.first
    ? [header(data, d), status, runChoice(data), rightNow(data, d)]
    : [header(data, d), status, note(t('loading'))];

  if (!web) {
    return frame({
      name: 'train', options, label, snap: 'half',
      map,
      start: backButton('#/', 'float'),
      end: following + wholeRoute,
      body: body(...content, d.first ? speedCard(data) : '', d.first ? about(data, d) : ''),
    });
  }
  return frame({
    name: 'train', options, label,
    map,
    end: following + wholeRoute + mapButton('zoomIn') + mapButton('zoomOut'),
    dock: d.first ? speedCard(data) : '',
    body: AppBar({ live: data.live, lang: getLang(), back: { href: '#/', label: t('home') } })
      + body(...content, d.first ? about(data, d) : ''),
  });
}
