// AlertsScreen: the Train page's Alerts page, where a rider chooses which push alerts they want for one run.
import { t, dur } from '../i18n.js';
import { PageHeader, StatusChip, LinkRow, ToggleRow, SegmentedControl, SectionHeader, Button } from '../components/index.js';
import { frame, body, row, note, notice, section, list, stack, navBar } from './_layout.js';
import { place, trainTitle, trainNo, route, dayApprox, delayStatus } from './_format.js';
import { derive, trainMapFor } from './TrainScreen.js';

/**
 * Train page › Alerts (#/train/<n>/alerts?stop=<id>&run=<id>). The Panel at full height:
 * - PageHeader ("Alerts", "28 DN Shalimar Express · Lahore Jn → Karachi Cantt") and the delay StatusChip, as on All stops;
 * - notice(alertsPage.notice);
 * - a LinkRow "Your station" with the station (or "Whole journey, no stop"), linking to the station picker;
 * - with a station: SectionHeader "At {station}" and a ToggleRow per choice of kind before, reach and leave. While before
 *   is on, its extra is the minutes SegmentedControl (15 min · 30 min · 1 h; local buttons, class p-alerts-minutes);
 * - SectionHeader "Whole journey" and a ToggleRow per choice of kind start, delay and end;
 * - Button primary, full: "Turn on alerts" (state off) or "Save changes" (state on), class p-alerts-save; with state on,
 *   a link Button "Turn off alerts", class p-alerts-off; then note "Alerts end with this journey."
 * blocked, unsupported and nolive show the header and their note (as on the Train page's Alerts card) and nothing else.
 * Each ToggleRow's name is the choice's kind. Takes the same data as TrainScreen, plus `alertsPage`.
 *
 * @typedef {object} AlertChoice
 * @property {'before' | 'reach' | 'leave' | 'start' | 'delay' | 'end'} kind - before, reach and leave are about the rider's
 *   station; start (leaving the first station), delay and end (reaching the last station) are about the whole journey.
 * @property {boolean} on
 * @property {number} [at] - Minutes on the TrainScreenData clock (data.now), shown with its day: under before, the expected
 *   time there ("Expected ~4:05 PM"); under leave, when it is due to leave ("Due to leave ~4:15 PM"); under end, the expected
 *   time at the last station. Left out when unknown, and unused by the other kinds.
 *
 * @typedef {object} AlertsPageData
 * @property {'off' | 'on' | 'blocked' | 'unsupported' | 'nolive'} state - off: alerts aren't on for this train yet. on: they
 *   are, and the page edits them. The others say why alerts can't be set.
 * @property {import('./_format.js').ScreenStation | null} stop - The rider's station, or null for the whole journey only.
 * @property {import('./_format.js').ScreenStation} first - The train's first station (named by start).
 * @property {import('./_format.js').ScreenStation} last - Its last station (named by end).
 * @property {string} pickHref - The station picker, for the "Your station" row.
 * @property {string} backHref - Where Back goes without history: the Train page for this run.
 * @property {AlertChoice[]} choices - The choices on offer, in this order: before, reach, leave, start, delay, end. The view
 *   leaves out what can't happen (leave at the last station, end when the rider's station is the last one, start once the
 *   train has left).
 * @property {15 | 30 | 60} minutes - How long before, for before.
 * @property {number | null} late - The delay now in minutes, for the delay row's sub line ("Now 25 min late").
 * @property {string} [notice] - Short feedback, already localised, such as "Choose at least one alert."
 */
/**
 * @param {import('./TrainScreen.js').TrainScreenData & { alertsPage: AlertsPageData }} data
 * @param {import('./_layout.js').ScreenOptions} [options]
 * @returns {string}
 */
export function AlertsScreen(data, options = {}) {
  const web = options.layout === 'web';
  const d = derive(data);
  const { train, run } = data;
  const a = data.alertsPage;
  const title = t('alertsHeader');
  const header = PageHeader({
    title,
    subtitle: d.first ? `${trainNo(train)} ${trainTitle(train)} · ${route(d.first, d.last)}` : `${trainNo(train)} ${trainTitle(train)}`,
  });
  const status = row(StatusChip(delayStatus(run ? run.late : null, { gps: run ? run.gps : data.gps !== false })));
  const expected = c => (c.at != null ? t('alertExpected', { time: dayApprox(c.at, d.ref) }) : undefined);
  const lateSub = a.late == null ? undefined
    : a.late >= 1 ? t('alertNowLate', { d: dur(a.late) })
    : a.late <= -1 ? t('alertNowEarly', { d: dur(-a.late) })
    : t('alertNowOnTime');
  const minutes = SegmentedControl({
    label: t('alertMinutes'), value: String(a.minutes),
    options: [15, 30, 60].map(n => ({ value: String(n), label: dur(n) })),
    className: 'p-alerts-minutes',
  });
  const toggle = c => {
    const base = { name: c.kind, checked: c.on };
    switch (c.kind) {
      case 'before': return ToggleRow({ ...base, label: t('alertBefore'), sub: expected(c), extra: minutes });
      case 'reach': return ToggleRow({ ...base, label: t('alertReach') });
      case 'leave': return ToggleRow({ ...base, label: t('alertLeave'), sub: c.at != null ? t('alertDueLeave', { time: dayApprox(c.at, d.ref) }) : undefined });
      case 'start': return ToggleRow({ ...base, label: t('alertStart', { station: place(a.first) }) });
      case 'delay': return ToggleRow({ ...base, label: t('alertDelay'), sub: lateSub });
      case 'end': return ToggleRow({ ...base, label: t('alertEnd', { station: place(a.last) }), sub: expected(c) });
      default: return '';
    }
  };
  const rowsOf = kinds => a.choices.filter(c => kinds.includes(c.kind)).map(toggle);
  const atStop = a.stop ? rowsOf(['before', 'reach', 'leave']) : [];
  const whole = rowsOf(['start', 'delay', 'end']);

  let parts;
  if (a.state === 'off' || a.state === 'on') {
    parts = [
      a.notice != null ? notice(a.notice) : '',
      LinkRow({ href: a.pickHref, eyebrow: t('alertsYourStation'), label: a.stop ? place(a.stop) : t('alertsSkipStop') }),
      atStop.length ? section(SectionHeader({ label: t('alertsAt', { station: place(a.stop) }) }), list(...atStop)) : '',
      whole.length ? section(SectionHeader({ label: t('alertsWholeJourney') }), list(...whole)) : '',
      stack(
        Button({ label: t(a.state === 'on' ? 'alertsSave' : 'alertsTurnOn'), variant: 'primary', full: true, className: 'p-alerts-save' }),
        a.state === 'on' ? Button({ label: t('alertsTurnOff'), variant: 'link', className: 'p-alerts-off' }) : '',
        note(t('alertsEndNote')),
      ),
    ];
  } else {
    const key = { blocked: 'alertsBlocked', unsupported: 'alertsUnsupported', nolive: 'alertsNoLive' }[a.state];
    parts = [key ? note(t(key)) : ''];
  }
  const content = body(header, status, ...parts);
  const map = options.standin === false ? '' : trainMapFor(data, web ? 'web' : 'phone');
  if (!web) {
    return frame({ name: 'alerts', options, snap: 'full', label: title, map, body: content, back: { href: a.backHref, label: t('back') } });
  }
  return frame({ name: 'alerts', options, snap: 'full', label: title, map, body: navBar(data.live, a.backHref) + content });
}
