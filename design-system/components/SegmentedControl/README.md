# SegmentedControl

A choice between two or three options, as route links or as local buttons.

## When to use
- To switch between two pages that belong together, such as "Train or station" and "From → To". Each option is a link and the page is the state.
- To switch a local view, such as Arriving, Departing and All on a station.

## When not to use
- For more than three options.
- For an on/off setting: use MapToggle or a button with `aria-pressed`.
- To sort or filter trains by lateness. Patri never does that.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `{ value, label, href? }[]` | | Labels already localised. An option with `href` is a link, otherwise a button. |
| `value` | `string` | | The value of the active option. |
| `label` | `string` | | Already localised. The group's aria-label. |
| `className` | `string` | none | Extra classes for a composing component. |

## Behaviour
Link options need no code: the router reads the `href`.

`bindSegmentedControl(root, { onChange })` returns `unbind()`. It makes the button options work: it moves `aria-pressed` to the pressed option and calls `onChange(value)`.

## Urdu and right-to-left
The options run from the right in Urdu, so the first option is on the right. Labels switch to the Urdu label style.

## Accessibility
- The control is `role="group"` with an aria-label.
- Link options mark the active one with `aria-current="page"`. Button options use `aria-pressed`.
- Each option is 44px tall, and the options share the width equally.
- The focus ring is drawn inside the option, because the control clips its corners.

## Example
```js
Patri.SegmentedControl({
  label: 'Show',
  value: 'arr',
  options: [
    { value: 'arr', label: 'Arriving' },
    { value: 'dep', label: 'Departing' },
    { value: 'all', label: 'All' },
  ],
});
```
The app imports it from `/js/components/index.js`.
