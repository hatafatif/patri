# SearchScreen

Search for a train, station or city: the full-height sheet with the search box, matching trains, recent searches and a hint.

## Components used
[Panel](../Panel/README.md) (through the screen frame), [IconButton](../IconButton/README.md) (back), [SearchField](../SearchField/README.md), [SegmentedControl](../SegmentedControl/README.md), [SectionHeader](../SectionHeader/README.md), [TrainRow](../TrainRow/README.md) with its [FollowButton](../FollowButton/README.md), [LinkRow](../LinkRow/README.md).

## Data
`SearchScreen(data, options)`. Sample: `Patri.samples.search`.

| Field | Type | Description |
|---|---|---|
| `query` | `string` | The text in the box. Matches are highlighted in the results. |
| `trains` | `SearchTrain[]` | Matching trains, in the order the search ranked them. |
| `recent` | `SearchRecent[]` | Recent searches, newest first. |

A `SearchTrain` is `{ train, from, to, late, gps?, followed, runId? }`. A `SearchRecent` is `{ kind: 'trip', from, to }` or `{ kind: 'station', station }`.

## Options
- `layout`: `'phone'` (default) or `'web'`. Phone: full snap, with a back button beside the search field. Web: the sidebar without the back button, the map beside it with zoom buttons.
- `snap`, `expanded`, `standin`: the shared screen options.

## Layout
The search row and the Train or station | From → To switch sit together; then Trains, Recent (trip → "Trip", station → "Station board") and one hint line.

## Behaviour
`bindScreen(root, { data, onLang })` wires the panel, the search field (typing, clear, Escape) and the follow stars, which toggle in place. Saving the follow and filtering the results are the view's job. The "From → To" option is a link to `#/trip`.

## Product rules
- Trains stay in the search's order; never sorted or filtered by lateness.
- The map behind the sheet is the preview-only stand-in; the app uses MapLibre.
