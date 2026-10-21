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

/** The local record { run, stop, at } for a train, or null (also when it is older than 3 days). */
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

/** Turns alerts on for a train, whole journey (stop null) or for one stop. Call it from a tap. Throws 'blocked' or an Error. */
export async function enable(train, run, stop) {
  if (await Notification.requestPermission() !== 'granted') throw 'blocked';
  const keyRes = await fetch('/api/push-key');
  if (!keyRes.ok) throw new Error(`push-key ${keyRes.status}`);
  const { publicKey } = await keyRes.json();
  const reg = await registerWorker();
  await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription())
    || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toBytes(publicKey) });
  const res = await post('/api/watch', { subscription: sub.toJSON(), train, run, stop: stop || null, lang: getLang() });
  if (!res.ok) throw new Error(`watch ${res.status}`);
  write({ ...read(), [train]: { run, stop: stop || null, at: Date.now() } });
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
