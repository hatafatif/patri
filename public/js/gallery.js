// The in-app component gallery (/components.html): every registered component, built from the components
// themselves, in a phone-width column and a wide column. Fixtures use real data (28 DN Shalimar Express).
import {
  AppBar, LanguageToggle, bindLanguageToggle, LiveIndicator, Panel, bindPanel, SearchField, bindSearchField,
  SegmentedControl, bindSegmentedControl, StationFields, bindStationFields, IconButton, FollowButton, bindFollowButton,
  MapToggle, bindMapToggle, TrainBadge, StatusChip, StatusStrip, TrainCard, TrainRow, DepartureRow, StopTimeline,
  bindStopTimeline, JourneyProgress, SectionHeader, DetailGrid, LinkRow, SpeedChart, bindSpeedChart, MapMarkers,
  trainMarker, mapLabel, mapPaint, Button, Card, PageHeader, Photo, bindPageHeader, ReplayBar, bindReplayBar, syncReplayBar, statusTone,
} from './components/index.js';
import { t, setLang, getLang, applyLang, clockMin, dur, delayText, pktMidnight, esc } from './i18n.js';

// ---------- Fixtures: { en, ur } pairs from /api/stations and /api/trains ----------
const ST = {
  lahore: { en: 'Lahore Jn', ur: 'لاہور جنکشن' },
  raiwind: { en: 'Raiwind Jn', ur: 'راۓوِنڈ جنکشن' },
  okara: { en: 'Okara', ur: 'اوکاڑا' },
  sahiwal: { en: 'Sahiwal', ur: 'ساہِيوال' },
  khanewal: { en: 'Khanewal Jn', ur: 'خانیوال جنکشن' },
  multan: { en: 'Multan Cantt', ur: 'ملتان کینٹ' },
  bahawalpur: { en: 'Bahawalpur', ur: 'بہاولپور' },
  khanpur: { en: 'Khanpur Jn', ur: 'خانپور جنکشن' },
  karachi: { en: 'Karachi Cantt', ur: 'کراچی کينٹ' },
  karachiCity: { en: 'Karachi City', ur: 'سٹی اسٹیشن کراچی' },
  rawalpindi: { en: 'Rawalpindi', ur: 'راولپِنڈى' },
  peshawar: { en: 'Peshawar Cantt', ur: 'پشاور کینٹ' },
  jacobabad: { en: 'Jacobabad Jn', ur: 'جیکب آباد' },
  nawabshah: { en: 'Nawabshah Jn', ur: 'نوابشاہ جنکشن' },
  rohri: { en: 'Rohri Jn', ur: 'روہڑی جنکشن' },
};
const TR = {
  shalimar: { en: 'Shalimar Express', ur: 'شالیمار ایکسپریس' },
  karakoram: { en: 'Karakoram Express', ur: 'قراقرم ایکسپریس' },
  tezgam: { en: 'Tezgam', ur: 'تیزگام' },
  pakistan: { en: 'Pakistan Express', ur: 'پاکستان ایکسپریس' },
  jaffar: { en: 'Jaffar Express', ur: 'جعفر ایکسپریس' },
  bahauddin: { en: 'Bahauddin Zikria Express', ur: 'بہائو الدین زکریا ایکسپریس' },
};
const L = o => o[getLang()];
const st = k => L(ST[k]);
const tr = k => L(TR[k]);
const badge = (number, direction) => ({ number, direction });

// A chip for a delay in minutes; the tone comes from statusTone and nothing is sorted or filtered by it.
const status = (late, extra = {}) => {
  const tone = statusTone(late);
  return { tone, text: late == null ? t('tagNoGps') : delayText(late), ...extra };
};
const route = (a, b) => t('passesFromTo', { a: st(a), b: st(b) });

// The strip on the Right now card: 28 DN at 105 km/h, 30 min late.
const strip = (late = 30, running = t('stRunningShort', { speed: 105 })) => ({
  running: { text: running },
  delay: { tone: statusTone(late), text: late == null ? t('tagNoGps') : delayText(late) },
  updated: t('updated', { ago: t('ago', { d: dur(1) }) }),
});

// 28 DN's stops, with the 30 min delay added to the timetable. Times are minutes after midnight.
const exp = min => ({ expected: clockMin(min + 30), scheduled: clockMin(min) });
const kmAway = 27;
function timeline(mode, legend = false) {
  const full = mode === 'full';
  const nowRow = { kind: 'train', name: t('trainHereKm', { km: kmAway, station: st('multan') }) };
  const rows = [
    ...(full ? [
      { kind: 'passed', name: st('lahore'), sub: t('km', { n: 0 }), time: { expected: clockMin(430) } },
      { kind: 'passed', name: st('okara'), sub: t('km', { n: 128 }), time: exp(560) },
    ] : []),
    { kind: 'passed', name: st('sahiwal'), sub: t('km', { n: '164.8' }), time: exp(603) },
    nowRow,
    { kind: 'next', name: st('multan'), sub: t('km', { n: 332 }), time: exp(770), countdown: t('inTime', { d: dur(15) }) },
    { kind: 'yourstop', name: st('bahawalpur'), sub: t('yourStop'), time: exp(865), change: true },
    ...(full ? [{ kind: 'stop', name: st('khanpur'), sub: t('km', { n: '549.9' }), time: exp(965) }] : []),
    { kind: 'more', name: t('moreStops', { n: full ? 7 : 8 }), href: '#/train/28dn/stops' },
    { kind: 'final', name: st('karachi'), sub: t('km', { n: '1,165' }), time: exp(1580) },
  ];
  return StopTimeline({ rows, mode, legend });
}

const progress = () => JourneyProgress({
  fraction: 305 / 1165,
  start: t('leftAt', { station: st('lahore'), time: clockMin(430) }),
  end: t('kmOf', { done: 305, total: '1,165' }),
});

const rightNowBody = () => stack(StatusStrip(strip()), timeline('compact'), progress(), 'loose');

// ---------- Speed history for 28 DN, 7:10 AM to about 1:05 PM, with a few station stops ----------
const midnight = pktMidnight();
const T0 = 430, T1 = 785;
const SPEED_STOPS = [{ min: 485, key: 'raiwind' }, { min: 592, key: 'okara' }, { min: 640, key: 'sahiwal' }];
function speedPoints() {
  const pts = [];
  for (let m = T0; m <= T1; m += 4) {
    const d = Math.min(...SPEED_STOPS.map(s => Math.abs(m - s.min)));
    const cruise = 100 + 9 * Math.sin(m / 11) + 4 * Math.sin(m / 3.3);
    const v = d < 1.5 ? 0 : cruise * Math.min(1, d / 9);
    pts.push([midnight + m * 60000, m === T1 ? 105 : Math.round(v)]);
  }
  return pts;
}
const SPEED_POINTS = speedPoints();
const speedStops = () => SPEED_STOPS.map(s => ({ ms: midnight + s.min * 60000, name: st(s.key) }));

// ---------- Specimens ----------
const PHOTO_SRC = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23e3ede6'/%3E%3Cpath d='M0 270H800' stroke='%2301411c' stroke-width='4'/%3E%3C/svg%3E";
const spec = (name, variant, stage, { cls = '' } = {}) =>
  `<section class="g-spec"><p class="g-cap" dir="ltr"><b>${name}</b>${variant ? ` · ${variant}` : ''}</p><div class="g-stage ${cls}">${stage}</div></section>`;
const wrap = (...items) => `<div class="g-wrap">${items.join('')}</div>`;
const stack = (...items) => {
  const loose = items[items.length - 1] === 'loose' && items.pop();
  return `<div class="g-stack${loose ? ' g-stack--loose' : ''}">${items.join('')}</div>`;
};
const group = (label, ...specs) => `<section class="g-group">${SectionHeader({ label, ruled: true })}${specs.join('')}</section>`;

const homeBody = () => {
  const cards = [
    TrainCard({
      href: '#/train/28', badge: badge(28, 'dn'), name: tr('shalimar'),
      position: route('sahiwal', 'multan'),
      yourStop: { name: st('multan'), time: `~${clockMin(800)}` },
      status: status(30, { dot: true }),
    }),
    TrainCard({
      href: '#/train/42', badge: badge(42, 'dn'), name: tr('karakoram'),
      position: t('stoppedAt', { station: st('lahore') }), status: status(0),
    }),
  ];
  const rows = [
    TrainRow({ href: '#/train/8', badge: badge(8, 'dn'), name: tr('tezgam'), sub: route('rawalpindi', 'karachi'), status: status(94) }),
    TrainRow({ href: '#/train/27', badge: badge(27, 'up'), name: tr('shalimar'), sub: route('karachi', 'lahore'), status: status(65) }),
    TrainRow({ href: '#/train/40', badge: badge(40, 'dn'), name: tr('jaffar'), sub: route('peshawar', 'jacobabad'), status: status(32) }),
    TrainRow({ href: '#/train/46', badge: badge(46, 'dn'), name: tr('pakistan'), sub: route('rawalpindi', 'karachi'), status: status(49) }),
  ];
  return AppBar({ live: 'on', lang: getLang() })
    + `<div class="g-pad">${SectionHeader({ label: t('myTrains'), count: 2, action: { label: t('edit'), href: '#/edit' } })}${cards.join('')}</div>`
    + `<div class="g-pad">${SectionHeader({ label: t('runningNowHead') })}<div>${rows.join('')}</div></div>`;
};

// A pretend map behind the panel, made of components: float controls, the train marker and a label.
const hostMap = () => `<div class="g-hostmap">`
  + `<div class="g-hostmap__controls">${IconButton({ icon: 'plus', label: t('zoomIn'), variant: 'float' })}${IconButton({ icon: 'minus', label: t('zoomOut'), variant: 'float' })}</div>`
  + `<div class="g-hostmap__label">${mapLabel({ title: st('multan'), sub: `~${clockMin(800)}`, kind: 'next' })}</div>`
  + `<div class="g-hostmap__train">${trainMarker({ label: `28 ${t('dn')}` })}</div>`
  + `</div>`;

const panelHost = (snap, short) =>
  `<div class="g-host${short ? ' g-host--short' : ''}">${hostMap()}${Panel({ body: homeBody(), snap, label: t('home') })}</div>`;

const MAP_COLOR_KEYS = ['circle-color', 'circle-stroke-color', 'line-color', 'text-color', 'text-halo-color', 'fill-color'];
function swatches() {
  const items = [];
  for (const [name, paint] of Object.entries(mapPaint())) {
    for (const key of MAP_COLOR_KEYS) {
      if (!paint[key]) continue;
      items.push(`<div class="g-swatch"><span class="g-swatch__chip" style="background:${esc(paint[key])}"></span><span><b>${esc(name)}</b><small>${esc(key)} ${esc(paint[key])}</small></span></div>`);
    }
  }
  return `<div class="g-swatches">${items.join('')}</div>`;
}

const stationBoard = () => {
  const rows = [
    { n: 26, d: 'dn', tr: 'bahauddin', sched: 960, est: 1066, late: 106, kind: 'starts', dest: 'karachiCity' },
    { n: 46, d: 'dn', tr: 'pakistan', sched: 1030, est: 1079, late: 49, kind: 'passes', dest: 'karachi', km: 28 },
    { n: 8, d: 'dn', tr: 'tezgam', sched: 1130, est: 1224, late: 94, kind: 'passes', dest: 'karachi', km: 182 },
    { n: 27, d: 'up', tr: 'shalimar', sched: 1195, est: 1260, late: 65, kind: 'passes', dest: 'lahore', km: 236 },
  ];
  return rows.map(r => DepartureRow({
    href: `#/train/${r.n}`,
    time: { expected: r.kind === 'starts' ? clockMin(r.est) : `~${clockMin(r.est)}`, scheduled: clockMin(r.sched) },
    train: { number: r.n, direction: r.d, name: tr(r.tr) },
    sub: r.kind === 'starts'
      ? `${t('startsHere')} · ${t('departsTo', { x: st(r.dest) })}`
      : `${t('departsTo', { x: st(r.dest) })} · ${t('kmAway', { km: r.km })}`,
    status: status(r.late),
  })).join('');
};

// A From → To row for a train that has already left: the caption sits over the time.
const leftRow = () => DepartureRow({
  href: '#/train/27',
  time: { expected: clockMin(430), caption: t('leftCaption') },
  train: { number: 27, direction: 'up', name: tr('shalimar') },
  sub: `${t('departsTo', { x: st('karachi') })} · ${t('km', { n: 1165 })}`,
  status: status(0),
});

function specimens(col) {
  const phone = col === 'phone';
  const name28 = tr('shalimar');
  const shell = group('Shell',
    spec('AppBar', 'live on · reconnecting · off · with back', stack(
      AppBar({ live: 'on', lang: getLang() }),
      AppBar({ live: 'reconnecting', lang: getLang() }),
      AppBar({ live: 'off', lang: getLang() }),
      AppBar({ live: 'on', lang: getLang(), back: { href: '#/', label: t('back') } }),
    ), { cls: 'g-stage--flush' }),
    spec('LanguageToggle', 'EN · اردو', wrap(LanguageToggle({ lang: 'en' }), LanguageToggle({ lang: 'ur' }))),
    spec('LiveIndicator', 'on · reconnecting · off (hidden)', wrap(
      LiveIndicator({ state: 'on' }), LiveIndicator({ state: 'reconnecting' }), LiveIndicator({ state: 'off' }),
    )),
    spec('Panel', phone ? 'in a 390px host: bottom sheet, snap half' : 'in a wide host: sidebar', panelHost('half'), { cls: 'g-stage--flush' }),
    phone ? spec('Panel', 'bottom sheet, snap down', panelHost('down', true), { cls: 'g-stage--flush' }) : '',
    spec('Card', 'plain, no header · plain with header', stack(
      Card({ tone: 'plain', body: TrainRow({ href: '#/train/28', badge: badge(28, 'dn'), name: name28, sub: route('lahore', 'karachi'), status: status(30) }) }),
      Card({ tone: 'plain', header: t('aboutTrain'), body: aboutGrid() }),
    )),
    spec('Card', 'key, no header · key "Right now"', stack(
      Card({ tone: 'key', body: stack(StatusStrip(strip()), progress(), 'loose') }),
      Card({ tone: 'key', header: t('rightNow'), body: rightNowBody() }),
    )),
    spec('Photo', 'with source link · without', stack(
      Photo({ src: PHOTO_SRC, alt: 'A sample landscape', credit: 'Photo: Example Author · CC BY-SA 4.0', href: 'https://example.org/photo' }),
      Photo({ src: PHOTO_SRC, alt: 'A sample landscape', credit: 'Photo: Example Author · CC BY-SA 4.0' }),
    )),
    spec('PageHeader', 'train: badge · Urdu name · follow · share', PageHeader({
      leading: { badge: badge(28, 'dn') }, title: TR.shalimar.en, titleUr: TR.shalimar.ur,
      subtitle: route('lahore', 'karachi'),
      actions: [{ kind: 'follow', followed: true, name: name28 }, { kind: 'share', label: t('share') }],
    })),
    spec('PageHeader', 'station: pin mark · Urdu name · follow with a Save label · share', PageHeader({
      leading: { icon: 'pin' }, title: ST.multan.en, titleUr: ST.multan.ur, subtitle: getLang() === 'ur' ? 'ملتان' : 'Multan',
      actions: [{ kind: 'follow', followed: false, name: st('multan'), label: { off: t('saveStation', { name: st('multan') }), on: t('saved') } }, { kind: 'share', label: t('share') }],
    })),
    spec('PageHeader', 'All stops: back · no leading', PageHeader({
      title: t('allStopsN', { n: 16 }),
      subtitle: `28 ${t('dn')} ${name28} · ${route('lahore', 'karachi')}`,
      actions: [{ kind: 'back', href: '#/train/28', label: t('back') }],
    })),
  );

  const inputs = group('Inputs',
    spec('SearchField', 'empty with placeholder · with a value · with route', stack(
      SearchField({ placeholder: t('searchTrains') }),
      SearchField({ value: getLang() === 'ur' ? 'شالی' : 'shal', placeholder: t('searchTrains') }),
      SearchField({ placeholder: t('searchTrains'), route: { href: '#/trip', label: t('fromTo') } }),
    )),
    spec('SegmentedControl', 'route options (links)', SegmentedControl({
      label: t('trainOrStation'), value: 'search',
      options: [{ value: 'search', label: t('trainOrStation'), href: '#/search' }, { value: 'trip', label: t('fromTo'), href: '#/trip' }],
    })),
    spec('SegmentedControl', 'local options (buttons), three choices', SegmentedControl({
      label: t('trainOrStation'), value: 'trains',
      options: [{ value: 'trains', label: t('tabTrains') }, { value: 'stations', label: t('tabStations') }, { value: 'trip', label: t('tabTrip') }],
    })),
    spec('StationFields', 'both set · to = null', stack(
      StationFields({ from: st('lahore'), to: st('karachi'), fromLabel: t('from'), toLabel: t('to') }),
      StationFields({ from: st('multan'), to: null, fromLabel: t('from'), toLabel: t('to') }),
    )),
    spec('IconButton', 'plain · outline · pressed · link', stack(
      wrap(
        IconButton({ icon: 'share', label: t('share'), variant: 'plain' }),
        IconButton({ icon: 'close', label: t('close'), variant: 'plain' }),
        IconButton({ icon: 'plus', label: t('zoomIn'), variant: 'outline' }),
        IconButton({ icon: 'minus', label: t('zoomOut'), variant: 'outline' }),
        IconButton({ icon: 'starFilled', label: t('follow', { name: name28 }), variant: 'outline', pressed: true }),
        IconButton({ icon: 'star', label: t('follow', { name: name28 }), variant: 'outline', pressed: false }),
        IconButton({ icon: 'back', label: t('back'), variant: 'outline', href: '#/' }),
      ),
    )),
    spec('IconButton', 'float, over the map', wrap(
      IconButton({ icon: 'layers', label: t('mapStyle'), variant: 'float' }),
      IconButton({ icon: 'share', label: t('share'), variant: 'float' }),
      IconButton({ icon: 'plus', label: t('zoomIn'), variant: 'float' }),
      IconButton({ icon: 'minus', label: t('zoomOut'), variant: 'float' }),
    ), { cls: 'g-stage--map' }),
    spec('FollowButton', 'followed · not followed', wrap(FollowButton({ followed: true, name: name28 }), FollowButton({ followed: false, name: name28 }))),
    spec('FollowButton', 'custom label: Save station / Saved', wrap(
      FollowButton({ followed: false, name: st('multan'), label: { off: t('saveStation', { name: st('multan') }), on: t('saved') } }),
      FollowButton({ followed: true, name: st('multan'), label: { off: t('saveStation', { name: st('multan') }), on: t('saved') } }),
    )),
    spec('MapToggle', 'on · off', wrap(MapToggle({ on: true, label: t('following') }), MapToggle({ on: false, label: t('following') })), { cls: 'g-stage--map' }),
    spec('ReplayBar', 'paused · playing · unrecorded days · disabled', stack(
      Card({ tone: 'plain', body: replayBar({ playing: false }) }),
      Card({ tone: 'plain', body: replayBar({ playing: true, at: REPLAY.from + 5.4 * DAY, speed: t('kmh', { n: 92 }) }) }),
      Card({ tone: 'plain', body: replayBar({ playing: false, gaps: [1, 2, 4, 6], at: REPLAY.from + 3.2 * DAY, speed: t('replayIdle') }) }),
      Card({ tone: 'plain', body: replayBar({ playing: false, disabled: true }) }),
    )),
    spec('Button', 'primary · secondary · link', wrap(
      Button({ label: t('seeAllStops'), variant: 'primary' }),
      Button({ label: t('chooseStop'), variant: 'secondary' }),
      Button({ label: t('change'), variant: 'link' }),
    )),
    spec('Button', 'with icon · full', stack(
      Button({ label: t('seeAllStops'), variant: 'primary', icon: 'chevronEnd' }),
      Button({ label: t('chooseStop'), variant: 'secondary', icon: 'chevronEnd' }),
      Button({ label: t('seeAllStops'), variant: 'primary', icon: 'chevronEnd', full: true }),
      Button({ label: t('chooseStop'), variant: 'secondary', full: true }),
    )),
  );

  const data = group('Train & station',
    spec('TrainBadge', 'sm · md · lg, DN', wrap(...['sm', 'md', 'lg'].map(size => TrainBadge({ ...badge(28, 'dn'), size })))),
    spec('TrainBadge', 'sm · md · lg, UP', wrap(...['sm', 'md', 'lg'].map(size => TrainBadge({ ...badge(27, 'up'), size })))),
    spec('TrainBadge', 'three-digit number', wrap(...['sm', 'md', 'lg'].map(size => TrainBadge({ ...badge(115, 'up'), size })))),
    spec('StatusChip', 'five tones, with a dot', wrap(...chips(true))),
    spec('StatusChip', 'five tones, no dot', wrap(...chips(false))),
    spec('StatusStrip', 'late · on time · early · no GPS', stack(
      StatusStrip(strip(30)),
      StatusStrip(strip(0)),
      StatusStrip(strip(-4)),
      StatusStrip({ running: { text: t('timetable') }, delay: { tone: 'nogps', text: t('tagNoGps') } }),
    )),
    spec('TrainCard', 'with your stop · without · stopped', stack(
      TrainCard({ href: '#/train/28', badge: badge(28, 'dn'), name: name28, position: route('sahiwal', 'multan'), yourStop: { name: st('multan'), time: `~${clockMin(800)}` }, status: status(30, { dot: true }) }),
      TrainCard({ href: '#/train/27', badge: badge(27, 'up'), name: name28, position: route('nawabshah', 'rohri'), status: status(65) }),
      TrainCard({ href: '#/train/42', badge: badge(42, 'dn'), name: tr('karakoram'), position: t('stoppedAt', { station: st('lahore') }), status: status(0) }),
    )),
    spec('TrainRow', 'with match highlighting · with follow', stack(
      TrainRow({ href: '#/train/28', badge: badge(28, 'dn'), name: name28, sub: route('lahore', 'karachi'), status: status(30), match: getLang() === 'ur' ? 'شالی' : 'shal' }),
      TrainRow({ href: '#/train/27', badge: badge(27, 'up'), name: name28, sub: route('karachi', 'lahore'), status: status(65), follow: { followed: true } }),
      TrainRow({ href: '#/train/42', badge: badge(42, 'dn'), name: tr('karakoram'), sub: route('lahore', 'karachi'), status: status(0), follow: { followed: false } }),
    )),
    spec('DepartureRow', 'Multan Cantt board', `<div>${stationBoard()}</div>`),
    spec('DepartureRow', 'time caption: a train already on its way', `<div>${leftRow()}</div>`),
    spec('StopTimeline', 'compact (the Right now form)', timeline('compact')),
    spec('StopTimeline', 'full: passed · train · next · yourstop · stop · more · final', timeline('full')),
    spec('StopTimeline', 'full, with the expected · scheduled legend (All stops)', timeline('full', true)),
    spec('JourneyProgress', '305 of 1,165 km', progress()),
    spec('SectionHeader', 'with a count and action · ruled · plain', stack(
      SectionHeader({ label: t('myTrains'), count: 2, action: { label: t('edit'), href: '#/edit' } }),
      SectionHeader({ label: t('rightNow'), ruled: true }),
      SectionHeader({ label: t('runningNowHead') }),
      'loose',
    )),
    spec('DetailGrid', '28 DN, with an Urdu-name value', aboutGrid()),
    spec('LinkRow', 'Return train', LinkRow({ href: '#/train/27', eyebrow: t('returnTrain'), label: `27 ${t('up')} ${name28}` })),
    spec('SpeedChart', '28 DN from 7:10 AM', SpeedChart({ points: SPEED_POINTS, stops: speedStops(), now: SPEED_POINTS[SPEED_POINTS.length - 1][0] })),
    spec('SpeedChart', 'custom title · stats off', SpeedChart({ points: SPEED_POINTS, stops: speedStops(), now: SPEED_POINTS[SPEED_POINTS.length - 1][0], title: t('speedSoFar'), stats: false })),
    spec('SpeedChart', 'empty state', SpeedChart({ points: [], stops: [] })),
  );

  const map = group('Map',
    spec('MapMarkers', 'trainMarker · mapLabel next · yourstop · selected · hover', `<div class="g-wrap g-wrap--start">${[
      `<div class="g-markerslot">${trainMarker({ label: `28 ${t('dn')} · ${t('kmh', { n: 105 })}` })}</div>`,
      mapLabel({ title: st('multan'), sub: `~${clockMin(800)}`, kind: 'next' }),
      mapLabel({ title: st('bahawalpur'), sub: `~${clockMin(895)}`, kind: 'yourstop' }),
      mapLabel({ title: st('sahiwal'), kind: 'selected' }),
      mapLabel({ title: st('okara'), kind: 'hover' }),
      MapMarkers({ type: 'label', title: st('khanewal'), sub: `~${clockMin(785)}`, kind: 'next' }),
    ].join('')}</div>`, { cls: 'g-stage--map' }),
    spec('MapMarkers', 'mapPaint() colours', swatches()),
  );

  return shell + inputs + data + map;
}

// A week of replay ending at the PKT midnight before today; the days with an index in `gaps` have no recording.
const DAY = 86400e3;
const REPLAY = { from: midnight - 8 * DAY + 4 * 3600e3, to: midnight - DAY + 20 * 3600e3 };
const WEEKDAYS = { en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], ur: ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'] };
const MONTHS = { en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], ur: ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'] };
const replayTime = at => {
  const d = new Date(at + 5 * 3600e3); // Pakistan time, read as UTC
  return `${WEEKDAYS[getLang()][d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[getLang()][d.getUTCMonth()]} · ${clockMin(d.getUTCHours() * 60 + d.getUTCMinutes())}`;
};
function replayBar({ playing, at = REPLAY.from + 2.5 * DAY + 11 * 3600e3, gaps = [], speed = t('kmh', { n: 74 }), disabled = false }) {
  const days = [];
  for (let start = REPLAY.from - 4 * 3600e3, i = 0; start < REPLAY.to; start += DAY, i++) days.push({ start, recorded: !gaps.includes(i) });
  return ReplayBar({ playing, at, from: REPLAY.from, to: REPLAY.to, days, time: replayTime(at), speed, label: t('replayTime'), disabled });
}

const chips = dot => [
  StatusChip({ tone: 'late', text: t('late', { d: dur(30) }), dot }),
  StatusChip({ tone: 'ontime', text: t('onTime'), dot }),
  StatusChip({ tone: 'early', text: t('early', { d: dur(4) }), dot }),
  StatusChip({ tone: 'nogps', text: t('tagNoGps'), dot }),
  StatusChip({ tone: 'neutral', text: t('updated', { ago: t('ago', { d: dur(1) }) }), dot }),
];

function aboutGrid() {
  return DetailGrid({
    items: [
      { label: t('detailNumber'), value: `28 ${t('dn')}` },
      { label: t('detailUrduName'), value: TR.shalimar.ur, lang: 'ur' },
      { label: t('detailRoute'), value: route('lahore', 'karachi') },
      { label: t('detailDistance'), value: t('km', { n: '1,165' }) },
      { label: t('detailDeparts'), value: clockMin(430) },
      { label: t('detailRuns'), value: t('daily') },
    ],
  });
}

// ---------- Page ----------
const app = document.getElementById('app');
let unbinds = [];

function render() {
  unbinds.forEach(fn => fn());
  unbinds = [];
  const lang = getLang();
  app.innerHTML = `<header class="g-top">${AppBar({ live: 'on', lang })}<div class="g-intro"><h1 class="g-title" dir="ltr">Patri components</h1>`
    + `<p class="g-lede" dir="ltr">Every registered component, built from the components themselves. Phone column 390px, wide column 960px and up.</p></div></header>`
    + `<main class="g-page"><div class="g-cols">`
    + `<div class="g-col" id="col-phone"><p class="g-coltitle" dir="ltr"><b>Phone</b> · 390px</p>${specimens('phone')}</div>`
    + `<div class="g-col" id="col-wide"><p class="g-coltitle" dir="ltr"><b>Wide</b> · 960px and up</p>${specimens('wide')}</div>`
    + `</div></main>`;

  // Delegated binds: the top bar, then each column (they cover every specimen inside).
  unbinds.push(bindLanguageToggle(document.body, { onChange: next => { setLang(next); render(); } }));
  for (const col of app.querySelectorAll('.g-col')) {
    unbinds.push(
      bindPanel(col),
      bindSearchField(col),
      bindSegmentedControl(col),
      bindStationFields(col),
      bindFollowButton(col),
      bindPageHeader(col),
      bindMapToggle(col),
      bindStopTimeline(col),
      bindSpeedChart(col, SPEED_POINTS),
    );
    // Each replay bar plays and scrubs on its own, so the specimens can be tried.
    for (const bar of col.querySelectorAll('.p-replaybar')) {
      const state = { at: Number(bar.querySelector('.p-replaybar__range').value) * 60000 + REPLAY.from, playing: bar.querySelector('.p-replaybar__play').dataset.state === 'playing' };
      const show = () => syncReplayBar(bar, { ...state, time: replayTime(state.at), speed: bar.querySelector('.p-replaybar__speed').textContent });
      unbinds.push(bindReplayBar(bar, { onToggle: () => { state.playing = !state.playing; show(); }, onScrub: at => { state.at = at; show(); } }));
    }
  }
}

// The gallery's links are placeholders; keep the page where it is.
document.addEventListener('click', e => {
  if (e.target.closest?.('a[href^="#"]')) e.preventDefault();
});

applyLang();
render();
