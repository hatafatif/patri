// English and Urdu strings, plus time and duration formatting in Pakistan time.

const STRINGS = {
  en: {
    appTitle: 'Patri',
    tabTrains: 'Trains', tabStations: 'Stations', tabTrip: 'Trip',
    live: 'Live', reconnecting: 'Reconnecting',
    findTrain: 'Find your train', findTrainSub: 'Name, number or city · {n} trains',
    searchTrains: 'Search name, number or city', searchStations: 'Search station or city', cancel: 'Cancel',
    noMatch: 'Nothing matches “{q}”', groupLive: 'Live tracking', groupTimetable: 'Timetable only',
    tagLive: 'Live', tagNoGps: 'No GPS',
    runningNow: 'Running now · {n}', onTime: 'On time', underHour: 'Under 1 h late', overHour: 'Over 1 h late',
    all: 'All', sortLeast: 'Least late first', sortMost: 'Most late first', sortNumber: 'By train number',
    legendTitle: '{n} trains on the move', legendOnTime: 'On time (up to 15 min)',
    late: '{d} late', early: '{d} early', hm: '{h} h {m} min', h: '{h} h', m: '{m} min', s: '{s}s',
    ago: '{d} ago', inTime: 'in {d}', km: '{n} km', kmh: '{n} km/h',
    waiting: 'Waiting', stopped: 'Stopped',
    stRunning: 'Running at {speed} km/h', stRunningShort: 'Running · {speed} km/h',
    stBetween: 'Between {a} and {b}', stStoppedAt: 'Stopped at {station}', stStoppedBetween: 'Stopped between stations',
    stFor: 'for {d}', stNotDeparted: 'Not departed yet', stWasDue: '{station} · was due {time}',
    stArrived: 'Arrived at {station}', stLost: 'No signal for {d}', stLastSeen: 'Last seen near {station}',
    notDepartedAt: 'Not departed · {station}', stoppedAt: 'Stopped · {station}',
    departedOn: 'Departed {day} {month}',
    hiddenRuns: '{n} more run hidden: its data looks wrong', showAnyway: 'Show anyway',
    noLiveRun: 'This train has no live run right now.', noGpsTrain: 'This train has no GPS, so only its timetable is shown.',
    yourStop: 'Your stop', change: 'Change', arrivesAt: 'Arrives ~{time}', kmToGo: '{km} km to go',
    passedYourStop: 'Passed your stop at {time}', promptStop: 'Where are you getting on or off?',
    promptStopSub: 'Get a live countdown to your station', chooseStop: 'Choose your stop', setMyStop: 'Set as my stop',
    chooseStopSub: '{train} · times include today’s delay', comingUp: 'Coming up', alreadyPassed: 'Already passed',
    nextStop: 'Next stop', lastStop: 'Last stop', passedAt: 'Passed {time}', stopsN: 'Stops · {n}',
    showEarlier: 'Show {n} earlier stops', hideEarlier: 'Hide earlier stops', trainHere: 'Train here · {speed} km/h',
    following: 'Following', trail: 'Trail', speedToday: 'Speed today', avg: 'avg', top: 'Top {n}', stoppedFor: 'stopped {d}',
    noHistory: 'The speed chart fills in while the app is running.', now: 'Now',
    etaHow: 'Timetable {sched} + {late} delay · {km} km at {speed} km/h',
    chooseStation: 'Choose a station', trainsNext: '{n} trains in the next 5 hours', arriving: 'Arriving', departing: 'Departing',
    nowAt: 'Now {time}', departsTo: 'Departs to {x}', arrivesFrom: 'Arrives from {x}', passesFromTo: '{a} ➜ {b}',
    atPlatform: 'On the platform', leavingNow: 'leaving now', kmAway: '{km} km away', noLivePos: 'No live position yet',
    trainNoGps: 'This train has no GPS', startsHere: 'Starts here', timetable: 'Timetable',
    headingTo: '{n} trains heading to {station}', noTrainsSoon: 'No trains due in the next 5 hours.',
    from: 'From', to: 'To', swap: 'Swap From and To', tripsCount: '{n} trains · every day', byDeparture: 'By departure',
    fastestFirst: 'Fastest first', fastest: 'Fastest', stopsBetween: '{n} stops', todayRunning: 'Today: running, {d}',
    todayOnTime: 'Today: running on time', leavesIn: 'Leaves in {d}', liveTracking: 'Live tracking', noTrips: 'No direct trains between these stations.',
    pickBoth: 'Choose where you’re going from and to.',
    share: 'Share', shareTitle: 'Share {name}', copyLink: 'Copy link', includeStop: 'Include my stop ({stop})',
    whatsapp: 'Send on WhatsApp', copyMessage: 'Copy message', copied: 'Copied', more: 'More…',
    shareMsg: '{name} is {delay}. Arrives {stop} around {time}. Track it live: {url}', shareMsgNoStop: '{name} is {delay}. Track it live: {url}',
    shareStation: 'Live departures and arrivals at {station}: {url}', loading: 'Loading…',
    up: 'UP', dn: 'DN', close: 'Close', zoomIn: 'Zoom in', zoomOut: 'Zoom out', language: 'Language',
    allTrains: 'All trains', mapStyle: 'Map style', styleSatellite: 'Satellite', styleStreets: 'Streets',
    // Sabz components
    panelHandle: 'Resize panel', clearSearch: 'Clear search', follow: 'Follow {name}', scheduled: 'Scheduled',
    moreStops: '{n} more stops', journeyProgress: 'Journey progress', back: 'Back', running: 'Running',
    updated: 'Updated {ago}', myTrains: 'My trains', rightNow: 'Right now', aboutTrain: 'About this train',
    seeAllStops: 'See all stops', returnTrain: 'Return train', edit: 'Edit', trainOrStation: 'Train or station', fromTo: 'From → To',
    trainHereKm: 'Train here · {km} km to {station}', leftAt: 'Left {station} {time}', kmOf: '{done} of {total} km',
    detailNumber: 'Number', detailUrduName: 'Urdu name', detailRoute: 'Route', detailDistance: 'Distance', detailRuns: 'Runs', detailDeparts: 'Departs', daily: 'Daily',
    runningNowHead: 'Running now', home: 'Home',
    // Screens (public/js/screens/)
    search: 'Search', searchBy: 'Search by', recent: 'Recent', stationBoard: 'Station board', stationsNearMe: 'Stations near me',
    searchHint: 'Type a train number (28), a name (Shalimar), a station (Multan Cantt) or a city (Karachi). One box finds all of them.',
    today: 'Today', tomorrow: 'Tomorrow', dayChoice: 'Day', dateShort: '{wd} {day} {month}',
    wd0: 'Sun', wd1: 'Mon', wd2: 'Tue', wd3: 'Wed', wd4: 'Thu', wd5: 'Fri', wd6: 'Sat',
    leavingNext: 'Leaving {station} next', onTheWay: 'Already on the way', arrives: 'Arrives {time}',
    showWholeRoute: 'Show the whole route', lastPassed: 'Just passed', finalStop: 'Final stop', halt: '{d} halt',
    seeAllStopsN: 'See all {n} stops', allStopsN: 'All {n} stops', start: 'Start', end: 'End',
    detailDirection: 'Direction', detailLocomotive: 'Locomotive', detailScheduledTime: 'Scheduled time', detailThisRun: 'This run',
    gps: 'GPS', down: 'Down', upDir: 'Up', directionTo: '{dir} · to {x}', leftOn: 'Left {date}', returnShort: 'Return',
    nextTrains: 'Next trains', justNow: 'just now', toStation: 'To {x}', startsHereTo: 'Starts here → {x}', clickForStation: 'Click for station',
    mapStations: 'Map of railway stations, with major cities labelled', mapFollowing: 'Map following {train}', mapAround: 'Map around {station}',
    // The Sabz app (views, component variants)
    leftCaption: 'Left', speedSoFar: 'Speed so far', legendExpected: 'expected', legendScheduled: 'scheduled',
    saveStation: 'Save {name}', saved: 'Saved', savedStations: 'Saved stations', linkCopied: 'Link copied', copyFailed: 'Couldn’t copy the link',
    notRunningNow: 'Not running now', mainStations: 'Main stations', nearestStation: 'Nearest station: {station}',
    locateDenied: 'Location is off, so the map stays where it is.', locateUnavailable: 'Couldn’t find where you are.',
    whichRun: 'Which run', pickStopHint: 'Tap the station where you get on or off.', timetableTimes: 'Times are from the timetable.', loadFailed: 'Couldn’t load this. Trying again…',
    // Right now rows, days on times, photos
    startedFrom: 'Started from', startsFrom: 'Starts from', kmAwayNow: '{km} km away · {speed} km/h now', plannedAt: 'Planned {time}',
    yesterday: 'Yesterday', dayTime: '{day} {time}', timeOnDay: '{time} {day}', nextDay: 'next day', dayN: 'day {n}',
    photoBy: 'Photo: {author} · {licence}',
  },
  ur: {
    appTitle: 'پٹڑی',
    tabTrains: 'ٹرینیں', tabStations: 'اسٹیشن', tabTrip: 'سفر',
    live: 'لائیو', reconnecting: 'دوبارہ جڑ رہا ہے',
    findTrain: 'اپنی ٹرین تلاش کریں', findTrainSub: 'نام، نمبر یا شہر · {n} ٹرینیں',
    searchTrains: 'نام، نمبر یا شہر تلاش کریں', searchStations: 'اسٹیشن یا شہر تلاش کریں', cancel: 'منسوخ',
    noMatch: '“{q}” سے کچھ نہیں ملا', groupLive: 'لائیو ٹریکنگ', groupTimetable: 'صرف ٹائم ٹیبل',
    tagLive: 'لائیو', tagNoGps: 'جی پی ایس نہیں',
    runningNow: 'اس وقت رواں · {n}', onTime: 'بروقت', underHour: 'ایک گھنٹے سے کم تاخیر', overHour: 'ایک گھنٹے سے زیادہ تاخیر',
    all: 'سب', sortLeast: 'کم تاخیر پہلے', sortMost: 'زیادہ تاخیر پہلے', sortNumber: 'ٹرین نمبر کے مطابق',
    legendTitle: '{n} ٹرینیں رواں دواں', legendOnTime: 'بروقت (15 منٹ تک)',
    late: '{d} تاخیر', early: '{d} جلدی', hm: '{h} {hours} {m} منٹ', h: '{h} {hours}', m: '{m} منٹ', s: '{s} سیکنڈ',
    ago: '{d} پہلے', inTime: '{d} میں', km: '{n} کلومیٹر', kmh: '{n} کلومیٹر فی گھنٹہ',
    waiting: 'منتظر', stopped: 'رکی ہوئی',
    stRunning: '{speed} کلومیٹر فی گھنٹہ پر رواں', stRunningShort: 'رواں · {speed} کلومیٹر فی گھنٹہ',
    stBetween: '{a} اور {b} کے درمیان', stStoppedAt: '{station} پر رکی ہوئی ہے', stStoppedBetween: 'دو اسٹیشنوں کے درمیان رکی ہوئی ہے',
    stFor: '{d} سے', stNotDeparted: 'ابھی روانہ نہیں ہوئی', stWasDue: '{station} · روانگی {time} تھی',
    stArrived: '{station} پہنچ گئی', stLost: '{d} سے سگنل نہیں', stLastSeen: 'آخری بار {station} کے قریب',
    notDepartedAt: 'روانہ نہیں ہوئی · {station}', stoppedAt: 'رکی ہوئی · {station}',
    departedOn: '{day} {month} کو روانہ',
    hiddenRuns: '{n} مزید سفر چھپایا گیا: ڈیٹا درست نہیں لگتا', showAnyway: 'پھر بھی دکھائیں',
    noLiveRun: 'یہ ٹرین اس وقت لائیو نہیں چل رہی۔', noGpsTrain: 'اس ٹرین میں جی پی ایس نہیں، صرف ٹائم ٹیبل دستیاب ہے۔',
    yourStop: 'آپ کا اسٹیشن', change: 'تبدیل کریں', arrivesAt: 'تقریباً {time} پہنچے گی', kmToGo: '{km} کلومیٹر باقی',
    passedYourStop: 'آپ کا اسٹیشن {time} پر گزر گیا', promptStop: 'آپ کہاں سوار ہوں گے یا اتریں گے؟',
    promptStopSub: 'اپنے اسٹیشن تک لائیو الٹی گنتی دیکھیں', chooseStop: 'اپنا اسٹیشن منتخب کریں', setMyStop: 'میرا اسٹیشن بنائیں',
    chooseStopSub: '{train} · اوقات میں آج کی تاخیر شامل ہے', comingUp: 'آنے والے', alreadyPassed: 'گزر چکے',
    nextStop: 'اگلا اسٹیشن', lastStop: 'آخری اسٹیشن', passedAt: '{time} پر گزری', stopsN: 'اسٹیشن · {n}',
    showEarlier: 'پچھلے {n} اسٹیشن دکھائیں', hideEarlier: 'پچھلے اسٹیشن چھپائیں', trainHere: 'ٹرین یہاں ہے · {speed} کلومیٹر فی گھنٹہ',
    following: 'ٹرین کے ساتھ', trail: 'راستہ', speedToday: 'آج کی رفتار', avg: 'اوسط', top: 'زیادہ سے زیادہ {n}', stoppedFor: '{d} رکی',
    noHistory: 'ایپ چلنے کے دوران رفتار کا چارٹ بنتا جاتا ہے۔', now: 'ابھی',
    etaHow: 'ٹائم ٹیبل {sched} + {late} تاخیر · {km} کلومیٹر، {speed} کلومیٹر فی گھنٹہ',
    chooseStation: 'اسٹیشن منتخب کریں', trainsNext: 'اگلے 5 گھنٹوں میں {n} ٹرینیں', arriving: 'آمد', departing: 'روانگی',
    nowAt: 'ابھی {time}', departsTo: '{x} کے لیے روانہ', arrivesFrom: '{x} سے آمد', passesFromTo: '{a} ← {b}',
    atPlatform: 'پلیٹ فارم پر', leavingNow: 'روانہ ہو رہی ہے', kmAway: '{km} کلومیٹر دور', noLivePos: 'ابھی لائیو مقام دستیاب نہیں',
    trainNoGps: 'اس ٹرین میں جی پی ایس نہیں', startsHere: 'یہاں سے شروع', timetable: 'ٹائم ٹیبل',
    headingTo: '{n} ٹرینیں {station} کی طرف', noTrainsSoon: 'اگلے 5 گھنٹوں میں کوئی ٹرین نہیں۔',
    from: 'کہاں سے', to: 'کہاں تک', swap: 'روانگی اور منزل بدلیں', tripsCount: '{n} ٹرینیں · روزانہ', byDeparture: 'روانگی کے مطابق',
    fastestFirst: 'تیز ترین پہلے', fastest: 'تیز ترین', stopsBetween: '{n} اسٹیشن', todayRunning: 'آج: رواں، {d}',
    todayOnTime: 'آج: بروقت رواں', leavesIn: '{d} میں روانہ', liveTracking: 'لائیو ٹریکنگ', noTrips: 'ان اسٹیشنوں کے درمیان کوئی براہ راست ٹرین نہیں۔',
    pickBoth: 'روانگی اور منزل کا اسٹیشن منتخب کریں۔',
    share: 'شیئر کریں', shareTitle: '{name} شیئر کریں', copyLink: 'لنک کاپی کریں', includeStop: 'میرا اسٹیشن شامل کریں ({stop})',
    whatsapp: 'واٹس ایپ پر بھیجیں', copyMessage: 'پیغام کاپی کریں', copied: 'کاپی ہو گیا', more: 'مزید…',
    shareMsg: '{name}: {delay}۔ {stop} تقریباً {time} پہنچے گی۔ لائیو دیکھیں: {url}', shareMsgNoStop: '{name}: {delay}۔ لائیو دیکھیں: {url}',
    shareStation: '{station} پر ٹرینوں کی لائیو آمد و روانگی: {url}', loading: 'لوڈ ہو رہا ہے…',
    up: 'اپ', dn: 'ڈاؤن', close: 'بند کریں', zoomIn: 'قریب کریں', zoomOut: 'دور کریں', language: 'زبان',
    allTrains: 'تمام ٹرینیں', mapStyle: 'نقشے کا انداز', styleSatellite: 'سیٹلائٹ', styleStreets: 'سڑکیں',
    // Sabz components
    panelHandle: 'پینل کا سائز بدلیں', clearSearch: 'تلاش صاف کریں', follow: '{name} کو فالو کریں', scheduled: 'مقررہ وقت',
    moreStops: '{n} مزید اسٹیشن', journeyProgress: 'سفر کی پیش رفت', back: 'واپس', running: 'رواں',
    updated: '{ago} اپ ڈیٹ ہوا', myTrains: 'میری ٹرینیں', rightNow: 'ابھی', aboutTrain: 'اس ٹرین کے بارے میں',
    seeAllStops: 'تمام اسٹیشن دیکھیں', returnTrain: 'واپسی کی ٹرین', edit: 'ترمیم کریں', trainOrStation: 'ٹرین یا اسٹیشن', fromTo: 'کہاں سے ← کہاں تک',
    trainHereKm: 'ٹرین یہاں ہے · {station} تک {km} کلومیٹر', leftAt: '{station} سے {time} پر روانہ', kmOf: '{total} میں سے {done} کلومیٹر',
    detailNumber: 'نمبر', detailUrduName: 'اردو نام', detailRoute: 'روٹ', detailDistance: 'فاصلہ', detailRuns: 'چلتی ہے', detailDeparts: 'روانگی', daily: 'روزانہ',
    runningNowHead: 'اس وقت رواں', home: 'ہوم',
    // Screens (public/js/screens/)
    search: 'تلاش', searchBy: 'تلاش بذریعہ', recent: 'حالیہ', stationBoard: 'اسٹیشن بورڈ', stationsNearMe: 'میرے قریب اسٹیشن',
    searchHint: 'ٹرین نمبر (28)، نام (شالیمار)، اسٹیشن (ملتان کینٹ) یا شہر (کراچی) لکھیں۔ ایک ہی خانہ سب کچھ ڈھونڈ لیتا ہے۔',
    today: 'آج', tomorrow: 'کل', dayChoice: 'دن', dateShort: '{wd} {day} {month}',
    wd0: 'اتوار', wd1: 'پیر', wd2: 'منگل', wd3: 'بدھ', wd4: 'جمعرات', wd5: 'جمعہ', wd6: 'ہفتہ',
    leavingNext: '{station} سے اگلی روانگیاں', onTheWay: 'پہلے ہی راستے میں', arrives: '{time} پہنچے گی',
    showWholeRoute: 'پورا روٹ دکھائیں', lastPassed: 'پچھلا اسٹیشن', finalStop: 'آخری اسٹیشن', halt: '{d} کا ٹھہراؤ',
    seeAllStopsN: 'تمام {n} اسٹیشن دیکھیں', allStopsN: 'تمام {n} اسٹیشن', start: 'آغاز', end: 'اختتام',
    detailDirection: 'سمت', detailLocomotive: 'انجن', detailScheduledTime: 'مقررہ سفری وقت', detailThisRun: 'موجودہ سفر',
    gps: 'جی پی ایس', down: 'ڈاؤن', upDir: 'اپ', directionTo: '{dir} · {x} کی طرف', leftOn: '{date} کو روانہ', returnShort: 'واپسی',
    nextTrains: 'اگلی ٹرینیں', justNow: 'ابھی', toStation: '{x} کی طرف', startsHereTo: 'یہاں سے شروع ← {x}', clickForStation: 'اسٹیشن دیکھنے کے لیے کلک کریں',
    mapStations: 'ریلوے اسٹیشنوں کا نقشہ، بڑے شہروں کے ناموں کے ساتھ', mapFollowing: '{train} کے ساتھ چلتا نقشہ', mapAround: '{station} کے آس پاس کا نقشہ',
    // The Sabz app (views, component variants)
    leftCaption: 'روانہ', speedSoFar: 'اب تک کی رفتار', legendExpected: 'متوقع', legendScheduled: 'مقررہ',
    saveStation: '{name} محفوظ کریں', saved: 'محفوظ ہے', savedStations: 'محفوظ اسٹیشن', linkCopied: 'لنک کاپی ہو گیا', copyFailed: 'لنک کاپی نہیں ہو سکا',
    notRunningNow: 'اس وقت نہیں چل رہی', mainStations: 'بڑے اسٹیشن', nearestStation: 'قریب ترین اسٹیشن: {station}',
    locateDenied: 'مقام کی اجازت نہیں ملی، اس لیے نقشہ جہاں تھا وہیں ہے۔', locateUnavailable: 'آپ کا مقام معلوم نہیں ہو سکا۔',
    whichRun: 'کون سا سفر', pickStopHint: 'وہ اسٹیشن چنیں جہاں آپ سوار ہوں گے یا اتریں گے۔', timetableTimes: 'اوقات ٹائم ٹیبل کے مطابق ہیں۔', loadFailed: 'لوڈ نہیں ہو سکا۔ دوبارہ کوشش ہو رہی ہے…',
    // Right now rows, days on times, photos
    startedFrom: 'روانگی کا اسٹیشن', startsFrom: 'روانگی کا اسٹیشن', kmAwayNow: '{km} کلومیٹر دور · ابھی {speed} کلومیٹر فی گھنٹہ', plannedAt: 'مقررہ وقت {time}',
    yesterday: 'گزشتہ روز', dayTime: '{day} {time}', timeOnDay: '{day} {time}', nextDay: 'اگلے دن', dayN: 'دن {n}',
    photoBy: 'تصویر: {author} · {licence}',
  },
};

const MONTHS = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ur: ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
};

let lang = 'en';
try { lang = localStorage.getItem('lang') === 'ur' ? 'ur' : 'en'; } catch {}

export const getLang = () => lang;
export const isUrdu = () => lang === 'ur';

export function setLang(next) {
  lang = next === 'ur' ? 'ur' : 'en';
  try { localStorage.setItem('lang', lang); } catch {}
  applyLang();
}

export function applyLang() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
}

export function t(key, vars = {}) {
  const s = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
}

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Numbers and times inside Urdu text are isolated so they read left to right.
export const bdi = s => `<bdi>${esc(s)}</bdi>`;

const PKT_OFFSET = 5 * 3600e3;
const pad = n => String(n).padStart(2, '0');

export function pktMidnight(ms = Date.now()) {
  const d = new Date(ms + PKT_OFFSET);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - PKT_OFFSET;
}

// Minutes after midnight (any day) -> "9:52 PM". In Urdu it's wrapped in Unicode isolates so it
// stays "9:52 PM" (not "PM 9:52") inside right-to-left sentences.
export function clockMin(min) {
  const x = ((Math.round(min) % 1440) + 1440) % 1440;
  const h = Math.floor(x / 60);
  const s = `${h % 12 || 12}:${pad(x % 60)} ${h < 12 ? 'AM' : 'PM'}`;
  return lang === 'ur' ? `\u2066${s}\u2069` : s;
}

export const clock = ms => clockMin((ms - pktMidnight(ms)) / 60000);

export function dur(minutes) {
  const total = Math.max(0, Math.round(minutes));
  const h = Math.floor(total / 60), m = total % 60;
  const hours = h === 1 ? 'گھنٹہ' : 'گھنٹے';
  if (h && m) return t('hm', { h, m, hours });
  if (h) return t('h', { h, hours });
  return t('m', { m });
}

export function ago(ms) {
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  return t('ago', { d: s < 60 ? t('s', { s }) : dur(s / 60) });
}

export function delayText(late) {
  if (Math.abs(late) < 1) return t('onTime');
  return t(late > 0 ? 'late' : 'early', { d: dur(Math.abs(late)) });
}


export function monthName(m) {
  return MONTHS[lang][m];
}
