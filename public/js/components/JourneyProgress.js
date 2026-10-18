// JourneyProgress: a thin bar showing how far along the route the train is.
import { bdi, esc, cx } from './_shared.js';
import { t } from '../i18n.js';

/**
 * How far along the route the train is: a progress bar with a start label and an end label below it.
 * @typedef {object} JourneyProgressProps
 * @property {number} fraction - 0 to 1; values outside are clamped.
 * @property {string} start - Already localised, such as "Left Lahore Jn 7:10 AM".
 * @property {string} end - Already localised, such as "305 of 1,165 km". Also the progressbar's aria-valuetext.
 * @property {string} [className] - Extra classes, so a composing component can hook its own styles.
 */
export function JourneyProgress({ fraction = 0, start = '', end = '', className } = {}) {
  const f = Math.min(1, Math.max(0, Number(fraction) || 0));
  const pct = Math.round(f * 100);
  return `<div class="${cx('p-journeyprogress', className)}"><div class="p-journeyprogress__track" role="progressbar" aria-label="${esc(t('journeyProgress'))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-valuetext="${esc(end)}"><span class="p-journeyprogress__fill" style="--p:${+(f * 100).toFixed(2)}%"></span></div><div class="p-journeyprogress__labels"><span class="p-journeyprogress__start">${bdi(start)}</span><span class="p-journeyprogress__end">${bdi(end)}</span></div></div>`;
}
