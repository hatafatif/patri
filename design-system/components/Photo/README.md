# Photo

A picture with a credit line under it.

## When to use
- For the train's photo in About this train, and the city photo on the Station page.

## When not to use
- For icons or logos.
- For a photo that isn't freely licensed or can't be credited. Show nothing instead.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `src` | `string` | `''` | The image URL. |
| `alt` | `string` | `''` | What the photo shows, for screen readers. |
| `credit` | `string` | `''` | Already localised, such as "Photo: A. Khan · CC BY-SA 4.0". Left out of the markup when empty. |
| `href` | `string` | none | The photo's source page. The credit links to it, opening in a new tab. |
| `className` | `string` | none | Extra classes, so a composing component can hook its own styles. |

## Behaviour
- Loads lazily, and reserves its 16:9 box so nothing shifts.
- The credit link opens in a new tab with `rel="noopener"`.

## Urdu and right-to-left
The credit switches to `urdu-caption` when the page language is Urdu. It is wrapped in `<bdi>`, so a Latin author name inside an Urdu line keeps its direction.

## Accessibility
- A `<figure>` with a `<figcaption>`.
- Give a meaningful `alt`. The credit link has a visible focus ring.

## Example
```js
Patri.Photo({ src: '/photos/28.jpg', alt: 'Shalimar Express at Lahore', credit: 'Photo: A. Khan · CC BY-SA 4.0', href: 'https://commons.wikimedia.org/wiki/File:Example.jpg' });
```
The app imports it from `/js/components/index.js`.
