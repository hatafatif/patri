# StationScreen

The Station page on a phone: the map zoomed to one station, and a bottom sheet with the station's header and the next trains through it.

## Components
[PageHeader](../PageHeader/README.md) (station mark, name with its Urdu twin, city, follow and share), [SegmentedControl](../SegmentedControl/README.md) (the "Next trains / Timetable" switch, links to `#/station/<id>` and `?view=timetable`), [SectionHeader](../SectionHeader/README.md), [StatusChip](../StatusChip/README.md) (the "Updated" note), [DepartureRow](../DepartureRow/README.md) (one per train), [IconButton](../IconButton/README.md) (the float back button), [Panel](../Panel/README.md) (the sheet), plus the preview-only map stand-in. The web layout is [StationScreenWeb](../StationScreenWeb/README.md).

## Data
`StationScreen(data, options)` returns an HTML string. `data` is `samples.station` in previews and a `/api/board` result in the view.

| Field | Type | Meaning |
|---|---|---|
| `live` | `'on' \| 'reconnecting' \| 'off'` | The feed state; used only by the web sidebar's AppBar. |
| `station` | `{ id, name, nameUr, city, cityUr }` | The station; the city is the subtitle. |
| `saved` | `boolean` | Whether the follow star is on. |
| `now`, `updatedAt` | `number` | Minutes after midnight. "Updated just now" when they match, otherwise "Updated 3 min ago". |
| `rows` | `StationRow[]` | The next trains, in expected-time order. |
| `view`, `timetable`, `loadingTimetable` | `'next' \| 'timetable'`, `TimetableRow[]`, `boolean` | With `view: 'timetable'` the switch is on Timetable and the list is every train through the station by scheduled time (`/api/timetable`), with a status only on trains running towards it. Never ordered by lateness. |
| `map.hover` | `{ key, station }` | Map stand-in only: a station shown hovered on the web map. |

A `StationRow` is `{ train, kind: 'starts' \| 'passes' \| 'ends', origin, dest, sched, est, late \| null, gps, runId?, kmAway?, atPlatform? }`.

## Options
- `layout`: `'phone'` (default) or `'web'`.
- `snap`: the sheet's starting snap on a phone, `'down' \| 'half' \| 'full'`. Default `'half'`.
- `expanded`: showcase frames only; the whole board opens below a 300px map band.
- `standin`: `false` when the view mounts MapLibre itself.

## Rows
- Each row links to `#/train/<number>?stop=<station id>` (plus `&run=<runId>` when the train is live).
- Time: at the platform, the expected time; when running, the estimate with a "~" (`~4:38 PM`); otherwise the timetable time. The scheduled time is struck through underneath when it differs.
- Sub line: "Starts here → X", "To X · N km away", or "Arrives from X".
- Status: "On the platform", "No GPS", or the delay chip.

## Behaviours
`bindScreen(root, { data, onLang })` wires the sheet's drag and snaps, the follow star and the language toggle (web).

## Rules
- Rows stay in the board's order. Never sort or filter them by lateness.
- The map shows stations and a small marker for every running train. In previews it is the stand-in; the app uses MapLibre.
- Urdu uses Noto Nastaliq Urdu; the header shows the Urdu name as the title and the English name under it.
