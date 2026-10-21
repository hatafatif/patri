# StopsScreen

The Train page's All stops list: every stop of a train in order, with the distance, halts, expected and scheduled times, and where the train is. `P.screens.StopsScreen(P.samples.train, { layout: 'phone' })` returns the whole screen as an HTML string; it takes the same data as [TrainScreen](../TrainScreen/README.md).

## Components it uses
[PageHeader](../PageHeader/README.md), [StatusChip](../StatusChip/README.md), [StopTimeline](../StopTimeline/README.md) (full mode), [MapMarkers](../MapMarkers/README.md) (in the map stand-in, hidden under the sheet), and on the web layout [AppBar](../AppBar/README.md). [LanguageToggle](../LanguageToggle/README.md) is in the preview toolbar.

## Layout
- Panel at the full snap: PageHeader ("All 16 stops", "28 DN Shalimar Express · Lahore Jn → Karachi Cantt", a back link to the train page), the delay chip, then the full StopTimeline.
- One row per stop plus the train row:
  - up to the last stop passed: kind `passed`, scheduled time, no strike; the first says "Start · 0 km", the last passed "165 km · Last stop";
  - "Train here · 105 km/h · 305 km" right after it;
  - the next stop (`next`), other stops (`stop`) and the final stop (`final`, "End · 1,165 km"): expected time with the scheduled time struck through; a halt of 5 minutes or more is added to the sub line.
- Web: the same body in the sidebar, under an AppBar whose back link goes to the train; the PageHeader has no back action. Not showcased.
- The wireframe's "expected · scheduled" legend has no component and is left out.

## Data and options
`TrainScreenData`: see [TrainScreen](../TrainScreen/README.md#data-trainscreendata) (it uses `train`, `stops`, `run`, `now`, `ests`, `progress`, `myStop` and `live`). Options: `layout` (`'phone'` default, `'web'`), `snap` (default `'full'`).

## Behaviour
`bindScreen(root, { data, onLang, onSnap })` wires the panel (drag, snaps), the Change link and the language switch.

## Rules
Rows keep the route order. The map stand-in is preview-only; the app uses MapLibre. The showcase frame is 390 px wide at the list's natural height (1318 px in English, 1730 px in Urdu).
