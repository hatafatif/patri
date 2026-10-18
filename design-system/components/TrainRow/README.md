# TrainRow

A compact row for Running now and search results: small badge, name, sub line and status, with an optional follow star.

## When to use
- Lists of many trains: Running now and train search results.

## When not to use
- On Home's My trains list. Use TrainCard.
- On a station board. Use DepartureRow.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `href` | `string` | | Where the row links to. |
| `badge` | `TrainBadgeProps` | | Number and direction. It always shows at the `sm` size. |
| `name` | `string` | | The train's name. |
| `sub` | `string` | | The line under the name, such as "Lahore Jn → Karachi Cantt". |
| `status` | `StatusChipProps` | | The status chip, at the end of the link. |
| `match` | `string` | | Search text. Each word found in the name or sub line is wrapped in `<mark>` (escaped, case-insensitive). |
| `follow` | `{ followed: boolean }` | | Adds a FollowButton beside the link. |

## Behaviour
Wire the star with `bindFollowButton(list, { onToggle(followed, button) })`. The button is a sibling of the link, never inside it. Use `button.closest('.p-trainrow')` to find the toggled row.

## Urdu and right-to-left
The row mirrors: the badge at the right, the star at the left. The name uses the Urdu body style and the sub line the Urdu label style.

## Accessibility
- The link area is at least 56px tall; the star is a 44px target.
- A button inside a link is invalid, so the star is a separate focus stop.
- `<mark>` is announced by some screen readers as highlighted text; it only repeats the visible name.

## Example
```js
Patri.TrainRow({
  href: '#/train/28dn',
  badge: { number: 28, direction: 'dn' },
  name: 'Shalimar Express',
  sub: 'Lahore Jn → Karachi Cantt',
  status: { tone: 'late', text: '30 min late' },
  match: 'shal',
  follow: { followed: false },
});
```
The app imports it from `/js/components/index.js`.
