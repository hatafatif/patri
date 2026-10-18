# DetailGrid

Key and value facts about a train, in a two-column grid.

## When to use
- In "About this train": number, route, distance, when it runs and when it departs.

## When not to use
- For a list of stops: use StopTimeline.
- For a single fact with an action: use LinkRow.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `{ label: string, value: string, lang?: 'ur' }[]` | `[]` | Already localised. One cell per item. |
| `className` | `string` | none | Extra classes for a composing component. |

## Urdu and right-to-left
- On an Urdu page the grid mirrors, and labels and values use the Urdu styles.
- A value with `lang: 'ur'` renders as `<dd lang="ur" dir="rtl">` in Nastaliq, even on an English page, so a train's Urdu name reads correctly. The cell still starts at the same edge as its label.
- Other values are wrapped in `<bdi>`, so times and numbers keep their order.

## Accessibility
- A real description list: `<dl>` with a `<dt>` and `<dd>` in each cell.
- Labels are `ink-muted` captions, which meet 4.5:1 on the surface.

## Example
```js
Patri.DetailGrid({ items: [
  { label: 'Number', value: '28 DN' },
  { label: 'Route', value: 'Lahore Jn → Karachi Cantt' },
  { label: 'Distance', value: '1,165 km' },
  { label: 'Urdu name', value: 'شالیمار ایکسپریس', lang: 'ur' },
] });
```
The app imports it from `/js/components/index.js`.
