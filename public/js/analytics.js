// Visitor counts with Vercel Web Analytics: no cookies, free on the Hobby plan up to 50k events a month (then
// collection pauses until the next month; nothing is charged). The plain script counts only full page loads,
// and Patri moves between pages by the hash, so automatic tracking is off and the router sends one page view
// per page, with a route pattern so the dashboard groups e.g. every train page under /train/[number].
// Off on localhost and bare IPs (the local server has no /_vercel/insights).
const enabled = !/^(localhost|[\d.]+|\[[\da-f:]+\])$/i.test(location.hostname);

window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
if (enabled) {
  const s = document.createElement('script');
  s.defer = true;
  s.src = '/_vercel/insights/script.js';
  s.dataset.disableAutoTrack = '1';
  document.head.append(s);
}

/** The dashboard's route for a parsed page (app.js parse()). */
function routeOf(view, p) {
  if (view === 'train') return `/train/[number]${p.stops ? '/stops' : p.replay ? '/replay' : p.alerts ? '/alerts' : ''}`;
  if (view === 'station') return '/station/[id]';
  if (view === 'trip') return p.from || p.to ? '/trip/[from]/[to]' : '/trip';
  if (view === 'search') return '/search';
  return '/';
}

let last = '';
/** Records a page view for the page the router just mounted; the same page twice in a row counts once. */
export function pageview(hash, view, params) {
  const path = hash.replace(/^#/, '').split('?')[0] || '/';
  if (!enabled || path === last) return;
  last = path;
  window.va('pageview', { route: routeOf(view, params), path });
}
