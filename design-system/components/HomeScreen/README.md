# HomeScreen

The phone Home screen: the station map under the Patri app bar, with a bottom sheet holding search, the trains you follow and the trains running now.

## Components used
[AppBar](../AppBar/README.md), [Panel](../Panel/README.md) (through the screen frame), [SearchField](../SearchField/README.md), [SectionHeader](../SectionHeader/README.md), [TrainCard](../TrainCard/README.md), [TrainRow](../TrainRow/README.md), [IconButton](../IconButton/README.md) (floating map controls), [StatusChip](../StatusChip/README.md) and [TrainBadge](../TrainBadge/README.md) inside the cards and rows. The web layout is shown in [HomeScreenWeb](../HomeScreenWeb/README.md).

## Data
`HomeScreen(data, options)` returns an HTML string. Sample: `Patri.samples.home`.

| Field | Type | Description |
|---|---|---|
| `live` | `'on' \| 'reconnecting' \| 'off'` | The feed state, for the AppBar's LiveIndicator. |
| `myTrains` | `HomeTrain[]` | The followed trains, in the rider's order. |
| `running` | `HomeTrain[]` | Trains running now. Shown in train-number order. |
| `runningCount` | `number` | The total for "Running now · 41"; `running` may be a subset. |
| `map.hover` | `{ key, station }` | Web map stand-in only: the city shown hovered. |

A `HomeTrain` is `{ train, where, late, gps?, runId?, yourStop?: { station, est } }`. `where` is between two stations, stopped at one, or not departed. `late` is minutes, or `null` when unknown. All names are English plus Urdu, so the same data renders in both languages.

## Options
- `layout`: `'phone'` (default) or `'web'`.
- `snap`: `'down'`, `'half'` or `'full'`. Phone only. Default `'half'`.
- `expanded`, `standin`: the shared screen options (see `_layout.js`).

## Layout
- The AppBar is a band across the top; the map starts below it. Floating buttons on the map: map style and stations near me.
- Panel body, in order: the search field with its From → To link; My trains (with Edit); Running now.

## Behaviour
`Patri.screens.bindScreen(root, { data, onLang })` wires the panel's drag and snaps, the search field, and the language toggle in the AppBar (it re-renders in the other language through `onLang`). The cards and rows are links.

## Product rules
- No lateness filters or sorting. Running now is sorted by train number (a copy; the data is frozen).
- The map shows stations and a small marker for every running train.
- The map in the preview is the preview-only stand-in; the app draws it with MapLibre.
