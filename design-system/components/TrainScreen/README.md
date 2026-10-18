# TrainScreen

The Train page on a phone: the map following one train, with a bottom sheet that shows where it is, how late, the stops around it, its speed so far and facts about it. `P.screens.TrainScreen(P.samples.train, { layout: 'phone', expanded: true })` returns the whole screen as an HTML string. The web layout is in [TrainScreenWeb](../TrainScreenWeb/README.md); the full stop list is [StopsScreen](../StopsScreen/README.md).

## Components it uses
[PageHeader](../PageHeader/README.md), [Card](../Card/README.md), [StatusStrip](../StatusChip/README.md), [StopTimeline](../StopTimeline/README.md), [JourneyProgress](../JourneyProgress/README.md), [Button](../Button/README.md), [SpeedChart](../SpeedChart/README.md), [DetailGrid](../DetailGrid/README.md), [LinkRow](../LinkRow/README.md), [IconButton](../IconButton/README.md), [MapToggle](../MapToggle/README.md), [Panel](../Panel/README.md) (through the frame), [MapMarkers](../MapMarkers/README.md) (in the map stand-in), and [LanguageToggle](../LanguageToggle/README.md) in the preview toolbar.

## Layout, top to bottom
- Map: the train (label "28 DN · 105 km/h") and a "next stop" card. Back (IconButton, float) at the start; Following (MapToggle, on) and Show the whole route at the end.
- Panel, half snap by default:
  1. PageHeader: train badge, name with its Urdu twin, route, follow star, share.
  2. Right now card (key tone): StatusStrip, the compact StopTimeline (last stop passed, train here, next stop with its countdown, your stop with Change, "8 more stops", final stop), JourneyProgress, and "See all 16 stops".
  3. Speed card: the SpeedChart, which carries its own "Speed today" title, so there is no SectionHeader above it (the wireframe says "Speed so far"; a `title` prop on SpeedChart would let the screen use that wording).
  4. About this train card (DetailGrid) and, 12px below it, the Return train LinkRow.
- Without `myStop` (or when it is not after the next stop) the your-stop row is left out; "more stops" counts the stops between the last row shown and the final stop and is left out at 0. A halt shows only when it is 5 minutes or more. Locomotive shows only when `details.locomotive` is given.

## Data: `TrainScreenData`
| Field | Meaning |
|---|---|
| `live` | `'on' \| 'reconnecting' \| 'off'`: feed state (web AppBar). |
| `train` | `{ number, label, up, name, nameUr }`. |
| `stops` | The route, first to last: `{ id, name, nameUr, city, cityUr, km, arr, dep }` (minutes after midnight of the first day). |
| `run` | `{ speed, late, updatedAt, date, gps }`: km/h, delay in minutes, last report, day it left, whether it has GPS. |
| `now` | Minutes after midnight on the run's first day. |
| `ests` | One per stop: `{ passed }` or `{ passed: false, est }`, as `eta.js` gives them. |
| `progress` | `{ passedIdx, nextIdx, kmDone, kmToNext }`. |
| `myStop` | The rider's stop id (optional). |
| `followed` | Whether the train is in My trains. |
| `speed` | `{ points: [ms, km/h][], stops: { ms, id }[], now, illustrative? }`. The sample's history is illustrative (made up to look like a run); only the stations and the 105 km/h are real. |
| `details` | `{ locomotive? }`. |
| `returnTrain` | The train running the other way (optional). |

## Options
`layout` (`'phone'` here), `snap` (`'down' \| 'half' \| 'full'`, default `'half'`), `expanded` (showcase frames: the map keeps a 300px band and the panel opens in full below it, so a tall frame shows the whole panel), `standin` (draw the map stand-in; views pass `false` and mount MapLibre).

## Behaviour
`P.screens.bindScreen(root, { data, onLang, onSnap })` wires the panel drag and snaps, the follow star, the Following toggle, the Change link, the timeline and the speed chart readout (`data.speed.points`), and re-renders on the language switch through `onLang`. Saving a follow, share and "Change stop" are the view's job.

## Rules
- Every fixed word comes from `t()`; every value is localised in the screen, so the same sample renders in English and Urdu.
- The map shows the one train, followed. In previews it is the preview-only stand-in (`trainMap`); the app draws it with MapLibre.
- Nothing is sorted or filtered by lateness.
- The showcase frame is 390 px wide at the panel's natural height (1600 px in English, 1860 px in Urdu, which is taller).
