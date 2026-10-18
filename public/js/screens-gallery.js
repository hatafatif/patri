// The in-app screens gallery (/screens.html): every page template in public/js/screens/, phone and web,
// rendered from the frozen samples. The map is the preview-only stand-in; the views use MapLibre.
import { AppBar, bindLanguageToggle } from './components/index.js';
import { setLang, getLang, applyLang } from './i18n.js';
import {
  HomeScreen, SearchScreen, RouteScreen, TrainScreen, StopsScreen, StationScreen, bindScreen,
} from './screens/index.js';
import { samples } from './screens/_sample.js';

// One entry per frame, in page order. h is the frame height; the phone frames are 390 wide.
const GROUPS = [
  { name: 'Home', screen: HomeScreen, data: samples.home, frames: [
    { layout: 'phone', h: 844, note: 'half', options: {} },
    { layout: 'phone', h: 844, note: 'down', options: { snap: 'down' } },
    { layout: 'web' },
  ] },
  { name: 'Search', screen: SearchScreen, data: samples.search, frames: [{ layout: 'phone', h: 844, options: {} }] },
  { name: 'Route', screen: RouteScreen, data: samples.route, title: 'From → To', frames: [{ layout: 'phone', h: 844, options: {} }] },
  { name: 'Train', screen: TrainScreen, data: samples.train, frames: [
    // Natural height of the whole panel; Urdu text is taller (the same sizes as the library previews).
    { layout: 'phone', h: { en: 1600, ur: 1860 }, options: { expanded: true } },
    { layout: 'web' },
  ] },
  { name: 'Stops', screen: StopsScreen, data: samples.train, title: 'All stops', frames: [{ layout: 'phone', h: { en: 1318, ur: 1730 }, options: {} }] },
  { name: 'Station', screen: StationScreen, data: samples.station, frames: [
    { layout: 'phone', h: 844, options: {} },
    { layout: 'web' },
  ] },
];

const app = document.getElementById('app');
let unbinds = [];

const heightOf = f => (typeof f.h === 'object' ? f.h[getLang()] : f.h);
const caption = (g, f) => {
  const size = f.layout === 'web' ? 'web 1440×900' : `phone 390×${heightOf(f)}${f.note ? ` ${f.note}` : ''}`;
  return `<p class="g-cap" dir="ltr"><b>${g.name}Screen</b> · ${size}</p>`;
};

function frameHtml(g, f, i) {
  const web = f.layout === 'web';
  const style = web ? '' : ` style="block-size:${heightOf(f)}px"`;
  const html = g.screen(g.data, { layout: f.layout, ...f.options });
  const box = `<div class="g-frame g-frame--${f.layout}" data-g-frame="${g.name}:${i}"${style}>${html}</div>`;
  return web
    ? `<div>${caption(g, f)}<div class="g-scroll">${box}</div></div>`
    : `<div class="g-phone">${caption(g, f)}${box}</div>`;
}

// Phone frames of a group go in one wrapping row; each web frame is a full-width block under it.
function groupHtml(g) {
  const phones = g.frames.map((f, i) => [f, i]).filter(([f]) => f.layout === 'phone');
  const webs = g.frames.map((f, i) => [f, i]).filter(([f]) => f.layout === 'web');
  return `<section class="g-group" id="${g.name.toLowerCase()}">`
    + (phones.length ? `<div class="g-phones">${phones.map(([f, i]) => frameHtml(g, f, i)).join('')}</div>` : '')
    + webs.map(([f, i]) => `<div style="margin-block-start:var(--space-4)">${frameHtml(g, f, i)}</div>`).join('')
    + '</section>';
}

function render() {
  unbinds.forEach(fn => fn());
  unbinds = [];
  const lang = getLang();
  app.innerHTML = `<header class="g-top">${AppBar({ live: 'on', lang })}<div class="g-intro"><h1 class="g-title" dir="ltr">Patri screens</h1>`
    + '<p class="g-lede" dir="ltr">The page templates in public/js/screens/, rendered from the frozen samples. The map is a preview-only stand-in; the views use MapLibre.</p></div></header>'
    + `<main class="g-page">${GROUPS.map(groupHtml).join('')}</main>`;

  const onLang = next => { setLang(next); render(); };
  // The top bar's toggle, then each frame (bindScreen wires every component inside it).
  unbinds.push(bindLanguageToggle(app.querySelector('.g-top'), { onChange: onLang }));
  for (const g of GROUPS) {
    g.frames.forEach((f, i) => {
      const el = app.querySelector(`[data-g-frame="${g.name}:${i}"]`);
      if (el) unbinds.push(bindScreen(el, { data: g.data, onLang }));
    });
  }
}

// Links in the screens are placeholders; keep the page where it is.
document.addEventListener('click', e => {
  if (e.target.closest?.('a[href^="#"]')) e.preventDefault();
});

applyLang();
render();
