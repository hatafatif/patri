# Patri components

The registry of every frontend component. **Build UI only from these.** If none fits, stop and ask the user before adding one (see `CLAUDE.md`).

- **Look:** Sabz, Pakistan Railways green and yellow in a flat timetable style.
- **Tokens:** `design-system/tokens.json`, compiled to `public/css/tokens.css`.
- **Library page:** the "Patri Components" design system, https://claude.ai/artifact/4ApeuZwGi3rveuSHQD9VUf
- **In-app gallery:** `/components.html` when the local server is running.

## Conventions every component follows

**Files**
- Each component is one ES module, `public/js/components/<Name>.js`.
- It exports `export function <Name>(props)`, which returns an HTML string; the app's views already build HTML as strings.
- If the component has behaviour, the module also exports `bind<Name>(root, handlers)`, which returns an `unbind()` function.
- `public/js/components/index.js` re-exports everything. It is the registry: a component isn't real until it's listed there and here.
- Shared helpers live in `public/js/components/_shared.js`: escaping (re-exported from `i18n.js`), the icon set, `highlight` (for TrainRow's search marks) and `statusTone`. Import them from there, never copy them; there is no `ui.js` dependency any more.

**Text and localisation**
- Text props arrive already localised; views call `t()`.
- Components may call `t()` only for their own fixed words, such as "Following", "Change" and aria-labels. Add those keys to `i18n.js` in **both** `en` and `ur`.
- Escape every text prop with `esc()`. Wrap names and numbers that can mix scripts in `bdi()`.

**Styling**
- Styles go in `public/css/components.css`, one block per component, using classes only.
- Classes are prefixed `p-` and use BEM: `.p-traincard`, `.p-traincard__name`, `.p-traincard--compact`.
- Use **tokens only**, as `var(--…)`: no raw colours, sizes or font names in component CSS. Layout lengths and the 44px tap size (`var(--tap)`) are the exception.

**Urdu and right-to-left**
- When `<html lang="ur" dir="rtl">` is set:
  - Every condensed uppercase label switches to the `urdu-label` style: Nastaliq, no `text-transform`, one size up, line-height 2 or more.
  - Names use `urdu-body` and `urdu-title`.
  - Times and numbers stay Latin digits in Barlow Condensed inside `<bdi>`.
- Use logical properties (`margin-inline-start`, `inset-inline-end`, `padding-inline`) so layouts mirror. Chevrons and arrows flip.

**Accessibility**
- Use real `<button>` and `<a href>` elements. Every icon-only control has an `aria-label`.
- Tap targets are at least 44px.
- `:focus-visible` shows a 3px `var(--focus)` ring.
- Text contrast is at least 4.5:1; the token notes give the ratios.
- Respect `prefers-reduced-motion`.

**Status**
- `statusTone(lateMin, { gps })` lives in `_shared.js` and is the only place that decides a status:
  - `nogps` when `gps === false` or `lateMin == null`;
  - `early` when `lateMin <= -1`;
  - `ontime` when `lateMin <= 15`;
  - `late` otherwise.
- Patri never filters or sorts trains by lateness. Status is shown, not used as a control.

## Registry

| # | Component | Kind | Used on |
|---|---|---|---|
| 1 | AppBar | shell | Home (phone), sidebar header (web) |
| 2 | LanguageToggle | shell | AppBar |
| 3 | LiveIndicator | shell | AppBar |
| 4 | Panel | shell | every screen: phone sheet, web sidebar |
| 5 | SearchField | input | Home, Search |
| 6 | SegmentedControl | input | Search (Search / Plan a trip) |
| 7 | StationFields | input | Search From → To |
| 8 | IconButton | input | everywhere |
| 9 | FollowButton | input | Train page, search results |
| 10 | MapToggle | input | Train page map ("Following") |
| 11 | TrainBadge | data | cards, rows, Train page |
| 12 | StatusChip / StatusStrip | data | everywhere a train appears |
| 13 | TrainCard | data | Home: My trains |
| 14 | TrainRow | data | Home: Running now, Search results |
| 15 | DepartureRow | data | Station page, From → To |
| 16 | StopTimeline | data | Train page (Right now), All stops |
| 17 | JourneyProgress | data | Train page |
| 18 | SectionHeader | data | every list |
| 19 | DetailGrid | data | Train page: About this train |
| 20 | LinkRow | data | Train page: Return train |
| 21 | SpeedChart | data | Train page (phone: panel; web: docked on the map) |
| 22 | MapMarkers | map | Home and Station map, Train map |
| 23 | Button | input | See all stops, Choose your stop, Change |
| 24 | Card | shell | Right now, About this train |
| 25 | PageHeader | shell | Train page, Station page, All stops |
| 26 | Photo | data | Train page: About this train; Station page |
| 27 | ReplayBar | input | Train page › Journey replay |

## Specs

Example data throughout is real: 28 DN Shalimar Express, Lahore Jn → Karachi Cantt.

### 1. AppBar
**What it is:** the top bar on Home, and the header of the web sidebar.
**Props:**
- `live`: `'on' | 'reconnecting' | 'off'`.
- `lang`: `'en' | 'ur'`.
- `back?`: `{ href, label }`. When present, a back link replaces the logo (sidebar header on the Train and Station pages).
**Parts:**
- The logo, `.p-appbar__logo`: an `<img src="brand/patri-logo.svg" alt="Patri">`, about 132×44 on phone. This is the bilingual "Rail line" lockup, PATRI ◆ پٹڑی on one track, and it doesn't mirror in Urdu. Never redraw it or put it inline. The files in `public/brand/` are the logo, `-reversed` for green backgrounds, `patri-icon.svg` and `patri-favicon.svg`. They're generated by `design-system/logo/compose.py`.
- LiveIndicator, then LanguageToggle, end-aligned.
**Look:** `surface` background with a 2px `rule` bottom border. Height 56px on phone, 64px in the sidebar. Inside the web sidebar (`.p-panel .p-appbar`) it is `position: sticky` at the top, so the back link stays visible while the panel body scrolls. No pink, no scallops.

### 2. LanguageToggle
**What it is:** EN / اردو switch.
**Props:** `lang`.
**Markup:** two `<button aria-pressed>`. The active one is filled `sabz-700` with white text.
**Behaviour:** `bindLanguageToggle(root, { onChange(lang) })`.
**Look:** the اردو label is always in Nastaliq.

### 3. LiveIndicator
**What it is:** an 8px dot plus "Live" or "Reconnecting".
**Props:** `state`.
**States:** on: a `sabz-700` dot; reconnecting: a `zard-500` dot with "Reconnecting"; off: hidden.
**Accessibility:** `aria-live="polite"`.

### 4. Panel
**What it is:** the single container for screen content.
**Props:**
- `body`: an HTML string.
- `snap`: `'down' | 'half' | 'full'`. Default `'half'`.
- `label`: the accessible name.
**Phone (under 940px):** a bottom sheet over the map.
- Top corners `radius-sheet`, `shadow-sheet`, and a 2px `rule` top border.
- A handle `<button class="p-panel__handle" aria-label="…">`, 44px tall, with a 40×4 bar.
- Snap heights: down shows 150px; half covers 55% of the viewport; full covers everything except 8px at the top. A screen can raise that gap with the CSS variable `--panel-top-gap` (the Home/Back pill does, 68px); `bindPanel` reads it too.
**Web (940px and up):** a fixed left sidebar, 440px wide.
- The handle is hidden. The body scrolls on its own. It has a 1.5px `line` end border.
**Behaviour:** `bindPanel(root, { onSnap(snap) })`.
- Pointer drag with snapping. Handle tap and Enter cycle the snaps; ArrowUp and ArrowDown step through them.
- On every change it sets the CSS variable `--panel-visible` on `<html>` to the panel's visible pixel height. **The map must fit its content into the area above the panel using this value.** This fixes the empty home map on phones.

### 5. SearchField
**What it is:** the search box for a train name, number, station or city.
**Props:** `value`, `placeholder`, `route?: { href, label }`. With `route`, a "From → To" button sits beside the field.
**Markup:** `<label>` wrapping the magnifier icon and `<input type="search">`, plus a clear `<button>` when there's a value. Height 52px, 1.5px `ink` border, `radius-md`.
**Behaviour:** `bindSearchField(root, { onInput, onClear })`.

### 6. SegmentedControl
**What it is:** a choice between 2 or 3 options.
**Props:** `options: [{ value, label, href? }]`, `value`, `label`.
**Markup:**
- `<a aria-current>` when options are routes, `<button aria-pressed>` when they're local.
- Height 44px, 1.5px `sabz-700` border.
- Active: `sabz-700` fill, white label text in label style.

### 7. StationFields
**What it is:** the From and To pickers with a swap button.
**Props:** `from`, `to` (station label or null), `fromLabel`, `toLabel`.
**Markup:**
- Two stacked `<button>`s, 52px each, each with a small FROM or TO label and the station name or a muted placeholder.
- An IconButton with the swap icon.
**Behaviour:** `bindStationFields(root, { onPickFrom, onPickTo, onSwap })`.

### 8. IconButton
**What it is:** a 44×44 icon control.
**Props:** `icon` (a key in the icon set), `label` (required, becomes the aria-label), `variant`, `text?`, `pressed?`, `href?`.
**Variants:**
- `plain`: no border.
- `outline`: 1.5px `line` border on `surface`.
- `float`: over the map; `surface` with `shadow-float`.
**Markup:** an `<a>` when there's an `href`, otherwise a `<button>`.
**`text`:** when true the label also shows as text after the icon (`.p-iconbutton--text`, a pill: `<span class="p-iconbutton__text">`, uppercase label font, Urdu label font in Urdu). The aria-label is dropped because the visible text names it. Used with `float` for the phone "← Home" / "← Back" pill on the map.

### 9. FollowButton
**What it is:** the star that adds a train to My trains.
**Props:** `followed`, `name` (used in the aria-label), `label?: { off, on }` (overrides the aria-label: `off` while not followed, `on` while followed, such as `{ off: 'Save Multan Cantt', on: 'Saved' }` for stations).
**Markup:** an IconButton with `aria-pressed`. The filled star is `sabz-700`; the empty one is `ink-muted`.
**Behaviour:** `bindFollowButton(root, { onToggle(followed) })` also swaps the aria-label when a `label` was given (both labels stay on the button as `data-label-off` and `data-label-on`). Saving is the view's job (localStorage `myTrains`).

### 10. MapToggle
**What it is:** the "Following" pill over the map.
**Props:** `on`, `label`.
**Markup:** `<button aria-pressed>`, 44px tall, `radius-md`, in label style.
**Look:** on is `sabz-700` with white text; off is `surface` with `ink` text and `shadow-float`.

### 11. TrainBadge
**What it is:** the train number badge.
**Props:** `number`, `direction: 'up' | 'dn'`, `size: 'sm' | 'md' | 'lg'` (40, 54 and 64px).
**Look:**
- A `sabz-900` square with `radius-md`.
- The number in `zard-500`, number style.
- UP or DN underneath in white, letter-spaced 0.3em, label style. In Urdu these are اپ and ڈاؤن in Nastaliq.

### 12. StatusChip and StatusStrip
**StatusChip:**
- **Props:** `tone: 'ontime' | 'late' | 'early' | 'nogps' | 'neutral'`, `text`, `dot?`.
- **Look:** `radius-sm`, label style, colours from `status-<tone>-bg` and `-fg`. `neutral` is plain `ink-muted` text, used for "Updated 1 min ago".
**StatusStrip:** the Sabz signature.
- **Props:** `running: { text }`, `delay: { tone, text }`, `updated?`.
- A pale-green running panel joined to the delay block, inside one 1.5px `sabz-700` frame.
- Example: [● RUNNING · 105 KM/H][30 MIN LATE], then "UPDATED 1 MIN AGO" in muted text.

### 13. TrainCard
**What it is:** one card in My trains on Home.
**Props:** `href`, `badge` (TrainBadge props), `name`, `position` (for example "Sahiwal → Multan Cantt" or "Stopped · Lahore Jn"), `yourStop?: { name, time }`, `status` (StatusChip props).
**Markup:** the whole card is an `<a>`. The badge sits at the start and the status at the end. The your-stop line is in time-sm style.

### 14. TrainRow
**What it is:** a compact row for Running now and search results.
**Props:** `href`, `badge`, `name`, `sub`, `status`, `match?` (the substring to highlight with `<mark>`), `follow?: { followed }`.
**Markup:** a row `<div>` containing an `<a>` and, optionally, a FollowButton as a sibling. Never put a button inside a link. Rows are divided by `line-soft`.

### 15. DepartureRow
**What it is:** one train on a station board or in a From → To list.
**Props:** `href`, `time: { expected, scheduled?, caption? }`, `train: { number, direction, name }`, `sub` (for example "To Karachi Cantt · 48 km away" or "Starts here → Karachi City"), `status`.
**Markup:** a 76px time column with the expected time in time style and, when it differs, the scheduled time struck through in time-sm `ink-muted`. `caption` adds a small label above the time, such as "Left" over "7:10 AM" for trains already on their way on From → To: label style (condensed, uppercase in English) in `ink-muted`, `urdu-label` in Urdu. Then the name with the number in muted label style, the sub line, and the status chip.

### 16. StopTimeline
**What it is:** the stops timeline. The Right now card shows the card form; the All stops page shows the full form; compact is the tight form without sub lines.
**Props:** `rows: [{ kind, name, label?, sub?, time?: { expected, scheduled? }, countdown?, href?, change? }]`, `mode: 'compact' | 'full' | 'card'` (card is the Right now form: a label over each name, heading-size names, sub lines shown; `label` is a short already-localised label above the name such as "Next stop", shown whenever given, in muted uppercase label style, `urdu-caption` in Urdu), `legend?: boolean` (an "expected · scheduled" key above the rows, at the end edge over the time column: "expected" in the expected-time look, then "scheduled" struck through in `ink-muted`; decorative, `aria-hidden`; used on All stops).
**Row kinds:**
- `passed`: `ink-passed` text with a filled `ink-passed` dot.
- `train`: "TRAIN HERE · 27 KM TO MULTAN CANTT" in label style, `sabz-700`, with the yellow train marker dot (a `zard-500` fill and a `sabz-900` ring).
- `next`: a `zard-100` row background and a ring dot.
- `yourstop`: the row is inverted, `sabz-900` with white text, the time in `zard-500`, and a "Change" Button (link variant) in `zard-500`.
- `stop`: a plain upcoming stop.
- `more`: a collapsed "8 more stops" link.
- `final`: a square end marker.
**Look:** rows are at least 46px high (64px in card mode, with more padding), divided by `line-soft`. Times are tabular.
**Behaviour:** `bindStopTimeline(root, { onChangeStop })`.

### 17. JourneyProgress
**What it is:** how far along the route the train is.
**Props:** `fraction` (0 to 1), `start` ("Left Lahore Jn 7:10 AM"), `end` ("305 of 1,165 km"), `train?` (draw the little locomotive on the bar), `moving?` (a gentle chug while the train runs).
**Train:** with `train`, the locomotive (`trainIcon` in `_shared.js`, styled by `.p-train`) rides the bar with its nose at the progress point, clamped so it stays inside the card. The fill and the train ease to a new position over 900ms and both animate in once when the page opens. With `moving` the train bobs 1.5px every 650ms. In Urdu the train is mirrored to face left. Both animations are off under `prefers-reduced-motion`.
**Markup:** `role="progressbar"` with `aria-valuenow`. An 8px `sabz-100` track with a `sabz-700` fill. The labels below are in time-sm style, `ink-muted`.

### 18. SectionHeader
**What it is:** the label above a list.
**Props:** `label`, `count?`, `action?: { label, href }`, `ruled?`.
**Markup:** an `<h2>` in label style. `ruled` adds the 2px `rule` underneath.
**Example:** "MY TRAINS · 2" with an "Edit" action.

### 19. DetailGrid
**What it is:** key/value facts about a train.
**Props:** `items: [{ label, value, lang?, sub?, tone?, wide? }]`, `size?: 'md' | 'lg'` (default `'md'`). `sub` is a small `ink-muted` caption line under the value; `tone` (`'ontime' | 'late' | 'early' | 'nogps'`) colours the value like a status; `wide` makes the item span both columns.
**Markup:** a two-column `<dl>` grid. The label is a small `ink-muted` caption and the value is body-strong. A value with `lang: 'ur'` renders in Nastaliq. `size: 'lg'` (class `p-detailgrid--lg`) shows big figures: uppercase label over a title-size value, with more row gap. Used for the Train page's Current status.

### 20. LinkRow
**What it is:** a full-width link row, such as Return train → 27 UP Shalimar Express.
**Props:** `href`, `eyebrow`, `label`.
**Markup:** an `<a>` at least 56px tall, with a 1.5px `line` border, `radius-md`, and a chevron that flips in right-to-left.

### 21. SpeedChart
**What it is:** the train's speed since it left.
**Props:** `points: [[ms, kmh]]`, `stops: [{ ms, name }]`, `now`, `title?` (replaces the default heading "Speed today", such as "Speed so far"), `stats?: boolean` (default `true`; `false` hides the average and top speed). Average and top are only ever worked out from the real points passed in; with fewer than two points the chart shows its empty message and no stats.
**Look:**
- Inline SVG. The line is `sabz-700`, the area fill is `sabz-100`, and the grid is `line-soft`.
- Stop marks are dashed `line`. The "now" point is a `zard-500` dot with a `sabz-900` ring.
- Axis labels are in time-sm style.
**Behaviour:** `bindSpeedChart(root, points)` adds a hover or tap readout. Port the existing `chart.js` logic into the component; don't keep two charts.

### 22. MapMarkers
**What it is:** everything drawn on the map. The map is MapLibre in `public/js/map.js`.
**Exports:**
- `trainMarker({ label, facing?, stale? })`: `facing` is `'left'` or `'right'` (default) and mirrors the locomotive. `stale: true` adds `p-trainmarker--stale` (its badge and label at opacity .55): the train is drawn where it was last seen, not where it is. a DOM-marker HTML string. A 40px `zard-500` badge with a 3px `sabz-900` ring and a halo, holding the little green locomotive (`trainIcon`, 28px wide), plus a `sabz-900` label with `zard-500` text ("28 DN · 105 km/h").
- `mapLabel({ title, sub?, kind: 'next' | 'yourstop' | 'selected' | 'hover' })`: label cards. `next` and `hover` are `surface` with a 1.5px `sabz-700` border; `yourstop` and `selected` are `sabz-900` with yellow text. Every kind uses `shadow-float`.
- `mapPaint()`: reads the tokens with `getComputedStyle` and returns MapLibre paint values:
  - station dot: `map-station` (sabz-700), radius 2.5;
  - major city: `surface` fill, `ink` stroke 2, radius 5.5, labelled;
  - selected station: a `zard-500` fill inside a `sabz-700` ring;
  - rail: `map-rail`;
  - route done: `sabz-700`, width 5, with a white casing;
  - route ahead: `sabz-700`, dashed.
  - replay trail: `zard-500`, width 5, fading to transparent at its tail (a `line-gradient`; the source needs `lineMetrics`).
**Rules:**
- Home and Station maps show **stations, plus a small marker for every running train** (`mapPaint().trainDot`; tapping or clicking one opens its Train page). Major cities are bigger and labelled at every zoom. The other stations appear as small dots once the map is zoomed in (they fade in from about zoom 7.5 to 8.5). Tapping a station opens its Station page.
- The Sabz base style is a terrain relief (`public/data/relief.webp`, built by `npm run relief` from `scripts/build-relief.py` with the `map-relief-*` tokens) under water, rails and labels, with the neighbours faded in `map-outside` and the Arabian Sea in `map-water`.
- The Train map shows that one train, followed.
- The Journey replay map shows the train's route, dashed, with a `trainMarker` and a fading trail for every replayed run on the move (`showReplay` and `setReplayFrame` in `map.js`).

### 23. Button
**Props:** `label`, `href?`, `variant: 'primary' | 'secondary' | 'link'`, `icon?` (trailing; any key in the icon set, such as `chevronEnd`, which flips in right-to-left, or `bell`), `full?`.
**Variants:**
- `primary`: `sabz-700` fill, white text in label style, 48px tall, `radius-md`.
- `secondary`: `surface` with a 1.5px `sabz-700` border and `sabz-700` text.
- `link`: inline underlined text with a 44px hit area that doesn't change the layout.
**Markup:** an `<a>` when there's an `href`, otherwise a `<button>`.

### 24. Card
**Props:** `body` (an HTML string), `header?` (a label), `tone: 'plain' | 'key'`.
**Look:** `surface` background with `radius-md`.
- `plain`: a 1px `line` border.
- `key`: a 1.5px `sabz-700` border. Use it for the Right now card.
- With a `header`, a SectionHeader with a 2px rule goes inside the top.

### 25. PageHeader
**What it is:** the header at the top of the Train page, the Station page and All stops. Approved on 2026-10-18.
**Props:**
- `leading?`: either `{ badge: TrainBadge props }` or `{ icon: 'pin' }`. Optional: the All stops page has none.
  - The badge renders at the size in its props (default `md`, 54px).
  - The station mark is a 50px circle with a `zard-500` ring on `surface`, with the pin icon at about 22px in `sabz-700`.
- `title`: the English name, in title style.
- `titleUr?`: the Urdu name, in `urdu-body`. It sits on its own line under the title, `lang="ur" dir="rtl"` on an isolated inline span, so it stays start-aligned with the title.
- `subtitle?`: in caption style, `ink-muted`. For example "Lahore Jn → Karachi Cantt" or "Multan".
- `actions?`: `[{ kind: 'follow', followed, name, label? } | { kind: 'share', label } | { kind: 'back', href, label }]`. These render as a FollowButton or an IconButton.
  - `back` renders at the start of the header, before `leading`, as a plain IconButton link (`back` icon, `aria-label` = `label`).
  - `follow` and `share` render at the end, in the order given. A follow action's optional `label: { off, on }` is passed to FollowButton as its aria-label (such as `{ off: 'Save Multan Cantt', on: 'Saved' }` on a station).
**Markup:** a `<header>` with the leading element, a text block whose `<h1>` is the title, and the actions at the end. Use `bindPageHeader(root, { onFollow, onShare })` to wire the actions.
**Urdu:** when the whole interface is in Urdu, the Urdu name becomes the `<h1>` in `urdu-title` and the English name moves to the second line (`lang="en" dir="ltr"`, in a Latin style, start-aligned).

### 26. Photo
**What it is:** a photo with its credit underneath: the train in About this train, the city on the Station page. Approved on 2026-10-21.
**Props:** `src`, `alt`, `credit` (already localised, such as "Photo: A. Khan · CC BY-SA 4.0"), `href?` (the photo's source page), `className?`.
**Look:** a 16:9 image at `radius-md` on a `line-soft` placeholder, the full width of its parent. The credit sits under it in caption style, `ink-muted`; in Urdu it uses `urdu-caption`.
**Behaviour:** the image loads lazily and its 16:9 box is reserved, so nothing shifts. With an `href`, the credit is an underlined link that opens in a new tab (`rel="noopener"`).
**Markup:** a `<figure>` with an `<img>` and a `<figcaption>`. The caption is left out when there is no credit.
**Rules:** only freely licensed photos (CC BY, CC BY-SA, CC0, public domain), always credited. No photo is better than a wrong one.

### 27. ReplayBar
**What it is:** the playback control for the journey replay, a time-lapse of a train's recorded journeys on the map. It sits inside a Card in the panel. Approved on 2026-10-22.
**Props:** `playing`, `at` (the replay's current time, epoch ms), `from`, `to` (epoch ms), `days?` (`{ start, recorded }[]`: one tick per day), `time` (already localised readout of `at`, such as "Tue 14 Oct · 3:40 PM"), `speed?` (already localised, such as "92 km/h" or "Between journeys"), `label` (already localised aria-label for the range, such as "Replay time"), `disabled?`, `className?`.
**Look:** a 44px round play/pause button filled `sabz-700` with a `surface` icon, beside a column of three rows.
- Ticks: one per day, 2px by 8px, `sabz-700` for a recorded day and `line` for an unrecorded one, lined up with the thumb's travel.
- Track: a native range input with a 4px `line` track and a 20px thumb styled like the map's train dot (`zard-500` fill, 2px `sabz-900` ring).
- Readout: the time in body-strong, and the speed at the inline end in caption style, `ink-muted`. In Urdu they become `urdu-strong` and `urdu-caption`.
**Behaviour:**
- The range counts whole minutes from `from` to `to`. `bindReplayBar(root, { onToggle, onScrub })` calls `onToggle()` for the button and `onScrub(at)` (epoch ms) when the range moves.
- `syncReplayBar(root, { at, time, speed, playing })` updates the bar in place and only touches what changed, so it can run every frame.
- A day before `from` is clamped to the start and a day after `to` is skipped. `disabled` greys the button and the range with the `line` and `ink-muted` tokens.
**Markup:** a `<div>` with `data-from` and `data-to`, a `<button>` (aria-label "Play" or "Pause"), the ticks (`aria-hidden`) and an `<input type="range">` with the label as its aria-label and the time as its aria-valuetext. Time and speed are in `<bdi>`.
**Right-to-left:** the range and the ticks run from the right and mirror together (logical `inset-inline-start`). The play and pause icons are media icons and don't mirror.

## Screens

The app's pages, built from the components above. **Views render their pages through these templates; they don't assemble components themselves.**

- **Where they live:**
  - `public/js/screens/`, one module per screen. `index.js` is the registry.
  - `public/css/screens.css` holds their layout: wrappers, flex and spacing from the tokens. It defines no visual pieces.
  - `_layout.js` has the frame and the panel-body helpers, plus `bindScreen()`. `_format.js` turns data into localised text.
  - `_sample.js` holds frozen real sample data, one object per screen.
  - `_map-standin.js` and `public/css/map-standin.css` are a static SVG map **for previews only**. Views draw the map with MapLibre (`public/js/map.js`) and never import the stand-in.
- **What a screen is:** `<Name>Screen(data, options)`, which returns an HTML string.
  - `data` is shaped like what the views already have: trains as `trainInfo()` gives them, stations with `name` and `nameUr`, and times in minutes after midnight, Pakistan time, as in `/api/route`, `/api/board` and `/api/trip`. Each module documents its shape in a JSDoc typedef.
  - The screen localises everything with `t()` and the `_format.js` helpers, so the same data renders in English and Urdu.
  - `options`:
    - `layout`: `'phone'` puts the map above the Panel, which is a bottom sheet. `'web'` makes the Panel the 440px sidebar, with the map beside it.
    - `snap` sets the phone sheet's starting snap.
    - `expanded` is for showcase frames only: the map keeps a band at the top and the panel opens in full.
    - `standin: false` leaves the map area empty, so a view can mount MapLibre in `.p-screen__backdrop`.
- **Layout helpers** in `_layout.js`, besides the wrappers: `mapButton(action)` (a floating IconButton for `zoomIn`, `zoomOut`, `layers`, `locate` or `wholeRoute`), `backButton(href, variant)` (the app goes back in history when it can, else follows `href`) and `notice(text)` (a polite live region holding a neutral StatusChip, for feedback such as "Link copied"; always rendered, empty when there is nothing to say).
- **Behaviour:** `bindScreen(root, handlers)` wires every component inside a rendered screen and returns `unbind()`. Every handler is optional: `data` (feeds the speed chart readout), `onLang`, `onSnap`, `onSearch`, `onClear`, `onSegment`, `onPickFrom`, `onPickTo`, `onSwap`, `onFollow`, `onShare`, `onChangeStop`, `onFollowing` and `onMap(action)`.
- **In the app:** each view in `public/js/views/` builds a screen's data from the live API and calls `paint(html, handlers)` from `public/js/app.js`. The first paint of a page is fresh; later ones morph the DOM in place (`public/js/render.js`), so the panel's snap, scroll, focus and the MapLibre map survive live updates.
- **The rule:** a screen is composed **only** from registered components, plus layout markup from `_layout.js`. If a page needs a visual piece no component provides, propose a new component (see the top of this file). Don't add markup or CSS to the screen.

| Screen | Page | Layouts in the library |
|---|---|---|
| HomeScreen | Home: station map, search, My trains, Running now | phone (panel half and down), web |
| SearchScreen | Search: one box for a train, station or city | phone |
| RouteScreen | Search › Plan a trip: trains you can still board | phone |
| TrainScreen | Train page: map following the train, Current status, Alerts (push alerts: Notify me, on with Change stop and Turn off, or a note saying why not; only when `data.alerts` is given), Journey, speed, About (with a Photo of the train above the facts when there is one), Return | phone, web |
| StopsScreen | Train page › All stops (same data as TrainScreen); with `pick: true` it is the choose-a-stop-for-alerts page (a Whole journey button, then the upcoming stops as links) | phone |
| StationScreen | Station page: the board of next trains, or with the "Next trains / Timetable" switch (SegmentedControl, `?view=timetable`) the whole day's timetable (a Photo of the city above it when there is one) | phone, web |

- **Library:** each screen has a showcase page in `design-system/components/<Name>Screen[Web]/` (group "Screens").
- **In-app gallery:** `/screens.html` shows every screen, phone and web, in English and Urdu.
- **Bundle:** `npm run ds` adds the screens to `bundle.js` as `window.Patri.screens` and the samples as `window.Patri.samples`, and appends `screens.css` and `map-standin.css` to `bundle.css`. It also renders every screen from its sample, in both languages, to prove each one builds.
