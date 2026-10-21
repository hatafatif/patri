# TrainScreenWeb

The Train page on a wide screen: the 440px sidebar with the train's status, stops and facts, the map following the train beside it, and the speed chart docked along the bottom of the map. `P.screens.TrainScreen(P.samples.train, { layout: 'web' })` returns the whole screen as an HTML string, for a 1440×900 area. The phone layout is [TrainScreen](../TrainScreen/README.md).

## Components it uses
[AppBar](../AppBar/README.md) (with a back link to Home, the sidebar's header and where the language switch lives), [PageHeader](../PageHeader/README.md), [Card](../Card/README.md), [StatusStrip](../StatusChip/README.md), [StopTimeline](../StopTimeline/README.md), [JourneyProgress](../JourneyProgress/README.md), [Button](../Button/README.md), [DetailGrid](../DetailGrid/README.md), [LinkRow](../LinkRow/README.md), [SpeedChart](../SpeedChart/README.md), [IconButton](../IconButton/README.md), [MapToggle](../MapToggle/README.md), [MapMarkers](../MapMarkers/README.md).

## Layout
- Sidebar (the Panel): AppBar, then PageHeader (no back, the AppBar has it), the Current status and Journey cards, About this train and the Return train link. There is no speed card in the sidebar.
- Map: the train, a "next stop" card (expected time, in how long, km to go) and a "your stop" card; at the top end Following (on), Show the whole route and zoom in and out as float IconButtons.
- Dock: a Card holding the SpeedChart along the bottom of the map.

## Data, options and behaviour
The data is the same `TrainScreenData` as [TrainScreen](../TrainScreen/README.md#data-trainscreendata); the sample's speed history is illustrative. The only option is `layout: 'web'`. `bindScreen(root, { data, onLang })` wires the follow star, the Following toggle, the Change link, the timeline, the chart readout and the language switch in the AppBar.

## Rules
The map shows the one train, followed. The preview draws the preview-only stand-in (`trainMap`); the app uses MapLibre. In the stand-in the docked chart covers part of the "your stop" card. Nothing is sorted or filtered by lateness.
