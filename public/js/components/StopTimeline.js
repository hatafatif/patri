// StopTimeline: the stops timeline, compact on the Right now card and full on the All stops page.
import { esc, bdi, cx } from './_shared.js';
import { t } from '../i18n.js';
import { Button } from './Button.js';

/**
 * The stops timeline: a rail down the start edge with one marker per row, the stop name, and the times at the end edge. The Right now card uses the compact form, the All stops page the full form.
 * @typedef {object} StopTimelineProps
 * @property {{ kind: 'passed' | 'train' | 'next' | 'yourstop' | 'stop' | 'more' | 'final', name: string, sub?: string, time?: { expected: string, scheduled?: string }, countdown?: string, href?: string, change?: boolean }[]} rows - One entry per row, top to bottom. name is already localised: for a train row it is the whole sentence ("Train here · 27 km to Multan Cantt"), for a more row the collapsed text ("8 more stops", href required). sub shows in full mode only. time.scheduled is struck through under the expected time. countdown is a short phrase such as "in 20 min". href turns the name into a link. change adds a Change link; wire it with bindStopTimeline().
 * @property {'compact' | 'full'} [mode='full'] - compact hides sub and uses tighter padding; full shows everything.
 * @property {boolean} [legend=false] - Adds an "expected · scheduled" key above the rows, at the end edge over the time column. Decorative (aria-hidden); the struck time already has a hidden "Scheduled" prefix.
 */
export function StopTimeline({ rows = [], mode = 'full', legend = false } = {}) {
  const full = mode !== 'compact';
  const items = rows.map(row => {
    const { kind = 'stop', name, sub, time, countdown, href, change } = row;
    const label = kind === 'more' ? esc(name) : bdi(name);
    const nameEl = href
      ? `<a class="p-stoptimeline__name" href="${esc(href)}">${label}</a>`
      : `<span class="p-stoptimeline__name">${label}</span>`;
    const subEl = full && sub ? `<span class="p-stoptimeline__sub">${bdi(sub)}</span>` : '';
    const changeEl = change ? Button({ label: t('change'), variant: 'link', className: 'p-stoptimeline__change' }) : '';
    const timeEl = time || countdown
      ? `<div class="p-stoptimeline__time">${time?.expected ? `<span class="p-stoptimeline__expected">${bdi(time.expected)}</span>` : ''}${time?.scheduled ? `<s class="p-stoptimeline__scheduled"><span class="p-sr">${esc(t('scheduled'))} </span>${bdi(time.scheduled)}</s>` : ''}${countdown ? `<span class="p-stoptimeline__countdown">${bdi(countdown)}</span>` : ''}</div>`
      : '';
    const here = kind === 'train' ? ' aria-current="location"' : '';
    return `<li class="p-stoptimeline__row p-stoptimeline__row--${esc(kind)}"${here}><span class="p-stoptimeline__rail" aria-hidden="true"><span class="p-stoptimeline__dot"></span></span><div class="p-stoptimeline__main">${nameEl}${subEl}${changeEl}</div>${timeEl}</li>`;
  });
  const key = legend
    ? `<li class="p-stoptimeline__legend" aria-hidden="true"><span class="p-stoptimeline__legend-expected">${esc(t('legendExpected'))}</span> · <s class="p-stoptimeline__legend-scheduled">${esc(t('legendScheduled'))}</s></li>`
    : '';
  return `<ol class="${cx('p-stoptimeline', `p-stoptimeline--${full ? 'full' : 'compact'}`)}">${key}${items.join('')}</ol>`;
}

/**
 * @typedef {object} StopTimelineHandlers
 * @property {() => void} [onChangeStop] - Called when the Change link on the your-stop row is clicked.
 */
export function bindStopTimeline(root, handlers = {}) {
  const onClick = e => {
    const btn = e.target.closest?.('.p-stoptimeline__change');
    if (!btn || !root.contains(btn)) return;
    handlers.onChangeStop?.();
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
