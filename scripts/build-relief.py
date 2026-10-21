#!/usr/bin/env python3
"""Builds the Sabz map's terrain relief: `npm run relief` -> public/data/relief.webp.

Elevation comes from the AWS Terrain Tiles (terrarium PNGs, public, no key) at zoom 7 over Pakistan. They are
cached in build/relief-dem/. The image is hill-shaded and tinted with the map-relief-* tokens in
design-system/tokens.json, then clipped to public/data/pakistan.json. It is in Web Mercator and covers exactly
the zoom 7 tiles below, so its corners are tile edges; mapstyle.js (RELIEF) places it with those corners.
Run it again after changing a map-relief-* token.
"""
import io
import json
import math
import os
import urllib.request

import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(__file__), '..')
at = lambda *p: os.path.join(ROOT, *p)
Z, X0, X1, Y0, Y1 = 7, 85, 91, 49, 55  # the tiles that cover Pakistan's bounding box
TILE = 256
URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
CACHE = at('build', 'relief-dem')
OUT = at('public', 'data', 'relief.webp')

# Elevation (m) of each tint stop. The colours are the tokens of the same name.
STOPS = [(0, 'map-relief-low'), (900, 'map-relief-mid'), (2600, 'map-relief-high'), (4800, 'map-relief-peak')]
SUN_AZIMUTH, SUN_ALTITUDE, EXAGGERATION = 315, 40, 4.0


def tokens():
    data = json.load(open(at('design-system', 'tokens.json')))
    return {t['name']: t['value'] for t in data['color']['tokens']}


def rgb(hex_):
    h = hex_.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float64)


def blur(a, sigma):
    r = int(3 * sigma)
    k = np.exp(-np.arange(-r, r + 1) ** 2 / (2 * sigma ** 2))
    k /= k.sum()
    a = np.pad(a, r, mode='edge')
    a = np.apply_along_axis(lambda v: np.convolve(v, k, 'valid'), 0, a)
    return np.apply_along_axis(lambda v: np.convolve(v, k, 'valid'), 1, a)


def tile(x, y):
    path = os.path.join(CACHE, f'{Z}-{x}-{y}.png')
    if not os.path.exists(path):
        os.makedirs(CACHE, exist_ok=True)
        with urllib.request.urlopen(URL.format(z=Z, x=x, y=y), timeout=60) as r:
            open(path, 'wb').write(r.read())
    a = np.asarray(Image.open(path).convert('RGB'), dtype=np.float64)
    return a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768


def lng(x):
    return x / 2 ** Z * 360 - 180


def lat(y):
    return math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / 2 ** Z))))


def to_px(lon, la):
    n = 2 ** Z * TILE
    x = (lon + 180) / 360 * n
    y = (1 - math.asinh(math.tan(math.radians(la))) / math.pi) / 2 * n
    return x - X0 * TILE, y - Y0 * TILE


def main():
    tk = tokens()
    dem = np.block([[tile(x, y) for x in range(X0, X1 + 1)] for y in range(Y0, Y1 + 1)])
    dem = np.maximum(dem, 0)
    h, w = dem.shape

    # Hill shade. A pixel's ground size shrinks towards the pole with cos(latitude).
    rows = np.array([lat(Y0 + (i + 0.5) / TILE) for i in range(h)])
    metres = 2 * math.pi * 6378137 / (2 ** Z * TILE) * np.cos(np.radians(rows))[:, None]
    gy, gx = np.gradient(dem)
    gx, gy = gx / metres * EXAGGERATION, gy / metres * EXAGGERATION
    slope = np.arctan(np.hypot(gx, gy))
    aspect = np.arctan2(-gx, gy)
    az, alt = math.radians(SUN_AZIMUTH), math.radians(SUN_ALTITUDE)
    shade = np.sin(alt) * np.cos(slope) + np.cos(alt) * np.sin(slope) * np.cos(az - aspect)
    shade = np.clip(shade / math.sin(alt), 0, 1.25)  # 1 is flat ground; above 1 faces the sun

    # Tint by elevation, then darken the slopes away from the sun and lighten the ones facing it.
    elev = blur(dem, 2)
    xs = [e for e, _ in STOPS]
    tint = np.stack([np.interp(elev, xs, [rgb(tk[n])[c] for _, n in STOPS]) for c in range(3)], axis=-1)
    dark = rgb(tk['map-relief-shade'])
    k = np.clip(1 - shade, 0, 1)[..., None] * 0.55
    out = tint * (1 - k) + dark * k
    lift = np.clip(shade - 1, 0, 0.25)[..., None] * 1.6
    out = out * (1 - lift) + 255 * lift

    # Keep Pakistan only.
    pk = json.load(open(at('public', 'data', 'pakistan.json')))
    mask = Image.new('L', (w * 2, h * 2), 0)
    draw = ImageDraw.Draw(mask)
    for poly in pk['geometry']['coordinates']:
        for i, ring in enumerate(poly):
            draw.polygon([tuple(2 * v for v in to_px(lo, la)) for lo, la in ring], fill=0 if i else 255)
    alpha = np.asarray(mask.resize((w, h), Image.LANCZOS))

    img = Image.fromarray(np.dstack([np.clip(out, 0, 255).astype(np.uint8), alpha]), 'RGBA')
    box = img.getbbox()
    img.save(OUT, 'WEBP', quality=78, method=6, alpha_quality=60)
    corners = [[lng(X0), lat(Y0)], [lng(X1 + 1), lat(Y0)], [lng(X1 + 1), lat(Y1 + 1)], [lng(X0), lat(Y1 + 1)]]
    print(f'Saved {os.path.relpath(OUT)} ({w}x{h}, {os.path.getsize(OUT) // 1024} KB, content box {box})')
    print('Corners:', json.dumps([[round(a, 6) for a in c] for c in corners]))


if __name__ == '__main__':
    main()
