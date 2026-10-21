# MapMarkers

Everything drawn on the map: the followed train's marker, the label cards, and the MapLibre paint values read from the design tokens.

## When to use
- `trainMarker` as the HTML of the one marker on the Train map.
- `mapLabel` for the next stop, your stop, the selected station and the station under the pointer.
- `mapPaint()` for the paint of every MapLibre layer, so the map follows the tokens.

## When not to use
- For anything outside the map. Hard-coded map colours in `map.js` should move to `mapPaint()`.

## Rules
- The Home and Station maps show stations, not trains. Major cities are bigger and labelled at every zoom. The other stations appear as small dots once the map is zoomed in (they fade in from about zoom 6.5 to 7.5). Tapping a station opens its Station page.
- The Sabz base style is a terrain relief (`public/data/relief.webp`, built by `npm run relief` from `scripts/build-relief.py` with the `map-relief-*` tokens) under water, rails and labels, with the neighbours faded in `map-outside` and the Arabian Sea in `map-water`.
- The Train map shows that one train, followed.

## Exports
| Export | Props | Returns |
|---|---|---|
| `trainMarker` | `{ label }` | HTML: a 22px yellow dot with a 3px dark ring and halo, and a dark label such as "28 DN · 105 km/h". The root is the dot, so anchoring the marker at its centre puts it on the train. |
| `mapLabel` | `{ title, sub?, kind }` | HTML: a label card. `kind` is `next`, `yourstop`, `selected` or `hover`. `next` and `hover` are light with a 1.5px `sabz-700` border; `yourstop` and `selected` are dark with a yellow title. All have `shadow-float`. |
| `mapPaint` | none | An object of MapLibre paint values: `station`, `majorCity`, `selectedStation`, `rail`, `routeDoneCasing`, `routeDone`, `routeAhead`, `cityLabel`, `land`, `water`, `border`. Read from the tokens each time it is called. |
| `MapMarkers` | `{ type: 'train', label }` or `{ type: 'label', title, sub?, kind }` | A dispatcher to the first two, so `Patri.MapMarkers` is callable. Not in the original spec. |

`land` and `water` use `fill-color`; `border` is a dashed line.

## Behaviour
None. The markup is static; `map.js` creates the MapLibre markers and layers from it.

## Urdu and right-to-left
Label titles use urdu-body and sub lines use urdu-label. The train label uses urdu-label. The text beside the train dot flows to the inline-end edge.

## Accessibility
Labels are text, so a screen reader gets the same names. Cards and the marker carry no interaction; the interaction is the map's station dots, which open the Station page.

## Example
```js
Patri.MapMarkers({ type: 'train', label: '28 DN · 105 km/h' });
Patri.mapLabel({ title: 'Multan Cantt', sub: '~1:20 PM', kind: 'yourstop' });
map.addLayer({ id: 'route-done', type: 'line', source: 'route', paint: Patri.mapPaint().routeDone });
```
The app imports these from `/js/components/index.js`.
