# SectionHeader

The label above a list, such as "MY TRAINS · 2", with an optional action and an optional rule underneath.

## When to use
- Above every list: My trains, Running now, stops.
- Inside a Card, where Card renders it for you from its `header`.

## When not to use
- For a page title.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | none | Already localised. Rendered as an `<h2>` in label style. |
| `count` | `number \| string` | none | Shown after the label as "· 2". |
| `action` | `{ label: string, href: string }` | none | A link at the end of the row, such as "Edit". Label style, sabz-700. |
| `ruled` | `boolean` | `false` | Adds a 2px `rule` line underneath. |

## Behaviour
None.

## Urdu and right-to-left
- The label and action switch to the Urdu label style, without capitals.
- The count stays in Latin digits inside `<bdi>`. The action moves to the left edge in Urdu.

## Accessibility
- The label is a real `<h2>`; the action is a real `<a href>`.
- The action has a 44px hit area that does not make the row taller.

## Example
```js
Patri.SectionHeader({ label: 'My trains', count: 2, action: { label: 'Edit', href: '#/' } });
Patri.SectionHeader({ label: 'Running now', count: 54, ruled: true });
```
The app imports it from `/js/components/index.js`.
