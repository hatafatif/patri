# SpeedChart

The train's speed since it left, as an inline SVG chart with the average and top speed above it and a hover or tap readout.

## When to use
- On the Train page: in the panel on phones, docked on the map on the web.

## When not to use
- For a train with no recorded history; the component then shows an empty message by itself, so just render it.
- For anything other than speed over time.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `points` | `[number, number][]` | `[]` | Speed samples as `[milliseconds, km/h]`, oldest first. Fewer than 2 points shows the "no history" message. |
| `stops` | `{ ms: number, name: string }[]` | `[]` | Stations the train has stopped at. Each gets a dashed mark and a name under the chart; names that would overlap are skipped. |
| `now` | `number` | last point | Milliseconds for the right edge. Never earlier than the last point. |
| `title` | `string` | "Speed today" | Replaces the heading, such as "Speed so far". Already localised. |
| `stats` | `boolean` | `true` | `false` hides the average and top speed, for illustrative points. |

The average and top speed come only from the points passed in, never invented; with fewer than 2 points the chart shows its empty message and no stats, whatever `stats` says. The average counts only points above 3 km/h. The grid lines are at 50 and 100 km/h.

## Behaviour
`bindSpeedChart(root, points)` takes the same points. Moving the pointer over the plot, or tapping it, shows a cursor line and a tip with the clock time and the speed, or "Stopped". On touch the readout stays until you tap elsewhere. It returns `unbind()`. This signature is fixed by the spec, so there is no handlers type.

## Urdu and right-to-left
The time axis mirrors: the start time moves to the right and "Now" to the left. The line is flipped and the marks, names and tip use start-edge positions. Titles and station names use urdu-label; clock times and numbers stay in Barlow Condensed.

## Accessibility
The SVG has `role="img"` and a label. The readout is pointer only, and the average and top speed in the header carry the same information as text. The "now" dot is an HTML element, so it stays round at any width.

## Example
```js
Patri.SpeedChart({
  points: [[t0, 0], [t0 + 60000, 42], [t0 + 120000, 88] /* … */],
  stops: [{ ms: t0 + 45 * 60000, name: 'Raiwind Jn' }],
  now: Date.now(),
  title: 'Speed so far',
});
```
The app imports it from `/js/components/index.js`.
