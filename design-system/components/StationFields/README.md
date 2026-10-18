# StationFields

The From and To pickers, stacked in one frame, with a swap button.

## When to use
- On the Trip tab, to start choosing a From and To station.

## When not to use
- For a single station choice: use a LinkRow or Button that opens the picker.
- As the picker itself. The fields only report a press; the view opens the picker.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `from` | `string \| null` | `null` | The From station's name. `null` shows a muted "Choose a station". |
| `to` | `string \| null` | `null` | The To station's name. `null` shows the same placeholder. |
| `fromLabel` | `string` | | Already localised small label, such as "From". |
| `toLabel` | `string` | | Already localised small label, such as "To". |
| `className` | `string` | none | Extra classes for a composing component. |

## Behaviour
`bindStationFields(root, { onPickFrom, onPickTo, onSwap })` returns `unbind()`. Each handler runs when its field or the swap button is pressed. Swapping the values and re-rendering is up to the view.

## Urdu and right-to-left
The swap button sits at the end of the frame, so it moves to the left in Urdu. Labels use the Urdu label style and station names use the Urdu body style. Each field grows past 52px if Nastaliq needs the height.

## Accessibility
- Two real buttons, each at least 52px tall. Each is announced as its label followed by the station name.
- The swap control is an icon button with the aria-label "Swap From and To".
- The focus ring is drawn inside each field.

## Example
```js
Patri.StationFields({ from: 'Lahore Jn', to: 'Karachi Cantt', fromLabel: 'From', toLabel: 'To' });
```
The app imports it from `/js/components/index.js`.
