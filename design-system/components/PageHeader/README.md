# PageHeader

The header at the top of the Train page, the Station page and All stops: an optional back link, a train badge or station mark, the name with its Urdu twin, a subtitle, and the follow and share actions.

## When to use
- At the top of the Train page: badge, train name, route, follow and share.
- At the top of the Station page: the station mark, station name, its city, follow and share.
- At the top of All stops: a back link, "All 16 stops" and the train it belongs to.

## When not to use
- For the bar above the page that holds the logo and language switch. Use AppBar.
- For a heading above a block of content. Use SectionHeader.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `leading` | `{ badge: TrainBadgeProps } \| { icon: 'pin' }` | none | A TrainBadge, shown at the size in its props (`md`, 54px, by default), or the station mark: a 50px circle with a `zard-500` ring, the pin in `sabz-700`. Optional; All stops has none. |
| `title` | `string` | | The English name. It is the `<h1>` in title style. |
| `titleUr` | `string` | none | The Urdu name. On its own line under the title in the Urdu body style, start-aligned with it. |
| `subtitle` | `string` | none | A caption line in `ink-muted`, such as "Lahore Jn → Karachi Cantt" or "Multan". |
| `actions` | `({ kind: 'follow', followed, name, label? } \| { kind: 'share', label } \| { kind: 'back', href, label })[]` | `[]` | `back` renders at the start, before the leading element, as a plain IconButton link. `follow` (a FollowButton) and `share` (an IconButton) render at the end, in the order given. A follow action's optional `label: { off, on }` replaces its aria-label, such as `{ off: 'Save Multan Cantt', on: 'Saved' }` on a station. |

All text arrives already localised.

## Behaviour
`bindPageHeader(root, { onFollow, onShare })` returns `unbind()`.
- The follow star toggles by itself, then calls `onFollow(followed, button)`. Saving is the view's job.
- `onShare(button)` is called when the share button is clicked.
- `root` can be the header itself or any ancestor. Only stars inside a `.p-pageheader` are handled, so other FollowButtons in the same root keep their own bind. The headers can be re-rendered without binding again.
- The header handles its own star and stops that click there, so a `bindFollowButton` on an ancestor never flips the same star a second time.

## Urdu and right-to-left
- In English, the Urdu name is a `<span lang="ur" dir="rtl">` inside a block that keeps the page direction, so it sits at the same left edge as the English title.
- When the whole interface is Urdu and `titleUr` is given, the Urdu name becomes the `<h1>` in the Urdu title style, and the English name moves to the second line (`lang="en" dir="ltr"`, a Latin style, start-aligned).
- The back arrow flips, the back link moves to the right, and the actions move to the left. The subtitle switches to the Urdu label style.
- Names that can mix scripts are isolated, so numbers stay left to right.

## Accessibility
- The header is a `<header>`; the name is the page's `<h1>`.
- Back is a real link and share a real button, both 44px with an `aria-label`. The follow star keeps its `aria-pressed` and "Follow {name}" label.
- The station mark is decorative (`aria-hidden`); the name carries the meaning.
- Long names wrap inside the text block, and the actions never shrink.

## Example
```js
const root = document.querySelector('#page');
root.innerHTML = Patri.PageHeader({
  leading: { badge: { number: 28, direction: 'dn' } },
  title: 'Shalimar Express',
  titleUr: 'شالیمار ایکسپریس',
  subtitle: 'Lahore Jn → Karachi Cantt',
  actions: [{ kind: 'follow', followed: true, name: 'Shalimar Express' }, { kind: 'share', label: 'Share' }],
  // station: { kind: 'follow', followed: false, name: 'Multan Cantt', label: { off: 'Save Multan Cantt', on: 'Saved' } }
});
const unbind = Patri.bindPageHeader(root, { onFollow: (followed) => save(followed), onShare: () => share() });
```
The app imports it from `/js/components/index.js`.
