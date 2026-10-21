// Sends Web Push messages to subscribed phones with the web-push package, signed with the VAPID keys
// from VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY. Without both, alerts are disabled (logged once) and
// /api/push-key answers 503. A 404 or 410 from the push service means the subscription is gone, so
// its watch is removed. Logs one line per send and only the last 8 characters of an endpoint.
const webpush = require('web-push');

const SUBJECT = 'https://patri.hataf.dev';
const short = endpoint => '…' + String(endpoint).slice(-8);

class Pusher {
  constructor(store, { publicKey = process.env.VAPID_PUBLIC_KEY, privateKey = process.env.VAPID_PRIVATE_KEY } = {}) {
    this.store = store;
    this.publicKey = publicKey || '';
    this.enabled = false;
    if (!publicKey || !privateKey) {
      console.log('Alerts disabled: VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY are not set');
      return;
    }
    try {
      webpush.setVapidDetails(SUBJECT, publicKey, privateKey);
      this.enabled = true;
    } catch (e) {
      console.log('Alerts disabled: bad VAPID keys:', e.message);
    }
  }

  // `watch` is a row from the watches table; resolves once the push service has answered.
  async send(watch, payload, event, urgency = 'normal') {
    if (!this.enabled) return;
    const subscription = { endpoint: watch.endpoint, keys: { p256dh: watch.p256dh, auth: watch.auth } };
    let status;
    try {
      const res = await webpush.sendNotification(subscription, JSON.stringify(payload), { TTL: 900, urgency, timeout: 10000 });
      status = res.statusCode;
    } catch (e) {
      status = e.statusCode || e.code || e.message;
      if (e.statusCode === 404 || e.statusCode === 410) this.store.removeWatch(watch.endpoint, watch.train);
    }
    console.log(`Push ${event} train ${watch.train} ${short(watch.endpoint)}: ${status}`);
  }
}

module.exports = { Pusher };
