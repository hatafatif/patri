// ReplayBar: the playback control for the journey replay: play or pause, a day-tick scrubber and the time.
import { esc, bdi, icon as icons, cx } from './_shared.js';
import { t } from '../i18n.js';

const MIN = 60000;

/**
 * The playback control for a time-lapse of recorded journeys: a play/pause button, a scrubber with one tick per day, and the time with the speed.
 * @typedef {object} ReplayBarProps
 * @property {boolean} playing
 * @property {number} at - The replay's current time, epoch ms.
 * @property {number} from - Start of the replay, epoch ms.
 * @property {number} to - End of the replay, epoch ms.
 * @property {{ start: number, recorded: boolean }[]} [days] - One tick per day: the day's start (epoch ms) and whether anything was recorded that day.
 * @property {string} time - Already localised readout of `at`, e.g. "Tue 14 Oct · 3:40 PM".
 * @property {string} [speed] - Already localised, e.g. "92 km/h", or a short phrase such as "Between journeys".
 * @property {string} label - Already localised aria-label for the range, e.g. "Replay time".
 * @property {boolean} [disabled=false]
 * @property {string} [className] - Extra classes, so a composing component can hook its own styles.
 */
export function ReplayBar({ playing = false, at, from, to, days = [], time = '', speed = '', label = '', disabled = false, className } = {}) {
  const span = to - from;
  const max = Math.max(0, Math.round(span / MIN));
  const value = Math.min(max, Math.max(0, Math.round((at - from) / MIN)));
  const off = disabled ? ' disabled' : '';
  // A day that starts before `from` (the first day) is clamped to the start; days after `to` are skipped.
  const ticks = span > 0 ? days.filter(d => d.start <= to).map(d => {
    const f = Math.min(1, Math.max(0, (d.start - from) / span));
    return `<span class="${cx('p-replaybar__tick', !d.recorded && 'p-replaybar__tick--empty')}" style="--f:${+f.toFixed(5)}"></span>`;
  }).join('') : '';
  const name = playing ? t('pause') : t('play');
  return `<div class="${cx('p-replaybar', className)}" data-from="${esc(from)}" data-to="${esc(to)}">`
    + `<button type="button" class="p-replaybar__play" data-state="${playing ? 'playing' : 'paused'}" aria-label="${esc(name)}"${off}>${playing ? icons.pause : icons.play}</button>`
    + `<div class="p-replaybar__main">`
    + `<div class="p-replaybar__ticks" aria-hidden="true">${ticks}</div>`
    + `<input type="range" class="p-replaybar__range" min="0" max="${max}" step="1" value="${value}" aria-label="${esc(label)}" aria-valuetext="${esc(time)}"${off}>`
    + `<div class="p-replaybar__readout"><span class="p-replaybar__time">${time ? bdi(time) : ''}</span><span class="p-replaybar__speed">${speed ? bdi(speed) : ''}</span></div>`
    + `</div></div>`;
}

/**
 * Handlers for bindReplayBar.
 * @typedef {object} ReplayBarHandlers
 * @property {() => void} [onToggle] - The play/pause button was pressed.
 * @property {(at: number) => void} [onScrub] - The range moved; called with the chosen replay time, epoch ms.
 */
/**
 * Makes the bar work: the button calls onToggle, the range calls onScrub. Returns unbind().
 * @param {Element} root - The element the HTML was rendered into, or the bar itself.
 * @param {ReplayBarHandlers} [handlers]
 * @returns {() => void}
 */
export function bindReplayBar(root, { onToggle, onScrub } = {}) {
  const onClick = e => {
    const btn = e.target.closest?.('.p-replaybar__play');
    if (!btn || !root.contains(btn) || btn.disabled) return;
    onToggle?.();
  };
  const onInput = e => {
    const range = e.target.closest?.('.p-replaybar__range');
    if (!range || !root.contains(range)) return;
    const from = Number(range.closest('.p-replaybar').dataset.from);
    onScrub?.(from + Number(range.value) * MIN);
  };
  root.addEventListener('click', onClick);
  root.addEventListener('input', onInput);
  return () => {
    root.removeEventListener('click', onClick);
    root.removeEventListener('input', onInput);
  };
}

// Sets an element's text (inside a <bdi>) only when it changed.
function setText(el, text) {
  if (!el || el.textContent === text) return;
  el.innerHTML = text ? bdi(text) : '';
}

/**
 * Updates the bar in place, without re-rendering, and only touches what changed (it is called every frame while playing). Does nothing when there is no bar.
 * @param {Element} root - The bar itself, or an element that contains it.
 * @param {{ at: number, time: string, speed?: string, playing: boolean }} state
 * @returns {void}
 */
export function syncReplayBar(root, { at, time = '', speed = '', playing = false } = {}) {
  const bar = root?.matches?.('.p-replaybar') ? root : root?.querySelector?.('.p-replaybar');
  if (!bar) return;
  const range = bar.querySelector('.p-replaybar__range');
  if (range) {
    const value = String(Math.min(Number(range.max), Math.max(0, Math.round((at - Number(bar.dataset.from)) / MIN))));
    if (range.value !== value) range.value = value;
    if (range.getAttribute('aria-valuetext') !== time) range.setAttribute('aria-valuetext', time);
  }
  setText(bar.querySelector('.p-replaybar__time'), time);
  setText(bar.querySelector('.p-replaybar__speed'), speed ?? '');
  const btn = bar.querySelector('.p-replaybar__play');
  const state = playing ? 'playing' : 'paused';
  if (btn && btn.dataset.state !== state) {
    btn.dataset.state = state;
    btn.innerHTML = playing ? icons.pause : icons.play;
    btn.setAttribute('aria-label', playing ? t('pause') : t('play'));
  }
}
