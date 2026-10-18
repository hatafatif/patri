# Patri Components

Sabz ("green") is Patri's look: Pakistan Railways green and yellow, in a flat timetable style, equally at home in English and Urdu.

Patri is a live tracker for Pakistan Railways. People open it on a phone, often on mobile data, to answer one question: where is my train? Sabz keeps that answer calm and legible.
- **Flat.** Solid fills and thin rules, like a printed timetable. Shadows are reserved for things that float over the map.
- **Green and yellow.** Pakistan green carries the actions. Yellow marks the train itself.
- **Bilingual.** Every component is designed in Urdu as well as English, right to left, in Nastaliq.

Truck Art is retired: no pink, no scallops, no flowers.

## Colour

| Token | Value | Use |
|---|---|---|
| `sabz-700` | `#01411c` | Primary, Pakistan green: primary buttons, active controls, key-panel borders, the route already travelled on the map. |
| `sabz-800` | `#022c14` | Hover and pressed for anything in `sabz-700`. |
| `sabz-900` | `#0b1f17` | Dark surfaces: the train number badge, the your-stop row, map labels that need to stand out. |
| `sabz-100` | `#e3ede6` | Green tint: the on-time background, the progress track, the speed chart's area. |
| `zard-500` | `#f2c230` | Yellow accent: the train marker, the badge number, highlights on `sabz-900`. **Never as text on white.** |
| `zard-100` | `#fdf3d2` | The next-stop row. |
| `ground` / `surface` | `#eef2ee` / `#ffffff` | The page behind panels and lists / panels, cards and inputs. |
| `ink` / `ink-muted` / `ink-passed` | | Primary text (16.9:1), secondary text (6.1:1), stops already passed (4.9:1). |
| `line` / `line-soft` / `rule` | | Control borders and dividers / row dividers inside lists / the 2px timetable rule under section headers and above the sheet. |
| `focus` | `#0b4a6f` | The 3px keyboard focus ring on every control. |

- **Text contrast is at least 4.5:1.** The ratios are noted next to each token in `tokens.json`.
- **Two shadows only:**
  - `shadow-float` for controls and labels over the map;
  - `shadow-sheet` for the phone panel's edge.
- **Never write a raw colour.** Every colour is a `var(--token)`.

## Type, and the Urdu pairing

| Family | Token | Used for |
|---|---|---|
| Barlow | `--font-body` | Names, running text, inputs. Styles `title`, `heading`, `body-strong`, `body`, `caption`. |
| Barlow Condensed | `--font-label` | Labels, times and numbers. Styles `label`, `time`, `time-sm`, `number`. |
| Noto Nastaliq Urdu | `--font-urdu` | All Urdu. Styles `urdu-title`, `urdu-body`, `urdu-label`. The stack starts with Barlow, which has no Urdu letters, so Urdu comes from Nastaliq while digits and English inside Urdu text ("30 منٹ تاخیر") stay Barlow. |

- **Labels:**
  - In English, labels are condensed, uppercase and letter-spaced: section headers, status chips, buttons.
  - In Urdu, every such label becomes `urdu-label`: Nastaliq, no capitals (Urdu has none), one size up, and a tall line.
- **Names:** in Urdu, names use `urdu-body`, and page titles use `urdu-title`. Nastaliq needs a line-height of 2 or more, so never clip it with a fixed height.
- **Times and numbers** stay Latin digits in Barlow Condensed, inside `<bdi>`, so "1:20 PM" and "28 DN" read correctly inside right-to-left text. Times are tabular.
- **Layout** uses logical properties, so the whole interface mirrors in right-to-left. Chevrons and back arrows flip; nothing else does.
- In CSS, use type as `font: var(--t-label); letter-spacing: var(--t-label-tracking);`, or as the `.t-label` utility classes.

## Status colours

A train's status comes from one function, `statusTone(lateMin, { gps })`. Nothing else decides it.

| Tone | When | Look |
|---|---|---|
| `ontime` | up to 15 min late | `sabz-700` on `sabz-100` (9.7:1) |
| `late` | more than 15 min late | white on a solid red block (5.0:1), darker than on time, so the two differ in lightness as well as hue |
| `early` | 1 min or more early | blue `#0b4a6f` on `#dcebf6` (8.0:1) |
| `nogps` | no live GPS, or no delay known | grey `#4a5650` on `#e3e6e4` (6.6:1) |
| `neutral` | not a status: "Updated 1 min ago" | plain `ink-muted` text |

The tone is always written out in words ("30 min late"), never shown by colour alone. The signature **StatusStrip** joins the running state and the delay in one green frame: [● RUNNING · 105 KM/H][30 MIN LATE].

## Product rules

**Do**
- Build every screen from the registered components (`docs/COMPONENTS.md`). If none fits, propose a new one and ask before building it.
- Put the train first: "Where's my train?", with its live position, status and the time it reaches your stop.
- Show stations, not trains, on the Home and Station maps. Every station is a dot, major cities are bigger and labelled, and tapping a station opens its Station page.
- On the Train map, show that one train, followed.
- Use Nastaliq for Urdu everywhere, including the اردو button on an English page.
- Make every tap target at least 44px, and give every icon-only control a label.

**Don't**
- Never filter or sort trains by lateness. Status is shown, not used as a control.
- Don't use yellow (`zard-500`) as text on white, or as a large background.
- Don't add shadows, gradients or decoration to things that don't float over the map.
- Don't hard-code colours, font sizes or font names. Use the tokens.
- Don't redraw, recolour, mirror or inline the logo. It is the bilingual "Rail line" lockup, PATRI ◆ پٹڑی, in `public/brand/` (generated by `design-system/logo/compose.py`). Use `patri-logo-reversed.svg` on green.

## Components

- **Shell:**
  - [AppBar](components/AppBar/README.md)
  - [LanguageToggle](components/LanguageToggle/README.md)
  - [LiveIndicator](components/LiveIndicator/README.md)
  - [Panel](components/Panel/README.md)
  - [Card](components/Card/README.md)
  - [PageHeader](components/PageHeader/README.md)
- **Inputs:**
  - [SearchField](components/SearchField/README.md)
  - [SegmentedControl](components/SegmentedControl/README.md)
  - [StationFields](components/StationFields/README.md)
  - [IconButton](components/IconButton/README.md)
  - [FollowButton](components/FollowButton/README.md)
  - [MapToggle](components/MapToggle/README.md)
  - [Button](components/Button/README.md)
- **Train & station:**
  - [TrainBadge](components/TrainBadge/README.md)
  - [StatusChip and StatusStrip](components/StatusChip/README.md)
  - [TrainCard](components/TrainCard/README.md)
  - [TrainRow](components/TrainRow/README.md)
  - [DepartureRow](components/DepartureRow/README.md)
  - [StopTimeline](components/StopTimeline/README.md)
  - [JourneyProgress](components/JourneyProgress/README.md)
  - [SectionHeader](components/SectionHeader/README.md)
  - [DetailGrid](components/DetailGrid/README.md)
  - [LinkRow](components/LinkRow/README.md)
  - [SpeedChart](components/SpeedChart/README.md)
- **Map:**
  - [MapMarkers](components/MapMarkers/README.md)

## Screens

The app's pages are templates built only from these components: `public/js/screens/`. Views render their pages through them.
- Each screen is `<Name>Screen(data, { layout })` and returns HTML. `layout` is `'phone'` (map above a bottom sheet) or `'web'` (sidebar beside the map).
- The library shows each screen with real sample data, in its own group, "Screens":
  - [HomeScreen](components/HomeScreen/README.md), [HomeScreenWeb](components/HomeScreenWeb/README.md)
  - [SearchScreen](components/SearchScreen/README.md)
  - [RouteScreen](components/RouteScreen/README.md)
  - [TrainScreen](components/TrainScreen/README.md), [TrainScreenWeb](components/TrainScreenWeb/README.md)
  - [StopsScreen](components/StopsScreen/README.md)
  - [StationScreen](components/StationScreen/README.md), [StationScreenWeb](components/StationScreenWeb/README.md)
- The maps in these previews are a static stand-in, because previews can't load map tiles. The app draws its maps with MapLibre.
- The full rules are in `docs/COMPONENTS.md`, under "Screens".

## Where this came from

- **Wireframes:** "Patri Blueprint Wireframes", https://claude.ai/artifact/RwgY75cexdcvaQHAbyr8ch. These set the flows and structure:
  - one draggable panel over a station map, instead of tabs;
  - one search box for trains, stations and cities, with From → To inside it;
  - two main pages, Train and Station, with All stops one tap away;
  - on the web, the panel becomes a sidebar.
- **Exploration:** "Train Live: new features", https://claude.ai/artifact/YSk1dnFQssHUHa5gLZTiFX. This is where the look was chosen:
  - the style A/B rounds chose **Sabz**, Pakistan Railways green and yellow in a flat timetable style, replacing Truck Art;
  - the logo rounds chose **Rail line**, the bilingual PATRI ◆ پٹڑی lockup on one track.

## Using the bundle

`components/bundle.js` is one classic script with no imports and no network access. It puts every component on `window.Patri`, the screens on `window.Patri.screens` and their frozen sample data on `window.Patri.samples`.

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700&family=Noto+Nastaliq+Urdu:wght@600;700&display=swap">
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="components/bundle.css">
<script src="components/bundle.js"></script>
<div id="out"></div>
<script>
  const out = document.getElementById('out');
  out.innerHTML = Patri.TrainCard({
    href: '#/train/28',
    badge: { number: '28', direction: 'dn', size: 'md' },
    name: 'Shalimar Express',
    position: 'Sahiwal → Multan Cantt',
    yourStop: { name: 'Multan Cantt', time: '~1:20 PM' },
    status: { tone: 'late', text: '30 min late' },
  });
</script>
```

- **Components** are functions that take props and return an HTML string. Text props arrive already localised.
- **The logo:** AppBar shows `brand/patri-logo.svg`, relative to the page, so serve that file next to your page.
- **Behaviour** comes from `Patri.bind<Name>(root, handlers)`, which returns an `unbind()` function. For example: `Patri.bindLanguageToggle(root, { onChange(lang) {} })`.
- **Urdu:** set `<html lang="ur" dir="rtl">` before rendering. The components' own words, such as "Change", "Live" and the aria-labels, follow `<html lang>`.
- **Types:** `components/index.d.ts` describes every component's props.
- **In the app:** the same components are ES modules: `import { TrainCard } from '/js/components/index.js'`. Styles are `/css/tokens.css` and `/css/components.css`. The gallery of every component is `/components.html`.
- **Rebuilding:**
  - `design-system/tokens.json` is the single source of the tokens.
  - `npm run ds` regenerates `public/css/tokens.css`, `bundle.js`, `bundle.css` and `index.d.ts`.
  - Never edit the generated files by hand.
