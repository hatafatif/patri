# TrainCard

One card in My trains on Home: the badge, the train's name and position, the rider's own stop, and its status.

## When to use
- For each followed train in the My trains list on Home.

## When not to use
- In long lists or search results. Use TrainRow.
- When a button is needed inside. The whole card is one link.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `href` | `string` | | Where the card links to. |
| `badge` | `TrainBadgeProps` | | Number and direction. It always shows at the `md` size. |
| `name` | `string` | | The train's name. |
| `position` | `string` | | Where it is, such as "Sahiwal → Multan Cantt" or "Stopped · Lahore Jn". |
| `yourStop` | `{ name: string, time: string }` | | Adds "Your stop · Multan Cantt · 1:20 PM" in the time style. |
| `status` | `StatusChipProps` | | The status chip, top-aligned at the end of the card. |

## Behaviour
None. The card is a link; hover tints the border `sabz-700`. There is no shadow.

## Urdu and right-to-left
The badge moves to the right and the status to the left. The name uses the Urdu body style and the captions the Urdu label style; times stay in Barlow Condensed.

## Accessibility
- A real `<a>`, so the whole card is one tab stop with a visible focus ring.
- The card is well over 44px tall.
- The text inside is plain, so the link reads as name, position, your stop and status.

## Example
```js
Patri.TrainCard({
  href: '#/train/28dn',
  badge: { number: 28, direction: 'dn' },
  name: 'Shalimar Express',
  position: 'Sahiwal → Multan Cantt',
  yourStop: { name: 'Multan Cantt', time: '1:20 PM' },
  status: { tone: 'late', text: '30 min late' },
});
```
The app imports it from `/js/components/index.js`.
