# Button

The text button: `primary` for the screen's main action, `secondary` next to it, and `link` for inline actions such as "Change".

## When to use
- `primary`: one per screen or card, for the main action, such as "See all stops".
- `secondary`: an alternative beside a primary, or a quieter action, such as "Choose your stop".
- `link`: an inline action inside text or a row, such as "Change" in the your-stop row of the StopTimeline.

## When not to use
- For icon-only controls. Use **IconButton**.
- For a choice between options. Use **SegmentedControl**.
- For a whole row that navigates. Use **LinkRow**, or the row component itself.
- For on/off state. Use **MapToggle** or **FollowButton**.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | none | Already localised. |
| `href` | `string` | none | Renders an `<a>` instead of a `<button>`. |
| `variant` | `'primary' \| 'secondary' \| 'link'` | `'primary'` | `primary` is a `sabz-700` fill with white label-style text, 48px tall. `secondary` is `surface` with a 1.5px `sabz-700` border and `sabz-700` text. `link` is underlined inline text with a 44px hit area that doesn't change the layout. |
| `icon` | `string` | none | A trailing icon key, usually `chevronEnd`, which flips in right-to-left. |
| `full` | `boolean` | `false` | Stretches the button to the full width of its container. |
| `className` | `string` | none | Extra classes, so a composing component can hook its own styles and behaviour. |

## Behaviour
- None of its own: a view or a composing component handles the click.
- A link-variant Button inside a dark row, like the your-stop row, takes that row's colour from the row's CSS.

## Urdu and right-to-left
- `primary` and `secondary` labels switch from condensed uppercase to the `urdu-label` style: Nastaliq, no capitals, one size up.
- The `chevronEnd` icon mirrors.
- `link` inherits the surrounding font.

## Accessibility
- A real `<button type="button">`, or an `<a>` when there's an `href`.
- `primary` and `secondary` are 48px tall. `link` gets an invisible 44px hit area.
- Every variant shows the 3px `focus` ring on keyboard focus.

## Example
```js
Patri.Button({ label: 'See all stops', href: '#/train/28/stops', icon: 'chevronEnd', full: true });
Patri.Button({ label: 'Choose your stop', variant: 'secondary' });
Patri.Button({ label: 'Change', variant: 'link' });
```
In the app: `import { Button } from '/js/components/index.js'`.
