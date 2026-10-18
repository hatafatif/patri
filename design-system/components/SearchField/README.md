# SearchField

The search box for a train name, number, station or city, with an optional "From → To" link beside it.

## When to use
- At the top of the Trains and Stations lists, to filter by name, number or city.
- With `route`, on the Trains list, where a trip search is one tap away.

## When not to use
- To pick a station inside a From or To picker flow: use StationFields to open the picker, then a SearchField inside it.
- For free-text input that isn't a search.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | `''` | The current text. The clear button is shown only when this is not empty. |
| `placeholder` | `string` | | Already localised. Also the input's aria-label. |
| `route` | `{ href: string, label: string }` | none | Adds a secondary "From → To" link beside the field, also 52px tall. |
| `className` | `string` | none | Extra classes for a composing component. |

## Behaviour
`bindSearchField(root, { onInput, onClear })` returns `unbind()`.
- `onInput(value)` runs on every change, and the clear button is shown or hidden to match.
- The clear button empties the field, hides itself, puts focus back in the input and calls `onClear()`.
- Escape in a non-empty field does the same as the clear button.

## Urdu and right-to-left
The magnifier sits at the start and the clear button at the end, so both swap sides in right-to-left. Typed text and the placeholder are Nastaliq. The field grows in height instead of clipping the script. The route link's label switches to the Urdu label style.

## Accessibility
- A real `<input type="search">` inside a `<label>`, with the placeholder as its aria-label.
- The clear button is an icon button with a localised aria-label ("Clear search") and is 44px.
- The field is 52px tall. The 3px focus ring appears around the whole field when the input is focused with the keyboard.

## Example
```js
Patri.SearchField({
  value: '',
  placeholder: 'Search name, number or city',
  route: { href: '#/trip', label: 'From → To' },
});
```
The app imports it from `/js/components/index.js`.
