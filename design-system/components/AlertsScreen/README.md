# AlertsScreen

The Train page's Alerts page: where a rider chooses which push alerts they want for one run. `P.screens.AlertsScreen(P.samples.alerts, { layout: 'phone' })` returns the whole screen as an HTML string; it takes the same data as [TrainScreen](../TrainScreen/README.md) plus `alertsPage`.

## Components it uses
[PageHeader](../PageHeader/README.md), [StatusChip](../StatusChip/README.md) (the delay), [LinkRow](../LinkRow/README.md) (your station), [SectionHeader](../SectionHeader/README.md), [ToggleRow](../ToggleRow/README.md), [SegmentedControl](../SegmentedControl/README.md) (the minutes, local buttons), [Button](../Button/README.md), [MapMarkers](../MapMarkers/README.md) (in the map stand-in), and on the web layout [AppBar](../AppBar/README.md). [LanguageToggle](../LanguageToggle/README.md) is in the preview toolbar.

## Layout
- Panel at full height: PageHeader ("Alerts", "28 DN Shalimar Express · Lahore Jn → Karachi Cantt"), the delay chip, then a LinkRow "Your station" with the station (or "Whole journey, no stop") linking to the stop picker.
- With a station: a section "At {station}" with a ToggleRow for before it gets there (the minutes control, 15 · 30 · 1 h, sits under it while it is on), when it arrives, and when it leaves.
- A section "Whole journey" with a ToggleRow for when it starts, if the delay changes, and when it reaches the last station.
- A full-width primary Button, "Turn on alerts" (or "Save changes" once alerts are on), with a "Turn off alerts" link under it when on, and a note that alerts end with the journey.
- When alerts are blocked, unsupported or the train has no live position, only the header and a note show.
- Web: the same body in the sidebar, under an AppBar whose back link goes to the train. Not showcased in the library.

## Data and options
`TrainScreenData` plus `alertsPage`: `{ state, stop, first, last, pickHref, backHref, choices, minutes, late, notice? }`, documented as `AlertsPageData` in `public/js/screens/AlertsScreen.js`. Options: `layout` (`'phone'` default, `'web'`).

## Behaviour
`bindScreen(root, { onToggle, onSegment, ... })` wires the switches and the minutes control. The view (`public/js/views/train.js`) saves the choices.

## Rules
Times show their day and are approximate ("Expected ~4:05 PM"). Choices that cannot happen (leave at the last station) are left out by the view.
