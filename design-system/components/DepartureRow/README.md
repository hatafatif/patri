# DepartureRow

One train on a station board or in a From → To list: expected time, train number and name, a sub line and the status.

## When to use
- Station boards and From → To trip results.

## When not to use
- Running now or search results. Use TrainRow.
- Sorting by lateness. Boards are ordered by time; status is only shown.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `href` | `string` | | Where the row links to. |
| `time` | `{ expected: string, scheduled?: string, caption?: string }` | | The expected time, such as "~1:20 PM". When `scheduled` is given and differs, it shows underneath, struck through. `caption` is a small label above the time, such as "Left" over "7:10 AM" for a train already on its way; rows without one don't change. |
| `train` | `{ number: string \| number, direction: 'up' \| 'dn', name: string }` | | Shown as "28 DN" in muted label style, then the name. |
| `sub` | `string` | | The line under the name, such as "To Karachi Cantt · 48 km away" or "Starts here → Karachi City". |
| `status` | `StatusChipProps` | | The status chip, under the sub line. |

## Behaviour
None. The row is a link.

## Urdu and right-to-left
The time column moves to the right. The direction word, name and sub line switch to the Urdu styles; the caption switches from condensed uppercase to the Urdu label style; times and numbers stay in Barlow Condensed.

## Accessibility
- The whole row is one link, at least 56px tall.
- The struck-through scheduled time has a visually hidden "Scheduled" prefix, so a screen reader doesn't read a bare second time.

## Example
```js
Patri.DepartureRow({
  href: '#/train/28dn',
  time: { expected: '~1:20 PM', scheduled: '12:50 PM' },
  train: { number: 28, direction: 'dn', name: 'Shalimar Express' },
  sub: 'To Karachi Cantt · 48 km away',
  status: { tone: 'late', text: '30 min late' },
});
// A train already on its way, with a caption over the time
Patri.DepartureRow({
  href: '#/train/27dn',
  time: { expected: '7:10 AM', caption: 'Left' },
  train: { number: 27, direction: 'dn', name: 'Karakoram Express' },
  sub: 'To Karachi Cantt',
  status: { tone: 'ontime', text: 'On time' },
});
```
The app imports it from `/js/components/index.js`.
