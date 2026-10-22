# ReplayScreen

The Train page's Journey replay: a time-lapse of the train's recorded journeys, and its return train's, played on the map. `P.screens.ReplayScreen(P.samples.replay, { layout: 'phone' })` returns the whole screen as an HTML string; it takes the same data as [TrainScreen](../TrainScreen/README.md) plus `replay`.

## Components it uses
[PageHeader](../PageHeader/README.md), [Card](../Card/README.md), [SegmentedControl](../SegmentedControl/README.md) (the period, as links), [ReplayBar](../ReplayBar/README.md), [MapMarkers](../MapMarkers/README.md) (in the map stand-in), and on the web layout [AppBar](../AppBar/README.md). [LanguageToggle](../LanguageToggle/README.md) is in the preview toolbar.

## Layout
- Panel at the half snap, so the map stays in view: PageHeader ("Journey replay", "7 UP Tezgam · With the return train, 8 DN Tezgam"), then one Card.
- The Card: the period switch (7 · 30 · 90 days), the ReplayBar, "Recorded since …" and a note that the whole period plays in about a minute.
- While loading, or when nothing was recorded or the request failed, the Card shows a note in place of the bar.
- In the app, the map shows the route dashed, with a train marker and a fading trail for every run on the move (`showReplay` and `setReplayFrame` in `public/js/map.js`). The stand-in here shows the plain train map.
- Web: the same body in the sidebar, under an AppBar whose back link goes to the train. Not showcased.

## Data and options
`TrainScreenData` plus `replay`: `{ state: 'loading' | 'ready' | 'empty' | 'failed', days, periods, bar, since, returnName? }`, documented as `ReplayData` in `public/js/screens/ReplayScreen.js`. The sample's texts are in English in both languages; the app localises them with `t()`. Options: `layout` (`'phone'` default, `'web'`).

## Behaviour
`bindScreen(root, { data, onLang, onSnap, onReplayToggle, onReplayScrub })` wires the panel, the ReplayBar and the language switch. The view (`public/js/views/train.js`) runs the playback loop with `public/js/replay.js` and updates the bar in place with `syncReplayBar`.

## Rules
The replay starts at the first recording in the period, plays it in about a minute and loops. A train is left off the map while nothing was recorded. Autoplay is off under `prefers-reduced-motion`.
