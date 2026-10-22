// ReplayScreen: the Train page's journey replay, a time-lapse of recorded runs on the map.
import { t, getLang } from '../i18n.js';
import { AppBar, PageHeader, Card, SegmentedControl, ReplayBar } from '../components/index.js';
import { frame, body, stack, note } from './_layout.js';
import { trainTitle, trainNo } from './_format.js';
import { trainMapFor } from './TrainScreen.js';

/**
 * Train page › Journey replay: the map plays the train's recorded journeys, and its return train's, while the
 * Panel (half height on the phone) holds the PageHeader and one Card: the period switch (SegmentedControl of
 * links), then the ReplayBar with how far back the recordings go and a hint. While loading, or when nothing was
 * recorded or the request failed, the card shows a note instead of the bar.
 * Takes the same data as TrainScreen, plus `replay`.
 * @typedef {object} ReplayData
 * @property {'loading' | 'ready' | 'empty' | 'failed'} state
 * @property {7 | 30 | 90} days - The period shown.
 * @property {{ value: string, label: string, href: string }[]} periods - The SegmentedControl's options ("7 days", ...), each a link to #/train/N/replay?days=n.
 * @property {import('../components/ReplayBar.js').ReplayBarProps} [bar] - Needed when state is 'ready'.
 * @property {string} [since] - Already localised, e.g. "Recorded since Tue 21 Oct". Needed when state is 'ready'.
 * @property {string} [returnName] - The return train, e.g. "8 DN Tezgam". Shown in the subtitle when given.
 */
/**
 * @param {import('./TrainScreen.js').TrainScreenData & { replay: ReplayData }} data
 * @param {import('./_layout.js').ScreenOptions} [options]
 * @returns {string}
 */
export function ReplayScreen(data, options = {}) {
  const web = options.layout === 'web';
  const { train, replay: r } = data;
  const title = t('replayTitle');
  const header = PageHeader({
    title,
    subtitle: `${trainNo(train)} ${trainTitle(train)}${r.returnName ? ` · ${t('replayWith', { name: r.returnName })}` : ''}`,
  });
  const inside = r.state === 'ready' ? [ReplayBar(r.bar), note(r.since), note(t('replayHint'))]
    : [note(t(r.state === 'loading' ? 'loading' : r.state === 'failed' ? 'replayFailed' : 'replayEmpty'))];
  const content = body(
    header,
    Card({
      body: stack(
        SegmentedControl({ label: t('replayPeriod'), value: String(r.days), options: r.periods }),
        ...inside,
      ),
    }),
  );
  const map = options.standin === false ? '' : trainMapFor(data, web ? 'web' : 'phone');
  const backHref = `#/train/${train.number}`;
  if (!web) {
    return frame({ name: 'replay', options, snap: 'half', label: title, map, body: content, back: { href: backHref, label: t('back') } });
  }
  return frame({
    name: 'replay', options, snap: 'half', label: title, map,
    body: AppBar({ live: data.live, lang: getLang(), back: { href: backHref, label: trainTitle(train) } }) + content,
  });
}
