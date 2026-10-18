# LinkRow

A full-width link row with a small eyebrow, a name and a chevron, such as Return train over 27 UP Shalimar Express.

## When to use
- To send the user to a related page, such as a train's return train.

## When not to use
- For an action that doesn't navigate: use Button.
- For a list of trains: use TrainRow.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `href` | `string` | | Where the row goes. |
| `eyebrow` | `string` | | Already localised small label above the name. |
| `label` | `string` | | Already localised name or title. |
| `className` | `string` | none | Extra classes for a composing component. |

## Urdu and right-to-left
The chevron flips so it points to the left in Urdu, and the eyebrow and name switch to the Urdu label and body styles. The name is wrapped in `<bdi>`.

## Accessibility
- A real `<a href>`, at least 56px tall. The whole row is the target.
- The border is 1.5px `line` and the focus ring is the standard 3px ring.
- The chevron is decorative and hidden from screen readers.

## Example
```js
Patri.LinkRow({ href: '#/train/27up', eyebrow: 'Return train', label: '27 UP Shalimar Express' });
```
The app imports it from `/js/components/index.js`.
