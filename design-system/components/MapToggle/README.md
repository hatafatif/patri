# MapToggle

The "Following" pill that floats over the map.

## When to use
- For an on/off setting that belongs to the map itself, such as keeping the map centred on the train.

## When not to use
- For a choice between options: use SegmentedControl.
- Away from the map. Its shadow is for sitting over map tiles.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `on` | `boolean` | `false` | Whether it is on. Sets `aria-pressed`. |
| `label` | `string` | | Already localised. |
| `className` | `string` | none | Extra classes for a composing component. |

## Behaviour
`bindMapToggle(root, { onToggle })` returns `unbind()`. When pressed it flips `aria-pressed` and the on or off look, then calls `onToggle(on)` with the new state.

## Urdu and right-to-left
The label switches to the Urdu label style. Nothing in the shape is directional.

## Accessibility
- A real `<button>` with `aria-pressed`, 44px tall.
- On is a `sabz-700` fill with white text. Off is `surface` with `ink` text and a shadow, so it stays legible on any base map.

## Example
```js
Patri.MapToggle({ on: true, label: 'Following' });
```
The app imports it from `/js/components/index.js`.
