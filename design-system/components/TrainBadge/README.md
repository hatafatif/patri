# TrainBadge

The train number on a dark green square, with UP or DN underneath.

## When to use
- Wherever a train is named: cards, rows, the train page header and the station board.
- `sm` in dense rows, `md` in cards, `lg` in a page header.

## When not to use
- For anything that isn't a train number.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `number` | `string \| number` | | The train number, such as 28 or 115. Three-digit numbers fit all sizes. |
| `direction` | `'up' \| 'dn'` | | Shown as UP or DN in English, اپ or ڈاؤن in Urdu. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 40, 54 or 64px square. |

## Behaviour
None. It is a static element.

## Urdu and right-to-left
The number stays in Barlow Condensed. اپ and ڈاؤن are Nastaliq with a tight line height so they stay inside the square.

## Accessibility
The number and direction are real text, so a screen reader reads "28 DN". `zard-500` on `sabz-900` is high contrast.

## Example
```js
Patri.TrainBadge({ number: 28, direction: 'dn', size: 'md' });
```
The app imports it from `/js/components/index.js`.
