# Logos

The Patri "Rail line" logo: **PATRI ◆ پٹڑی**, the English and Urdu names on one track, with yellow sleepers and a yellow station diamond between them. Every letter is a vector outline, so the files render the same everywhere, with no fonts needed.

| File | Use |
|---|---|
| `patri-logo.svg` | The logo on white or `ground`. Ink and green letters, a green rail and yellow sleepers. |
| `patri-logo-reversed.svg` | The logo on `sabz-700` green. White and yellow letters, a yellow rail and pale sleepers. |
| `patri-icon.svg` | The app icon and home-screen icon: a white P on a yellow rail with the station diamond, on a green rounded tile. |
| `patri-favicon.svg` | Browser tab and other sizes of 32px and below. The same mark without sleepers, so it stays crisp. |

Rules:
- **Never mirror it.** In the Urdu interface the logo moves to the start (right) side but reads the same way.
- **Never recolour, stretch or redraw it.** Use the reversed file on green, and keep a clear space of at least the diamond's height all round.
- **Minimum sizes:** 110px wide for the logo, 16px for the favicon.
- The source is `design-system/logo/compose.py` in the repo. It shapes the words with HarfBuzz from Barlow Condensed Bold and Noto Nastaliq Urdu Bold.
