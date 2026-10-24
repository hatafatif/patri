// Rules engine for push alerts. update() in server.js calls check(run) after each recorded position;
// for every watch on that run (one phone watching one train, optionally for one stop) it decides which
// of four events are due: departed, approach (15 min before the stop), delay (the lateness moved by
// 15+ min) and arrived. Each event is sent at most once per watch (the `sent` table). It only ever
// concerns the one train a person chose to watch; nothing here filters or sorts trains by lateness.
// Texts are English or Urdu per watch. `send(watch, payload, event)` is push.js's sender.
// The feed marks the first station passed while the train still waits there, and never marks the last
// station passed, so leaving the first and reaching any stop also go by the distance.
const { haversineKm } = require('./data.js');

const PKT_OFFSET = 5 * 3600e3;
const APPROACH_MIN = 15; // minutes before the stop
const DELAY_STEP = 15; // minutes of change worth an alert
const DELAY_GAP = 20 * 60e3; // at most one delay alert per 20 min
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

class Alerts {
  constructor({ store, timetable, send, now = Date.now }) {
    this.store = store;
    this.timetable = timetable;
    this.send = send;
    this.now = now;
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

  // Called when a watch is created: remembers the current delay and, if the run has already left,
  // marks 'departed' as sent so it never fires late. `run` is the latest known position or null.
  begin(endpoint, train, run) {
    if (!run || run.suspect) return;
    const stops = this.timetable.routes.get(train) || [];
    const { prevIdx } = this.timetable.progress(stops, run);
    this.store.setLastLate(endpoint, train, run.lateBy);
    if (prevIdx >= 1 || kmFrom(run, stops[0]) > AWAY_KM) this.store.markSent(endpoint, train, 'departed');
  }

  check(run) {
    if (run.suspect) return;
    const watches = this.store.watchesForRun(run.id);
    if (!watches.length) return;
    const stops = this.timetable.routes.get(run.train);
    if (!stops || !stops.length) return;
    const { prevIdx } = this.timetable.progress(stops, run);
    const now = this.now();
    const late = run.lateBy;
    for (const w of watches) {
      try {
        this.checkWatch(w, run, stops, prevIdx, late, now);
      } catch (e) {
        console.log('Alert check failed:', e.message);
      }
    }
  }

  checkWatch(w, run, stops, prevIdx, late, now) {
    const lang = w.lang === 'ur' ? 'ur' : 'en';
    const tx = TEXT[lang];
    const stopIdx = w.stop ? stops.findIndex(s => s.id === w.stop) : -1;
    const fire = (event, body, urgency) => {
      if (!this.store.markSent(w.endpoint, w.train, event, now)) return false;
      this.send(w, { title: this.title(w.train, lang), body, tag: `train-${w.train}`, url: `/#/train/${w.train}` }, event, urgency);
      return true;
    };

    // Arrived ends the watch; nothing else is worth saying after it.
    const reached = i => prevIdx >= i || kmFrom(run, stops[i]) < AWAY_KM;
    const done = stopIdx >= 0
      ? reached(stopIdx)
      : reached(stops.length - 1) || /done|arrived|complete/i.test(String(run.status ?? ''));
    if (done) {
      const st = stops[stopIdx >= 0 ? stopIdx : stops.length - 1];
      fire('arrived', tx.reach(this.name(st, lang), late), 'high');
      this.store.markDone(w.endpoint, w.train);
      return;
    }

    // Left: past the next station, or moving and clear of the first one (a waiting train is already "past" it).
    if (prevIdx >= 1 || (run.speed > 0 && kmFrom(run, stops[0]) > AWAY_KM)) fire('departed', tx.leave(this.name(stops[0], lang), late), 'normal');

    if (stopIdx >= 0) {
      const stop = stops[stopIdx];
      const sched = stop.arr ?? stop.dep;
      if (sched != null) {
        const eta = run.date + (sched + late) * 60000;
        const mins = (eta - now) / 60000;
        if (mins <= APPROACH_MIN) {
          fire('approach', tx.before(this.name(stop, lang), Math.max(1, Math.round(mins)), clock(eta)), 'high');
        }
      }
    }

    if (w.last_late == null) {
      this.store.setLastLate(w.endpoint, w.train, late);
    } else if (Math.abs(late - w.last_late) >= DELAY_STEP && now - this.store.lastDelaySent(w.endpoint, w.train) >= DELAY_GAP) {
      fire(`delay:${late}`, tx.delay(late, w.last_late), 'normal');
      this.store.setLastLate(w.endpoint, w.train, late);
    }
  }
}

module.exports = { Alerts, duration, clock };
