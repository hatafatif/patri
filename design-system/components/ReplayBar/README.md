# ReplayBar

The playback control for the journey replay: a play/pause button, a scrubber with one tick per day, and the time of the moment on the map.

## When to use
- Under the map's replay in the Train page's Journey replay, inside a Card in the panel.

## When not to use
- For audio or video, or for choosing a value that isn't a time.
- For choosing the replay's period (7, 30 or 90 days). That is a SegmentedControl.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `playing` | `boolean` | `false` | Shows the pause icon when true, the play icon when false. |
| `at` | `number` | none | The replay's current time, epoch ms. |
| `from` | `number` | none | Start of the replay, epoch ms. |
| `to` | `number` | none | End of the replay, epoch ms. |
| `days` | `{ start: number, recorded: boolean }[]` | `[]` | One tick per day: the day's start (epoch ms) and whether anything was recorded. A day before `from` is clamped to the start; a day after `to` is skipped. |
| `time` | `string` | `''` | Already localised readout of `at`, such as "Tue 14 Oct · 3:40 PM". |
| `speed` | `string` | `''` | Already localised, such as "92 km/h", or a short phrase such as "Between journeys". |
| `label` | `string` | `''` | Already localised aria-label for the range, such as "Replay time". |
| `disabled` | `boolean` | `false` | Disables the button and the range, and greys them. |
| `className` | `string` | none | Extra classes, so a composing component can hook its own styles. |

## Behaviour
- The range counts whole minutes from `from` to `to`, one step each.
- `bindReplayBar(root, { onToggle, onScrub })` is delegated. The button calls `onToggle()`. Moving the range calls `onScrub(at)` with the epoch ms of the chosen time. It returns `unbind()`.
- `syncReplayBar(root, { at, time, speed, playing })` updates the bar in place and only touches what changed, so it is safe to call every frame while playing. Pass the bar or an element that contains it; it does nothing if there is no bar.
- Ticks are solid for recorded days and faint for unrecorded ones, lined up with the thumb's travel.

## Urdu and right-to-left
The time uses `urdu-strong` and the speed `urdu-caption` when the page language is Urdu. Both are wrapped in `<bdi>`, so times and numbers stay left to right. The range runs from the right under `dir="rtl"`, and the ticks mirror with it. The play and pause icons do not mirror.

## Accessibility
- A real `<button>` whose aria-label is "Play" or "Pause", and a native range input with `label` as its aria-label and `time` as its aria-valuetext. Arrow keys move it by a minute.
- The button is 44px and the range is 44px tall. Both show the 3px focus ring.
- Disabled controls are greyed with the `line` and `ink-muted` tokens.

## Example
```js
Patri.ReplayBar({
  playing: false, at: Date.now() - 86400e3, from: Date.now() - 7 * 86400e3, to: Date.now(),
  days: [{ start: Date.now() - 7 * 86400e3, recorded: true }],
  time: 'Tue 14 Oct · 3:40 PM', speed: '92 km/h', label: 'Replay time',
});
```
The app imports it from `/js/components/index.js`.
