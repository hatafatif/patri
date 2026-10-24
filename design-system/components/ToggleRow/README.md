# ToggleRow

One on/off choice in a list, such as one alert on the Alerts page: a label, an optional quiet line under it, and a switch at the inline end.

## When to use
- A list of independent settings, each on or off, such as the alerts for a train.
- When one choice has a follow-up (how long before), as `extra` under the row.

## When not to use
- To pick one of two or three options. That is a SegmentedControl.
- For an action that happens at once, such as following a train. That is a Button or FollowButton.
- For the map's "Following" pill. That is MapToggle.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | none | What `onToggle` reports. Unique on the page. |
| `label` | `string` | `''` | Already localised. |
| `sub` | `string` | none | A quiet line under the label. Already localised. |
| `checked` | `boolean` | `false` | Whether the switch is on. |
| `disabled` | `boolean` | `false` | Greys the row and stops it being switched. |
| `extra` | `string` | none | Trusted HTML, such as a SegmentedControl, shown under the row only while it is checked. |
| `className` | `string` | none | Extra classes, so a composing component can hook its own styles. |

## Behaviour
- The whole row is the tap target: tapping the label or the switch flips it.
- `bindToggleRow(root, { onToggle })` is delegated. It moves `p-togglerow--on` and calls `onToggle(name, checked)`. It returns `unbind()`.
- `extra` is drawn only when `checked` is true at render time, so the view re-renders after a toggle to show or hide it.
- Rows one under another are divided by a thin `line-soft` rule; the rule goes under the extra.
- The knob slides in 150ms, and does not move under reduced motion.

## Urdu and right-to-left
The label and sub become `urdu-strong` and `urdu-caption`. The switch sits at the inline end and the knob moves toward the inline end when on, so under `dir="rtl"` the switch is at the left and the knob slides left.

## Accessibility
- A native checkbox with `role="switch"`, visually hidden but focusable, so Space flips it and screen readers say on or off.
- The sub is tied to the switch with `aria-describedby`.
- The row is at least 56px tall. Keyboard focus draws the 3px focus ring around the switch.
- Disabled rows use `line-soft` and `ink-muted`.

## Example
```js
Patri.ToggleRow({
  name: 'before', label: 'Before it gets there', sub: 'Expected ~4:05 PM', checked: true,
  extra: Patri.SegmentedControl({ options: [{ value: '30', label: '30 min' }], value: '30', label: 'How long before' }),
});
Patri.bindToggleRow(root, { onToggle: (name, checked) => {} });
```
The app imports it from `/js/components/index.js`.
