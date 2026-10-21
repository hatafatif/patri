# StopTimeline

The stops timeline: a rail down the start edge with one marker per row, the stop name, and the expected, scheduled and countdown times at the end edge.

## When to use
- Card mode on the Train page's Right now card: a label over each name, heading-size names and sub lines shown.
- Compact mode for a tight list of stops without sub lines.
- Full mode on the All stops page, to show every stop with its sub line.

## When not to use
- For a list of trains or departures; use TrainRow or DepartureRow.
- To show how far along the whole route the train is; use JourneyProgress.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `rows` | `{ kind, name, label?, sub?, time?, countdown?, href?, change? }[]` | `[]` | One entry per row, top to bottom. `time` is `{ expected, scheduled? }`. All text is already localised. |
| `mode` | `'compact' \| 'full' \| 'card'` | `'full'` | Compact hides `sub` and uses tighter padding. Full shows everything. Card is the Right now form: a label over each name, heading-size names, sub lines shown, rows at least 64px. |
| `legend` | `boolean` | `false` | Adds an "expected · scheduled" key above the rows, at the end edge over the time column: "expected" in the expected-time look, then "scheduled" struck through in `ink-muted`. Used on All stops. |

Row kinds:
- `passed`: `ink-passed` text and a filled `ink-passed` dot.
- `train`: the name is the whole sentence ("Train here · 27 km to Multan Cantt"), in label style and `sabz-700`, with the yellow train dot.
- `next`: a `zard-100` row with a ring dot.
- `yourstop`: an inverted `sabz-900` row; the time and the Change link are `zard-500`.
- `stop`: a plain upcoming stop with a hollow dot.
- `more`: a collapsed link such as "8 more stops". `href` is required. Its rail is dotted.
- `final`: a square end marker.

A row's `label` is a short, already-localised line above the name, such as "Next stop" (card mode). It shows whenever it is given, in muted uppercase label style (`ink-passed` on passed rows, `ink-on-dark-muted` on your-stop rows, `urdu-caption` in Urdu).

A row with `href` makes its name a link; the link covers the whole row. `change: true` adds a Change link button (from Button) and is meant for the `yourstop` row.

## Behaviour
`bindStopTimeline(root, { onChangeStop })` delegates clicks on the Change link and calls `onChangeStop()`. It returns `unbind()`.

## Urdu and right-to-left
The rail sits at the inline-start edge, so it moves to the right in right-to-left. The legend moves to the left with the time column and its words use urdu-label. Names use urdu-strong (bold), the more row urdu-body, the train label urdu-label, and labels, sub lines and countdowns urdu-caption (light and small, so the names stand out), and times stay in Barlow Condensed with Latin digits.

## Accessibility
It is an ordered list. The markers are decorative. The scheduled time has a screen-reader prefix, "Scheduled"; the legend is decorative (`aria-hidden`) because of that. The train row has `aria-current="location"`. Linked rows are at least 46px tall; a button is never placed inside a link; the focus ring surrounds the whole row.

## Example
```js
Patri.StopTimeline({
  mode: 'card', // 'compact' | 'full' too; legend: true adds the expected · scheduled key
  rows: [
    { kind: 'passed', name: 'Sahiwal', time: { expected: '11:02 AM' } },
    { kind: 'train', name: 'Train here · 27 km to Multan Cantt' },
    { kind: 'next', name: 'Khanewal Jn', time: { expected: '~12:40 PM', scheduled: '12:10 PM' }, countdown: 'in 20 min' },
    { kind: 'yourstop', name: 'Multan Cantt', time: { expected: '~1:20 PM', scheduled: '12:50 PM' }, countdown: 'in 1 h', change: true },
  ],
});
```
The app imports it from `/js/components/index.js`.
