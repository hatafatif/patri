# Card

A bordered surface that holds a block of content, with an optional ruled header.

## When to use
- For a self-contained block on a screen: Right now (key tone), About this train (plain tone).

## When not to use
- To hold a whole screen. Use Panel.
- For rows in a list. Use the row components.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `body` | `string` | `''` | An HTML string, inserted as-is. |
| `header` | `string` | none | A label. Renders a SectionHeader with a 2px rule inside the top of the card. Already localised. |
| `tone` | `'plain' \| 'key'` | `'plain'` | plain has a 1px `line` border. key has a 1.5px `sabz-700` border; use it for the Right now card. |

## Behaviour
None.

## Urdu and right-to-left
Nothing to switch in the card itself. The header follows SectionHeader, and the body follows its own content.

## Accessibility
- A `<section>`. The header is an `<h2>` from SectionHeader.
- Padding is 12px, or 16px when the card is wider than 480px. The card is a size container, so give it a block or grid parent with a width, not a flex row that sizes it from its content.

## Example
```js
Patri.Card({ header: 'Right now', tone: 'key', body: '<p>Running at 105 km/h near Sahiwal</p>' });
```
The app imports it from `/js/components/index.js`.
