// Rules engine for push alerts. update() in server.js calls check(run) after each recorded position;
// a watch (one phone, one train, one run) carries a list of rules (routes.js, "Alert rules"): before a stop
// (15, 30 or 60 min), reaching a stop, leaving a stop, and a change in delay. check() evaluates every rule of
// every watch on that run, and each rule is sent at most once per watch (key = ruleKey(rule) in the `sent`
// table); delay alerts are the exception, rate limited instead. A watch is done once all its rules are settled.
// tick() runs every minute so "before" alerts still go out when the train's position has stopped arriving.
// It only ever concerns the one train a person chose to watch; nothing here filters or sorts trains by lateness.
// Texts are English or Urdu per watch. `send(watch, payload, event, urgency)` is push.js's sender.
// The feed marks the first station passed while the train still waits there, and never marks the last
// station passed, so leaving the first and reaching any stop also go by the distance.
const { haversineKm } = require('./data.js');
const { ruleKey, legacyRules } = require('./routes');

const PKT_OFFSET = 5 * 3600e3;
const DELAY_STEP = 15; // minutes of change worth an alert
const DELAY_GAP = 30 * 60e3; // at most one delay alert per 30 min
const DELAY_HOLD = 5 * 60e3; // a change must hold this long before it is told
const STALE_MS = 3 * 60e3; // no position for this long: only "before" rules are checked, by the timetable
const SPEED_WINDOW = 30 * 60e3; // the average speed for the arrival estimate covers this long
const LATE_MIN = 5; // under this the train counts as on time
const AWAY_KM = 1.5; // the train is at a station within this, and has left the first one beyond it

function duration(min, lang) {
  min = Math.max(0, Math.round(min));
  const h = Math.floor(min / 60), m = min % 60;
  if (lang === 'ur') {
    const hours = h === 1 ? '1 گھنٹہ' : `${h} گھنٹے`;
    if (!h) return `${m} منٹ`;
    return m ? `${hours} ${m} منٹ` : hours;
  }
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

// h:mm AM/PM in Pakistan time.
function clock(ms) {
  const d = new Date(ms + PKT_OFFSET);
  const h = d.getUTCHours(), m = d.getUTCMinutes();
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

// One function per rule kind (leave, before, reach, delay), plus the endings a message can carry.
// `late` is in minutes; times are already clock text such as "4:05 PM".
const TEXT = {
  en: {
    leave: (st, late) => `Left ${st}${late >= LATE_MIN ? ` · ${duration(late, 'en')} late` : ''}`,
    before: (st, min, time) => `${st} in about ${min} min (~${time})`,
    reach: (st, late) => `Reached ${st}${late >= LATE_MIN ? ` · ${duration(late, 'en')} late` : ''}`,
    delay: (late, prev) => late < LATE_MIN
      ? `Now on time (was ${duration(prev, 'en')} late)`
      : `Now ${duration(late, 'en')} late (was ${prev < LATE_MIN ? 'on time' : duration(prev, 'en')})`,
    expectedAt: (st, time) => ` · Expected at ${st} ~${time}`,
    stoppedBetween: (a, b) => ` · Stopped between ${a} and ${b}`,
    stale: ' · No live location, so this may be off',
  },
  ur: {
    leave: (st, late) => `${st} سے روانہ ہو گئی${late >= LATE_MIN ? ` · ${duration(late, 'ur')} تاخیر` : ''}`,
    before: (st, min, time) => `${st} تقریباً ${min} منٹ میں (~${time})`,
    reach: (st, late) => `${st} پہنچ گئی${late >= LATE_MIN ? ` · ${duration(late, 'ur')} تاخیر` : ''}`,
    delay: (late, prev) => late < LATE_MIN
      ? `اب وقت پر (پہلے ${duration(prev, 'ur')} تاخیر)`
      : `اب ${duration(late, 'ur')} تاخیر (پہلے ${prev < LATE_MIN ? 'وقت پر' : duration(prev, 'ur')})`,
    expectedAt: (st, time) => ` · ${st} پر متوقع ~${time}`,
    stoppedBetween: (a, b) => ` · ${a} اور ${b} کے درمیان رکی ہوئی ہے`,
    stale: ' · لائیو مقام دستیاب نہیں، وقت میں فرق ہو سکتا ہے',
  },
};

/** Km from the run's position to a station, or NaN when either has no coordinates (every comparison is then false). */
function kmFrom(run, stop) {
  return stop && stop.lat && stop.lon && Number.isFinite(run.lat) && Number.isFinite(run.lon) ? haversineKm(run, stop) : NaN;
}

// Clock time "HH:MM" from the feed -> epoch ms nearest to `near`.
function etaToMs(hhmm, near) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(near + PKT_OFFSET);
  let ms = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h, m) - PKT_OFFSET;
  while (ms - near > 12 * 3600e3) ms -= 86400e3;
  while (near - ms > 12 * 3600e3) ms += 86400e3;
  return ms;
}

// Watches made before rules existed recorded their events under the old names (these expire within 3 days).
// Whether this rule's old event was sent.
function legacySent(rule, stops, sent) {
  if (rule.kind === 'leave') return rule.stop === stops[0]?.id && sent.has('departed');
  if (rule.kind === 'before') return rule.min === 15 && sent.has('approach');
  if (rule.kind === 'reach') return sent.has('arrived');
  return false;
}

class Alerts {
  constructor({ store, timetable, send, now = Date.now }) {
    this.store = store;
    this.timetable = timetable;
    this.send = send;
    this.now = now;
    this.watched = new Set(); // run ids with an active watch
    this.speeds = new Map(); // run id -> [[ms, km/h]] of the last 30 min
    this.pending = new Map(); // "endpoint|train" -> when the delay first moved 15+ min from its baseline
    this.refresh();
  }

  /** Reloads the set of runs worth checking. Call after a watch is added, removed or done. */
  refresh() {
    this.watched = new Set(this.store.watchedRuns());
    for (const id of this.speeds.keys()) if (!this.watched.has(id)) this.speeds.delete(id);
  }

  // e.g. "28 DN Shalimar Express". Upstream names end with the number and direction ("Shalimar Express 28DN"),
  // which the label already carries, so that tail is dropped.
  title(train, lang) {
    const t = this.timetable.byNumber.get(train);
    if (!t) return String(train);
    if (lang === 'ur') {
      const name = (t.TrainNameUR || '').replace(/\s*\d+\s*(اپ|ڈاؤن|ڈائون)\s*$/, '').trim();
      return `${train} ${t.IsUp ? 'اپ' : 'ڈاؤن'} ${name || t.TrainName}`;
    }
    return `${train} ${t.IsUp ? 'UP' : 'DN'} ${t.TrainName.replace(/\s*\d+\s*(UP|DN)\s*$/i, '').trim()}`;
  }

  name(station, lang) {
    return (lang === 'ur' && station.nameUr) || station.name;
  }

  /** Mean of the speeds over 3 km/h in the last 30 min of positions, or null with fewer than 5 of them. */
  recentSpeed(runId, now) {
    const moving = (this.speeds.get(runId) || []).filter(([ms, v]) => now - ms <= SPEED_WINDOW && v > 3);
    return moving.length < 5 ? null : moving.reduce((a, [, v]) => a + v, 0) / moving.length;
  }

  // When the run is expected at stops[i] (epoch ms), or null: the later of the timetable plus the delay (the feed's own ETA
  // when i is the next stop) and, within 120 km, the distance at the last 30 min's average speed plus 2 min a stop.
  // A stale check (no position for a while) uses the timetable plus the last delay only.
  expectedAt(run, stops, i, now, stale) {
    const s = stops[i], sched = s.arr ?? s.dep;
    if (sched == null) return null;
    const { nextIdx, kmTo } = this.timetable.progress(stops, run);
    let timetable = run.date + (sched + run.lateBy) * 60e3;
    if (stale) return timetable;
    if (i === nextIdx && run.nextEta) timetable = etaToMs(run.nextEta, timetable);
    const speed = this.recentSpeed(run.id, now), km = kmTo(i);
    if (!speed || km == null || km >= 120) return timetable;
    return Math.max(timetable, now + (km / speed) * 3600e3 + Math.max(0, i - nextIdx) * 2 * 60e3);
  }

  // The watch's rules, each with its key and the index of its stop on the route (a delay rule without a stop
  // runs to the last station). Rules for stops not on the route are dropped.
  rulesOf(w, stops) {
    const rules = w.rules ? JSON.parse(w.rules) : legacyRules(stops, w.stop);
    const last = stops.at(-1).id;
    return rules
      .map(rule => ({ rule, key: ruleKey(rule), i: stops.findIndex(s => s.id === (rule.stop ?? last)) }))
      .filter(r => r.i >= 0);
  }

  // The events sent for a watch; for an old watch, its old events also count as the matching rules' keys.
  sentOf(w, rules, stops) {
    const sent = this.store.sentEvents(w.endpoint, w.train);
    if (!w.rules) for (const r of rules) if (legacySent(r.rule, stops, sent)) sent.add(r.key);
    return sent;
  }

  // Called when a watch is saved (new or edited): remembers the current delay and marks as sent, without
  // pushing, whatever is already true so nothing fires late. `run` is the latest known position or null.
  begin(endpoint, train, run) {
    if (!run || run.suspect) return;
    const w = this.store.watchesForRun(run.id).find(x => x.endpoint === endpoint && x.train === train);
    const stops = this.timetable.routes.get(train);
    if (!w || !stops || !stops.length) return;
    const { prevIdx } = this.timetable.progress(stops, run);
    const now = this.now();
    this.store.setLastLate(endpoint, train, run.lateBy);
    this.pending.delete(`${endpoint}|${train}`);
    const mark = key => this.store.markSent(endpoint, train, key, now);
    for (const { rule, key, i } of this.rulesOf(w, stops)) {
      const reached = prevIdx >= i || kmFrom(run, stops[i]) < AWAY_KM;
      if (rule.kind === 'reach' && reached) mark(key);
      if (rule.kind === 'leave') {
        if (i > 0 && reached) mark(`at:${stops[i].id}`);
        if (i === 0 ? prevIdx >= 1 || kmFrom(run, stops[0]) > AWAY_KM : prevIdx >= i + 1) mark(key);
      }
      if (rule.kind === 'before') {
        const eta = reached ? null : this.expectedAt(run, stops, i, now, false);
        if (reached || (eta != null && eta - now <= rule.min * 60e3)) mark(key);
      }
    }
  }

  check(run) {
    if (run.suspect || !this.watched.has(run.id)) return;
    const now = this.now();
    const list = this.speeds.get(run.id) || [];
    list.push([now, run.speed]);
    while (list.length && now - list[0][0] > SPEED_WINDOW) list.shift();
    this.speeds.set(run.id, list);
    this.evaluate(run, now, false);
  }

  // Every minute: reload the watched runs and, for those whose position is more than 3 min old, check the "before" rules.
  tick(latest) {
    this.refresh();
    const now = this.now();
    for (const id of this.watched) {
      const run = latest.get(id);
      if (run && !run.suspect && now - run.updatedAt > STALE_MS) this.evaluate(run, now, true);
    }
  }

  evaluate(run, now, stale) {
    const stops = this.timetable.routes.get(run.train);
    if (!stops || !stops.length) return;
    const { prevIdx } = this.timetable.progress(stops, run);
    for (const w of this.store.watchesForRun(run.id)) {
      try {
        this.checkWatch(w, run, stops, prevIdx, now, stale);
      } catch (e) {
        console.log('Alert check failed:', e.message);
      }
    }
  }

  checkWatch(w, run, stops, prevIdx, now, stale) {
    const lang = w.lang === 'ur' ? 'ur' : 'en';
    const tx = TEXT[lang];
    const late = run.lateBy;
    const rules = this.rulesOf(w, stops);
    const sent = this.sentOf(w, rules, stops);
    const url = `/#/train/${w.train}?run=${encodeURIComponent(run.id)}`;
    const fire = (event, body, urgency) => {
      if (!this.store.markSent(w.endpoint, w.train, event, now)) return false;
      sent.add(event);
      this.send(w, { title: this.title(w.train, lang), body, tag: `train-${w.train}`, url }, event, urgency);
      return true;
    };
    const reached = i => prevIdx >= i || kmFrom(run, stops[i]) < AWAY_KM;
    const left = i => i === 0
      ? prevIdx >= 1 || (run.speed > 0 && kmFrom(run, stops[0]) > AWAY_KM)
      : prevIdx >= i + 1 || (sent.has(`at:${stops[i].id}`) && run.speed > 0 && kmFrom(run, stops[i]) > AWAY_KM);

    let settled = true;
    for (const { rule, key, i } of rules) {
      const name = this.name(stops[i], lang);
      if (rule.kind === 'before') {
        if (!sent.has(key) && !reached(i)) {
          const eta = this.expectedAt(run, stops, i, now, stale);
          if (eta != null && eta - now <= rule.min * 60e3) {
            const mins = Math.max(1, Math.round((eta - now) / 60e3));
            fire(key, tx.before(name, mins, clock(eta)) + (stale ? tx.stale : ''), 'high');
          }
        }
        if (!sent.has(key) && !reached(i)) settled = false;
      } else if (stale) {
        settled = false; // nothing else can change without a position
      } else if (rule.kind === 'reach') {
        if (!sent.has(key) && reached(i)) fire(key, tx.reach(name, late), 'high');
        if (!sent.has(key)) settled = false;
      } else if (rule.kind === 'leave') {
        const at = `at:${stops[i].id}`;
        // Remember the train was at this station, so a later move away counts as leaving.
        if (i > 0 && !sent.has(at) && reached(i) && this.store.markSent(w.endpoint, w.train, at, now)) sent.add(at);
        if (!sent.has(key) && left(i)) fire(key, tx.leave(name, late), 'normal');
        if (!sent.has(key)) settled = false;
      } else if (rule.kind === 'delay' && !reached(i)) {
        settled = false;
        this.checkDelay(w, run, stops, rule, i, prevIdx, now, lang, fire);
      }
    }
    if (settled && !stale) {
      this.store.markDone(w.endpoint, w.train);
      this.refresh();
    }
  }

  checkDelay(w, run, stops, rule, until, prevIdx, now, lang, fire) {
    const tx = TEXT[lang];
    const late = run.lateBy;
    const pkey = `${w.endpoint}|${w.train}`;
    if (w.last_late == null) {
      this.store.setLastLate(w.endpoint, w.train, late);
      w.last_late = late;
    }
    const base = w.last_late;
    if (Math.abs(late - base) < DELAY_STEP) {
      this.pending.delete(pkey);
      return;
    }
    if (!this.pending.has(pkey)) this.pending.set(pkey, now);
    if (now - this.pending.get(pkey) < DELAY_HOLD || now - this.store.lastDelaySent(w.endpoint, w.train) < DELAY_GAP) return;
    let body = tx.delay(late, base);
    if (rule.stop) {
      const eta = this.expectedAt(run, stops, until, now, false);
      if (eta != null) body += tx.expectedAt(this.name(stops[until], lang), clock(eta));
    }
    const prev = stops[prevIdx], next = stops[this.timetable.progress(stops, run).nextIdx];
    if (run.speed === 0 && kmFrom(run, prev) > 2 && kmFrom(run, next) > 2) {
      body += tx.stoppedBetween(this.name(prev, lang), this.name(next, lang));
    }
    fire(`delay:${now}`, body, 'normal');
    this.store.setLastLate(w.endpoint, w.train, late);
    w.last_late = late;
    this.pending.delete(pkey);
  }
}

module.exports = { Alerts, duration, clock };
