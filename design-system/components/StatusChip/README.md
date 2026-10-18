# StatusChip and StatusStrip

StatusChip is a small coloured label for a train's status; StatusStrip is the Sabz signature that joins the running state to the delay in one framed strip.

Status is shown, never used as a control: do not sort or filter trains by it.

## When to use
- StatusChip: in cards and rows, and for muted notes such as "Updated 1 min ago" (`neutral`).
- StatusStrip: on the train page, to show "Running · 105 km/h" next to "30 min late".
- Get the tone from `statusTone(lateMin, { gps })` in `_shared.js`: `nogps` when there is no GPS, `early` at 1 min early or more, `ontime` up to 15 min late, `late` above that.

## When not to use
- As a button or filter chip.
- StatusStrip for a train with no GPS. Use a `nogps` StatusChip instead.

## Props
StatusChip:

| Prop | Type | Default | Description |
|---|---|---|---|
| `tone` | `'ontime' \| 'late' \| 'early' \| 'nogps' \| 'neutral'` | `'neutral'` | Picks the colours from `--status-<tone>-bg` and `-fg`. `neutral` is plain `ink-muted` text, with no background or padding. |
| `text` | `string` | | Already localised, such as "30 min late". |
| `dot` | `boolean` | `false` | Adds a small dot in the text colour before the text. |

StatusStrip:

| Prop | Type | Default | Description |
|---|---|---|---|
| `running` | `{ text: string }` | | The pale-green running panel, with a `sabz-700` dot. |
| `delay` | `{ tone: 'ontime' \| 'late' \| 'early' \| 'nogps', text: string }` | | The delay block, coloured by tone. |
| `updated` | `string` | | Muted note after the strip, such as "Updated 1 min ago". It wraps below the strip on narrow screens. |

## Behaviour
None. Both are static.

## Urdu and right-to-left
All text switches to the Urdu label style, with no capitals or letter-spacing. The strip mirrors: the running panel is at the start and the delay block at the end.

## Accessibility
- Colours meet the contrast values noted on the tokens (at least 5:1).
- The tone is also spelled out in the text, so colour is never the only signal.
- The dots are decorative and hidden from screen readers.

## Example
```js
Patri.StatusChip({ tone: 'late', text: '30 min late' });
Patri.StatusStrip({
  running: { text: 'Running · 105 km/h' },
  delay: { tone: 'late', text: '30 min late' },
  updated: 'Updated 1 min ago',
});
```
The app imports them from `/js/components/index.js`.
