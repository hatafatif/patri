# IconButton

A 44×44 icon-only control, plain, outlined or floating over the map, that always carries an accessible label.

## When to use
- A compact action whose icon is unmistakable: swap From and To, zoom in, share, close.
- Map controls, with the `float` variant, so they stay legible on any base map.
- As the base of other components: FollowButton and the StationFields swap are IconButtons.

## When not to use
- When the action needs words to be understood. Use **Button**.
- For the "Following" pill on the map. Use **MapToggle**.
- For following a train. Use **FollowButton**, which handles the star and its label.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `icon` | `string` | none | A key in the icon set in `_shared.js`: `train`, `station`, `trip`, `search`, `share`, `pin`, `check`, `swap`, `chevron`, `chevronEnd`, `back`, `close`, `star`, `starFilled`, `plus`, `minus`, `layers`, `locate`, `stop`, `clock`, `flag`, `signalOff`. |
| `label` | `string` | none | Required, already localised. Becomes the `aria-label`. |
| `variant` | `'plain' \| 'outline' \| 'float'` | `'plain'` | `plain` has no border. `outline` has a 1.5px `line` border on `surface`. `float` is `surface` with `shadow-float`, for use over the map. |
| `text` | `boolean` | `false` | Also shows the label as visible text after the icon, as a pill. The visible text names the control, so the `aria-label` is dropped. Use with `float` over a map, such as the phone "← HOME" pill. |
| `pressed` | `boolean` | none | For toggles only: sets `aria-pressed`. A pressed button draws its icon in `sabz-700`. |
| `href` | `string` | none | Renders an `<a>` instead of a `<button>`. |
| `className` | `string` | none | Extra classes, so a composing component can hook its own styles and behaviour. |

## Behaviour
None of its own. The component that uses it binds the click: for example, `bindStationFields` handles the swap.

## Urdu and right-to-left
- The `back` and `chevronEnd` icons point along the reading direction and mirror automatically under `dir="rtl"`.
- Other icons don't mirror.
- Pass a localised `label`.

## Accessibility
- A real `<button type="button">`, or an `<a>` when there's an `href`.
- `label` is required and becomes the accessible name (the visible text, with `text`).
- It is always 44×44 and shows the 3px `focus` ring on keyboard focus.

## Example
```js
Patri.IconButton({ icon: 'swap', label: 'Swap From and To', variant: 'outline' });
Patri.IconButton({ icon: 'plus', label: 'Zoom in', variant: 'float' });
Patri.IconButton({ icon: 'back', label: 'Home', variant: 'float', text: true, href: '#/' });
```
In the app: `import { IconButton } from '/js/components/index.js'`.
