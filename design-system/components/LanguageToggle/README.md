# LanguageToggle

The EN / اردو switch: two buttons, the active one filled sabz-700.

## When to use
- In the AppBar, to switch the app between English and Urdu.

## When not to use
- For any other two-way choice. Use SegmentedControl.

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `lang` | `'en' \| 'ur'` | `'en'` | The active language. |

## Behaviour
`bindLanguageToggle(root, { onChange(lang) })`
- Clicking the inactive button updates `aria-pressed` on both buttons at once, then calls `onChange('en' | 'ur')`.
- Clicking the active button does nothing.
- Returns `unbind()`.

## Urdu and right-to-left
- The اردو button is always in Nastaliq, even on an English page. The EN button stays in Barlow Condensed, even on an Urdu page.
- The two buttons swap sides in right-to-left.

## Accessibility
- A `role="group"` labelled with `t('language')`, holding two `<button type="button">` elements with `aria-pressed`.
- The EN button has `lang="en"` and `aria-label="English"`; the اردو button has `lang="ur"`.
- Each button is at least 44px tall.

## Example
```js
const root = document.querySelector('#bar');
root.innerHTML = Patri.LanguageToggle({ lang: 'en' });
Patri.bindLanguageToggle(root, { onChange: lang => setLang(lang) });
```
The app imports it from `/js/components/index.js`.
