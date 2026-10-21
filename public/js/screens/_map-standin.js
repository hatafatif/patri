// PREVIEW-ONLY STAND-IN for the map. It exists so the design-system previews and the in-app screens
// gallery can show a map without loading tiles. Views must draw the map with MapLibre
// (public/js/map.js) and must never import this module.
//
// The SVG draws geometry only (sea, border, rails, route). Dots, place names and the MapMarkers
// cards are HTML overlays placed with physical left/top percentages, so they keep one on-screen size
// at any scale and the geography never mirrors in right-to-left. Styles: css/map-standin.css.
import { trainMarker, mapLabel } from '../components/MapMarkers.js';
import { esc } from '../components/_shared.js';
import { t, isUrdu } from '../i18n.js';

// ---------- Place names: key -> [English, Urdu] (Urdu from /api/stations nameUr, or the standard city name) ----------
const NAMES = {
  peshawar: ['Peshawar', 'پشاور'], rawalpindi: ['Rawalpindi', 'راولپنڈی'], lahore: ['Lahore', 'لاہور'],
  faisalabad: ['Faisalabad', 'فیصل آباد'], multan: ['Multan', 'ملتان'], quetta: ['Quetta', 'کوئٹہ'],
  sukkur: ['Sukkur', 'سکھر'], hyderabad: ['Hyderabad', 'حیدرآباد'], karachi: ['Karachi', 'کراچی'],
  okara: ['Okara', 'اوکاڑا'], sahiwal: ['Sahiwal', 'ساہِيوال'], chichawatni: ['Chichawatni', 'چِچہ وطنى'],
  khanewal: ['Khanewal', 'خانیوال'], shorkot: ['Shorkot', 'شورکوٹ'], lodhran: ['Lodhran', 'لودهراں'],
  bahawalpur: ['Bahawalpur', 'بہاولپور'], muzaffargarh: ['Muzaffargarh', 'مظفر گڑھ'],
  kotadu: ['Kot Adu', 'کوٹ ادو'], layyah: ['Layyah', 'لیّہ'],
};

// ---------- Geometry (adapted from the wireframes; coordinates are viewBox units) ----------
// Country map, viewBox 300 x 360. `places` are [key, x, y, side the label sits on, major?, side of a hover card].
const COUNTRY = {
  w: 300, h: 360,
  border: 'M5 300 L0 250 L10 215 L50 200 L70 175 L95 165 L110 140 L130 120 L150 100 L165 75 L185 55 L200 35 L215 15 L225 10 L255 25 L265 55 L245 72 L232 95 L238 118 L220 132 L212 160 L196 185 L180 215 L165 245 L155 272 L160 298',
  // Sea: the southern coast (Karachi to the west) and everything beyond it. It runs past the viewBox on purpose.
  sea: 'M-1200 280 L-300 292 L5 300 L30 318 L62 326 L86 344 L100 330 L120 334 L142 318 L160 298 L190 306 L300 335 L1500 380 L1500 1500 L-1200 1500 Z',
  rails: [
    [[180, 70], [205, 80], [212, 96], [218, 112], [228, 132], [218, 148], [205, 158], [192, 168], [175, 180], [162, 202], [150, 222], [140, 238], [130, 250], [122, 262], [115, 278], [110, 295], [105, 318], [96, 330], [88, 338]],
    [[218, 112], [208, 128], [198, 145], [188, 160], [180, 172], [175, 180]],
    [[122, 262], [102, 252], [82, 238], [70, 222], [60, 205]],
    [[105, 318], [92, 292], [92, 268], [102, 252]],
    [[105, 318], [125, 322], [140, 330]],
  ],
  stations: [[192, 74], [212, 96], [218, 112], [218, 148], [205, 158], [192, 168], [208, 128], [188, 160], [162, 202], [150, 222], [140, 238], [130, 250], [115, 278], [110, 295], [96, 330], [102, 252], [82, 238], [70, 222], [92, 292], [92, 270], [125, 322], [140, 330]],
  places: [
    ['peshawar', 180, 70, 'nw', true, 'ne'], ['rawalpindi', 205, 80, 'ne', true, 'ne'], ['lahore', 228, 132, 'e', true, 'ne'],
    ['faisalabad', 198, 145, 'nw', true, 'ne'], ['multan', 175, 180, 'w', true, 'ne'], ['quetta', 60, 205, 's', true, 'ne'],
    ['sukkur', 122, 262, 'e', true, 'ne'], ['hyderabad', 105, 318, 'ne', true, 'ne'], ['karachi', 88, 338, 'w', true, 'ne'],
  ],
  step: 13, // arc length between the extra dots along the rails
};

// Train zoom. Phone: the wireframe's 390 x 300 shifted down 100 in a 390 x 500 box, so a cover crop works from 300 to 700 tall.
// Web: 1000 x 800 as drawn. `route` runs in the direction of travel; `trainAt` is the index of the train's vertex.
const TRAIN = {
  phone: {
    w: 390, h: 500,
    route: [[510, -20], [420, 60], [330, 140], [280, 182], [235, 218], [195, 248], [100, 315], [20, 400], [-50, 485]],
    trainAt: 5,
    rails: [[[235, 218], [165, 150], [120, 70], [95, -10]], [[100, 315], [40, 318], [-20, 350]]],
    places: [['sahiwal', 330, 140, 'e'], ['chichawatni', 280, 182, 'e'], ['khanewal', 235, 218, 'e']],
    multan: [100, 315], multanSide: 'se', bahawalpur: null,
  },
  web: {
    w: 1000, h: 800,
    route: [[1050, -60], [900, 44], [790, 120], [690, 195], [600, 265], [520, 330], [360, 450], [300, 520], [250, 590], [190, 680], [130, 780], [90, 850]],
    trainAt: 5,
    rails: [[[600, 265], [520, 190], [450, 90], [420, -20]], [[360, 450], [430, 530], [480, 640], [500, 840]]],
    places: [['okara', 900, 44, 'w'], ['sahiwal', 790, 120, 'e'], ['chichawatni', 690, 195, 'e'], ['khanewal', 600, 265, 'e'], ['lodhran', 300, 520, 'e']],
    multan: [360, 450], multanSide: 'nw', bahawalpur: [250, 590],
  },
};

// Station zoom around Multan Cantt. `T` maps wireframe coordinates into the box.
const STATION = {
  phone: {
    w: 390, h: 500, T: (x, y) => [195 + (x - 195) * 0.72, y + 100], at: [195, 195], selectedSide: 'w', step: 60,
    rails: [
      [[400, -15], [367, 39], [335, 91], [293, 124], [250, 156], [211, 169], [195, 195], [153, 267], [114, 332], [90, 370], [62, 410]],
      [[370, -80], [335, -26], [302, 26], [270, 81], [237, 130], [211, 169]],
    ],
    places: [
      ['okara', 335, 91, 'e', 0, 'se'], ['sahiwal', 293, 124, 'e', 0, 'se'], ['shorkot', 237, 130, 'w', 0, 'nw'],
      ['khanewal', 211, 169, 'e', 0, 'se'], ['bahawalpur', 153, 267, 'e', 0, 'se'],
      ['lahore', 367, 39, 'nw', 1, 'sw'], ['faisalabad', 270, 81, 'w', 1, 'se'],
    ],
    dots: [[250, 156], [302, 26], [174, 231]],
  },
  web: {
    // x is squeezed around Multan so Lahore stays clear of the zoom buttons at the map's top end.
    w: 1000, h: 800, T: (x, y) => [450 + (x - 450) * 0.72, y], at: [450, 420], selectedSide: 'nw', step: 90,
    rails: [
      [[1240, -130], [990, 120], [880, 230], [780, 280], [650, 330], [540, 370], [450, 420], [520, 500], [560, 590], [600, 700], [640, 830]],
      [[640, -20], [620, 90], [500, 230], [540, 370]],
      [[450, 420], [360, 440], [300, 330], [240, 200], [200, 60]],
    ],
    places: [
      ['okara', 880, 230, 'e', 0, 'se'], ['sahiwal', 780, 280, 'e', 0, 'se'], ['chichawatni', 650, 330, 'e', 0, 'se'],
      ['shorkot', 500, 230, 'e', 0, 'se'], ['khanewal', 540, 370, 'e', 0, 'se'], ['lodhran', 520, 500, 'e', 0, 'se'],
      ['bahawalpur', 560, 590, 'e', 0, 'se'], ['muzaffargarh', 360, 440, 'sw', 0, 'sw'], ['kotadu', 300, 330, 'w', 0, 'nw'],
      ['layyah', 240, 200, 'w', 0, 'nw'], ['lahore', 990, 120, 'nw', 1, 'sw'], ['faisalabad', 620, 90, 'ne', 1, 'se'],
    ],
    dots: [],
  },
};

// ---------- Small helpers ----------
const pct = (v, total) => `${+((v / total) * 100).toFixed(3)}%`;
const at = (x, y, w, h) => `left:${pct(x, w)};top:${pct(y, h)}`;
const d = pts => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const near = (p, list, r) => list.some(q => dist(p, q) < r);

// Points spaced `step` apart along each polyline, skipping any within `gap` of `avoid` or of an earlier point.
function along(lines, step, avoid, gap = step * 0.55) {
  const out = [];
  for (const line of lines) {
    let need = step / 2;
    for (let i = 1; i < line.length; i++) {
      const a = line[i - 1], b = line[i], len = dist(a, b);
      let pos = 0;
      while (pos + need <= len) {
        pos += need;
        need = step;
        const p = [a[0] + ((b[0] - a[0]) * pos) / len, a[1] + ((b[1] - a[1]) * pos) / len];
        if (!near(p, avoid, gap) && !near(p, out, gap)) out.push(p);
      }
      need -= len - pos;
    }
  }
  return out;
}

const dotEl = (cls, [x, y], w, h) => `<span class="p-mapstandin__dot ${cls}" style="${at(x, y, w, h)}"></span>`;
const rtl = () => (isUrdu() ? 'rtl' : 'ltr');

function nameEl(key, [x, y], side, major, w, h) {
  const [en, ur] = NAMES[key];
  const cls = ['p-mapstandin__at', `p-mapstandin__at--${side}`, 'p-mapstandin__name', major ? 'p-mapstandin__name--major' : '', isUrdu() ? 'p-mapstandin__name--ur' : ''].filter(Boolean).join(' ');
  return `<span class="${cls}" style="${at(x, y, w, h)}">${esc(isUrdu() ? ur : en)}</span>`;
}

// A MapMarkers card beside a dot. `side` is where the card sits relative to the dot; `wide` leaves room for a bigger dot.
function pin(kind, text, [x, y], side, w, h, wide = false) {
  return `<div class="p-mapstandin__at p-mapstandin__at--${side} p-mapstandin__pin${wide ? ' p-mapstandin__pin--wide' : ''}" dir="${rtl()}" style="${at(x, y, w, h)}">${mapLabel({ kind, title: text.title, sub: text.sub })}</div>`;
}

function shell(mode, w, h, label, body) {
  return `<div class="p-mapstandin p-mapstandin--${mode}"><div class="p-mapstandin__box" style="--w:${w};--h:${h}">`
    + `<svg class="p-mapstandin__svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">${body.svg}</svg>`
    + `<div class="p-mapstandin__layer" aria-hidden="true">${body.layer}</div>${body.cards || ''}</div></div>`;
}

// ---------- 1. Home map ----------
/**
 * The Home map: Pakistan, its rails, major cities as dots and named (small stations only show once zoomed in).
 * @param {{ layout?: 'phone' | 'web', hover?: { key: string, title: string, sub?: string } }} [props]
 *   hover: a card beside a city's dot; key is one of peshawar, rawalpindi, lahore, faisalabad, multan, quetta, sukkur, hyderabad, karachi.
 */
export function countryMap({ layout = 'phone', hover } = {}) {
  const { w, h } = COUNTRY;
  const hov = hover && COUNTRY.places.find(p => p[0] === hover.key);
  const svg = `<path class="p-mapstandin__sea" d="${COUNTRY.sea}"/>`
    + `<path class="p-mapstandin__border" d="${COUNTRY.border}"/>`
    + COUNTRY.rails.map(r => `<path class="p-mapstandin__rail" d="${d(r)}"/>`).join('');
  const layer = COUNTRY.places.map(([k, x, y]) => dotEl('p-mapstandin__dot--city', [x, y], w, h)).join('')
    + COUNTRY.places.filter(p => p !== hov).map(([k, x, y, side]) => nameEl(k, [x, y], side, true, w, h)).join('');
  const cards = hov ? pin('hover', hover, [hov[1], hov[2]], hov[5], w, h) : '';
  return shell('country', w, h, t('mapStations'), { svg, layer, cards });
}

// ---------- 2. Train-following map ----------
/**
 * The train zoom between Sahiwal and Multan Cantt: route done solid, route ahead dashed, the followed train, the next stop and, on web, your stop.
 * @param {{ layout?: 'phone' | 'web', train: { label: string }, next: { title: string, sub?: string }, yourStop?: { title: string, sub?: string } }} props
 *   yourStop is drawn only where Bahawalpur is inside the geometry (web).
 */
export function trainMap({ layout = 'phone', train = { label: '' }, next = { title: '' }, yourStop } = {}) {
  const g = TRAIN[layout === 'web' ? 'web' : 'phone'];
  const { w, h } = g;
  const here = g.route[g.trainAt];
  const done = g.route.slice(0, g.trainAt + 1), ahead = g.route.slice(g.trainAt);
  const svg = g.rails.map(r => `<path class="p-mapstandin__rail" d="${d(r)}"/>`).join('')
    + `<path class="p-mapstandin__route-casing" d="${d(done)}"/>`
    + `<path class="p-mapstandin__route-done" d="${d(done)}"/>`
    + `<path class="p-mapstandin__route-ahead" d="${d(ahead)}"/>`;
  const showStop = yourStop && g.bahawalpur;
  const layer = g.places.map(([k, x, y]) => dotEl('p-mapstandin__dot--station p-mapstandin__dot--onroute', [x, y], w, h)).join('')
    + dotEl('p-mapstandin__dot--city', g.multan, w, h)
    + (showStop ? dotEl('p-mapstandin__dot--station p-mapstandin__dot--onroute', g.bahawalpur, w, h) : '')
    + g.places.map(([k, x, y, side]) => nameEl(k, [x, y], side, false, w, h)).join('');
  const cards = pin('next', next, g.multan, g.multanSide, w, h)
    + (showStop ? pin('yourstop', yourStop, g.bahawalpur, 'e', w, h) : '')
    + `<div class="p-mapstandin__train" dir="ltr" style="${at(here[0], here[1], w, h)}">${trainMarker({ label: train.label })}</div>`;
  return shell('zoom', w, h, t('mapFollowing', { train: train.label }), { svg, layer, cards });
}

// ---------- 3. Station map ----------
/**
 * The station zoom around Multan Cantt: rails, nearby stations, a couple of major cities, and Multan Cantt as the selected station.
 * @param {{ layout?: 'phone' | 'web', selected: { title: string, sub?: string }, hover?: { key: string, title: string, sub?: string } }} props
 *   hover: a card beside a station; key is one of okara, sahiwal, shorkot, khanewal, bahawalpur, lahore, faisalabad (phone) or
 *   okara, sahiwal, chichawatni, shorkot, khanewal, lodhran, bahawalpur, muzaffargarh, kotadu, layyah, lahore, faisalabad (web).
 */
export function stationMap({ layout = 'phone', selected = { title: '' }, hover } = {}) {
  const g = STATION[layout === 'web' ? 'web' : 'phone'];
  const { w, h } = g;
  const rails = g.rails.map(r => r.map(p => g.T(...p)));
  const places = g.places.map(([k, x, y, side, major, card]) => [k, ...g.T(x, y), side, major, card]);
  const focus = g.T(...g.at);
  const listed = [...places.map(p => [p[1], p[2]]), ...g.dots.map(p => g.T(...p)), focus];
  const extra = along(rails, g.step, listed, g.step * 0.5);
  const hov = hover && places.find(p => p[0] === hover.key);
  const svg = rails.map(r => `<path class="p-mapstandin__rail" d="${d(r)}"/>`).join('');
  const layer = [...g.dots.map(p => g.T(...p)), ...extra].map(p => dotEl('p-mapstandin__dot--station', p, w, h)).join('')
    + places.map(([k, x, y, , major]) => dotEl(major ? 'p-mapstandin__dot--city' : 'p-mapstandin__dot--station', [x, y], w, h)).join('')
    + dotEl('p-mapstandin__dot--selected', focus, w, h)
    + places.filter(p => p !== hov).map(([k, x, y, side, major]) => nameEl(k, [x, y], side, !!major, w, h)).join('');
  const cards = pin('selected', selected, focus, g.selectedSide, w, h, true)
    + (hov ? pin('hover', hover, [hov[1], hov[2]], hov[5], w, h) : '');
  return shell('zoom', w, h, t('mapAround', { station: selected.title }), { svg, layer, cards });
}
