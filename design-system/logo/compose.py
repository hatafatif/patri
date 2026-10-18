"""Compose the Patri "Rail line" logo files from HarfBuzz-shaped glyph outlines.

Usage: python3 -I compose.py <fonts-dir> <out-dir>
Writes patri-logo.svg, patri-logo-reversed.svg, patri-icon.svg, patri-favicon.svg.
"""
import re
import subprocess
import sys
import tempfile
from pathlib import Path

fonts, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)

INK, GREEN, YELLOW, MIST, WHITE = "#0b1f17", "#01411c", "#f2c230", "#c9d6ce", "#ffffff"


def shaped(text, font, size, ascender, prefix, fill, variations=None):
    """Shape text with hb-view; return (inner svg markup, advance width, baseline offset)."""
    with tempfile.NamedTemporaryFile(suffix=".svg") as tmp:
        cmd = ["hb-view", f"--font-file={font}", f"--font-size={size}", "--margin=0",
               "--output-format=svg", "--background=00000000", f"--output-file={tmp.name}", text]
        if variations:
            cmd.insert(2, f"--variations={variations}")
        subprocess.run(cmd, check=True)
        svg = Path(tmp.name).read_text()
    width = float(re.search(r'<svg[^>]*\bwidth="([\d.]+)', svg).group(1))
    height = float(re.search(r'<svg[^>]*\bheight="([\d.]+)', svg).group(1))
    inner = re.search(r"<svg[^>]*>(.*)</svg>", svg, re.S).group(1)
    inner = inner.replace('id="glyph', f'id="{prefix}-glyph').replace('#glyph', f'#{prefix}-glyph')
    inner = re.sub(r'fill="rgb\([^)]*\)"', f'fill="{fill}"', inner)
    inner = re.sub(r"fill:rgb\([^)]*\)", f"fill:{fill}", inner)
    return inner, width, height, ascender * size / 1000


def place(text, font, size, ascender, prefix, fill, x, baseline, anchor="start", variations=None):
    inner, w, h, base = shaped(text, font, size, ascender, prefix, fill, variations)
    if anchor == "middle":
        x -= w / 2
    y = baseline - base
    return f'<svg x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" viewBox="0 0 {w:.2f} {h:.2f}" overflow="visible">{inner}</svg>'


BARLOW = fonts / "BarlowCondensed-Bold.ttf"
NASTALIQ = fonts / "NotoNastaliqUrdu.ttf"
SLEEPERS_L = "M34 128 V146M58 128 V146M82 128 V146M106 128 V146M130 128 V146M154 128 V146M178 128 V146M202 128 V146M226 128 V146"
SLEEPERS_R = "M298 128 V146M322 128 V146M346 128 V146M370 128 V146M394 128 V146M418 128 V146M442 128 V146M466 128 V146M490 128 V146M514 128 V146"


def lockup(word_fill, urdu_fill, rail, sleepers, prefix):
    latin = place("PATRI", BARLOW, 100, 1000, f"{prefix}l", word_fill, 24, 122)
    urdu = place("پٹڑی", NASTALIQ, 78, 1904, f"{prefix}u", urdu_fill, 396, 108, "middle", "wght=700")
    return f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 560 180" width="560" height="180" role="img" aria-labelledby="{prefix}t">
<title id="{prefix}t">Patri · پٹڑی</title>
<g stroke="{sleepers}" stroke-width="5"><path d="{SLEEPERS_L}"/><path d="{SLEEPERS_R}"/></g>
<path d="M24 137 H530" stroke="{rail}" stroke-width="7"/>
{latin}
<polygon points="262,121 278,137 262,153 246,137" fill="{YELLOW}" stroke="{INK}" stroke-width="2.5"/>
{urdu}
</svg>
'''


def icon(prefix, sleepers=True, size_label="Patri"):
    p = place("P", BARLOW, 140, 1000, f"{prefix}p", WHITE, 54, 138)
    ties = f'<g stroke="{MIST}" stroke-width="7"><path d="M42 140 V164M70 140 V164M98 140 V164M126 140 V164M154 140 V164"/></g>' if sleepers else ""
    rail_w = 10 if sleepers else 14
    diamond = '<polygon points="146,128 170,152 146,176 122,152" fill="#f2c230" stroke="#0b1f17" stroke-width="4"/>' if sleepers \
        else '<polygon points="146,124 174,152 146,180 118,152" fill="#f2c230"/>'
    return f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 200 200" width="200" height="200" role="img" aria-labelledby="{prefix}t">
<title id="{prefix}t">{size_label}</title>
<rect width="200" height="200" rx="44" fill="{GREEN}"/>
{ties}
<path d="M28 152 H172" stroke="{YELLOW}" stroke-width="{rail_w}"/>
{p}
{diamond}
</svg>
'''


(out / "patri-logo.svg").write_text(lockup(INK, GREEN, GREEN, YELLOW, "a"))
(out / "patri-logo-reversed.svg").write_text(lockup(WHITE, YELLOW, YELLOW, MIST, "b"))
(out / "patri-icon.svg").write_text(icon("c"))
(out / "patri-favicon.svg").write_text(icon("d", sleepers=False))
print("wrote", sorted(p.name for p in out.glob("*.svg")))
