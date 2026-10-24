// AlertsScreen: the Train page's Alerts page, where a rider chooses which push alerts they want for one run.
import { t } from '../i18n.js';
import { frame, body, note } from './_layout.js';

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
  // Stub: the builder replaces this with the layout above.
  return frame({ name: 'alerts', options, snap: 'full', label: t('alertsHeader'), body: body(note(t('loading'))) });
}
