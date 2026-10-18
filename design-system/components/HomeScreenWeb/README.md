# HomeScreenWeb

The web Home screen: a 440px sidebar with the search, My trains and Running now beside the full-size station map.

## Components used
The same as [HomeScreen](../HomeScreen/README.md): [AppBar](../AppBar/README.md) (first thing in the sidebar), [Panel](../Panel/README.md), [SearchField](../SearchField/README.md), [SectionHeader](../SectionHeader/README.md), [TrainCard](../TrainCard/README.md), [TrainRow](../TrainRow/README.md), [IconButton](../IconButton/README.md).

## Data
The same `data` as HomeScreen (`Patri.samples.home`), plus `map.hover`: `{ key, station }`, the city shown hovered on the map. The screen turns it into a card with the station name and "Click for station". The sample hovers Lahore.

## Options
`HomeScreen(data, { layout: 'web' })`. The screen fills the box it is rendered into; give it 1440×900 or any width of 940px and more.

## Layout
- Sidebar header: the AppBar (logo, live indicator, language toggle), no back link. Then the same body as the phone: search with From → To, My trains, Running now.
- Floating on the map, top end: zoom in, zoom out, map style, stations near me.

## Behaviour
`bindScreen(root, { data, onLang })` wires the language toggle in the AppBar, the search field and the links. There is no sheet drag in the sidebar.

## Product rules
- No lateness filters or sorting; Running now is in train-number order.
- The map shows stations, not trains. In the preview it is the stand-in; the app uses MapLibre.
