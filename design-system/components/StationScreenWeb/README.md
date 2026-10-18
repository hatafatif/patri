# StationScreenWeb

The Station page on a wide screen: the next trains in a 440px sidebar with a back link, and the map beside it, zoomed to the station.

## Components
The same as [StationScreen](../StationScreen/README.md), with an [AppBar](../AppBar/README.md) (back link to Home, the live indicator, the language switch) as the first thing in the sidebar, and [IconButton](../IconButton/README.md) float buttons on the map for zoom in, zoom out and the map style.

## Data and options
`StationScreen(samples.station, { layout: 'web' })`. The data is the same as the phone's; `live` feeds the AppBar and `map.hover` (here Khanewal Jn) shows one station hovered on the map with "Click for station".

## Behaviours
`bindScreen(root, { data, onLang })` wires the follow star and the AppBar's language toggle, which re-renders the screen in the other language. The sidebar scrolls; with the 900px frame the first seven of the eight sample trains are visible and the eighth sits just below the fold.

## Rules
- Rows stay in the board's order. Never sort or filter them by lateness.
- The map shows stations, not trains. In previews it is the stand-in; the app uses MapLibre.
