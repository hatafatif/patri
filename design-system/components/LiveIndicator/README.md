# LiveIndicator

An 8px dot with the word "Live" or "Reconnecting", hidden when the feed is off.

## When to use
- In the AppBar, to show whether live train data is arriving.

## When not to use
- To show a train's status. Use StatusChip for that.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `state` | `'on' \| 'reconnecting' \| 'off'` | `'off'` | on: a sabz-700 dot and "Live". reconnecting: a zard-500 dot and "Reconnecting". off: the element is rendered with the `hidden` attribute and no text. |

## Behaviour
None. Re-render it when the state changes. Because it is always rendered, with `aria-live="polite"`, screen readers hear the change.

## Urdu and right-to-left
The text uses the Urdu label style. The dot sits at the start of the text and mirrors.

## Accessibility
- `role="status"` and `aria-live="polite"`.
- The dot is decorative. The text stays in `ink`, since zard-500 is never text on white.

## Example
```js
Patri.LiveIndicator({ state: 'reconnecting' });
```
The app imports it from `/js/components/index.js`.
