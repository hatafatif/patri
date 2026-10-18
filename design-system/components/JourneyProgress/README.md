# JourneyProgress

A thin bar showing how far along the route the train is, with a start label and an end label below it.

## When to use
- On the train page, under the status, to show how much of the journey is done.

## When not to use
- For a station's own progress or for time-based progress.
- To show lateness. It shows distance only.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `fraction` | `number` | `0` | 0 to 1. Values outside the range are clamped. |
| `start` | `string` | | Already localised, such as "Left Lahore Jn 7:10 AM". |
| `end` | `string` | | Already localised, such as "305 of 1,165 km". Also the bar's `aria-valuetext`. |
| `className` | `string` | none | Extra classes for a composing component. |

## Urdu and right-to-left
The fill grows from the start side, so it runs from the right in Urdu. The start label sits at the start and the end label at the end. Both labels are isolated with `<bdi>` so times and numbers keep their order. In Urdu they switch to the Urdu label style.

## Accessibility
- The 8px track is `role="progressbar"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow` (a rounded percentage) and `aria-valuetext` (the end label), and the aria-label "Journey progress".
- The labels are `ink-muted` text, which meets 4.5:1 on the page.

## Example
```js
Patri.JourneyProgress({ fraction: 305 / 1165, start: 'Left Lahore Jn 7:10 AM', end: '305 of 1,165 km' });
```
The app imports it from `/js/components/index.js`.
