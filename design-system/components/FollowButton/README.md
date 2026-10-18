# FollowButton

The star that adds a train to My trains.

## When to use
- Beside a train in a list (TrainRow) or in a train page header, so a rider can follow it.

## When not to use
- For other toggles. Use IconButton with `pressed` directly.
- Inside a link. Render it as a sibling of the link.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `followed` | `boolean` | `false` | Whether the train is followed. Sets `aria-pressed` and the filled star. |
| `name` | `string` | | The train's name, already localised. Used in the aria-label, "Follow Shalimar Express". |
| `label` | `{ off: string, on: string }` | none | Overrides the aria-label: `off` while not followed, `on` while followed, such as `{ off: 'Save Multan Cantt', on: 'Saved' }` for stations. Without it the label is "Follow {name}". |

## Behaviour
`bindFollowButton(root, { onToggle(followed, button) })` listens for clicks on `.p-followbutton` inside `root` (or on `root` itself). It flips `aria-pressed`, swaps the star icon (and the aria-label, when `label` was given; both labels are kept on the button as `data-label-off` and `data-label-on`), then calls `onToggle` with the new state and the button element. The view saves the change (localStorage `myTrains`). Use the button to find which row was toggled, for example `button.closest('.p-trainrow')`. It returns an `unbind()` function.

## Urdu and right-to-left
The default label comes from `t('follow')`, in Urdu "{name} کو فالو کریں"; a custom `label` arrives already localised. The star is symmetric, so nothing mirrors.

## Accessibility
- A real `<button>` with `aria-pressed` and an `aria-label` that names the train.
- 44×44px tap target and the shared focus ring.
- The filled star is `sabz-700`; the empty one is `ink-muted`. State is not shown by colour alone: the star shape changes too.

## Example
```js
Patri.FollowButton({ followed: false, name: 'Shalimar Express' });
Patri.FollowButton({ followed: false, name: 'Multan Cantt', label: { off: 'Save Multan Cantt', on: 'Saved' } });
Patri.bindFollowButton(list, { onToggle: (followed, button) => save(followed, button) });
```
The app imports these from `/js/components/index.js`.
