// Frozen sample data for the screen templates, used by the library previews and /screens.html.
// Every name, number and time is real: the strings and numbers come from the approved wireframes
// ("Patri Blueprint Wireframes", Sunday 18 Oct 2026) and the Urdu names, ids, stops and timetable from
// the live API (/api/trains, /api/stations, /api/route?train=28, /api/board?station=116, /api/trip?from=108&to=129).
// The shapes are the screens' data typedefs. Times are minutes after midnight in Pakistan time.
// The wireframes were drawn at different moments, so each screen has its own `now`, worked out from what it shows.

const freeze = o => {
  if (o && typeof o === 'object' && !Object.isFrozen(o)) {
    Object.freeze(o);
    Object.values(o).forEach(freeze);
  }
  return o;
};

// ---------- Stations (ids, names and Urdu names from /api/stations and /api/route) ----------
const S = {
  lahore: { id: '108', name: 'Lahore Jn.', nameUr: 'لاہور جنکشن', city: 'Lahore', cityUr: 'لاہور' },
  kotLakhpat: { id: '165', name: 'Kot Lakhpat', nameUr: 'کوٹ لکھپت', city: 'Lahore' },
  raiwind: { id: '109', name: 'Raiwind Jn.', nameUr: 'راۓوِنڈ جنکشن', city: 'Raiwind' },
  okara: { id: '111', name: 'Okara', nameUr: 'اوکاڑا ', city: 'Okara' },
  sahiwal: { id: '112', name: 'Sahiwal', nameUr: 'ساہِيوال', city: 'Sahiwal' },
  multan: { id: '116', name: 'Multan Cantt', nameUr: 'ملتان کینٹ', city: 'Multan', cityUr: 'ملتان' },
  bahawalpur: { id: '117', name: 'Bahawalpur', nameUr: 'بہاولپور', city: 'Bahawalpur' },
  khanpur: { id: '118', name: 'Khanpur Jn.', nameUr: 'خانپور جنکشن', city: 'Khanpur' },
  rahimYarKhan: { id: '119', name: 'Rahim Yar Khan', nameUr: 'رحیم یار خان', city: 'Rahim Yar Khan' },
  sadiqabad: { id: '138', name: 'Sadiqabad', nameUr: 'صادق آباد', city: 'Rahim Yar Khan' },
  ghotki: { id: '136', name: 'Ghotki', nameUr: 'گھوٹکی ,', city: 'Ghotki' },
  rohri: { id: '120', name: 'Rohri Jn.', nameUr: 'روہڑی جنکشن', city: 'Rohri' },
  nawabshah: { id: '123', name: 'Nawabshah Jn.', nameUr: 'نوابشاہ جنکشن', city: 'Nawabshah' },
  hyderabad: { id: '126', name: 'Hyderabad Jn', nameUr: 'حیدرآباد جنکشن', city: 'Hyderabad' },
  landhi: { id: '127', name: 'Landhi Jn.', nameUr: 'لانڈھی جنکشن', city: 'Karachi' },
  karachi: { id: '129', name: 'Karachi Cantt', nameUr: 'کراچی کينٹ', city: 'Karachi', cityUr: 'کراچی' },
  karachiCity: { id: '172', name: 'Karachi City', nameUr: 'سٹی اسٹیشن کراچی ', city: 'Karachi' },
  rawalpindi: { id: '101', name: 'Rawalpindi', nameUr: 'راولپِنڈى', city: 'Rawalpindi' },
  peshawar: { id: '170', name: 'Peshawar Cantt', nameUr: 'پشاور کینٹ', city: 'Peshawar' },
  jacobabad: { id: '232', name: 'Jacobabad Jn', nameUr: 'جیکب آباد', city: 'Jacobabad' },
  sargodha: { id: '152', name: 'Sargodha Jn', nameUr: 'سرگودھا جنکشن ', city: 'Sargodha' },
  shaheenabad: { id: '151', name: 'Shaheenabad Jn', nameUr: 'شاہین آباد جنکشن', city: 'Sargodha' },
  padidan: { id: '137', name: 'Padidan', nameUr: 'پڈعیدن ,', city: 'Naushahro Feroze' },
  khanewal: { id: '135', name: 'Khanewal Jn', nameUr: 'خانیوال جنکشن ,', city: 'Khanewal' },
};

// ---------- Trains (trainInfo() of /api/trains: number, label, direction, names) ----------
const train = (number, up, name, nameUr) => ({ number, label: String(number), up, name, nameUr });
const T = {
  1: train(1, true, 'Khyber Mail', 'خیبر میل'),
  2: train(2, false, 'Khyber Mail', 'خیبر میل'),
  8: train(8, false, 'Tezgam', 'تیزگام'),
  10: train(10, false, 'Allama Iqbal Express', 'علامہ اقبال ایکسپریس'),
  11: train(11, true, 'Hazara Express', 'ہزارا ایکسپریس'),
  16: train(16, false, 'Karachi Express', 'کراچی ایکسپریس'),
  18: train(18, false, 'Millat Express', 'ملت ایکسپریس'),
  26: train(26, false, 'Bahauddin Zikria Express', 'بہائو الدین زکریا ایکسپریس'),
  27: train(27, true, 'Shalimar Express', 'شالیمار ایکسپریس'),
  28: train(28, false, 'Shalimar Express', 'شالیمار ایکسپریس'),
  34: train(34, false, 'Pak Business', 'پاک بزنس'),
  38: train(38, false, 'Fareed Express', 'فرید ایکسپریس'),
  40: train(40, false, 'Jaffar Express', 'جعفر ایکسپریس'),
  42: train(42, false, 'Karakoram Express', 'قراقرم ایکسپریس'),
  46: train(46, false, 'Pakistan Express', 'پاکستان ایکسپریس'),
  47: train(47, true, 'Rehman Baba Express', 'رحمان بابا ایکسپریس'),
  48: train(48, false, 'Rehman Baba Express', 'رحمان بابا ایکسپریس'),
  127: train(127, true, 'Mehr Express', 'مھر ایکسپریس'),
};

const between = (from, to) => ({ kind: 'between', from, to });

// ---------- Home (Main.dc.html, Home-Peek.dc.html, Desktop-Home.dc.html) ----------
const home = {
  live: 'on',
  myTrains: [
    { train: T[28], where: between(S.sahiwal, S.multan), late: 30, gps: true, runId: '281810', yourStop: { station: S.bahawalpur, est: 895 } },
    { train: T[10], where: { kind: 'stopped', at: S.lahore }, late: 47, gps: true, runId: '101810' },
  ],
  // The six rows the web wireframe lists, in train-number order.
  running: [
    { train: T[11], where: between(S.nawabshah, S.padidan), late: 36, gps: true },
    { train: T[18], where: between(S.sargodha, S.shaheenabad), late: 15, gps: true },
    { train: T[27], where: between(S.nawabshah, S.rohri), late: 34, gps: true, runId: '271810' },
    { train: T[28], where: between(S.sahiwal, S.multan), late: 30, gps: true, runId: '281810' },
    { train: T[47], where: between(S.landhi, S.hyderabad), late: 4, gps: true },
    { train: T[48], where: { kind: 'notDeparted', at: S.peshawar }, late: -3, gps: true },
  ],
  runningCount: 41,
  map: { hover: { key: 'lahore', station: S.lahore } },
};

// ---------- Search (Search.dc.html) ----------
const search = {
  query: 'Shalimar',
  trains: [
    { train: T[28], from: S.lahore, to: S.karachi, late: 30, gps: true, followed: true, runId: '281810' },
    { train: T[27], from: S.karachi, to: S.lahore, late: 34, gps: true, followed: false, runId: '271810' },
  ],
  recent: [
    { kind: 'trip', from: S.lahore, to: S.karachi },
    { kind: 'station', station: S.multan },
  ],
};

// ---------- From → To (Route.dc.html; /api/trip?from=108&to=129) ----------
// now is 1:14 PM: Karakoram Express (3:00 PM) leaves "in 1h 46m". dep and arr are the timetable from
// /api/trip, late the delay the wireframe shows. The wireframe lists three of the four trains on the way;
// the fourth, Khyber Mail 2 DN (left 7:50 AM), comes from /api/trip with the delay the Station wireframe shows.
const routeSample = {
  from: S.lahore,
  to: S.karachi,
  date: '2026-10-18',
  day: 'today',
  now: 794,
  leaving: [
    { train: T[8], dep: 825, arr: 2070, late: 110, gps: true, stopsBetween: 21, runId: '81810' },
    { train: T[42], dep: 900, arr: 2085, late: null, gps: true, stopsBetween: 7 },
    { train: T[34], dep: 990, arr: 2130, late: null, gps: false, stopsBetween: 11 },
    { train: T[16], dep: 1080, arr: 2255, late: null, gps: true, stopsBetween: 11 },
  ],
  onTheWay: [
    { train: T[38], dep: 360, arr: 1915, late: 55, gps: true, stopsBetween: 43, runId: '381810' },
    { train: T[28], dep: 430, arr: 1580, late: 30, gps: true, stopsBetween: 14, runId: '281810' },
    { train: T[2], dep: 470, arr: 1820, late: 198, gps: true, stopsBetween: 29, runId: '21710' },
    { train: T[10], dep: 730, arr: 1995, late: 47, gps: true, stopsBetween: 26, runId: '101810' },
  ],
};

// ---------- Train page and All stops: 28 DN (Train.dc.html, Stops.dc.html, Desktop-Train.dc.html) ----------
// The route is /api/route?train=28. now is 1:00 PM: Multan Cantt (~1:20 PM) is "in 20 min". The train
// is 30 min late, 27 km short of Multan Cantt, 305 km from Lahore, last reported 1 min ago.
const STOPS = [
  [S.lahore, null, 430, 0],
  [S.kotLakhpat, 450, 452, 13.1],
  [S.raiwind, 478, 480, 38.8],
  [S.okara, 560, 562, 128],
  [S.sahiwal, 603, 605, 164.8],
  [S.multan, 770, 790, 332],
  [S.bahawalpur, 865, 867, 420.7],
  [S.khanpur, 965, 967, 549.9],
  [S.rahimYarKhan, 990, 992, 591.5],
  [S.sadiqabad, 1012, 1014, 613.2],
  [S.ghotki, 1070, 1072, 700.1],
  [S.rohri, 1140, 1165, 753.6],
  [S.nawabshah, 1318, 1320, 920.7],
  [S.hyderabad, 1425, 1430, 1016.9],
  [S.landhi, 1540, 1542, 1147.9],
  [S.karachi, 1580, null, 1165.2],
].map(([s, arr, dep, km]) => ({ ...s, arr, dep, km }));

const LATE = 30;
const PASSED = 4; // Sahiwal
// Expected times: the timetable plus today's delay, as the wireframes show them.
const ests = STOPS.map((s, i) => (i <= PASSED ? { passed: true } : { passed: false, est: (s.arr ?? s.dep) + LATE }));

// ILLUSTRATIVE speed history: the wireframe's chart is a sketch, so these samples are made up to look
// like a run from 7:10 AM to 1:00 PM with stops at Raiwind, Okara and Sahiwal, ending at 105 km/h.
// Only the stations and the 105 km/h are real.
const DAY0 = Date.UTC(2026, 9, 18) - 5 * 3600e3; // midnight PKT, Sun 18 Oct 2026
const SPEED_STOPS = [{ min: 490, id: S.raiwind.id }, { min: 585, id: S.okara.id }, { min: 633, id: S.sahiwal.id }];
function speedPoints() {
  const pts = [];
  for (let m = 430; m < 780; m += 4) {
    const d = Math.min(...SPEED_STOPS.map(s => Math.abs(m - s.min)));
    const cruise = 100 + 9 * Math.sin(m / 11) + 4 * Math.sin(m / 3.3);
    pts.push([DAY0 + m * 60e3, d < 1.5 ? 0 : Math.round(cruise * Math.min(1, d / 9))]);
  }
  pts.push([DAY0 + 780 * 60e3, 105]);
  return pts;
}

const trainSample = {
  live: 'on',
  train: T[28],
  stops: STOPS,
  gps: true,
  run: { speed: 105, late: LATE, updatedAt: 779, date: '2026-10-18', gps: true },
  now: 780,
  ests,
  progress: { passedIdx: PASSED, nextIdx: PASSED + 1, kmDone: 305, kmToNext: 27 },
  followed: true,
  speed: {
    illustrative: true,
    points: speedPoints(),
    stops: SPEED_STOPS.map(s => ({ ms: DAY0 + s.min * 60e3, id: s.id })),
    now: DAY0 + 780 * 60e3,
  },
  details: { locomotive: '9052' },
  returnTrain: T[27],
};

// ---------- Station page: Multan Cantt (Station.dc.html, Desktop-Station.dc.html; /api/board?station=116) ----------
// The eight trains of the web wireframe's board, in expected-time order. The board was "updated just now";
// now is taken as 4:10 PM, just before the first two 4:15 PM departures.
const board = (t, kind, origin, dest, sched, est, late, gps, extra = {}) =>
  ({ train: t, kind, origin, dest, sched, est, late, gps, runId: null, kmAway: null, atPlatform: false, ...extra });
const station = {
  live: 'on',
  station: S.multan,
  saved: false,
  now: 970,
  updatedAt: 970,
  rows: [
    board(T[26], 'starts', S.multan, S.karachiCity, 960, 975, 15, false, { runId: '261810', atPlatform: true }),
    board(T[127], 'starts', S.multan, S.rawalpindi, 975, 975, null, false),
    board(T[1], 'passes', S.karachi, S.peshawar, 875, 998, 123, true, { kmAway: 27 }),
    board(T[2], 'passes', S.peshawar, S.karachi, 820, 1018, 198, true, { runId: '21710', kmAway: 48 }),
    board(T[46], 'passes', S.rawalpindi, S.karachi, 1030, 1080, 50, true, { runId: '461810', kmAway: 110 }),
    board(T[8], 'passes', S.rawalpindi, S.karachi, 1130, 1245, 115, true, { runId: '81810', kmAway: 294 }),
    board(T[27], 'passes', S.karachi, S.lahore, 1195, 1265, 70, true, { runId: '271810', kmAway: 341 }),
    board(T[40], 'passes', S.peshawar, S.jacobabad, 1245, 1272, 27, true, { runId: '401810', kmAway: 328 }),
  ],
  map: { hover: { key: 'khanewal', station: S.khanewal } },
};

// ---------- Journey replay: the train sample plus a ready replay (about 5 days recorded, one not) ----------
// The replay texts are plain English here: samples hold data, and the view localises them with t().
const REPLAY_FROM = DAY0 - 4 * 86400e3 + 7 * 3600e3;
const REPLAY_TO = DAY0 + 20 * 3600e3;
const replaySample = {
  ...trainSample,
  replay: {
    state: 'ready',
    days: 7,
    periods: [7, 30, 90].map(n => ({ value: String(n), label: `${n} days`, href: `#/train/28/replay?days=${n}` })),
    bar: {
      playing: true, at: DAY0 - 86400e3 + 15 * 3600e3, from: REPLAY_FROM, to: REPLAY_TO,
      days: [0, 1, 2, 3, 4].map(i => ({ start: DAY0 - (4 - i) * 86400e3, recorded: i !== 2 })),
      time: 'Sat 17 Oct · 3:00 PM', speed: '96 km/h', label: 'Replay time',
    },
    since: 'Recorded since Wed 14 Oct',
    returnName: '27 UP Shalimar Express',
  },
};

/** The samples, one per screen. StopsScreen takes samples.train. */
export const samples = freeze({ home, search, route: routeSample, train: trainSample, replay: replaySample, station });
