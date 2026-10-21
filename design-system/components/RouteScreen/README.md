# RouteScreen

From → To: pick two stations and a day, then see the direct trains you can still board.

## Components used
[Panel](../Panel/README.md) (through the screen frame), [IconButton](../IconButton/README.md) (back), [SegmentedControl](../SegmentedControl/README.md) (mode, as links; and Today | Tomorrow, as buttons), [StationFields](../StationFields/README.md), [SectionHeader](../SectionHeader/README.md), [DepartureRow](../DepartureRow/README.md) with its [StatusChip](../StatusChip/README.md).

## Data
`RouteScreen(data, options)`. Sample: `Patri.samples.route`.

| Field | Type | Description |
|---|---|---|
| `from`, `to` | `ScreenStation` | The two stations. |
| `date` | `string` | Today in Pakistan time, `'YYYY-MM-DD'`; shown as "Today · Sun 18 Oct". |
| `day` | `'today' \| 'tomorrow'` | The selected day. |
| `now` | `number` | Minutes after midnight today, for "in 1 h 46 min". |
| `leaving` | `RouteTrip[]` | Trains still to leave From, in departure order. |

A `RouteTrip` is `{ train, dep, arr, late, gps, stopsBetween, runId? }`. Times are minutes after midnight; `arr` of 1440 or more is the next day ("+1").

## Options
- `layout`: `'phone'` (default) or `'web'`. Phone: full snap with a back button. Web: the sidebar without the back button, zoom buttons on the map.
- `snap`, `expanded`, `standin`: the shared screen options.

## Rows
- Leaving: with a delay, the expected time ("~3:35 PM") over the struck scheduled time, and the delay chip. Without one, the scheduled time and either "in 1 h 46 min" or "No GPS". The sub line is "Arrives … · N stops".
- Links go to `#/train/<n>?stop=<from id>`, with `&run=` when the run is known.

## Behaviour
`bindScreen(root, { data, onLang })` wires the panel, the From and To fields and swap (the view supplies the pickers), the Today | Tomorrow buttons (the view loads the other day), and the language toggle. The Search | Plan a trip control is made of links.

## Product rules
- Departure order is kept; no sorting or filtering by lateness.
- The map behind the sheet is the preview-only stand-in; the app uses MapLibre.
