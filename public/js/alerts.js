// Push alerts on the phone or browser: the service worker, the permission and push subscription, and a local
// note of which trains are being watched. The server side is alerts.js and push.js.
import { getLang } from './i18n.js';

const KEY = 'alerts';
const KEEP_MS = 3 * 86400e3; // a watch is dropped after 3 days, like the server's
let registration = null;

export const supported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
export const blocked = () => supported() && Notification.permission === 'denied';

/** Registers /sw.js once; resolves to the registration. */
export function registerWorker() {
  if (!('serviceWorker' in navigator)) return Promise.reject(new Error('no service worker'));
  registration ||= navigator.serviceWorker.register('/sw.js');
  return registration;
}

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function write(map) {
  try { localStorage.setItem(KEY, JSON.stringify(map)); } catch {}
}

/** The local record { run, stop, rules, at } for a train, or null (also when it is older than 3 days). */
export function watching(train) {
  const map = read();
  const w = map[train];
  if (!w) return null;
  if (!(Date.now() - w.at < KEEP_MS)) { delete map[train]; write(map); return null; }
  return w;
}

const toBytes = s => {
  const raw = atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '='));
  return Uint8Array.from(raw, c => c.charCodeAt(0));
};

const post = (url, body) => fetch(url, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
});

/** Turns alerts on for a train with the chosen rules (see routes.js), for a stop or none. Call it from a tap. Throws 'blocked' or an Error. */
export async function enable(train, run, stop, rules) {
  if (await Notification.requestPermission() !== 'granted') throw 'blocked';
  const keyRes = await fetch('/api/push-key');
  if (!keyRes.ok) throw new Error(`push-key ${keyRes.status}`);
  const { publicKey } = await keyRes.json();
  const reg = await registerWorker();
  await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription())
    || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toBytes(publicKey) });
  const res = await post('/api/watch', { subscription: sub.toJSON(), train, run, stop: stop || null, rules, lang: getLang() });
  if (!res.ok) throw new Error(`watch ${res.status}`);
  write({ ...read(), [train]: { run, stop: stop || null, rules, at: Date.now() } });
}

/** Turns alerts off for a train: tells the server (best effort) and forgets the local record. */
export async function disable(train) {
  try {
    const reg = await registerWorker();
    const sub = await reg.pushManager.getSubscription();
    if (sub) await post('/api/unwatch', { endpoint: sub.endpoint, train });
  } catch {}
  const map = read();
  delete map[train];
  write(map);
}

/** Tells the server the app's language again for every watch still kept, so notifications follow it. Best effort. */
export async function relang() {
  if (!supported() || Notification.permission !== 'granted') return;
  const watches = Object.entries(read()).filter(([, w]) => Date.now() - w.at < KEEP_MS);
  if (!watches.length) return;
  const reg = await registerWorker();
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  const lang = getLang();
  await Promise.all(watches.map(([n, w]) => post('/api/watch', {
    subscription: sub.toJSON(), train: Number(n), run: w.run, stop: w.stop ?? null, ...(w.rules ? { rules: w.rules } : {}), lang,
  }).catch(() => {})));
}

// ---- Rules and the Alerts page's choices. Pure, so they can be tested without a browser.

/** The rules a saved watch stands for: its own, or (an old one without rules) the legacy set, as the server's legacyRules(). */
export function rulesOfWatch(w, stops) {
  if (Array.isArray(w.rules) && w.rules.length) return w.rules;
  const first = stops[0]?.id, last = stops.at(-1)?.id;
  return w.stop
    ? [{ kind: 'leave', stop: first }, { kind: 'before', stop: w.stop, min: 15 }, { kind: 'reach', stop: w.stop }, { kind: 'delay', stop: w.stop }]
    : [{ kind: 'leave', stop: first }, { kind: 'delay' }, { kind: 'reach', stop: last }];
}

/** Rules -> the page's choices: leave at the first stop is 'start'; reach at the last stop is 'end' unless that is the rider's stop; the rest keep their kind. */
export function choicesOfRules(rules, stops, stop) {
  const first = stops[0]?.id, last = stops.at(-1)?.id;
  const out = [];
  for (const r of rules) {
    let c;
    if (r.kind === 'leave' && r.stop === first) c = { kind: 'start' };
    else if (r.kind === 'reach' && r.stop === last && r.stop !== stop) c = { kind: 'end' };
    else if (r.kind === 'before') c = { kind: 'before', min: r.min };
    else c = { kind: r.kind };
    if (!out.some(x => x.kind === c.kind)) out.push(c);
  }
  return out;
}

/** The page's choices -> rules for /api/watch. `on` is a Set of kinds, `offered` the kinds shown, stop an id or null. */
export function rulesOfChoices({ on, minutes, offered, stop, stops }) {
  const first = stops[0]?.id, last = stops.at(-1)?.id;
  const use = k => on.has(k) && offered.includes(k);
  const rules = [];
  if (stop) {
    if (use('before')) rules.push({ kind: 'before', stop, min: minutes });
    if (use('reach')) rules.push({ kind: 'reach', stop });
    if (use('leave')) rules.push({ kind: 'leave', stop });
  }
  if (use('start')) rules.push({ kind: 'leave', stop: first });
  if (use('delay')) rules.push(stop ? { kind: 'delay', stop } : { kind: 'delay' });
  if (use('end')) rules.push({ kind: 'reach', stop: last });
  // The rider's station can be the first (leave = start) or the last (reach = end): one rule once.
  return rules.filter((r, i) => rules.findIndex(x => x.kind === r.kind && x.stop === r.stop && x.min === r.min) === i);
}
