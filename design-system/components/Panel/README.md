# Panel

The single container for screen content: a bottom sheet over the map on phones, a 440px left sidebar on the web.

## When to use
- Every screen. Put the screen's content in `body`.

## When not to use
- For a card inside a screen. Use Card.

## Host contract
The panel is `position: absolute` inside its host. The host must be:
- `position: relative`,
- `container-type: inline-size`, and
- given a definite height.

In the app that host is the app root. The layout switches on the **host's** width with `@container (min-width: 940px)`, not on the window width, so a 390px frame and a wide frame can sit side by side (as in the gallery).

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `body` | `string` | `''` | An HTML string, inserted as-is. |
| `snap` | `'down' \| 'half' \| 'full'` | `'half'` | The sheet's starting height. Ignored in the sidebar. |
| `label` | `string` | `''` | The accessible name of the panel. Already localised. |
| `back` | `{ href, label }` | none | A back link at the inline-start of the sheet's top bar, beside the handle. The bar never scrolls, so the link stays visible at every snap and scroll. Phone sheet only. |

## Layout
- **Sheet (host under 940px):**
  - Anchored to the bottom, with `radius-sheet` top corners, `shadow-sheet` and a 2px `rule` top border.
  - A 44px handle with a 40x4 bar sits above a body that scrolls on its own.
  - Snap heights work in CSS without JavaScript: down is 150px, half is 55% of the host, full is the host minus 8px.
- **Sidebar (host 940px and up):** 440px wide at the inline start, full height, with a 1.5px `line` end border. No radius or shadow. The handle is hidden, the body scrolls on its own, and `data-snap` is ignored. A nested AppBar becomes 64px tall.

## Behaviour
`bindPanel(root, { onSnap(snap) })`
- Drag the handle to resize. It follows the pointer, clamped between 150px and the host height minus 8px. On release it snaps to the nearest of down, half and full.
- A tap on the handle, or Enter or Space, cycles down, half, full, then down again. A click right after a real drag is ignored.
- ArrowUp and ArrowDown step up and down through the snaps.
- `onSnap(snap)` is called every time the snap changes.
- It sets `--panel-visible` on `<html>` to the panel's visible height in pixels (the sheet's height, or `0px` in sidebar mode). It updates on bind, on every snap and drag move, and when the host is resized. **The map must fit its content into the area above the panel using this value.**
- Returns `unbind()`, which removes the listeners and the ResizeObserver.

## Urdu and right-to-left
The sidebar sits at the inline start, so it moves to the right in Urdu. The sheet is symmetric.

## Accessibility
- The panel is a `<section>` named by `label`. The handle is a real `<button>` with `aria-label="Resize panel"` (from `t('panelHandle')`) and a visible focus ring.
- It can be used with the keyboard alone: Enter, Space and the arrow keys.
- The height change is a short transition, which is turned off for reduced motion.

## Example
```js
host.innerHTML = Patri.Panel({ label: 'Right now', snap: 'half', body: '<p>Running at 105 km/h near Sahiwal</p>' });
const unbind = Patri.bindPanel(host, { onSnap: snap => console.log(snap) });
```
`host` is positioned and a size container, as above. The app imports it from `/js/components/index.js`.
