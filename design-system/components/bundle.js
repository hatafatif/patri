/* @ds-bundle: {"format":4,"namespace":"Patri","components":[{"name":"AppBar"},{"name":"LanguageToggle"},{"name":"LiveIndicator"},{"name":"Panel"},{"name":"SearchField"},{"name":"SegmentedControl"},{"name":"StationFields"},{"name":"IconButton"},{"name":"FollowButton"},{"name":"MapToggle"},{"name":"TrainBadge"},{"name":"StatusChip"},{"name":"TrainCard"},{"name":"TrainRow"},{"name":"DepartureRow"},{"name":"StopTimeline"},{"name":"JourneyProgress"},{"name":"SectionHeader"},{"name":"DetailGrid"},{"name":"LinkRow"},{"name":"SpeedChart"},{"name":"MapMarkers"},{"name":"Button"},{"name":"Card"},{"name":"PageHeader"},{"name":"Photo"},{"name":"ReplayBar"}]} */
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // public/js/components/index.js
  var components_exports = {};
  __export(components_exports, {
    AppBar: () => AppBar,
    Button: () => Button,
    Card: () => Card,
    DepartureRow: () => DepartureRow,
    DetailGrid: () => DetailGrid,
    FollowButton: () => FollowButton,
    IconButton: () => IconButton,
    JourneyProgress: () => JourneyProgress,
    LanguageToggle: () => LanguageToggle,
    LinkRow: () => LinkRow,
    LiveIndicator: () => LiveIndicator,
    MapMarkers: () => MapMarkers,
    MapToggle: () => MapToggle,
    PageHeader: () => PageHeader,
    Panel: () => Panel,
    Photo: () => Photo,
    ReplayBar: () => ReplayBar,
    SearchField: () => SearchField,
    SectionHeader: () => SectionHeader,
    SegmentedControl: () => SegmentedControl,
    SpeedChart: () => SpeedChart,
    StationFields: () => StationFields,
    StatusChip: () => StatusChip,
    StatusStrip: () => StatusStrip,
    StopTimeline: () => StopTimeline,
    TrainBadge: () => TrainBadge,
    TrainCard: () => TrainCard,
    TrainRow: () => TrainRow,
    bindFollowButton: () => bindFollowButton,
    bindLanguageToggle: () => bindLanguageToggle,
    bindMapToggle: () => bindMapToggle,
    bindPageHeader: () => bindPageHeader,
    bindPanel: () => bindPanel,
    bindReplayBar: () => bindReplayBar,
    bindSearchField: () => bindSearchField,
    bindSegmentedControl: () => bindSegmentedControl,
    bindSpeedChart: () => bindSpeedChart,
    bindStationFields: () => bindStationFields,
    bindStopTimeline: () => bindStopTimeline,
    mapLabel: () => mapLabel,
    mapPaint: () => mapPaint,
    statusTone: () => statusTone,
    syncReplayBar: () => syncReplayBar,
    trainImages: () => trainImages,
    trainMarker: () => trainMarker
  });

  // public/js/i18n.js
  var STRINGS = {
    en: {
      appTitle: "Patri",
      tabTrains: "Trains",
      tabStations: "Stations",
      tabTrip: "Trip",
      live: "Live",
      reconnecting: "Reconnecting",
      findTrain: "Find your train",
      findTrainSub: "Name, number or city \xB7 {n} trains",
      searchTrains: "Search name, number or city",
      searchStations: "Search station or city",
      cancel: "Cancel",
      noMatch: "Nothing matches \u201C{q}\u201D",
      groupLive: "Live tracking",
      groupTimetable: "Timetable only",
      tagLive: "Live",
      tagNoGps: "Location unavailable",
      runningNow: "Running now \xB7 {n}",
      onTime: "On time",
      underHour: "Under 1 h late",
      overHour: "Over 1 h late",
      all: "All",
      sortLeast: "Least late first",
      sortMost: "Most late first",
      sortNumber: "By train number",
      legendTitle: "{n} trains on the move",
      legendOnTime: "On time (up to 15 min)",
      late: "{d} late",
      early: "{d} early",
      hm: "{h} h {m} min",
      h: "{h} h",
      m: "{m} min",
      s: "{s}s",
      ago: "{d} ago",
      inTime: "in {d}",
      km: "{n} km",
      kmh: "{n} km/h",
      waiting: "Waiting",
      stopped: "Stopped",
      stRunning: "Running at {speed} km/h",
      stRunningShort: "Running \xB7 {speed} km/h",
      stBetween: "Between {a} and {b}",
      stStoppedAt: "Stopped at {station}",
      stStoppedBetween: "Stopped between stations",
      stFor: "for {d}",
      stNotDeparted: "Not departed yet",
      stWasDue: "{station} \xB7 was due {time}",
      stArrived: "Arrived at {station}",
      stLost: "No signal for {d}",
      stLastSeen: "Last seen near {station}",
      notDepartedAt: "Not departed \xB7 {station}",
      stoppedAt: "Stopped \xB7 {station}",
      departedOn: "Departed {day} {month}",
      hiddenRuns: "{n} more run hidden: its data looks wrong",
      showAnyway: "Show anyway",
      noLiveRun: "This train has no live run right now.",
      noGpsTrain: "This train\u2019s location is unavailable, so only its timetable is shown.",
      yourStop: "Your stop",
      change: "Change",
      arrivesAt: "Arrives ~{time}",
      kmToGo: "{km} km to go",
      passedYourStop: "Passed your stop at {time}",
      promptStop: "Where are you getting on or off?",
      promptStopSub: "Get a live countdown to your station",
      chooseStop: "Choose your stop",
      setMyStop: "Set as my stop",
      chooseStopSub: "{train} \xB7 times include today\u2019s delay",
      comingUp: "Coming up",
      alreadyPassed: "Already passed",
      nextStop: "Next stop",
      lastStop: "Last stop",
      passedAt: "Passed {time}",
      stopsN: "Stops \xB7 {n}",
      showEarlier: "Show {n} earlier stops",
      hideEarlier: "Hide earlier stops",
      trainHere: "Train here \xB7 {speed} km/h",
      following: "Following",
      trail: "Trail",
      speedToday: "Speed today",
      avg: "avg",
      top: "Top {n}",
      stoppedFor: "stopped {d}",
      noHistory: "The speed chart fills in while the app is running.",
      now: "Now",
      etaHow: "Timetable {sched} + {late} delay \xB7 {km} km at {speed} km/h",
      chooseStation: "Choose a station",
      trainsNext: "{n} trains in the next 5 hours",
      arriving: "Arriving",
      departing: "Departing",
      nowAt: "Now {time}",
      departsTo: "Departs to {x}",
      arrivesFrom: "Arrives from {x}",
      passesFromTo: "{a} \u279C {b}",
      atPlatform: "On the platform",
      leavingNow: "leaving now",
      kmAway: "{km} km away",
      noLivePos: "No live position yet",
      trainNoGps: "This train\u2019s location is unavailable",
      startsHere: "Starts here",
      timetable: "Timetable",
      headingTo: "{n} trains heading to {station}",
      noTrainsSoon: "No trains due in the next 5 hours.",
      from: "From",
      to: "To",
      swap: "Swap From and To",
      tripsCount: "{n} trains \xB7 every day",
      byDeparture: "By departure",
      fastestFirst: "Fastest first",
      fastest: "Fastest",
      stopsBetween: "{n} stops",
      todayRunning: "Today: running, {d}",
      todayOnTime: "Today: running on time",
      leavesIn: "Leaves in {d}",
      liveTracking: "Live tracking",
      noTrips: "No direct trains between these stations.",
      pickBoth: "Choose where you\u2019re going from and to.",
      share: "Share",
      shareTitle: "Share {name}",
      copyLink: "Copy link",
      includeStop: "Include my stop ({stop})",
      whatsapp: "Send on WhatsApp",
      copyMessage: "Copy message",
      copied: "Copied",
      more: "More\u2026",
      shareMsg: "{name} is {delay}. Arrives {stop} around {time}. Track it live: {url}",
      shareMsgNoStop: "{name} is {delay}. Track it live: {url}",
      shareStation: "Live departures and arrivals at {station}: {url}",
      loading: "Loading\u2026",
      up: "UP",
      dn: "DN",
      close: "Close",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      language: "Language",
      allTrains: "All trains",
      mapStyle: "Map style",
      styleSatellite: "Satellite",
      styleStreets: "Streets",
      // Sabz components
      panelHandle: "Resize panel",
      clearSearch: "Clear search",
      follow: "Follow {name}",
      scheduled: "Scheduled",
      moreStops: "{n} more stops",
      journeyProgress: "Journey progress",
      back: "Back",
      running: "Running",
      updated: "Updated {ago}",
      myTrains: "Recently checked",
      rightNow: "Current status",
      aboutTrain: "About this train",
      seeAllStops: "See all stops",
      returnTrain: "Return train",
      edit: "Edit",
      trainOrStation: "Train or station",
      fromTo: "Plan a trip",
      trainHereKm: "Train here \xB7 {km} km to {station}",
      leftAt: "Left {station} {time}",
      kmOf: "{done} of {total} km",
      detailNumber: "Number",
      detailUrduName: "Urdu name",
      detailRoute: "Route",
      detailDistance: "Distance",
      detailRuns: "Runs",
      detailDeparts: "Departs",
      daily: "Daily",
      runningNowHead: "Running now",
      home: "Home",
      // Screens (public/js/screens/)
      search: "Search",
      searchBy: "Search by",
      recent: "Recent",
      stationBoard: "Station board",
      stationsNearMe: "Stations near me",
      searchHint: "Type a train number (28), a name (Shalimar), a station (Multan Cantt) or a city (Karachi). One box finds all of them.",
      today: "Today",
      tomorrow: "Tomorrow",
      dayChoice: "Day",
      dateShort: "{wd} {day} {month}",
      wd0: "Sun",
      wd1: "Mon",
      wd2: "Tue",
      wd3: "Wed",
      wd4: "Thu",
      wd5: "Fri",
      wd6: "Sat",
      leavingNext: "Leaving {station} next",
      onTheWay: "Already on the way",
      arrives: "Arrives {time}",
      showWholeRoute: "Show the whole route",
      lastPassed: "Just passed",
      finalStop: "Final stop",
      halt: "{d} halt",
      seeAllStopsN: "See all {n} stops",
      allStopsN: "All {n} stops",
      start: "Start",
      end: "End",
      detailDirection: "Direction",
      detailLocomotive: "Locomotive",
      detailScheduledTime: "Scheduled time",
      detailThisRun: "This run",
      gps: "GPS",
      down: "Down",
      upDir: "Up",
      directionTo: "{dir} \xB7 to {x}",
      leftOn: "Left {date}",
      returnShort: "Return",
      nextTrains: "Next trains",
      justNow: "just now",
      toStation: "To {x}",
      startsHereTo: "Starts here \u2192 {x}",
      clickForStation: "Click for station",
      mapStations: "Map of railway stations and running trains, with major cities labelled",
      clickForTrain: "Click for train",
      mapFollowing: "Map following {train}",
      mapAround: "Map around {station}",
      // The Sabz app (views, component variants)
      leftCaption: "Left",
      speedSoFar: "Speed so far",
      legendExpected: "expected",
      legendScheduled: "scheduled",
      saveStation: "Save {name}",
      saved: "Saved",
      savedStations: "Saved stations",
      linkCopied: "Link copied",
      copyFailed: "Couldn\u2019t copy the link",
      notRunningNow: "Not running now",
      mainStations: "Main stations",
      nearestStation: "Nearest station: {station}",
      locateDenied: "Location is off, so the map stays where it is.",
      locateUnavailable: "Couldn\u2019t find where you are.",
      whichRun: "Which run",
      pickStopHint: "Tap the station where you get on or off.",
      timetableTimes: "Times are from the timetable.",
      loadFailed: "Couldn\u2019t load this. Trying again\u2026",
      // Right now rows, days on times, photos
      startedFrom: "Started from",
      startsFrom: "Starts from",
      kmAwayNow: "{km} km away \xB7 {speed} km/h now",
      plannedAt: "Planned {time}",
      yesterday: "Yesterday",
      dayTime: "{day} {time}",
      timeOnDay: "{time} {day}",
      nextDay: "next day",
      dayN: "day {n}",
      photoBy: "Photo: {author} \xB7 {licence}",
      journey: "Journey",
      firstStop: "First stop",
      currentStop: "Current stop",
      speedLabel: "Speed",
      delayLabel: "Delay",
      arrivalLabel: "Arrival",
      // Alerts (push notifications) and last seen
      alertsHeader: "Alerts",
      notifyMe: "Notify me",
      alertsOn: "Alerts on",
      alertsFor: "For {station}",
      alertsWholeTrip: "For the whole journey",
      alertsWhat: "You\u2019ll hear when it leaves, 15 min before your stop, if the delay changes a lot, and when it arrives.",
      alertsChooseStop: "Choose your stop for alerts",
      alertsSkipStop: "Whole journey, no stop",
      alertsOff: "Turn off",
      alertsChange: "Change stop",
      alertsBlocked: "Notifications are blocked for Patri in your browser settings.",
      alertsUnsupported: "This browser can\u2019t show notifications. On iPhone, add Patri to your Home Screen first.",
      alertsNoLive: "Alerts need live location, and this train has none right now.",
      alertsFailed: "Couldn\u2019t turn on alerts. Try again.",
      lastSeen: "Last seen near {station} \xB7 {ago}",
      lastSeenShort: "Last seen {ago}",
      // Journey replay (recorded days played back on the map)
      replay: "Replay past journeys",
      replayTitle: "Journey replay",
      replayWith: "With the return train, {name}",
      replayPeriod: "Replay period",
      nDays: "{n} days",
      replayTime: "Replay time",
      play: "Play",
      pause: "Pause",
      replayIdle: "Between journeys",
      replaySince: "Recorded since {date}",
      replayHint: "Sped up: the whole period plays in about a minute.",
      replayEmpty: "Nothing recorded for this train yet. Patri keeps the last 90 days.",
      replayFailed: "The replay isn\u2019t available right now."
    },
    ur: {
      appTitle: "\u067E\u0679\u0691\u06CC",
      tabTrains: "\u0679\u0631\u06CC\u0646\u06CC\u06BA",
      tabStations: "\u0627\u0633\u0679\u06CC\u0634\u0646",
      tabTrip: "\u0633\u0641\u0631",
      live: "\u0644\u0627\u0626\u06CC\u0648",
      reconnecting: "\u062F\u0648\u0628\u0627\u0631\u06C1 \u062C\u0691 \u0631\u06C1\u0627 \u06C1\u06D2",
      findTrain: "\u0627\u067E\u0646\u06CC \u0679\u0631\u06CC\u0646 \u062A\u0644\u0627\u0634 \u06A9\u0631\u06CC\u06BA",
      findTrainSub: "\u0646\u0627\u0645\u060C \u0646\u0645\u0628\u0631 \u06CC\u0627 \u0634\u06C1\u0631 \xB7 {n} \u0679\u0631\u06CC\u0646\u06CC\u06BA",
      searchTrains: "\u0646\u0627\u0645\u060C \u0646\u0645\u0628\u0631 \u06CC\u0627 \u0634\u06C1\u0631 \u062A\u0644\u0627\u0634 \u06A9\u0631\u06CC\u06BA",
      searchStations: "\u0627\u0633\u0679\u06CC\u0634\u0646 \u06CC\u0627 \u0634\u06C1\u0631 \u062A\u0644\u0627\u0634 \u06A9\u0631\u06CC\u06BA",
      cancel: "\u0645\u0646\u0633\u0648\u062E",
      noMatch: "\u201C{q}\u201D \u0633\u06D2 \u06A9\u0686\u06BE \u0646\u06C1\u06CC\u06BA \u0645\u0644\u0627",
      groupLive: "\u0644\u0627\u0626\u06CC\u0648 \u0679\u0631\u06CC\u06A9\u0646\u06AF",
      groupTimetable: "\u0635\u0631\u0641 \u0679\u0627\u0626\u0645 \u0679\u06CC\u0628\u0644",
      tagLive: "\u0644\u0627\u0626\u06CC\u0648",
      tagNoGps: "\u0645\u0642\u0627\u0645 \u062F\u0633\u062A\u06CC\u0627\u0628 \u0646\u06C1\u06CC\u06BA",
      runningNow: "\u0627\u0633 \u0648\u0642\u062A \u0631\u0648\u0627\u06BA \xB7 {n}",
      onTime: "\u0628\u0631\u0648\u0642\u062A",
      underHour: "\u0627\u06CC\u06A9 \u06AF\u06BE\u0646\u0679\u06D2 \u0633\u06D2 \u06A9\u0645 \u062A\u0627\u062E\u06CC\u0631",
      overHour: "\u0627\u06CC\u06A9 \u06AF\u06BE\u0646\u0679\u06D2 \u0633\u06D2 \u0632\u06CC\u0627\u062F\u06C1 \u062A\u0627\u062E\u06CC\u0631",
      all: "\u0633\u0628",
      sortLeast: "\u06A9\u0645 \u062A\u0627\u062E\u06CC\u0631 \u067E\u06C1\u0644\u06D2",
      sortMost: "\u0632\u06CC\u0627\u062F\u06C1 \u062A\u0627\u062E\u06CC\u0631 \u067E\u06C1\u0644\u06D2",
      sortNumber: "\u0679\u0631\u06CC\u0646 \u0646\u0645\u0628\u0631 \u06A9\u06D2 \u0645\u0637\u0627\u0628\u0642",
      legendTitle: "{n} \u0679\u0631\u06CC\u0646\u06CC\u06BA \u0631\u0648\u0627\u06BA \u062F\u0648\u0627\u06BA",
      legendOnTime: "\u0628\u0631\u0648\u0642\u062A (15 \u0645\u0646\u0679 \u062A\u06A9)",
      late: "{d} \u062A\u0627\u062E\u06CC\u0631",
      early: "{d} \u062C\u0644\u062F\u06CC",
      hm: "{h} {hours} {m} \u0645\u0646\u0679",
      h: "{h} {hours}",
      m: "{m} \u0645\u0646\u0679",
      s: "{s} \u0633\u06CC\u06A9\u0646\u0688",
      ago: "{d} \u067E\u06C1\u0644\u06D2",
      inTime: "{d} \u0645\u06CC\u06BA",
      km: "{n} \u06A9\u0644\u0648\u0645\u06CC\u0679\u0631",
      kmh: "{n} \u06A9\u0644\u0648\u0645\u06CC\u0679\u0631 \u0641\u06CC \u06AF\u06BE\u0646\u0679\u06C1",
      waiting: "\u0645\u0646\u062A\u0638\u0631",
      stopped: "\u0631\u06A9\u06CC \u06C1\u0648\u0626\u06CC",
      stRunning: "{speed} \u06A9\u0644\u0648\u0645\u06CC\u0679\u0631 \u0641\u06CC \u06AF\u06BE\u0646\u0679\u06C1 \u067E\u0631 \u0631\u0648\u0627\u06BA",
      stRunningShort: "\u0631\u0648\u0627\u06BA \xB7 {speed} \u06A9\u0644\u0648\u0645\u06CC\u0679\u0631 \u0641\u06CC \u06AF\u06BE\u0646\u0679\u06C1",
      stBetween: "{a} \u0627\u0648\u0631 {b} \u06A9\u06D2 \u062F\u0631\u0645\u06CC\u0627\u0646",
      stStoppedAt: "{station} \u067E\u0631 \u0631\u06A9\u06CC \u06C1\u0648\u0626\u06CC \u06C1\u06D2",
      stStoppedBetween: "\u062F\u0648 \u0627\u0633\u0679\u06CC\u0634\u0646\u0648\u06BA \u06A9\u06D2 \u062F\u0631\u0645\u06CC\u0627\u0646 \u0631\u06A9\u06CC \u06C1\u0648\u0626\u06CC \u06C1\u06D2",
      stFor: "{d} \u0633\u06D2",
      stNotDeparted: "\u0627\u0628\u06BE\u06CC \u0631\u0648\u0627\u0646\u06C1 \u0646\u06C1\u06CC\u06BA \u06C1\u0648\u0626\u06CC",
      stWasDue: "{station} \xB7 \u0631\u0648\u0627\u0646\u06AF\u06CC {time} \u062A\u06BE\u06CC",
      stArrived: "{station} \u067E\u06C1\u0646\u0686 \u06AF\u0626\u06CC",
      stLost: "{d} \u0633\u06D2 \u0633\u06AF\u0646\u0644 \u0646\u06C1\u06CC\u06BA",
      stLastSeen: "\u0622\u062E\u0631\u06CC \u0628\u0627\u0631 {station} \u06A9\u06D2 \u0642\u0631\u06CC\u0628",
      notDepartedAt: "\u0631\u0648\u0627\u0646\u06C1 \u0646\u06C1\u06CC\u06BA \u06C1\u0648\u0626\u06CC \xB7 {station}",
      stoppedAt: "\u0631\u06A9\u06CC \u06C1\u0648\u0626\u06CC \xB7 {station}",
      departedOn: "{day} {month} \u06A9\u0648 \u0631\u0648\u0627\u0646\u06C1",
      hiddenRuns: "{n} \u0645\u0632\u06CC\u062F \u0633\u0641\u0631 \u0686\u06BE\u067E\u0627\u06CC\u0627 \u06AF\u06CC\u0627: \u0688\u06CC\u0679\u0627 \u062F\u0631\u0633\u062A \u0646\u06C1\u06CC\u06BA \u0644\u06AF\u062A\u0627",
      showAnyway: "\u067E\u06BE\u0631 \u0628\u06BE\u06CC \u062F\u06A9\u06BE\u0627\u0626\u06CC\u06BA",
      noLiveRun: "\u06CC\u06C1 \u0679\u0631\u06CC\u0646 \u0627\u0633 \u0648\u0642\u062A \u0644\u0627\u0626\u06CC\u0648 \u0646\u06C1\u06CC\u06BA \u0686\u0644 \u0631\u06C1\u06CC\u06D4",
      noGpsTrain: "\u0627\u0633 \u0679\u0631\u06CC\u0646 \u06A9\u0627 \u0645\u0642\u0627\u0645 \u062F\u0633\u062A\u06CC\u0627\u0628 \u0646\u06C1\u06CC\u06BA\u060C \u0627\u0633 \u0644\u06CC\u06D2 \u0635\u0631\u0641 \u0679\u0627\u0626\u0645 \u0679\u06CC\u0628\u0644 \u062F\u06A9\u06BE\u0627\u06CC\u0627 \u06AF\u06CC\u0627 \u06C1\u06D2\u06D4",
      yourStop: "\u0622\u067E \u06A9\u0627 \u0627\u0633\u0679\u06CC\u0634\u0646",
      change: "\u062A\u0628\u062F\u06CC\u0644 \u06A9\u0631\u06CC\u06BA",
      arrivesAt: "\u062A\u0642\u0631\u06CC\u0628\u0627\u064B {time} \u067E\u06C1\u0646\u0686\u06D2 \u06AF\u06CC",
      kmToGo: "{km} \u06A9\u0644\u0648\u0645\u06CC\u0679\u0631 \u0628\u0627\u0642\u06CC",
      passedYourStop: "\u0622\u067E \u06A9\u0627 \u0627\u0633\u0679\u06CC\u0634\u0646 {time} \u067E\u0631 \u06AF\u0632\u0631 \u06AF\u06CC\u0627",
      promptStop: "\u0622\u067E \u06A9\u06C1\u0627\u06BA \u0633\u0648\u0627\u0631 \u06C1\u0648\u06BA \u06AF\u06D2 \u06CC\u0627 \u0627\u062A\u0631\u06CC\u06BA \u06AF\u06D2\u061F",
      promptStopSub: "\u0627\u067E\u0646\u06D2 \u0627\u0633\u0679\u06CC\u0634\u0646 \u062A\u06A9 \u0644\u0627\u0626\u06CC\u0648 \u0627\u0644\u0679\u06CC \u06AF\u0646\u062A\u06CC \u062F\u06CC\u06A9\u06BE\u06CC\u06BA",
      chooseStop: "\u0627\u067E\u0646\u0627 \u0627\u0633\u0679\u06CC\u0634\u0646 \u0645\u0646\u062A\u062E\u0628 \u06A9\u0631\u06CC\u06BA",
      setMyStop: "\u0645\u06CC\u0631\u0627 \u0627\u0633\u0679\u06CC\u0634\u0646 \u0628\u0646\u0627\u0626\u06CC\u06BA",
      chooseStopSub: "{train} \xB7 \u0627\u0648\u0642\u0627\u062A \u0645\u06CC\u06BA \u0622\u062C \u06A9\u06CC \u062A\u0627\u062E\u06CC\u0631 \u0634\u0627\u0645\u0644 \u06C1\u06D2",
      comingUp: "\u0622\u0646\u06D2 \u0648\u0627\u0644\u06D2",
      alreadyPassed: "\u06AF\u0632\u0631 \u0686\u06A9\u06D2",
      nextStop: "\u0627\u06AF\u0644\u0627 \u0627\u0633\u0679\u06CC\u0634\u0646",
      lastStop: "\u0622\u062E\u0631\u06CC \u0627\u0633\u0679\u06CC\u0634\u0646",
      passedAt: "{time} \u067E\u0631 \u06AF\u0632\u0631\u06CC",
      stopsN: "\u0627\u0633\u0679\u06CC\u0634\u0646 \xB7 {n}",
      showEarlier: "\u067E\u0686\u06BE\u0644\u06D2 {n} \u0627\u0633\u0679\u06CC\u0634\u0646 \u062F\u06A9\u06BE\u0627\u0626\u06CC\u06BA",
      hideEarlier: "\u067E\u0686\u06BE\u0644\u06D2 \u0627\u0633\u0679\u06CC\u0634\u0646 \u0686\u06BE\u067E\u0627\u0626\u06CC\u06BA",
      trainHere: "\u0679\u0631\u06CC\u0646 \u06CC\u06C1\u0627\u06BA \u06C1\u06D2 \xB7 {speed} \u06A9\u0644\u0648\u0645\u06CC\u0679\u0631 \u0641\u06CC \u06AF\u06BE\u0646\u0679\u06C1",
      following: "\u0679\u0631\u06CC\u0646 \u06A9\u06D2 \u0633\u0627\u062A\u06BE",
      trail: "\u0631\u0627\u0633\u062A\u06C1",
      speedToday: "\u0622\u062C \u06A9\u06CC \u0631\u0641\u062A\u0627\u0631",
      avg: "\u0627\u0648\u0633\u0637",
      top: "\u0632\u06CC\u0627\u062F\u06C1 \u0633\u06D2 \u0632\u06CC\u0627\u062F\u06C1 {n}",
      stoppedFor: "{d} \u0631\u06A9\u06CC",
      noHistory: "\u0627\u06CC\u067E \u0686\u0644\u0646\u06D2 \u06A9\u06D2 \u062F\u0648\u0631\u0627\u0646 \u0631\u0641\u062A\u0627\u0631 \u06A9\u0627 \u0686\u0627\u0631\u0679 \u0628\u0646\u062A\u0627 \u062C\u0627\u062A\u0627 \u06C1\u06D2\u06D4",
      now: "\u0627\u0628\u06BE\u06CC",
      etaHow: "\u0679\u0627\u0626\u0645 \u0679\u06CC\u0628\u0644 {sched} + {late} \u062A\u0627\u062E\u06CC\u0631 \xB7 {km} \u06A9\u0644\u0648\u0645\u06CC\u0679\u0631\u060C {speed} \u06A9\u0644\u0648\u0645\u06CC\u0679\u0631 \u0641\u06CC \u06AF\u06BE\u0646\u0679\u06C1",
      chooseStation: "\u0627\u0633\u0679\u06CC\u0634\u0646 \u0645\u0646\u062A\u062E\u0628 \u06A9\u0631\u06CC\u06BA",
      trainsNext: "\u0627\u06AF\u0644\u06D2 5 \u06AF\u06BE\u0646\u0679\u0648\u06BA \u0645\u06CC\u06BA {n} \u0679\u0631\u06CC\u0646\u06CC\u06BA",
      arriving: "\u0622\u0645\u062F",
      departing: "\u0631\u0648\u0627\u0646\u06AF\u06CC",
      nowAt: "\u0627\u0628\u06BE\u06CC {time}",
      departsTo: "{x} \u06A9\u06D2 \u0644\u06CC\u06D2 \u0631\u0648\u0627\u0646\u06C1",
      arrivesFrom: "{x} \u0633\u06D2 \u0622\u0645\u062F",
      passesFromTo: "{a} \u2190 {b}",
      atPlatform: "\u067E\u0644\u06CC\u0679 \u0641\u0627\u0631\u0645 \u067E\u0631",
      leavingNow: "\u0631\u0648\u0627\u0646\u06C1 \u06C1\u0648 \u0631\u06C1\u06CC \u06C1\u06D2",
      kmAway: "{km} \u06A9\u0644\u0648\u0645\u06CC\u0679\u0631 \u062F\u0648\u0631",
      noLivePos: "\u0627\u0628\u06BE\u06CC \u0644\u0627\u0626\u06CC\u0648 \u0645\u0642\u0627\u0645 \u062F\u0633\u062A\u06CC\u0627\u0628 \u0646\u06C1\u06CC\u06BA",
      trainNoGps: "\u0627\u0633 \u0679\u0631\u06CC\u0646 \u06A9\u0627 \u0645\u0642\u0627\u0645 \u062F\u0633\u062A\u06CC\u0627\u0628 \u0646\u06C1\u06CC\u06BA",
      startsHere: "\u06CC\u06C1\u0627\u06BA \u0633\u06D2 \u0634\u0631\u0648\u0639",
      timetable: "\u0679\u0627\u0626\u0645 \u0679\u06CC\u0628\u0644",
      headingTo: "{n} \u0679\u0631\u06CC\u0646\u06CC\u06BA {station} \u06A9\u06CC \u0637\u0631\u0641",
      noTrainsSoon: "\u0627\u06AF\u0644\u06D2 5 \u06AF\u06BE\u0646\u0679\u0648\u06BA \u0645\u06CC\u06BA \u06A9\u0648\u0626\u06CC \u0679\u0631\u06CC\u0646 \u0646\u06C1\u06CC\u06BA\u06D4",
      from: "\u06A9\u06C1\u0627\u06BA \u0633\u06D2",
      to: "\u06A9\u06C1\u0627\u06BA \u062A\u06A9",
      swap: "\u0631\u0648\u0627\u0646\u06AF\u06CC \u0627\u0648\u0631 \u0645\u0646\u0632\u0644 \u0628\u062F\u0644\u06CC\u06BA",
      tripsCount: "{n} \u0679\u0631\u06CC\u0646\u06CC\u06BA \xB7 \u0631\u0648\u0632\u0627\u0646\u06C1",
      byDeparture: "\u0631\u0648\u0627\u0646\u06AF\u06CC \u06A9\u06D2 \u0645\u0637\u0627\u0628\u0642",
      fastestFirst: "\u062A\u06CC\u0632 \u062A\u0631\u06CC\u0646 \u067E\u06C1\u0644\u06D2",
      fastest: "\u062A\u06CC\u0632 \u062A\u0631\u06CC\u0646",
      stopsBetween: "{n} \u0627\u0633\u0679\u06CC\u0634\u0646",
      todayRunning: "\u0622\u062C: \u0631\u0648\u0627\u06BA\u060C {d}",
      todayOnTime: "\u0622\u062C: \u0628\u0631\u0648\u0642\u062A \u0631\u0648\u0627\u06BA",
      leavesIn: "{d} \u0645\u06CC\u06BA \u0631\u0648\u0627\u0646\u06C1",
      liveTracking: "\u0644\u0627\u0626\u06CC\u0648 \u0679\u0631\u06CC\u06A9\u0646\u06AF",
      noTrips: "\u0627\u0646 \u0627\u0633\u0679\u06CC\u0634\u0646\u0648\u06BA \u06A9\u06D2 \u062F\u0631\u0645\u06CC\u0627\u0646 \u06A9\u0648\u0626\u06CC \u0628\u0631\u0627\u06C1 \u0631\u0627\u0633\u062A \u0679\u0631\u06CC\u0646 \u0646\u06C1\u06CC\u06BA\u06D4",
      pickBoth: "\u0631\u0648\u0627\u0646\u06AF\u06CC \u0627\u0648\u0631 \u0645\u0646\u0632\u0644 \u06A9\u0627 \u0627\u0633\u0679\u06CC\u0634\u0646 \u0645\u0646\u062A\u062E\u0628 \u06A9\u0631\u06CC\u06BA\u06D4",
      share: "\u0634\u06CC\u0626\u0631 \u06A9\u0631\u06CC\u06BA",
      shareTitle: "{name} \u0634\u06CC\u0626\u0631 \u06A9\u0631\u06CC\u06BA",
      copyLink: "\u0644\u0646\u06A9 \u06A9\u0627\u067E\u06CC \u06A9\u0631\u06CC\u06BA",
      includeStop: "\u0645\u06CC\u0631\u0627 \u0627\u0633\u0679\u06CC\u0634\u0646 \u0634\u0627\u0645\u0644 \u06A9\u0631\u06CC\u06BA ({stop})",
      whatsapp: "\u0648\u0627\u0679\u0633 \u0627\u06CC\u067E \u067E\u0631 \u0628\u06BE\u06CC\u062C\u06CC\u06BA",
      copyMessage: "\u067E\u06CC\u063A\u0627\u0645 \u06A9\u0627\u067E\u06CC \u06A9\u0631\u06CC\u06BA",
      copied: "\u06A9\u0627\u067E\u06CC \u06C1\u0648 \u06AF\u06CC\u0627",
      more: "\u0645\u0632\u06CC\u062F\u2026",
      shareMsg: "{name}: {delay}\u06D4 {stop} \u062A\u0642\u0631\u06CC\u0628\u0627\u064B {time} \u067E\u06C1\u0646\u0686\u06D2 \u06AF\u06CC\u06D4 \u0644\u0627\u0626\u06CC\u0648 \u062F\u06CC\u06A9\u06BE\u06CC\u06BA: {url}",
      shareMsgNoStop: "{name}: {delay}\u06D4 \u0644\u0627\u0626\u06CC\u0648 \u062F\u06CC\u06A9\u06BE\u06CC\u06BA: {url}",
      shareStation: "{station} \u067E\u0631 \u0679\u0631\u06CC\u0646\u0648\u06BA \u06A9\u06CC \u0644\u0627\u0626\u06CC\u0648 \u0622\u0645\u062F \u0648 \u0631\u0648\u0627\u0646\u06AF\u06CC: {url}",
      loading: "\u0644\u0648\u0688 \u06C1\u0648 \u0631\u06C1\u0627 \u06C1\u06D2\u2026",
      up: "\u0627\u067E",
      dn: "\u0688\u0627\u0624\u0646",
      close: "\u0628\u0646\u062F \u06A9\u0631\u06CC\u06BA",
      zoomIn: "\u0642\u0631\u06CC\u0628 \u06A9\u0631\u06CC\u06BA",
      zoomOut: "\u062F\u0648\u0631 \u06A9\u0631\u06CC\u06BA",
      language: "\u0632\u0628\u0627\u0646",
      allTrains: "\u062A\u0645\u0627\u0645 \u0679\u0631\u06CC\u0646\u06CC\u06BA",
      mapStyle: "\u0646\u0642\u0634\u06D2 \u06A9\u0627 \u0627\u0646\u062F\u0627\u0632",
      styleSatellite: "\u0633\u06CC\u0679\u0644\u0627\u0626\u0679",
      styleStreets: "\u0633\u0691\u06A9\u06CC\u06BA",
      // Sabz components
      panelHandle: "\u067E\u06CC\u0646\u0644 \u06A9\u0627 \u0633\u0627\u0626\u0632 \u0628\u062F\u0644\u06CC\u06BA",
      clearSearch: "\u062A\u0644\u0627\u0634 \u0635\u0627\u0641 \u06A9\u0631\u06CC\u06BA",
      follow: "{name} \u06A9\u0648 \u0641\u0627\u0644\u0648 \u06A9\u0631\u06CC\u06BA",
      scheduled: "\u0645\u0642\u0631\u0631\u06C1 \u0648\u0642\u062A",
      moreStops: "{n} \u0645\u0632\u06CC\u062F \u0627\u0633\u0679\u06CC\u0634\u0646",
      journeyProgress: "\u0633\u0641\u0631 \u06A9\u06CC \u067E\u06CC\u0634 \u0631\u0641\u062A",
      back: "\u0648\u0627\u067E\u0633",
      running: "\u0631\u0648\u0627\u06BA",
      updated: "{ago} \u0627\u067E \u0688\u06CC\u0679 \u06C1\u0648\u0627",
      myTrains: "\u062D\u0627\u0644 \u06C1\u06CC \u0645\u06CC\u06BA \u062F\u06CC\u06A9\u06BE\u06CC \u06AF\u0626\u06CC \u0679\u0631\u06CC\u0646\u06CC\u06BA",
      rightNow: "\u0645\u0648\u062C\u0648\u062F\u06C1 \u0635\u0648\u0631\u062A\u062D\u0627\u0644",
      aboutTrain: "\u0627\u0633 \u0679\u0631\u06CC\u0646 \u06A9\u06D2 \u0628\u0627\u0631\u06D2 \u0645\u06CC\u06BA",
      seeAllStops: "\u062A\u0645\u0627\u0645 \u0627\u0633\u0679\u06CC\u0634\u0646 \u062F\u06CC\u06A9\u06BE\u06CC\u06BA",
      returnTrain: "\u0648\u0627\u067E\u0633\u06CC \u06A9\u06CC \u0679\u0631\u06CC\u0646",
      edit: "\u062A\u0631\u0645\u06CC\u0645 \u06A9\u0631\u06CC\u06BA",
      trainOrStation: "\u0679\u0631\u06CC\u0646 \u06CC\u0627 \u0627\u0633\u0679\u06CC\u0634\u0646",
      fromTo: "\u0633\u0641\u0631 \u06A9\u0627 \u0645\u0646\u0635\u0648\u0628\u06C1",
      trainHereKm: "\u0679\u0631\u06CC\u0646 \u06CC\u06C1\u0627\u06BA \u06C1\u06D2 \xB7 {station} \u062A\u06A9 {km} \u06A9\u0644\u0648\u0645\u06CC\u0679\u0631",
      leftAt: "{station} \u0633\u06D2 {time} \u067E\u0631 \u0631\u0648\u0627\u0646\u06C1",
      kmOf: "{total} \u0645\u06CC\u06BA \u0633\u06D2 {done} \u06A9\u0644\u0648\u0645\u06CC\u0679\u0631",
      detailNumber: "\u0646\u0645\u0628\u0631",
      detailUrduName: "\u0627\u0631\u062F\u0648 \u0646\u0627\u0645",
      detailRoute: "\u0631\u0648\u0679",
      detailDistance: "\u0641\u0627\u0635\u0644\u06C1",
      detailRuns: "\u0686\u0644\u062A\u06CC \u06C1\u06D2",
      detailDeparts: "\u0631\u0648\u0627\u0646\u06AF\u06CC",
      daily: "\u0631\u0648\u0632\u0627\u0646\u06C1",
      runningNowHead: "\u0627\u0633 \u0648\u0642\u062A \u0631\u0648\u0627\u06BA",
      home: "\u06C1\u0648\u0645",
      // Screens (public/js/screens/)
      search: "\u062A\u0644\u0627\u0634",
      searchBy: "\u062A\u0644\u0627\u0634 \u0628\u0630\u0631\u06CC\u0639\u06C1",
      recent: "\u062D\u0627\u0644\u06CC\u06C1",
      stationBoard: "\u0627\u0633\u0679\u06CC\u0634\u0646 \u0628\u0648\u0631\u0688",
      stationsNearMe: "\u0645\u06CC\u0631\u06D2 \u0642\u0631\u06CC\u0628 \u0627\u0633\u0679\u06CC\u0634\u0646",
      searchHint: "\u0679\u0631\u06CC\u0646 \u0646\u0645\u0628\u0631 (28)\u060C \u0646\u0627\u0645 (\u0634\u0627\u0644\u06CC\u0645\u0627\u0631)\u060C \u0627\u0633\u0679\u06CC\u0634\u0646 (\u0645\u0644\u062A\u0627\u0646 \u06A9\u06CC\u0646\u0679) \u06CC\u0627 \u0634\u06C1\u0631 (\u06A9\u0631\u0627\u0686\u06CC) \u0644\u06A9\u06BE\u06CC\u06BA\u06D4 \u0627\u06CC\u06A9 \u06C1\u06CC \u062E\u0627\u0646\u06C1 \u0633\u0628 \u06A9\u0686\u06BE \u0688\u06BE\u0648\u0646\u0688 \u0644\u06CC\u062A\u0627 \u06C1\u06D2\u06D4",
      today: "\u0622\u062C",
      tomorrow: "\u06A9\u0644",
      dayChoice: "\u062F\u0646",
      dateShort: "{wd} {day} {month}",
      wd0: "\u0627\u062A\u0648\u0627\u0631",
      wd1: "\u067E\u06CC\u0631",
      wd2: "\u0645\u0646\u06AF\u0644",
      wd3: "\u0628\u062F\u06BE",
      wd4: "\u062C\u0645\u0639\u0631\u0627\u062A",
      wd5: "\u062C\u0645\u0639\u06C1",
      wd6: "\u06C1\u0641\u062A\u06C1",
      leavingNext: "{station} \u0633\u06D2 \u0627\u06AF\u0644\u06CC \u0631\u0648\u0627\u0646\u06AF\u06CC\u0627\u06BA",
      onTheWay: "\u067E\u06C1\u0644\u06D2 \u06C1\u06CC \u0631\u0627\u0633\u062A\u06D2 \u0645\u06CC\u06BA",
      arrives: "{time} \u067E\u06C1\u0646\u0686\u06D2 \u06AF\u06CC",
      showWholeRoute: "\u067E\u0648\u0631\u0627 \u0631\u0648\u0679 \u062F\u06A9\u06BE\u0627\u0626\u06CC\u06BA",
      lastPassed: "\u067E\u0686\u06BE\u0644\u0627 \u0627\u0633\u0679\u06CC\u0634\u0646",
      finalStop: "\u0622\u062E\u0631\u06CC \u0627\u0633\u0679\u06CC\u0634\u0646",
      halt: "{d} \u06A9\u0627 \u0679\u06BE\u06C1\u0631\u0627\u0624",
      seeAllStopsN: "\u062A\u0645\u0627\u0645 {n} \u0627\u0633\u0679\u06CC\u0634\u0646 \u062F\u06CC\u06A9\u06BE\u06CC\u06BA",
      allStopsN: "\u062A\u0645\u0627\u0645 {n} \u0627\u0633\u0679\u06CC\u0634\u0646",
      start: "\u0622\u063A\u0627\u0632",
      end: "\u0627\u062E\u062A\u062A\u0627\u0645",
      detailDirection: "\u0633\u0645\u062A",
      detailLocomotive: "\u0627\u0646\u062C\u0646",
      detailScheduledTime: "\u0645\u0642\u0631\u0631\u06C1 \u0633\u0641\u0631\u06CC \u0648\u0642\u062A",
      detailThisRun: "\u0645\u0648\u062C\u0648\u062F\u06C1 \u0633\u0641\u0631",
      gps: "\u062C\u06CC \u067E\u06CC \u0627\u06CC\u0633",
      down: "\u0688\u0627\u0624\u0646",
      upDir: "\u0627\u067E",
      directionTo: "{dir} \xB7 {x} \u06A9\u06CC \u0637\u0631\u0641",
      leftOn: "{date} \u06A9\u0648 \u0631\u0648\u0627\u0646\u06C1",
      returnShort: "\u0648\u0627\u067E\u0633\u06CC",
      nextTrains: "\u0627\u06AF\u0644\u06CC \u0679\u0631\u06CC\u0646\u06CC\u06BA",
      justNow: "\u0627\u0628\u06BE\u06CC",
      toStation: "{x} \u06A9\u06CC \u0637\u0631\u0641",
      startsHereTo: "\u06CC\u06C1\u0627\u06BA \u0633\u06D2 \u0634\u0631\u0648\u0639 \u2190 {x}",
      clickForStation: "\u0627\u0633\u0679\u06CC\u0634\u0646 \u062F\u06CC\u06A9\u06BE\u0646\u06D2 \u06A9\u06D2 \u0644\u06CC\u06D2 \u06A9\u0644\u06A9 \u06A9\u0631\u06CC\u06BA",
      mapStations: "\u0631\u06CC\u0644\u0648\u06D2 \u0627\u0633\u0679\u06CC\u0634\u0646\u0648\u06BA \u0627\u0648\u0631 \u0686\u0644\u062A\u06CC \u0679\u0631\u06CC\u0646\u0648\u06BA \u06A9\u0627 \u0646\u0642\u0634\u06C1\u060C \u0628\u0691\u06D2 \u0634\u06C1\u0631\u0648\u06BA \u06A9\u06D2 \u0646\u0627\u0645\u0648\u06BA \u06A9\u06D2 \u0633\u0627\u062A\u06BE",
      clickForTrain: "\u0679\u0631\u06CC\u0646 \u062F\u06CC\u06A9\u06BE\u0646\u06D2 \u06A9\u06D2 \u0644\u06CC\u06D2 \u06A9\u0644\u06A9 \u06A9\u0631\u06CC\u06BA",
      mapFollowing: "{train} \u06A9\u06D2 \u0633\u0627\u062A\u06BE \u0686\u0644\u062A\u0627 \u0646\u0642\u0634\u06C1",
      mapAround: "{station} \u06A9\u06D2 \u0622\u0633 \u067E\u0627\u0633 \u06A9\u0627 \u0646\u0642\u0634\u06C1",
      // The Sabz app (views, component variants)
      leftCaption: "\u0631\u0648\u0627\u0646\u06C1",
      speedSoFar: "\u0627\u0628 \u062A\u06A9 \u06A9\u06CC \u0631\u0641\u062A\u0627\u0631",
      legendExpected: "\u0645\u062A\u0648\u0642\u0639",
      legendScheduled: "\u0645\u0642\u0631\u0631\u06C1",
      saveStation: "{name} \u0645\u062D\u0641\u0648\u0638 \u06A9\u0631\u06CC\u06BA",
      saved: "\u0645\u062D\u0641\u0648\u0638 \u06C1\u06D2",
      savedStations: "\u0645\u062D\u0641\u0648\u0638 \u0627\u0633\u0679\u06CC\u0634\u0646",
      linkCopied: "\u0644\u0646\u06A9 \u06A9\u0627\u067E\u06CC \u06C1\u0648 \u06AF\u06CC\u0627",
      copyFailed: "\u0644\u0646\u06A9 \u06A9\u0627\u067E\u06CC \u0646\u06C1\u06CC\u06BA \u06C1\u0648 \u0633\u06A9\u0627",
      notRunningNow: "\u0627\u0633 \u0648\u0642\u062A \u0646\u06C1\u06CC\u06BA \u0686\u0644 \u0631\u06C1\u06CC",
      mainStations: "\u0628\u0691\u06D2 \u0627\u0633\u0679\u06CC\u0634\u0646",
      nearestStation: "\u0642\u0631\u06CC\u0628 \u062A\u0631\u06CC\u0646 \u0627\u0633\u0679\u06CC\u0634\u0646: {station}",
      locateDenied: "\u0645\u0642\u0627\u0645 \u06A9\u06CC \u0627\u062C\u0627\u0632\u062A \u0646\u06C1\u06CC\u06BA \u0645\u0644\u06CC\u060C \u0627\u0633 \u0644\u06CC\u06D2 \u0646\u0642\u0634\u06C1 \u062C\u06C1\u0627\u06BA \u062A\u06BE\u0627 \u0648\u06C1\u06CC\u06BA \u06C1\u06D2\u06D4",
      locateUnavailable: "\u0622\u067E \u06A9\u0627 \u0645\u0642\u0627\u0645 \u0645\u0639\u0644\u0648\u0645 \u0646\u06C1\u06CC\u06BA \u06C1\u0648 \u0633\u06A9\u0627\u06D4",
      whichRun: "\u06A9\u0648\u0646 \u0633\u0627 \u0633\u0641\u0631",
      pickStopHint: "\u0648\u06C1 \u0627\u0633\u0679\u06CC\u0634\u0646 \u0686\u0646\u06CC\u06BA \u062C\u06C1\u0627\u06BA \u0622\u067E \u0633\u0648\u0627\u0631 \u06C1\u0648\u06BA \u06AF\u06D2 \u06CC\u0627 \u0627\u062A\u0631\u06CC\u06BA \u06AF\u06D2\u06D4",
      timetableTimes: "\u0627\u0648\u0642\u0627\u062A \u0679\u0627\u0626\u0645 \u0679\u06CC\u0628\u0644 \u06A9\u06D2 \u0645\u0637\u0627\u0628\u0642 \u06C1\u06CC\u06BA\u06D4",
      loadFailed: "\u0644\u0648\u0688 \u0646\u06C1\u06CC\u06BA \u06C1\u0648 \u0633\u06A9\u0627\u06D4 \u062F\u0648\u0628\u0627\u0631\u06C1 \u06A9\u0648\u0634\u0634 \u06C1\u0648 \u0631\u06C1\u06CC \u06C1\u06D2\u2026",
      // Right now rows, days on times, photos
      startedFrom: "\u0631\u0648\u0627\u0646\u06AF\u06CC \u06A9\u0627 \u0627\u0633\u0679\u06CC\u0634\u0646",
      startsFrom: "\u0631\u0648\u0627\u0646\u06AF\u06CC \u06A9\u0627 \u0627\u0633\u0679\u06CC\u0634\u0646",
      kmAwayNow: "{km} \u06A9\u0644\u0648\u0645\u06CC\u0679\u0631 \u062F\u0648\u0631 \xB7 \u0627\u0628\u06BE\u06CC {speed} \u06A9\u0644\u0648\u0645\u06CC\u0679\u0631 \u0641\u06CC \u06AF\u06BE\u0646\u0679\u06C1",
      plannedAt: "\u0645\u0642\u0631\u0631\u06C1 \u0648\u0642\u062A {time}",
      yesterday: "\u06AF\u0632\u0634\u062A\u06C1 \u0631\u0648\u0632",
      dayTime: "{day} {time}",
      timeOnDay: "{day} {time}",
      nextDay: "\u0627\u06AF\u0644\u06D2 \u062F\u0646",
      dayN: "\u062F\u0646 {n}",
      photoBy: "\u062A\u0635\u0648\u06CC\u0631: {author} \xB7 {licence}",
      journey: "\u0633\u0641\u0631",
      firstStop: "\u067E\u06C1\u0644\u0627 \u0627\u0633\u0679\u06CC\u0634\u0646",
      currentStop: "\u0645\u0648\u062C\u0648\u062F\u06C1 \u0627\u0633\u0679\u06CC\u0634\u0646",
      speedLabel: "\u0631\u0641\u062A\u0627\u0631",
      delayLabel: "\u062A\u0627\u062E\u06CC\u0631",
      arrivalLabel: "\u0622\u0645\u062F",
      // Alerts (push notifications) and last seen
      alertsHeader: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A",
      notifyMe: "\u0645\u062C\u06BE\u06D2 \u0627\u0637\u0644\u0627\u0639 \u062F\u06CC\u06BA",
      alertsOn: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0622\u0646 \u06C1\u06CC\u06BA",
      alertsFor: "{station} \u06A9\u06D2 \u0644\u06CC\u06D2",
      alertsWholeTrip: "\u067E\u0648\u0631\u06D2 \u0633\u0641\u0631 \u06A9\u06D2 \u0644\u06CC\u06D2",
      alertsWhat: "\u0679\u0631\u06CC\u0646 \u06A9\u06CC \u0631\u0648\u0627\u0646\u06AF\u06CC\u060C \u0622\u067E \u06A9\u06D2 \u0627\u0633\u0679\u06CC\u0634\u0646 \u0633\u06D2 15 \u0645\u0646\u0679 \u067E\u06C1\u0644\u06D2\u060C \u062A\u0627\u062E\u06CC\u0631 \u0645\u06CC\u06BA \u0628\u0691\u06CC \u062A\u0628\u062F\u06CC\u0644\u06CC \u0627\u0648\u0631 \u067E\u06C1\u0646\u0686\u0646\u06D2 \u067E\u0631 \u0622\u067E \u06A9\u0648 \u0627\u0637\u0644\u0627\u0639 \u0645\u0644\u06D2 \u06AF\u06CC\u06D4",
      alertsChooseStop: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u06A9\u06D2 \u0644\u06CC\u06D2 \u0627\u067E\u0646\u0627 \u0627\u0633\u0679\u06CC\u0634\u0646 \u0686\u0646\u06CC\u06BA",
      alertsSkipStop: "\u067E\u0648\u0631\u0627 \u0633\u0641\u0631\u060C \u06A9\u0648\u0626\u06CC \u0627\u0633\u0679\u06CC\u0634\u0646 \u0646\u06C1\u06CC\u06BA",
      alertsOff: "\u0628\u0646\u062F \u06A9\u0631\u06CC\u06BA",
      alertsChange: "\u0627\u0633\u0679\u06CC\u0634\u0646 \u0628\u062F\u0644\u06CC\u06BA",
      alertsBlocked: "\u0622\u067E \u06A9\u06D2 \u0628\u0631\u0627\u0624\u0632\u0631 \u06A9\u06CC \u0633\u06CC\u0679\u0646\u06AF\u0632 \u0645\u06CC\u06BA \u067E\u0679\u0691\u06CC \u06A9\u06CC \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0628\u0646\u062F \u06C1\u06CC\u06BA\u06D4",
      alertsUnsupported: "\u06CC\u06C1 \u0628\u0631\u0627\u0624\u0632\u0631 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0646\u06C1\u06CC\u06BA \u062F\u06A9\u06BE\u0627 \u0633\u06A9\u062A\u0627\u06D4 \u0622\u0626\u06CC \u0641\u0648\u0646 \u067E\u0631 \u067E\u06C1\u0644\u06D2 \u067E\u0679\u0691\u06CC \u06A9\u0648 \u06C1\u0648\u0645 \u0627\u0633\u06A9\u0631\u06CC\u0646 \u067E\u0631 \u0634\u0627\u0645\u0644 \u06A9\u0631\u06CC\u06BA\u06D4",
      alertsNoLive: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u06A9\u06D2 \u0644\u06CC\u06D2 \u0644\u0627\u0626\u06CC\u0648 \u0645\u0642\u0627\u0645 \u0636\u0631\u0648\u0631\u06CC \u06C1\u06D2\u060C \u062C\u0648 \u0627\u0633 \u0648\u0642\u062A \u0627\u0633 \u0679\u0631\u06CC\u0646 \u06A9\u0627 \u062F\u0633\u062A\u06CC\u0627\u0628 \u0646\u06C1\u06CC\u06BA\u06D4",
      alertsFailed: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0622\u0646 \u0646\u06C1\u06CC\u06BA \u06C1\u0648 \u0633\u06A9\u06CC\u06BA\u06D4 \u062F\u0648\u0628\u0627\u0631\u06C1 \u06A9\u0648\u0634\u0634 \u06A9\u0631\u06CC\u06BA\u06D4",
      lastSeen: "{station} \u06A9\u06D2 \u0642\u0631\u06CC\u0628 \u0622\u062E\u0631\u06CC \u0628\u0627\u0631 \u062F\u06CC\u06A9\u06BE\u06CC \u06AF\u0626\u06CC \xB7 {ago}",
      lastSeenShort: "\u0622\u062E\u0631\u06CC \u0628\u0627\u0631 {ago} \u062F\u06CC\u06A9\u06BE\u06CC \u06AF\u0626\u06CC",
      // Journey replay (recorded days played back on the map)
      replay: "\u067E\u0686\u06BE\u0644\u06D2 \u0633\u0641\u0631 \u062F\u0648\u0628\u0627\u0631\u06C1 \u062F\u06CC\u06A9\u06BE\u06CC\u06BA",
      replayTitle: "\u0633\u0641\u0631 \u06A9\u0627 \u0631\u06CC \u067E\u0644\u06D2",
      replayWith: "\u0648\u0627\u067E\u0633\u06CC \u06A9\u06CC \u0679\u0631\u06CC\u0646 {name} \u06A9\u06D2 \u0633\u0627\u062A\u06BE",
      replayPeriod: "\u0631\u06CC \u067E\u0644\u06D2 \u06A9\u0627 \u062F\u0648\u0631\u0627\u0646\u06CC\u06C1",
      nDays: "{n} \u062F\u0646",
      replayTime: "\u0631\u06CC \u067E\u0644\u06D2 \u06A9\u0627 \u0648\u0642\u062A",
      play: "\u0686\u0644\u0627\u0626\u06CC\u06BA",
      pause: "\u0631\u0648\u06A9\u06CC\u06BA",
      replayIdle: "\u0633\u0641\u0631 \u06A9\u06D2 \u062F\u0631\u0645\u06CC\u0627\u0646",
      replaySince: "{date} \u0633\u06D2 \u0631\u06CC\u06A9\u0627\u0631\u0688 \u0634\u062F\u06C1",
      replayHint: "\u062A\u06CC\u0632 \u0631\u0641\u062A\u0627\u0631: \u067E\u0648\u0631\u0627 \u062F\u0648\u0631\u0627\u0646\u06CC\u06C1 \u062A\u0642\u0631\u06CC\u0628\u0627\u064B \u0627\u06CC\u06A9 \u0645\u0646\u0679 \u0645\u06CC\u06BA \u0686\u0644\u062A\u0627 \u06C1\u06D2\u06D4",
      replayEmpty: "\u0627\u0633 \u0679\u0631\u06CC\u0646 \u06A9\u0627 \u0627\u0628\u06BE\u06CC \u06A9\u0648\u0626\u06CC \u0631\u06CC\u06A9\u0627\u0631\u0688 \u0646\u06C1\u06CC\u06BA\u06D4 \u067E\u0679\u0691\u06CC \u067E\u0686\u06BE\u0644\u06D2 90 \u062F\u0646 \u06A9\u0627 \u0631\u06CC\u06A9\u0627\u0631\u0688 \u0631\u06A9\u06BE\u062A\u06CC \u06C1\u06D2\u06D4",
      replayFailed: "\u0631\u06CC \u067E\u0644\u06D2 \u0627\u0633 \u0648\u0642\u062A \u062F\u0633\u062A\u06CC\u0627\u0628 \u0646\u06C1\u06CC\u06BA\u06D4"
    }
  };
  var MONTHS = {
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    ur: ["\u062C\u0646\u0648\u0631\u06CC", "\u0641\u0631\u0648\u0631\u06CC", "\u0645\u0627\u0631\u0686", "\u0627\u067E\u0631\u06CC\u0644", "\u0645\u0626\u06CC", "\u062C\u0648\u0646", "\u062C\u0648\u0644\u0627\u0626\u06CC", "\u0627\u06AF\u0633\u062A", "\u0633\u062A\u0645\u0628\u0631", "\u0627\u06A9\u062A\u0648\u0628\u0631", "\u0646\u0648\u0645\u0628\u0631", "\u062F\u0633\u0645\u0628\u0631"]
  };
  var lang = "en";
  try {
    lang = localStorage.getItem("lang") === "ur" ? "ur" : "en";
  } catch {
  }
  var getLang = () => lang;
  var isUrdu = () => lang === "ur";
  function t(key, vars = {}) {
    const s = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
    return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
  }
  var esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  var bdi = (s) => `<bdi>${esc(s)}</bdi>`;
  var PKT_OFFSET = 5 * 36e5;
  var pad = (n) => String(n).padStart(2, "0");
  function pktMidnight(ms = Date.now()) {
    const d2 = new Date(ms + PKT_OFFSET);
    return Date.UTC(d2.getUTCFullYear(), d2.getUTCMonth(), d2.getUTCDate()) - PKT_OFFSET;
  }
  function clockMin(min) {
    const x = (Math.round(min) % 1440 + 1440) % 1440;
    const h = Math.floor(x / 60);
    const s = `${h % 12 || 12}:${pad(x % 60)} ${h < 12 ? "AM" : "PM"}`;
    return lang === "ur" ? `\u2066${s}\u2069` : s;
  }
  var clock = (ms) => clockMin((ms - pktMidnight(ms)) / 6e4);
  function dur(minutes) {
    const total = Math.max(0, Math.round(minutes));
    const h = Math.floor(total / 60), m = total % 60;
    const hours = h === 1 ? "\u06AF\u06BE\u0646\u0679\u06C1" : "\u06AF\u06BE\u0646\u0679\u06D2";
    if (h && m) return t("hm", { h, m, hours });
    if (h) return t("h", { h, hours });
    return t("m", { m });
  }
  function delayText(late) {
    if (Math.abs(late) < 1) return t("onTime");
    return t(late > 0 ? "late" : "early", { d: dur(Math.abs(late)) });
  }
  function monthName(m) {
    return MONTHS[lang][m];
  }
  function __syncLang() {
    try {
      lang = document.documentElement.lang === "ur" ? "ur" : "en";
    } catch {
    }
  }

  // public/js/components/_shared.js
  var trainIcon = () => '<svg class="p-train" viewBox="0 0 40 22" aria-hidden="true" focusable="false"><rect class="p-train__roof" x="9" y="2.2" width="8" height="2.2" rx="1"/><path class="p-train__body" d="M5 4h20.5c1.4 0 2.8.6 3.8 1.7l5.6 6.1c.7.8 1.1 1.8 1.1 2.8V16.5H3V6a2 2 0 0 1 2-2z"/><path class="p-train__window" d="M25.2 6.4h.6c.9 0 1.7.4 2.3 1l3.4 3.8h-6.3z"/><rect class="p-train__window" x="6" y="6.4" width="5.2" height="3.6" rx="1"/><rect class="p-train__window" x="13.6" y="6.4" width="5.2" height="3.6" rx="1"/><rect class="p-train__stripe" x="3" y="12.2" width="33" height="1.8"/><circle class="p-train__lamp" cx="34.3" cy="15" r="0.9"/><rect class="p-train__frame" x="4" y="16.3" width="31" height="1.6" rx=".8"/><circle class="p-train__wheel" cx="8.5" cy="18.8" r="2.1"/><circle class="p-train__wheel" cx="13.5" cy="18.8" r="2.1"/><circle class="p-train__wheel" cx="25.5" cy="18.8" r="2.1"/><circle class="p-train__wheel" cx="30.5" cy="18.8" r="2.1"/></svg>';
  var icon = {
    bell: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9M10 20.5a2 2 0 0 0 4 0"/></svg>',
    train: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 10h14M9 13.5h.01M15 13.5h.01M8 21l2-4M16 21l-2-4"/></svg>',
    station: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/></svg>',
    trip: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h6.5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7H16"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    share: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"/></svg>',
    pin: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    swap: '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4v16M7 4 4 7M7 4l3 3M17 20V4M17 20l-3-3M17 20l3-3"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
    stop: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><rect x="7" y="6" width="3.5" height="12" rx="1"/><rect x="13.5" y="6" width="3.5" height="12" rx="1"/></svg>',
    // Media icons: they don't mirror in right-to-left, so no p-flip.
    play: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><rect x="7" y="6" width="3.5" height="12" rx="1"/><rect x="13.5" y="6" width="3.5" height="12" rx="1"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>',
    flag: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 21V4M6 4h11l-2 4 2 4H6"/></svg>',
    signalOff: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 5.2-2.8M19 12.5a10 10 0 0 0-2.3-1.7M12 20h.01"/></svg>',
    // Added for the Sabz components.
    star: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.75 5.6 6.15.9-4.45 4.33 1.05 6.12L12 17.06l-5.5 2.89 1.05-6.12L3.1 9.5l6.15-.9Z"/></svg>',
    starFilled: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.75 5.6 6.15.9-4.45 4.33 1.05 6.12L12 17.06l-5.5 2.89 1.05-6.12L3.1 9.5l6.15-.9Z"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    home: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 9.5V20h4.75v-6h3.5v6h4.75V9.5"/></svg>',
    back: '<svg class="p-flip" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    chevronEnd: '<svg class="p-flip" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
    layers: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 13 9 5 9-5"/></svg>',
    locate: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>'
  };
  var LOGO_SRC = "brand/patri-logo.svg";
  function statusTone(lateMin, { gps } = {}) {
    if (gps === false || lateMin == null) return "nogps";
    if (lateMin <= -1) return "early";
    if (lateMin <= 15) return "ontime";
    return "late";
  }
  var cx = (...names) => names.filter(Boolean).join(" ");
  function highlight(text, tokens) {
    text = String(text ?? "");
    if (!tokens.length) return esc(text);
    const re = new RegExp(tokens.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "giu");
    let out = "", last = 0;
    for (const m of text.matchAll(re)) {
      if (!m[0]) continue;
      out += `${esc(text.slice(last, m.index))}<mark>${esc(m[0])}</mark>`;
      last = m.index + m[0].length;
    }
    return out + esc(text.slice(last));
  }

  // public/js/components/LiveIndicator.js
  function LiveIndicator({ state = "off" } = {}) {
    const cls = cx("p-liveindicator", `p-liveindicator--${state}`);
    const attrs = 'role="status" aria-live="polite"';
    if (state === "on" || state === "reconnecting") {
      const word = t(state === "on" ? "live" : "reconnecting");
      return `<span class="${cls}" ${attrs}><span class="p-liveindicator__dot" aria-hidden="true"></span><span class="p-liveindicator__text">${word}</span></span>`;
    }
    return `<span class="${cls}" ${attrs} hidden></span>`;
  }

  // public/js/components/LanguageToggle.js
  function LanguageToggle({ lang: lang2 = "en" } = {}) {
    const btn = (code, attrs, text) => `<button type="button" class="p-languagetoggle__btn" data-lang="${code}" aria-pressed="${lang2 === code ? "true" : "false"}" ${attrs}>${text}</button>`;
    return `<div class="p-languagetoggle" role="group" aria-label="${t("language")}">` + btn("en", 'lang="en" aria-label="English"', "EN") + btn("ur", 'lang="ur"', "\u0627\u0631\u062F\u0648") + "</div>";
  }
  function bindLanguageToggle(root, handlers = {}) {
    const onClick = (e) => {
      const btn = e.target.closest?.(".p-languagetoggle [data-lang]");
      if (!btn || !root.contains(btn) || btn.getAttribute("aria-pressed") === "true") return;
      for (const b of btn.parentElement.querySelectorAll("[data-lang]")) b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      handlers.onChange?.(btn.dataset.lang);
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }

  // public/js/components/AppBar.js
  function AppBar({ live = "off", lang: lang2 = "en", back, home: home2 } = {}) {
    const link = (cls, icon2, l) => `<a class="p-appbar__${cls}" href="${esc(l.href)}">${icon[icon2]}<span class="p-appbar__backlabel">${esc(l.label)}</span></a>`;
    const start = back ? link("back", "back", back) + (home2 ? link("home", "home", home2) : "") : `<a class="p-appbar__brand" href="#/"><img class="p-appbar__logo" src="${LOGO_SRC}" alt="Patri"></a>`;
    return `<header class="p-appbar">${start}<div class="p-appbar__end">${LiveIndicator({ state: live })}${LanguageToggle({ lang: lang2 })}</div></header>`;
  }

  // public/js/components/Panel.js
  function Panel({ body: body2 = "", snap = "half", label = "" } = {}) {
    return `<section class="p-panel" data-snap="${esc(snap)}" aria-label="${esc(label)}"><button type="button" class="p-panel__handle" aria-label="${t("panelHandle")}"><span class="p-panel__bar"></span></button><div class="p-panel__body">${body2}</div></section>`;
  }
  var SNAPS = ["down", "half", "full"];
  var DOWN_PX = 150;
  var DEFAULT_TOP_GAP = 8;
  var DRAG_SLOP = 4;
  function bindPanel(root, handlers = {}) {
    const panels = root.matches?.(".p-panel") ? [root] : [...root.querySelectorAll(".p-panel")];
    const cleanups = panels.map((panel) => bindOne(panel, handlers));
    return () => cleanups.forEach((fn) => fn());
  }
  function bindOne(panel, handlers) {
    const handle = panel.querySelector(".p-panel__handle");
    const host = () => panel.offsetParent || panel.parentElement;
    const hostH = () => host()?.clientHeight || 0;
    const TOP_GAP = () => parseFloat(getComputedStyle(panel).getPropertyValue("--panel-top-gap")) || DEFAULT_TOP_GAP;
    const isSidebar = () => getComputedStyle(handle).display === "none";
    const current = () => SNAPS.includes(panel.dataset.snap) ? panel.dataset.snap : "half";
    const heightOf = (snap, H2 = hostH()) => Math.min(H2, snap === "down" ? DOWN_PX : snap === "half" ? Math.round(H2 * 0.55) : H2 - TOP_GAP());
    let dragging = false;
    let moved = false;
    let suppressClick = false;
    let startY = 0;
    let startH = 0;
    let dragH = 0;
    let wasSidebar = null;
    function publish() {
      const sidebar = isSidebar();
      if (sidebar && wasSidebar === false) panel.style.blockSize = "";
      wasSidebar = sidebar;
      const px = sidebar ? 0 : dragging ? dragH : heightOf(current());
      document.documentElement.style.setProperty("--panel-visible", `${px}px`);
    }
    function setSnap(snap) {
      if (snap === current()) return;
      panel.dataset.snap = snap;
      publish();
      handlers.onSnap?.(snap);
    }
    const step = (dir) => setSnap(SNAPS[Math.max(0, Math.min(SNAPS.length - 1, SNAPS.indexOf(current()) + dir))]);
    function onDown(e) {
      if (isSidebar() || e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      moved = false;
      startY = e.clientY;
      startH = panel.getBoundingClientRect().height;
      dragH = startH;
      handle.setPointerCapture?.(e.pointerId);
    }
    function onMove(e) {
      if (!dragging) return;
      const dy = startY - e.clientY;
      if (!moved && Math.abs(dy) < DRAG_SLOP) return;
      if (!moved) {
        moved = true;
        panel.classList.add("p-panel--dragging");
      }
      dragH = Math.max(DOWN_PX, Math.min(hostH() - TOP_GAP(), startH + dy));
      panel.style.blockSize = `${dragH}px`;
      publish();
    }
    function onUp(e) {
      if (!dragging) return;
      dragging = false;
      handle.releasePointerCapture?.(e.pointerId);
      if (!moved) return;
      suppressClick = true;
      setTimeout(() => {
        suppressClick = false;
      }, 0);
      const H2 = hostH();
      const nearest = SNAPS.reduce((best, s) => Math.abs(heightOf(s, H2) - dragH) < Math.abs(heightOf(best, H2) - dragH) ? s : best);
      panel.style.blockSize = "";
      panel.classList.remove("p-panel--dragging");
      if (nearest === current()) publish();
      else setSnap(nearest);
    }
    function onCancel(e) {
      if (!dragging) return;
      dragging = false;
      moved = false;
      panel.style.blockSize = "";
      panel.classList.remove("p-panel--dragging");
      publish();
    }
    function onClick(e) {
      if (suppressClick) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      setSnap(SNAPS[(SNAPS.indexOf(current()) + 1) % SNAPS.length]);
    }
    function onKey(e) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        step(-1);
      }
    }
    handle.addEventListener("pointerdown", onDown);
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onCancel);
    handle.addEventListener("click", onClick);
    handle.addEventListener("keydown", onKey);
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(publish) : null;
    const h = host();
    if (ro && h) ro.observe(h);
    publish();
    return () => {
      handle.removeEventListener("pointerdown", onDown);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onCancel);
      handle.removeEventListener("click", onClick);
      handle.removeEventListener("keydown", onKey);
      ro?.disconnect();
    };
  }

  // public/js/components/IconButton.js
  function IconButton({ icon: icon2, label, variant = "plain", pressed, href, text = false, className } = {}) {
    const cls = cx("p-iconbutton", `p-iconbutton--${variant}`, text && "p-iconbutton--text", className);
    const svg = (icon[icon2] ?? "") + (text ? `<span class="p-iconbutton__text">${esc(label)}</span>` : "");
    const name = text ? "" : ` aria-label="${esc(label)}"`;
    if (href) return `<a class="${cls}" href="${esc(href)}"${name}>${svg}</a>`;
    const state = pressed == null ? "" : ` aria-pressed="${pressed ? "true" : "false"}"`;
    return `<button type="button" class="${cls}" ${name}${state}>${svg}</button>`;
  }

  // public/js/components/Button.js
  function Button({ label, href, variant = "primary", icon: icon2, full, className } = {}) {
    const cls = cx("p-button", `p-button--${variant}`, full && "p-button--full", className);
    const inner = `<span class="p-button__label">${esc(label)}</span>${icon2 && icon[icon2] || ""}`;
    return href ? `<a class="${cls}" href="${esc(href)}">${inner}</a>` : `<button type="button" class="${cls}">${inner}</button>`;
  }

  // public/js/components/SearchField.js
  function SearchField({ value = "", placeholder = "", route: route2, className } = {}) {
    const clear = IconButton({ icon: "close", label: t("clearSearch"), className: "p-searchfield__clear" });
    const clearBtn = value ? clear : clear.replace("<button ", "<button hidden ");
    const field2 = `<label class="p-searchfield__field">${icon.search}<input type="search" class="p-searchfield__input" value="${esc(value)}" placeholder="${esc(placeholder)}" aria-label="${esc(placeholder)}" autocomplete="off" enterkeyhint="search">${clearBtn}</label>`;
    const link = route2 ? Button({ label: route2.label, href: route2.href, variant: "secondary", className: "p-searchfield__route" }) : "";
    return `<div class="${cx("p-searchfield", route2 && "p-searchfield--route", className)}">${field2}${link}</div>`;
  }
  function bindSearchField(root, { onInput, onClear } = {}) {
    const clearOf = (input) => input.closest(".p-searchfield").querySelector(".p-searchfield__clear");
    const clear = (input) => {
      input.value = "";
      const btn = clearOf(input);
      if (btn) btn.hidden = true;
      input.focus();
      onClear?.();
    };
    const onIn = (e) => {
      const input = e.target.closest?.(".p-searchfield__input");
      if (!input || !root.contains(input)) return;
      const btn = clearOf(input);
      if (btn) btn.hidden = !input.value;
      onInput?.(input.value);
    };
    const onClick = (e) => {
      const btn = e.target.closest?.(".p-searchfield__clear");
      if (!btn || !root.contains(btn)) return;
      clear(btn.closest(".p-searchfield").querySelector(".p-searchfield__input"));
    };
    const onKey = (e) => {
      const input = e.target.closest?.(".p-searchfield__input");
      if (!input || e.key !== "Escape" || !input.value) return;
      e.preventDefault();
      clear(input);
    };
    root.addEventListener("input", onIn);
    root.addEventListener("click", onClick);
    root.addEventListener("keydown", onKey);
    return () => {
      root.removeEventListener("input", onIn);
      root.removeEventListener("click", onClick);
      root.removeEventListener("keydown", onKey);
    };
  }

  // public/js/components/SegmentedControl.js
  function SegmentedControl({ options = [], value, label = "", className } = {}) {
    const items = options.map((o) => {
      const active = o.value === value;
      const inner = `<span class="p-segmentedcontrol__label">${esc(o.label)}</span>`;
      return o.href ? `<a class="p-segmentedcontrol__option" href="${esc(o.href)}"${active ? ' aria-current="page"' : ""}>${inner}</a>` : `<button type="button" class="p-segmentedcontrol__option" data-value="${esc(o.value)}" aria-pressed="${active ? "true" : "false"}">${inner}</button>`;
    }).join("");
    return `<div class="${cx("p-segmentedcontrol", className)}" role="group" aria-label="${esc(label)}">${items}</div>`;
  }
  function bindSegmentedControl(root, { onChange } = {}) {
    const onClick = (e) => {
      const btn = e.target.closest?.("button.p-segmentedcontrol__option");
      if (!btn || !root.contains(btn)) return;
      const group = btn.closest(".p-segmentedcontrol");
      group.querySelectorAll("button.p-segmentedcontrol__option").forEach((b) => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
      onChange?.(btn.dataset.value);
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }

  // public/js/components/StationFields.js
  var field = (which, label, station2) => {
    const name = station2 ? `<span class="p-stationfields__name">${bdi(station2)}</span>` : `<span class="p-stationfields__name p-stationfields__name--empty">${esc(t("chooseStation"))}</span>`;
    return `<button type="button" class="p-stationfields__field" data-field="${which}"><span class="p-stationfields__label">${esc(label)}</span>${name}</button>`;
  };
  function StationFields({ from = null, to = null, fromLabel = "", toLabel = "", className } = {}) {
    const swap = IconButton({ icon: "swap", label: t("swap"), variant: "outline", className: "p-stationfields__swap" });
    return `<div class="${cx("p-stationfields", className)}">${field("from", fromLabel, from)}${field("to", toLabel, to)}${swap}</div>`;
  }
  function bindStationFields(root, { onPickFrom, onPickTo, onSwap } = {}) {
    const onClick = (e) => {
      const el = e.target.closest?.(".p-stationfields__field, .p-stationfields__swap");
      if (!el || !root.contains(el)) return;
      if (el.classList.contains("p-stationfields__swap")) onSwap?.();
      else if (el.dataset.field === "from") onPickFrom?.();
      else onPickTo?.();
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }

  // public/js/components/FollowButton.js
  function FollowButton({ followed, name, label } = {}) {
    const html = IconButton({
      icon: followed ? "starFilled" : "star",
      label: (followed ? label?.on : label?.off) ?? t("follow", { name }),
      pressed: !!followed,
      className: "p-followbutton"
    });
    return label ? html.replace("<button ", `<button data-label-off="${esc(label.off)}" data-label-on="${esc(label.on)}" `) : html;
  }
  function bindFollowButton(root, { onToggle } = {}) {
    const onClick = (e) => {
      const btn = e.target.closest?.(".p-followbutton");
      if (!btn || !root.contains(btn)) return;
      const followed = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", followed ? "true" : "false");
      btn.innerHTML = icon[followed ? "starFilled" : "star"];
      const text = followed ? btn.dataset.labelOn : btn.dataset.labelOff;
      if (text) btn.setAttribute("aria-label", text);
      onToggle?.(followed, btn);
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }

  // public/js/components/MapToggle.js
  function MapToggle({ on = false, label = "", className } = {}) {
    return `<button type="button" class="${cx("p-maptoggle", on ? "p-maptoggle--on" : "p-maptoggle--off", className)}" aria-pressed="${on ? "true" : "false"}">${esc(label)}</button>`;
  }
  function bindMapToggle(root, { onToggle } = {}) {
    const onClick = (e) => {
      const btn = e.target.closest?.(".p-maptoggle");
      if (!btn || !root.contains(btn)) return;
      const on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.toggle("p-maptoggle--on", on);
      btn.classList.toggle("p-maptoggle--off", !on);
      onToggle?.(on);
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }

  // public/js/components/TrainBadge.js
  function TrainBadge({ number, direction, size = "md" } = {}) {
    return `<span class="${cx("p-trainbadge", `p-trainbadge--${size}`)}"><span class="p-trainbadge__number">${bdi(number)}</span><span class="p-trainbadge__dir">${esc(t(direction))}</span></span>`;
  }

  // public/js/components/StatusChip.js
  function StatusChip({ tone = "neutral", text, dot } = {}) {
    return `<span class="${cx("p-statuschip", `p-statuschip--${tone}`)}">${dot ? '<span class="p-statuschip__dot" aria-hidden="true"></span>' : ""}${esc(text)}</span>`;
  }
  function StatusStrip({ running, delay, updated } = {}) {
    return `<div class="p-statusstrip"><div class="p-statusstrip__frame"><span class="p-statusstrip__running"><span class="p-statusstrip__dot" aria-hidden="true"></span>${esc(running?.text)}</span><span class="${cx("p-statusstrip__delay", `p-statusstrip__delay--${delay?.tone ?? "ontime"}`)}">${esc(delay?.text)}</span></div>${updated ? `<span class="p-statusstrip__updated">${esc(updated)}</span>` : ""}</div>`;
  }

  // public/js/components/TrainCard.js
  function TrainCard({ href, badge, name, position, yourStop, status } = {}) {
    const stop = yourStop ? `<div class="p-traincard__stop"><span class="p-traincard__stoplabel">${esc(t("yourStop"))}</span> \xB7 ${bdi(yourStop.name)} \xB7 ${bdi(yourStop.time)}</div>` : "";
    return `<a class="p-traincard" href="${esc(href)}">${TrainBadge({ ...badge, size: "md" })}<span class="p-traincard__main"><span class="p-traincard__name">${bdi(name)}</span><span class="p-traincard__position">${esc(position)}</span>${stop}</span><span class="p-traincard__status">${StatusChip(status)}</span></a>`;
  }

  // public/js/components/TrainRow.js
  function TrainRow({ href, badge, name, sub, status, match, follow } = {}) {
    const tokens = String(match ?? "").trim().split(/\s+/).filter(Boolean);
    return `<div class="p-trainrow"><a class="p-trainrow__link" href="${esc(href)}">${TrainBadge({ ...badge, size: "sm" })}<span class="p-trainrow__main"><span class="p-trainrow__name"><bdi>${highlight(name, tokens)}</bdi></span><span class="p-trainrow__sub"><bdi>${highlight(sub, tokens)}</bdi></span></span><span class="p-trainrow__status">${StatusChip(status)}</span></a>${follow ? FollowButton({ followed: follow.followed, name }) : ""}</div>`;
  }

  // public/js/components/DepartureRow.js
  function DepartureRow({ href, time: time2, train: train2, sub, status } = {}) {
    const sched = time2?.scheduled && time2.scheduled !== time2.expected ? `<s class="p-departurerow__sched"><span class="p-sr">${esc(t("scheduled"))} </span>${bdi(time2.scheduled)}</s>` : "";
    const cap = time2?.caption ? `<span class="p-departurerow__caption">${esc(time2.caption)}</span>` : "";
    return `<a class="p-departurerow" href="${esc(href)}"><span class="p-departurerow__time">${cap}<span class="p-departurerow__expected">${bdi(time2?.expected)}</span>${sched}</span><span class="p-departurerow__main"><span class="p-departurerow__head"><span class="p-departurerow__num">${bdi(train2?.number)} ${esc(t(train2?.direction))}</span> <span class="p-departurerow__name">${bdi(train2?.name)}</span></span><span class="p-departurerow__sub">${esc(sub)}</span><span class="p-departurerow__status">${StatusChip(status)}</span></span></a>`;
  }

  // public/js/components/StopTimeline.js
  function StopTimeline({ rows = [], mode = "full", legend = false } = {}) {
    const shape = mode === "compact" || mode === "card" ? mode : "full";
    const full = shape !== "compact";
    const items = rows.map((row2) => {
      const { kind = "stop", name, label: tag, sub, time: time2, countdown, href, change } = row2;
      const label = kind === "more" ? esc(name) : bdi(name);
      const nameEl2 = href ? `<a class="p-stoptimeline__name" href="${esc(href)}">${label}</a>` : `<span class="p-stoptimeline__name">${label}</span>`;
      const tagEl = tag ? `<span class="p-stoptimeline__label">${bdi(tag)}</span>` : "";
      const subEl = full && sub ? `<span class="p-stoptimeline__sub">${bdi(sub)}</span>` : "";
      const changeEl = change ? Button({ label: t("change"), variant: "link", className: "p-stoptimeline__change" }) : "";
      const timeEl = time2 || countdown ? `<div class="p-stoptimeline__time">${time2?.expected ? `<span class="p-stoptimeline__expected">${bdi(time2.expected)}</span>` : ""}${time2?.scheduled ? `<s class="p-stoptimeline__scheduled"><span class="p-sr">${esc(t("scheduled"))} </span>${bdi(time2.scheduled)}</s>` : ""}${countdown ? `<span class="p-stoptimeline__countdown">${bdi(countdown)}</span>` : ""}</div>` : "";
      const here = kind === "train" ? ' aria-current="location"' : "";
      return `<li class="p-stoptimeline__row p-stoptimeline__row--${esc(kind)}"${here}><span class="p-stoptimeline__rail" aria-hidden="true"><span class="p-stoptimeline__dot"></span></span><div class="p-stoptimeline__main">${tagEl}${nameEl2}${subEl}${changeEl}</div>${timeEl}</li>`;
    });
    const key = legend ? `<li class="p-stoptimeline__legend" aria-hidden="true"><span class="p-stoptimeline__legend-expected">${esc(t("legendExpected"))}</span> \xB7 <s class="p-stoptimeline__legend-scheduled">${esc(t("legendScheduled"))}</s></li>` : "";
    return `<ol class="${cx("p-stoptimeline", `p-stoptimeline--${shape}`)}">${key}${items.join("")}</ol>`;
  }
  function bindStopTimeline(root, handlers = {}) {
    const onClick = (e) => {
      const btn = e.target.closest?.(".p-stoptimeline__change");
      if (!btn || !root.contains(btn)) return;
      handlers.onChangeStop?.();
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }

  // public/js/components/JourneyProgress.js
  function JourneyProgress({ fraction = 0, start = "", end = "", train: train2 = false, moving = false, className } = {}) {
    const f = Math.min(1, Math.max(0, Number(fraction) || 0));
    const pct2 = Math.round(f * 100);
    const pp = +(f * 100).toFixed(2);
    const rider = train2 ? `<span class="p-journeyprogress__train" style="--p:${pp}%">${trainIcon()}</span>` : "";
    return `<div class="${cx("p-journeyprogress", train2 && "p-journeyprogress--train", train2 && moving && "p-journeyprogress--moving", className)}"><div class="p-journeyprogress__track" role="progressbar" aria-label="${esc(t("journeyProgress"))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct2}" aria-valuetext="${esc(end)}"><span class="p-journeyprogress__fill" style="--p:${pp}%"></span>${rider}</div><div class="p-journeyprogress__labels"><span class="p-journeyprogress__start">${bdi(start)}</span><span class="p-journeyprogress__end">${bdi(end)}</span></div></div>`;
  }

  // public/js/components/SectionHeader.js
  function SectionHeader({ label, count, action, ruled } = {}) {
    const n = count == null || count === "" ? "" : `<span class="p-sectionheader__count"> \xB7 ${bdi(count)}</span>`;
    const act = action ? `<a class="p-sectionheader__action" href="${esc(action.href)}">${esc(action.label)}</a>` : "";
    return `<div class="p-sectionheader${ruled ? " p-sectionheader--ruled" : ""}"><h2 class="p-sectionheader__label">${esc(label)}${n}</h2>${act}</div>`;
  }

  // public/js/components/DetailGrid.js
  function DetailGrid({ items = [], size = "md", className } = {}) {
    const rows = items.map(({ label, value, lang: lang2, sub, tone, wide }) => {
      const attrs = lang2 === "ur" ? ' lang="ur" dir="rtl"' : "";
      const subHtml = sub ? `<dd class="p-detailgrid__sub">${bdi(sub)}</dd>` : "";
      return `<div class="${cx("p-detailgrid__item", wide && "p-detailgrid__item--wide")}"><dt class="p-detailgrid__label">${esc(label)}</dt><dd class="${cx("p-detailgrid__value", tone && `p-detailgrid__value--${tone}`)}"${attrs}>${lang2 === "ur" ? esc(value) : bdi(value)}</dd>${subHtml}</div>`;
    }).join("");
    return `<dl class="${cx("p-detailgrid", size === "lg" && "p-detailgrid--lg", className)}">${rows}</dl>`;
  }

  // public/js/components/LinkRow.js
  function LinkRow({ href = "#", eyebrow = "", label = "", className } = {}) {
    return `<a class="${cx("p-linkrow", className)}" href="${esc(href)}"><span class="p-linkrow__text"><span class="p-linkrow__eyebrow">${esc(eyebrow)}</span><span class="p-linkrow__label">${bdi(label)}</span></span>${icon.chevronEnd}</a>`;
  }

  // public/js/components/SpeedChart.js
  var H = 120;
  var MOVING = 3;
  function stats(points) {
    const moving = points.filter((p) => p[1] > MOVING);
    if (!moving.length) return null;
    return {
      avg: Math.round(moving.reduce((s, p) => s + p[1], 0) / moving.length),
      top: Math.round(Math.max(...points.map((p) => p[1])))
    };
  }
  function SpeedChart({ points = [], stops = [], now, title, stats: showStats = true } = {}) {
    const s = points.length >= 2 ? stats(points) : null;
    const heading = title || t("speedToday");
    const head = `<div class="p-speedchart__head"><span class="p-speedchart__title">${esc(heading)}</span>${s && showStats ? `<b class="p-speedchart__avg">${bdi(s.avg)} <small>${esc(t("kmh", { n: "" }).trim())} ${esc(t("avg"))}</small></b><span class="p-speedchart__top">${esc(t("top", { n: s.top }))}</span>` : ""}</div>`;
    if (!s) return `<div class="p-speedchart">${head}<p class="p-speedchart__empty">${esc(t("noHistory"))}</p></div>`;
    const last = points[points.length - 1];
    const x0 = points[0][0];
    const x1 = Math.max(now ?? last[0], last[0], x0 + 1);
    const yMax = Math.max(120, s.top + 10);
    const X = (ms) => (ms - x0) / (x1 - x0) * 1e3;
    const Y = (v) => H - 4 - v / yMax * (H - 12);
    const pts = points.map((p) => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`);
    const line = `M${pts.join(" L")}`;
    const area = `${line} L${X(last[0]).toFixed(1)},${H} L0,${H} Z`;
    const marks = [];
    for (const stop of [...stops].sort((a, b) => a.ms - b.ms)) {
      const x = X(stop.ms) / 10;
      if (x < 8 || x > 92) continue;
      if (marks.length && x - marks[marks.length - 1].x < 13) continue;
      marks.push({ x, name: stop.name });
    }
    const nowX = X(last[0]) / 10, nowY = Y(last[1]) / H * 100;
    const pct2 = (n) => n.toFixed(2);
    return `<div class="p-speedchart">${head}
    <div class="p-speedchart__plot" data-x0="${x0}" data-x1="${x1}">
      <svg class="p-speedchart__svg" viewBox="0 0 1000 ${H}" preserveAspectRatio="none" role="img" aria-label="${esc(heading)}">
        <path class="p-speedchart__grid" d="M0,${Y(50).toFixed(1)} L1000,${Y(50).toFixed(1)} M0,${Y(100).toFixed(1)} L1000,${Y(100).toFixed(1)}"/>
        <path class="p-speedchart__area" d="${area}"/>
        <path class="p-speedchart__line" d="${line}"/>
      </svg>
      ${marks.map((m) => `<span class="p-speedchart__mark" style="--x:${pct2(m.x)}%"></span>`).join("")}
      <span class="p-speedchart__cursor" hidden></span>
      <span class="p-speedchart__now" style="--x:${pct2(nowX)}%;--y:${pct2(nowY)}%"></span>
      <span class="p-speedchart__tip" hidden></span>
    </div>
    <div class="p-speedchart__axis">
      <div class="p-speedchart__stations">${marks.map((m) => `<span class="p-speedchart__station" style="--x:${pct2(m.x)}%">${bdi(m.name)}</span>`).join("")}</div>
      <div class="p-speedchart__ticks"><span class="p-speedchart__tick">${bdi(clock(x0))}</span><span class="p-speedchart__tick p-speedchart__tick--end">${esc(t("now"))}</span></div>
    </div>
  </div>`;
  }
  function bindSpeedChart(root, points = []) {
    const plots = root.matches?.(".p-speedchart__plot") ? [root] : [...root.querySelectorAll(".p-speedchart__plot")];
    const undo = [];
    for (const plot of plots) {
      if (!points.length) break;
      const x0 = Number(plot.dataset.x0), x1 = Number(plot.dataset.x1);
      const cursor = plot.querySelector(".p-speedchart__cursor"), tip = plot.querySelector(".p-speedchart__tip");
      const hide = () => {
        cursor.hidden = tip.hidden = true;
      };
      const show = (e) => {
        const r = plot.getBoundingClientRect();
        let f = (e.clientX - r.left) / r.width;
        if (document.documentElement.dir === "rtl") f = 1 - f;
        const ms = x0 + Math.min(Math.max(f, 0), 1) * (x1 - x0);
        let best = points[0];
        for (const p of points) if (Math.abs(p[0] - ms) < Math.abs(best[0] - ms)) best = p;
        const at3 = (best[0] - x0) / (x1 - x0) * 100;
        cursor.hidden = tip.hidden = false;
        cursor.style.insetInlineStart = `${at3}%`;
        tip.style.insetInlineStart = `${Math.min(Math.max(at3, 14), 86)}%`;
        tip.innerHTML = `${bdi(clock(best[0]))} \xB7 ${best[1] > MOVING ? bdi(t("kmh", { n: Math.round(best[1]) })) : esc(t("stopped"))}`;
      };
      const leave = (e) => {
        if (e.pointerType === "mouse") hide();
      };
      const outside = (e) => {
        if (!plot.contains(e.target)) hide();
      };
      plot.addEventListener("pointerdown", show);
      plot.addEventListener("pointermove", show);
      plot.addEventListener("pointerleave", leave);
      document.addEventListener("pointerdown", outside);
      undo.push(() => {
        plot.removeEventListener("pointerdown", show);
        plot.removeEventListener("pointermove", show);
        plot.removeEventListener("pointerleave", leave);
        document.removeEventListener("pointerdown", outside);
      });
    }
    return () => undo.forEach((fn) => fn());
  }

  // public/js/components/MapMarkers.js
  function trainMarker({ label = "", facing = "right", stale = false } = {}) {
    return `<div class="${cx("p-trainmarker", facing === "left" && "p-trainmarker--left", stale && "p-trainmarker--stale")}"><span class="p-trainmarker__dot">${trainIcon()}</span><span class="p-trainmarker__label">${bdi(label)}</span></div>`;
  }
  function mapLabel({ title = "", sub, kind = "next" } = {}) {
    const k = ["next", "yourstop", "selected", "hover"].includes(kind) ? kind : "next";
    return `<div class="${cx("p-maplabel", `p-maplabel--${k}`)}"><span class="p-maplabel__title">${bdi(title)}</span>${sub ? `<span class="p-maplabel__sub">${bdi(sub)}</span>` : ""}</div>`;
  }
  function withAlpha(hex, a) {
    let h = String(hex).trim().replace("#", "");
    if (h.length === 3) h = [...h].map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return `rgba(${n >> 16 & 255}, ${n >> 8 & 255}, ${n & 255}, ${a})`;
  }
  function mapPaint() {
    const css = getComputedStyle(document.documentElement);
    const v = (name) => css.getPropertyValue(`--${name}`).trim();
    return {
      station: { "circle-color": v("map-station"), "circle-radius": 2.5 },
      majorCity: { "circle-color": v("surface"), "circle-stroke-color": v("ink"), "circle-stroke-width": 2, "circle-radius": 5.5 },
      selectedStation: { "circle-color": v("zard-500"), "circle-stroke-color": v("sabz-700"), "circle-stroke-width": 3, "circle-radius": 7 },
      rail: { "line-color": v("map-rail"), "line-width": 1.5 },
      routeDoneCasing: { "line-color": v("surface"), "line-width": 8 },
      routeDone: { "line-color": v("sabz-700"), "line-width": 5 },
      routeAhead: { "line-color": v("sabz-700"), "line-width": 3, "line-dasharray": [2, 2] },
      // Both fade in over the oldest 40% of the trail only, so the yellow never sits half-transparent on the dark casing.
      railNetwork: { "line-color": v("sabz-700"), "line-opacity": 0.8, "line-width": ["interpolate", ["linear"], ["zoom"], 5, 1.4, 9, 2.8, 12, 4.5] },
      trainClusterText: { "text-color": v("sabz-900") },
      replayTrail: { "line-width": 5, "line-gradient": ["interpolate", ["linear"], ["line-progress"], 0, withAlpha(v("zard-500"), 0), 0.4, v("zard-500"), 1, v("zard-500")] },
      replayTrailCasing: { "line-width": 9, "line-gradient": ["interpolate", ["linear"], ["line-progress"], 0, withAlpha(v("sabz-900"), 0), 0.4, withAlpha(v("sabz-900"), 0.9), 1, withAlpha(v("sabz-900"), 0.9)] },
      cityLabel: { "text-color": v("ink"), "text-halo-color": v("surface"), "text-halo-width": 1.5 },
      land: { "fill-color": v("map-land") },
      water: { "fill-color": v("map-water") },
      border: { "line-color": v("map-border"), "line-width": 1, "line-dasharray": [3, 2] }
    };
  }
  var svgImage = (svg) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" '))}`;
  });
  function draw(w, h, paint) {
    const canvas = document.createElement("canvas");
    canvas.width = w * 2;
    canvas.height = h * 2;
    const g = canvas.getContext("2d");
    g.scale(2, 2);
    paint(g);
    return g.getImageData(0, 0, w * 2, h * 2);
  }
  async function trainImages() {
    const css = getComputedStyle(document.documentElement);
    const v = (name) => css.getPropertyValue(`--${name}`).trim();
    const ink = v("sabz-900"), green = v("sabz-700"), yellow = v("zard-500"), surface = v("surface");
    const glyph = await svgImage(icon.train.replace('stroke="currentColor"', `stroke="${ink}"`).replace('stroke-width="2"', 'stroke-width="2.4"'));
    const outline = (g, path) => {
      g.lineJoin = "round";
      g.lineWidth = 3;
      g.strokeStyle = surface;
      g.stroke(path);
    };
    const cluster = draw(50, 26, (g) => {
      g.beginPath();
      g.roundRect(1, 1, 48, 24, 12);
      g.fillStyle = yellow;
      g.fill();
      g.lineWidth = 2;
      g.strokeStyle = ink;
      g.stroke();
      g.drawImage(glyph, 7, 5, 16, 16);
    });
    const loco = draw(16, 22, (g) => {
      const body2 = new Path2D();
      body2.moveTo(-5, 20);
      body2.lineTo(-5, 9);
      body2.quadraticCurveTo(-5, 2, 0, 2);
      body2.quadraticCurveTo(5, 2, 5, 9);
      body2.lineTo(5, 20);
      body2.closePath();
      g.translate(8, 0);
      outline(g, body2);
      g.fillStyle = ink;
      g.fill(body2);
      g.save();
      g.clip(body2);
      g.fillStyle = yellow;
      g.fillRect(-6, 1, 12, 6);
      g.restore();
      g.fillStyle = yellow;
      g.fillRect(-3, 9, 6, 1.6);
    });
    const coach = draw(16, 22, (g) => {
      const body2 = new Path2D();
      body2.roundRect(-5, 2, 10, 18, 2.5);
      g.translate(8, 0);
      outline(g, body2);
      g.fillStyle = green;
      g.fill(body2);
      g.fillStyle = yellow;
      for (const y of [5.5, 10.2, 14.9]) g.fillRect(-2.5, y, 5, 1.6);
    });
    return { cluster, loco, coach };
  }
  function MapMarkers({ type, ...rest } = {}) {
    return type === "train" ? trainMarker(rest) : mapLabel(rest);
  }

  // public/js/components/Card.js
  function Card({ body: body2 = "", header: header2, tone = "plain" } = {}) {
    const head = header2 ? SectionHeader({ label: header2, ruled: true }) : "";
    return `<section class="${cx("p-card", `p-card--${tone}`)}">${head}<div class="p-card__body">${body2}</div></section>`;
  }

  // public/js/components/PageHeader.js
  function PageHeader({ leading, title, titleUr, subtitle, actions = [] } = {}) {
    const back = actions.find((a) => a.kind === "back");
    const end = actions.filter((a) => a.kind !== "back").map((a) => {
      if (a.kind === "follow") return FollowButton({ followed: a.followed, name: a.name, label: a.label });
      if (a.kind === "share") return IconButton({ icon: "share", label: a.label, className: "p-pageheader__share" });
      return "";
    }).join("");
    let lead = "";
    if (leading?.badge) lead = TrainBadge(leading.badge);
    else if (leading?.icon) lead = `<span class="p-pageheader__mark" aria-hidden="true">${icon[leading.icon] ?? ""}</span>`;
    let heading;
    let second = "";
    if (titleUr && isUrdu()) {
      heading = `<h1 class="p-pageheader__title" lang="ur">${bdi(titleUr)}</h1>`;
      second = `<p class="p-pageheader__alt p-pageheader__alt--latin"><span lang="en" dir="ltr">${esc(title)}</span></p>`;
    } else {
      heading = `<h1 class="p-pageheader__title">${bdi(title)}</h1>`;
      if (titleUr) second = `<p class="p-pageheader__alt"><span lang="ur" dir="rtl">${esc(titleUr)}</span></p>`;
    }
    const sub = subtitle ? `<p class="p-pageheader__subtitle">${bdi(subtitle)}</p>` : "";
    return `<header class="p-pageheader">` + (back ? IconButton({ icon: "back", label: back.label, href: back.href, className: "p-pageheader__back" }) : "") + lead + `<div class="p-pageheader__text">${heading}${second}${sub}</div>` + (end ? `<div class="p-pageheader__actions">${end}</div>` : "") + `</header>`;
  }
  function bindPageHeader(root, { onFollow, onShare } = {}) {
    let wrapped;
    const scoped = {
      contains: (node) => root.contains(node) && !!node.closest?.(".p-pageheader"),
      addEventListener: (type, fn) => {
        wrapped = (e) => {
          const btn = e.target.closest?.(".p-followbutton");
          if (!btn || !scoped.contains(btn)) return;
          fn(e);
          e.stopPropagation();
        };
        root.addEventListener(type, wrapped, true);
      },
      removeEventListener: (type) => root.removeEventListener(type, wrapped, true)
    };
    const unbindFollow = bindFollowButton(scoped, { onToggle: onFollow });
    const onClick = (e) => {
      const btn = e.target.closest?.(".p-pageheader__share");
      if (!btn || !root.contains(btn)) return;
      onShare?.(btn);
    };
    root.addEventListener("click", onClick);
    return () => {
      unbindFollow();
      root.removeEventListener("click", onClick);
    };
  }

  // public/js/components/Photo.js
  function Photo({ src = "", alt = "", credit = "", href, className } = {}) {
    const text = bdi(credit);
    const line = href ? `<a class="p-photo__link" href="${esc(href)}" target="_blank" rel="noopener">${text}</a>` : text;
    return `<figure class="${cx("p-photo", className)}"><img class="p-photo__img" src="${esc(src)}" alt="${esc(alt)}" width="800" height="450" loading="lazy" decoding="async">${credit ? `<figcaption class="p-photo__credit">${line}</figcaption>` : ""}</figure>`;
  }

  // public/js/components/ReplayBar.js
  var MIN = 6e4;
  function ReplayBar({ playing = false, at: at3, from, to, days = [], time: time2 = "", speed = "", label = "", disabled = false, className } = {}) {
    const span = to - from;
    const max = Math.max(0, Math.round(span / MIN));
    const value = Math.min(max, Math.max(0, Math.round((at3 - from) / MIN)));
    const off = disabled ? " disabled" : "";
    const ticks = span > 0 ? days.filter((d2) => d2.start >= from && d2.start <= to).map((d2) => {
      const f = (d2.start - from) / span;
      return `<span class="${cx("p-replaybar__tick", !d2.recorded && "p-replaybar__tick--empty")}" style="--f:${+f.toFixed(5)}"></span>`;
    }).join("") : "";
    const name = playing ? t("pause") : t("play");
    return `<div class="${cx("p-replaybar", className)}" data-from="${esc(from)}" data-to="${esc(to)}"><button type="button" class="p-replaybar__play" data-state="${playing ? "playing" : "paused"}" aria-label="${esc(name)}"${off}>${playing ? icon.pause : icon.play}</button><div class="p-replaybar__main"><div class="p-replaybar__ticks" aria-hidden="true">${ticks}</div><input type="range" class="p-replaybar__range" min="0" max="${max}" step="1" value="${value}" aria-label="${esc(label)}" aria-valuetext="${esc(time2)}"${off}><div class="p-replaybar__readout"><span class="p-replaybar__time">${time2 ? bdi(time2) : ""}</span><span class="p-replaybar__speed">${speed ? bdi(speed) : ""}</span></div></div></div>`;
  }
  function bindReplayBar(root, { onToggle, onScrub } = {}) {
    const onClick = (e) => {
      const btn = e.target.closest?.(".p-replaybar__play");
      if (!btn || !root.contains(btn) || btn.disabled) return;
      onToggle?.();
    };
    const onInput = (e) => {
      const range = e.target.closest?.(".p-replaybar__range");
      if (!range || !root.contains(range)) return;
      const from = Number(range.closest(".p-replaybar").dataset.from);
      onScrub?.(from + Number(range.value) * MIN);
    };
    root.addEventListener("click", onClick);
    root.addEventListener("input", onInput);
    return () => {
      root.removeEventListener("click", onClick);
      root.removeEventListener("input", onInput);
    };
  }
  function setText(el, text) {
    if (!el || el.textContent === text) return;
    el.innerHTML = text ? bdi(text) : "";
  }
  function syncReplayBar(root, { at: at3, time: time2 = "", speed = "", playing = false } = {}) {
    const bar = root?.matches?.(".p-replaybar") ? root : root?.querySelector?.(".p-replaybar");
    if (!bar) return;
    const range = bar.querySelector(".p-replaybar__range");
    if (range) {
      const value = String(Math.min(Number(range.max), Math.max(0, Math.round((at3 - Number(bar.dataset.from)) / MIN))));
      if (range.value !== value) range.value = value;
      if (range.getAttribute("aria-valuetext") !== time2) range.setAttribute("aria-valuetext", time2);
    }
    setText(bar.querySelector(".p-replaybar__time"), time2);
    setText(bar.querySelector(".p-replaybar__speed"), speed ?? "");
    const btn = bar.querySelector(".p-replaybar__play");
    const state = playing ? "playing" : "paused";
    if (btn && btn.dataset.state !== state) {
      btn.dataset.state = state;
      btn.innerHTML = playing ? icon.pause : icon.play;
      btn.setAttribute("aria-label", playing ? t("pause") : t("play"));
    }
  }

  // public/js/screens/index.js
  var screens_exports = {};
  __export(screens_exports, {
    HomeScreen: () => HomeScreen,
    ReplayScreen: () => ReplayScreen,
    RouteScreen: () => RouteScreen,
    SearchScreen: () => SearchScreen,
    StationScreen: () => StationScreen,
    StopsScreen: () => StopsScreen,
    TrainScreen: () => TrainScreen,
    bindScreen: () => bindScreen
  });

  // public/js/screens/_layout.js
  function frame({ name, options = {}, label = "", body: body2 = "", snap = "half", top = "", map = "", start = "", end = "", dock = "", back }) {
    const web = options.layout === "web";
    const expanded = !web && options.expanded;
    const sheetSnap = options.snap || (expanded ? "full" : snap);
    const pill = !web && back;
    const backPill = pill ? IconButton({ icon: "back", label: back.label, href: back.href, variant: "float", text: true, className: "p-screen__back" }) : "";
    const searchBtn = pill ? IconButton({ icon: "search", label: t("search"), href: "#/search", variant: "float", className: "p-screen__search" }) : "";
    const startHtml = (pill ? `<div class="p-screen__controls-row">${backPill}${homeButton("float")}${searchBtn}</div>` : "") + start;
    const cls = ["p-screen", `p-screen--${web ? "web" : "phone"}`, `p-screen--${name}`, expanded && "p-screen--expanded", !web && top && "p-screen--top", pill && "p-screen--back"].filter(Boolean).join(" ");
    return `<div class="${cls}" data-screen="${esc(name)}">` + (!web && top ? `<div class="p-screen__top">${top}</div>` : "") + `<div class="p-screen__map"><div class="p-screen__backdrop">${options.standin === false ? "" : map}</div>` + (startHtml ? `<div class="p-screen__controls p-screen__controls--start">${startHtml}</div>` : "") + (end ? `<div class="p-screen__controls p-screen__controls--end">${end}</div>` : "") + (web && dock ? `<div class="p-screen__dock">${dock}</div>` : "") + `</div><div class="p-screen__sheet">${Panel({ body: body2, snap: sheetSnap, label })}</div></div>`;
  }
  var join = (parts) => parts.filter(Boolean).join("");
  var body = (...parts) => `<div class="p-screen__body">${join(parts)}</div>`;
  var section = (...parts) => `<section class="p-screen__section">${join(parts)}</section>`;
  var cards = (...parts) => `<div class="p-screen__cards">${join(parts)}</div>`;
  var list = (...parts) => `<div class="p-screen__list">${join(parts)}</div>`;
  var stack = (...parts) => `<div class="p-screen__stack">${join(parts)}</div>`;
  var row = (...parts) => `<div class="p-screen__row">${join(parts)}</div>`;
  var fill = (html) => `<div class="p-screen__fill">${html}</div>`;
  var note = (text) => `<p class="p-screen__note">${esc(text)}</p>`;
  var MAP_BUTTONS = {
    zoomIn: ["plus", "zoomIn"],
    zoomOut: ["minus", "zoomOut"],
    layers: ["layers", "mapStyle"],
    locate: ["locate", "stationsNearMe"],
    wholeRoute: ["trip", "showWholeRoute"]
  };
  function mapButton(action) {
    const [icon2, key] = MAP_BUTTONS[action];
    return IconButton({ icon: icon2, label: t(key), variant: "float", className: `p-screen__mapbtn p-screen__mapbtn--${action}` });
  }
  var backButton = (href, variant = "plain") => IconButton({ icon: "back", label: t("back"), href, variant, className: "p-screen__back" });
  var homeButton = (variant = "plain") => IconButton({ icon: "home", label: t("home"), href: "#/", variant, className: "p-screen__home" });
  var navBar = (live, backHref = "#/") => AppBar({ live, lang: getLang(), back: { href: backHref, label: t("back") }, home: { href: "#/", label: t("home") } });
  var notice = (text) => `<div class="p-screen__notice" role="status" aria-live="polite">${text ? StatusChip({ tone: "neutral", text }) : ""}</div>`;
  function bindScreen(root, o = {}) {
    const undo = [
      bindPanel(root, { onSnap: o.onSnap }),
      bindSearchField(root, { onInput: o.onSearch, onClear: o.onClear }),
      bindSegmentedControl(root, {
        onChange: (value) => o.onSegment?.(value, root.querySelector(`.p-segmentedcontrol [data-value="${CSS.escape(value)}"]`)?.closest(".p-segmentedcontrol"))
      }),
      bindStationFields(root, { onPickFrom: o.onPickFrom, onPickTo: o.onPickTo, onSwap: o.onSwap }),
      bindMapToggle(root, { onToggle: o.onFollowing }),
      bindStopTimeline(root, { onChangeStop: o.onChangeStop }),
      bindPageHeader(root, { onFollow: o.onFollow, onShare: o.onShare }),
      bindReplayBar(root, { onToggle: o.onReplayToggle, onScrub: o.onReplayScrub }),
      bindLanguageToggle(root, { onChange: (lang2) => o.onLang?.(lang2) })
    ];
    for (const btn of root.querySelectorAll(".p-followbutton")) {
      if (!btn.closest(".p-pageheader")) undo.push(bindFollowButton(btn.parentElement, { onToggle: o.onFollow }));
    }
    const onMapClick = (e) => {
      const btn = e.target.closest?.(".p-screen__mapbtn");
      if (!btn || !root.contains(btn)) return;
      const action = [...btn.classList].find((c) => c.startsWith("p-screen__mapbtn--"))?.slice("p-screen__mapbtn--".length);
      if (action) o.onMap?.(action, btn);
    };
    root.addEventListener("click", onMapClick);
    undo.push(() => root.removeEventListener("click", onMapClick));
    const points = o.data?.speed?.points;
    if (points?.length) undo.push(bindSpeedChart(root, points));
    return () => undo.forEach((fn) => fn());
  }

  // public/js/names.js
  var EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu;
  var clean = (s) => String(s ?? "").replace(EMOJI, " ").replace(/\s+/g, " ").trim();
  var titleCase = (s) => s.replace(/(^|\s)(\p{Ll})/gu, (_, sp, c) => sp + c.toUpperCase());
  var place = (s) => titleCase(clean(s).replace(/\.$/, "").replace(/^Railway Station (?=\S)| Railway Station$/gi, ""));
  var placeUr = (s) => clean(s).replace(/[\s,،.]+$/, "");
  var stationName = (en, ur) => isUrdu() && placeUr(ur) ? placeUr(ur) : place(en);
  var trainName = (info) => isUrdu() && info.nameUr ? info.nameUr : info.name;

  // public/js/screens/_format.js
  var place2 = (s) => s ? stationName(s.name, s.nameUr) : "";
  var placeEn = (s) => s ? place(s.name) : "";
  var placeUr2 = (s) => clean(s?.nameUr).replace(/[\s,،.]+$/, "");
  var cityOf = (s) => isUrdu() ? s?.cityUr || place2(s) : s?.city ? stationName(s.city, "") : place2(s);
  var trainTitle = (train2) => trainName(train2);
  var trainNo = (train2) => `${train2.label ?? train2.number} ${t(train2.up ? "up" : "dn")}`;
  var badgeOf = (train2, size) => ({ number: train2.label ?? String(train2.number), direction: train2.up ? "up" : "dn", ...size ? { size } : {} });
  var route = (a, b) => t("passesFromTo", { a: place2(a), b: place2(b) });
  var ltr = (s) => isUrdu() ? `\u2066${s}\u2069` : s;
  var DAY_MS = 864e5;
  function dayWord(diff) {
    if (diff === -1) return t("yesterday");
    if (diff === 0) return t("today");
    if (diff === 1) return t("tomorrow");
    const wd = new Date(Date.now() + 5 * 36e5 + diff * DAY_MS).getUTCDay();
    return t(`wd${wd}`);
  }
  function at(min, now, mark, always) {
    const clock2 = ltr(`${mark}${clockMin(min)}`);
    if (now == null) {
      const n = Math.floor(min / 1440);
      return n <= 0 ? clock2 : t("timeOnDay", { time: clock2, day: n === 1 ? t("nextDay") : t("dayN", { n: n + 1 }) });
    }
    const diff = Math.floor(min / 1440) - Math.floor(now / 1440);
    return diff === 0 && !always ? clock2 : t("dayTime", { day: dayWord(diff), time: clock2 });
  }
  var time = (min, now) => at(min, now, "", false);
  var approx = (min, now) => at(min, now, "~", false);
  var dayTime = (min, now) => at(min, now, "", true);
  var dayApprox = (min, now) => at(min, now, "~", true);
  var kmNum = (n) => Math.round(n).toLocaleString("en-US");
  var km = (n) => t("km", { n: kmNum(n) });
  function dateLabel(iso) {
    const [y, m, d2] = String(iso).split("-").map(Number);
    const wd = new Date(Date.UTC(y, m - 1, d2)).getUTCDay();
    return t("dateShort", { wd: t(`wd${wd}`), day: d2, month: monthName(m - 1) });
  }
  function delayStatus(late, { gps, dot } = {}) {
    if (late == null) return { tone: "nogps", text: t(gps === false ? "tagNoGps" : "timetable"), ...dot ? { dot } : {} };
    return { tone: statusTone(late, { gps }), text: delayText(late), ...dot ? { dot } : {} };
  }
  function whereText(w) {
    if (!w) return "";
    if (w.kind === "stopped") return t("stoppedAt", { station: place2(w.at) });
    if (w.kind === "notDeparted") return t("notDepartedAt", { station: place2(w.at) });
    return route(w.from, w.to);
  }

  // public/js/screens/_map-standin.js
  var NAMES = {
    peshawar: ["Peshawar", "\u067E\u0634\u0627\u0648\u0631"],
    rawalpindi: ["Rawalpindi", "\u0631\u0627\u0648\u0644\u067E\u0646\u0688\u06CC"],
    lahore: ["Lahore", "\u0644\u0627\u06C1\u0648\u0631"],
    faisalabad: ["Faisalabad", "\u0641\u06CC\u0635\u0644 \u0622\u0628\u0627\u062F"],
    multan: ["Multan", "\u0645\u0644\u062A\u0627\u0646"],
    quetta: ["Quetta", "\u06A9\u0648\u0626\u0679\u06C1"],
    sukkur: ["Sukkur", "\u0633\u06A9\u06BE\u0631"],
    hyderabad: ["Hyderabad", "\u062D\u06CC\u062F\u0631\u0622\u0628\u0627\u062F"],
    karachi: ["Karachi", "\u06A9\u0631\u0627\u0686\u06CC"],
    okara: ["Okara", "\u0627\u0648\u06A9\u0627\u0691\u0627"],
    sahiwal: ["Sahiwal", "\u0633\u0627\u06C1\u0650\u064A\u0648\u0627\u0644"],
    chichawatni: ["Chichawatni", "\u0686\u0650\u0686\u06C1 \u0648\u0637\u0646\u0649"],
    khanewal: ["Khanewal", "\u062E\u0627\u0646\u06CC\u0648\u0627\u0644"],
    shorkot: ["Shorkot", "\u0634\u0648\u0631\u06A9\u0648\u0679"],
    lodhran: ["Lodhran", "\u0644\u0648\u062F\u0647\u0631\u0627\u06BA"],
    bahawalpur: ["Bahawalpur", "\u0628\u06C1\u0627\u0648\u0644\u067E\u0648\u0631"],
    muzaffargarh: ["Muzaffargarh", "\u0645\u0638\u0641\u0631 \u06AF\u0691\u06BE"],
    kotadu: ["Kot Adu", "\u06A9\u0648\u0679 \u0627\u062F\u0648"],
    layyah: ["Layyah", "\u0644\u06CC\u0651\u06C1"]
  };
  var COUNTRY = {
    w: 300,
    h: 360,
    border: "M5 300 L0 250 L10 215 L50 200 L70 175 L95 165 L110 140 L130 120 L150 100 L165 75 L185 55 L200 35 L215 15 L225 10 L255 25 L265 55 L245 72 L232 95 L238 118 L220 132 L212 160 L196 185 L180 215 L165 245 L155 272 L160 298",
    // Sea: the southern coast (Karachi to the west) and everything beyond it. It runs past the viewBox on purpose.
    sea: "M-1200 280 L-300 292 L5 300 L30 318 L62 326 L86 344 L100 330 L120 334 L142 318 L160 298 L190 306 L300 335 L1500 380 L1500 1500 L-1200 1500 Z",
    rails: [
      [[180, 70], [205, 80], [212, 96], [218, 112], [228, 132], [218, 148], [205, 158], [192, 168], [175, 180], [162, 202], [150, 222], [140, 238], [130, 250], [122, 262], [115, 278], [110, 295], [105, 318], [96, 330], [88, 338]],
      [[218, 112], [208, 128], [198, 145], [188, 160], [180, 172], [175, 180]],
      [[122, 262], [102, 252], [82, 238], [70, 222], [60, 205]],
      [[105, 318], [92, 292], [92, 268], [102, 252]],
      [[105, 318], [125, 322], [140, 330]]
    ],
    stations: [[192, 74], [212, 96], [218, 112], [218, 148], [205, 158], [192, 168], [208, 128], [188, 160], [162, 202], [150, 222], [140, 238], [130, 250], [115, 278], [110, 295], [96, 330], [102, 252], [82, 238], [70, 222], [92, 292], [92, 270], [125, 322], [140, 330]],
    places: [
      ["peshawar", 180, 70, "nw", true, "ne"],
      ["rawalpindi", 205, 80, "ne", true, "ne"],
      ["lahore", 228, 132, "e", true, "ne"],
      ["faisalabad", 198, 145, "nw", true, "ne"],
      ["multan", 175, 180, "w", true, "ne"],
      ["quetta", 60, 205, "s", true, "ne"],
      ["sukkur", 122, 262, "e", true, "ne"],
      ["hyderabad", 105, 318, "ne", true, "ne"],
      ["karachi", 88, 338, "w", true, "ne"]
    ],
    step: 13
    // arc length between the extra dots along the rails
  };
  var TRAIN = {
    phone: {
      w: 390,
      h: 500,
      route: [[510, -20], [420, 60], [330, 140], [280, 182], [235, 218], [195, 248], [100, 315], [20, 400], [-50, 485]],
      trainAt: 5,
      rails: [[[235, 218], [165, 150], [120, 70], [95, -10]], [[100, 315], [40, 318], [-20, 350]]],
      places: [["sahiwal", 330, 140, "e"], ["chichawatni", 280, 182, "e"], ["khanewal", 235, 218, "e"]],
      multan: [100, 315],
      multanSide: "se",
      bahawalpur: null
    },
    web: {
      w: 1e3,
      h: 800,
      route: [[1050, -60], [900, 44], [790, 120], [690, 195], [600, 265], [520, 330], [360, 450], [300, 520], [250, 590], [190, 680], [130, 780], [90, 850]],
      trainAt: 5,
      rails: [[[600, 265], [520, 190], [450, 90], [420, -20]], [[360, 450], [430, 530], [480, 640], [500, 840]]],
      places: [["okara", 900, 44, "w"], ["sahiwal", 790, 120, "e"], ["chichawatni", 690, 195, "e"], ["khanewal", 600, 265, "e"], ["lodhran", 300, 520, "e"]],
      multan: [360, 450],
      multanSide: "nw",
      bahawalpur: [250, 590]
    }
  };
  var STATION = {
    phone: {
      w: 390,
      h: 500,
      T: (x, y) => [195 + (x - 195) * 0.72, y + 100],
      at: [195, 195],
      selectedSide: "w",
      step: 60,
      rails: [
        [[400, -15], [367, 39], [335, 91], [293, 124], [250, 156], [211, 169], [195, 195], [153, 267], [114, 332], [90, 370], [62, 410]],
        [[370, -80], [335, -26], [302, 26], [270, 81], [237, 130], [211, 169]]
      ],
      places: [
        ["okara", 335, 91, "e", 0, "se"],
        ["sahiwal", 293, 124, "e", 0, "se"],
        ["shorkot", 237, 130, "w", 0, "nw"],
        ["khanewal", 211, 169, "e", 0, "se"],
        ["bahawalpur", 153, 267, "e", 0, "se"],
        ["lahore", 367, 39, "nw", 1, "sw"],
        ["faisalabad", 270, 81, "w", 1, "se"]
      ],
      dots: [[250, 156], [302, 26], [174, 231]]
    },
    web: {
      // x is squeezed around Multan so Lahore stays clear of the zoom buttons at the map's top end.
      w: 1e3,
      h: 800,
      T: (x, y) => [450 + (x - 450) * 0.72, y],
      at: [450, 420],
      selectedSide: "nw",
      step: 90,
      rails: [
        [[1240, -130], [990, 120], [880, 230], [780, 280], [650, 330], [540, 370], [450, 420], [520, 500], [560, 590], [600, 700], [640, 830]],
        [[640, -20], [620, 90], [500, 230], [540, 370]],
        [[450, 420], [360, 440], [300, 330], [240, 200], [200, 60]]
      ],
      places: [
        ["okara", 880, 230, "e", 0, "se"],
        ["sahiwal", 780, 280, "e", 0, "se"],
        ["chichawatni", 650, 330, "e", 0, "se"],
        ["shorkot", 500, 230, "e", 0, "se"],
        ["khanewal", 540, 370, "e", 0, "se"],
        ["lodhran", 520, 500, "e", 0, "se"],
        ["bahawalpur", 560, 590, "e", 0, "se"],
        ["muzaffargarh", 360, 440, "sw", 0, "sw"],
        ["kotadu", 300, 330, "w", 0, "nw"],
        ["layyah", 240, 200, "w", 0, "nw"],
        ["lahore", 990, 120, "nw", 1, "sw"],
        ["faisalabad", 620, 90, "ne", 1, "se"]
      ],
      dots: []
    }
  };
  var pct = (v, total) => `${+(v / total * 100).toFixed(3)}%`;
  var at2 = (x, y, w, h) => `left:${pct(x, w)};top:${pct(y, h)}`;
  var d = (pts) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  var dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  var near = (p, list2, r) => list2.some((q) => dist(p, q) < r);
  function along(lines, step, avoid, gap = step * 0.55) {
    const out = [];
    for (const line of lines) {
      let need = step / 2;
      for (let i = 1; i < line.length; i++) {
        const a = line[i - 1], b = line[i], len = dist(a, b);
        let pos = 0;
        while (pos + need <= len) {
          pos += need;
          need = step;
          const p = [a[0] + (b[0] - a[0]) * pos / len, a[1] + (b[1] - a[1]) * pos / len];
          if (!near(p, avoid, gap) && !near(p, out, gap)) out.push(p);
        }
        need -= len - pos;
      }
    }
    return out;
  }
  var dotEl = (cls, [x, y], w, h) => `<span class="p-mapstandin__dot ${cls}" style="${at2(x, y, w, h)}"></span>`;
  var rtl = () => isUrdu() ? "rtl" : "ltr";
  function nameEl(key, [x, y], side, major, w, h) {
    const [en, ur] = NAMES[key];
    const cls = ["p-mapstandin__at", `p-mapstandin__at--${side}`, "p-mapstandin__name", major ? "p-mapstandin__name--major" : "", isUrdu() ? "p-mapstandin__name--ur" : ""].filter(Boolean).join(" ");
    return `<span class="${cls}" style="${at2(x, y, w, h)}">${esc(isUrdu() ? ur : en)}</span>`;
  }
  function pin(kind, text, [x, y], side, w, h, wide = false) {
    return `<div class="p-mapstandin__at p-mapstandin__at--${side} p-mapstandin__pin${wide ? " p-mapstandin__pin--wide" : ""}" dir="${rtl()}" style="${at2(x, y, w, h)}">${mapLabel({ kind, title: text.title, sub: text.sub })}</div>`;
  }
  function shell(mode, w, h, label, body2) {
    return `<div class="p-mapstandin p-mapstandin--${mode}"><div class="p-mapstandin__box" style="--w:${w};--h:${h}"><svg class="p-mapstandin__svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">${body2.svg}</svg><div class="p-mapstandin__layer" aria-hidden="true">${body2.layer}</div>${body2.cards || ""}</div></div>`;
  }
  function countryMap({ layout = "phone", hover } = {}) {
    const { w, h } = COUNTRY;
    const hov = hover && COUNTRY.places.find((p) => p[0] === hover.key);
    const svg = `<path class="p-mapstandin__sea" d="${COUNTRY.sea}"/><path class="p-mapstandin__border" d="${COUNTRY.border}"/>` + COUNTRY.rails.map((r) => `<path class="p-mapstandin__rail" d="${d(r)}"/>`).join("");
    const layer = COUNTRY.places.map(([k, x, y]) => dotEl("p-mapstandin__dot--city", [x, y], w, h)).join("") + COUNTRY.places.filter((p) => p !== hov).map(([k, x, y, side]) => nameEl(k, [x, y], side, true, w, h)).join("");
    const cards2 = hov ? pin("hover", hover, [hov[1], hov[2]], hov[5], w, h) : "";
    return shell("country", w, h, t("mapStations"), { svg, layer, cards: cards2 });
  }
  function trainMap({ layout = "phone", train: train2 = { label: "" }, next = { title: "" }, yourStop } = {}) {
    const g = TRAIN[layout === "web" ? "web" : "phone"];
    const { w, h } = g;
    const here = g.route[g.trainAt];
    const done = g.route.slice(0, g.trainAt + 1), ahead = g.route.slice(g.trainAt);
    const svg = g.rails.map((r) => `<path class="p-mapstandin__rail" d="${d(r)}"/>`).join("") + `<path class="p-mapstandin__route-casing" d="${d(done)}"/><path class="p-mapstandin__route-done" d="${d(done)}"/><path class="p-mapstandin__route-ahead" d="${d(ahead)}"/>`;
    const showStop = yourStop && g.bahawalpur;
    const layer = g.places.map(([k, x, y]) => dotEl("p-mapstandin__dot--station p-mapstandin__dot--onroute", [x, y], w, h)).join("") + dotEl("p-mapstandin__dot--city", g.multan, w, h) + (showStop ? dotEl("p-mapstandin__dot--station p-mapstandin__dot--onroute", g.bahawalpur, w, h) : "") + g.places.map(([k, x, y, side]) => nameEl(k, [x, y], side, false, w, h)).join("");
    const cards2 = pin("next", next, g.multan, g.multanSide, w, h) + (showStop ? pin("yourstop", yourStop, g.bahawalpur, "e", w, h) : "") + `<div class="p-mapstandin__train" dir="ltr" style="${at2(here[0], here[1], w, h)}">${trainMarker({ label: train2.label })}</div>`;
    return shell("zoom", w, h, t("mapFollowing", { train: train2.label }), { svg, layer, cards: cards2 });
  }
  function stationMap({ layout = "phone", selected = { title: "" }, hover } = {}) {
    const g = STATION[layout === "web" ? "web" : "phone"];
    const { w, h } = g;
    const rails = g.rails.map((r) => r.map((p) => g.T(...p)));
    const places = g.places.map(([k, x, y, side, major, card]) => [k, ...g.T(x, y), side, major, card]);
    const focus = g.T(...g.at);
    const listed = [...places.map((p) => [p[1], p[2]]), ...g.dots.map((p) => g.T(...p)), focus];
    const extra = along(rails, g.step, listed, g.step * 0.5);
    const hov = hover && places.find((p) => p[0] === hover.key);
    const svg = rails.map((r) => `<path class="p-mapstandin__rail" d="${d(r)}"/>`).join("");
    const layer = [...g.dots.map((p) => g.T(...p)), ...extra].map((p) => dotEl("p-mapstandin__dot--station", p, w, h)).join("") + places.map(([k, x, y, , major]) => dotEl(major ? "p-mapstandin__dot--city" : "p-mapstandin__dot--station", [x, y], w, h)).join("") + dotEl("p-mapstandin__dot--selected", focus, w, h) + places.filter((p) => p !== hov).map(([k, x, y, side, major]) => nameEl(k, [x, y], side, !!major, w, h)).join("");
    const cards2 = pin("selected", selected, focus, g.selectedSide, w, h, true) + (hov ? pin("hover", hover, [hov[1], hov[2]], hov[5], w, h) : "");
    return shell("zoom", w, h, t("mapAround", { station: selected.title }), { svg, layer, cards: cards2 });
  }

  // public/js/screens/HomeScreen.js
  function HomeScreen(data, options = {}) {
    const web = options.layout === "web";
    const lang2 = getLang();
    const appBar = AppBar({ live: data.live, lang: lang2 });
    const href = (h2) => `#/train/${h2.train.number}${h2.runId ? `?run=${h2.runId}` : ""}`;
    const where = (h2) => (h2.where ? whereText(h2.where) : t("notRunningNow")) + (h2.lastSeen && !h2.where ? ` \xB7 ${h2.lastSeen}` : "");
    const status = (h2) => delayStatus(h2.late, { gps: h2.gps });
    const mine = data.myTrains.map((h2) => TrainCard({
      href: href(h2),
      badge: badgeOf(h2.train),
      name: trainTitle(h2.train),
      position: where(h2),
      ...h2.yourStop ? { yourStop: { name: place2(h2.yourStop.station), time: (h2.yourStop.scheduled ? time : approx)(h2.yourStop.est) } } : {},
      status: status(h2)
    }));
    const running = [...data.running].sort((a, b) => a.train.number - b.train.number).map((h2) => TrainRow({
      href: href(h2),
      badge: badgeOf(h2.train),
      name: trainTitle(h2.train),
      sub: where(h2),
      status: status(h2)
    }));
    const panel = body(
      SearchField({ placeholder: t("searchTrains"), route: { href: "#/trip", label: t("fromTo") } }),
      notice(data.notice),
      mine.length ? section(SectionHeader({ label: t("myTrains"), count: mine.length }), cards(...mine)) : "",
      section(SectionHeader({ label: t("runningNowHead"), count: data.runningCount }), list(...running))
    );
    const layers = mapButton("layers");
    const locate = mapButton("locate");
    if (!web) {
      return frame({ name: "home", options, snap: "half", label: t("home"), top: appBar, map: countryMap({ layout: "phone" }), end: layers + locate, body: panel });
    }
    const h = data.map?.hover;
    const hover = h ? { key: h.key, title: place2(h.station), sub: t("clickForStation") } : void 0;
    return frame({
      name: "home",
      options,
      label: t("home"),
      map: countryMap({ layout: "web", hover }),
      end: mapButton("zoomIn") + mapButton("zoomOut") + layers + locate,
      body: appBar + panel
    });
  }

  // public/js/screens/SearchScreen.js
  function SearchScreen(data, options = {}) {
    const web = options.layout === "web";
    const pick = data.mode === "pick";
    const field2 = SearchField({ value: data.query, placeholder: t(pick ? "searchStations" : "searchTrains") });
    const back = backButton(data.backHref || "#/");
    const mode = pick ? "" : SegmentedControl({
      label: t("searchBy"),
      value: "search",
      options: [{ value: "search", label: t("search"), href: "#/search" }, { value: "trip", label: t("fromTo"), href: "#/trip" }]
    });
    const rows = data.trains.map((h) => TrainRow({
      href: `#/train/${h.train.number}${h.runId ? `?run=${h.runId}` : ""}`,
      badge: badgeOf(h.train),
      name: trainTitle(h.train),
      sub: route(h.from, h.to) + (h.lastSeen && h.late == null ? ` \xB7 ${h.lastSeen}` : ""),
      status: delayStatus(h.late, { gps: h.gps }),
      match: data.query,
      follow: { followed: h.followed }
    }));
    const recent = (data.recent || []).map((r) => r.kind === "trip" ? LinkRow({ href: `#/trip/${r.from.id}/${r.to.id}`, eyebrow: t("tabTrip"), label: route(r.from, r.to) }) : LinkRow({ href: `#/station/${r.station.id}`, eyebrow: t("stationBoard"), label: place2(r.station) }));
    const stationRows = (items) => (items || []).map((r) => LinkRow({
      href: r.href,
      // The API has no Urdu city names, so in Urdu a station without one gets "Station board" rather than an English city.
      eyebrow: r.eyebrow ?? ((isUrdu() ? r.station.cityUr : r.station.city) ? cityOf(r.station) : t("stationBoard")),
      label: place2(r.station)
    }));
    const found = stationRows(data.stations), saved = stationRows(data.saved), main = stationRows(data.main);
    const trainsSection = rows.length ? section(SectionHeader({ label: t("tabTrains"), count: rows.length }), list(...rows)) : "";
    const foundSection = found.length ? section(SectionHeader({ label: t("tabStations"), count: found.length }), cards(...found)) : "";
    const nothing = data.query.trim() && !rows.length && !found.length;
    const panel = body(
      // The search box and its mode switch sit closer together than the sections do.
      stack(web ? field2 : row(back, homeButton(), fill(field2)), mode, pick ? SectionHeader({ label: data.pickLabel || "" }) : ""),
      ...data.stationsFirst ? [foundSection, trainsSection] : [trainsSection, foundSection],
      nothing ? note(t("noMatch", { q: data.query.trim() })) : "",
      recent.length ? section(SectionHeader({ label: t("recent") }), cards(...recent)) : "",
      saved.length ? section(SectionHeader({ label: t("savedStations") }), cards(...saved)) : "",
      main.length ? section(SectionHeader({ label: t("mainStations") }), cards(...main)) : "",
      data.hint !== false && !nothing ? note(t("searchHint")) : ""
    );
    if (!web) return frame({ name: "search", options, snap: "full", label: t("search"), map: countryMap({ layout: "phone" }), body: panel });
    return frame({
      name: "search",
      options,
      label: t("search"),
      map: countryMap({ layout: "web" }),
      end: mapButton("zoomIn") + mapButton("zoomOut"),
      body: navBar(data.live, data.backHref || "#/") + panel
    });
  }

  // public/js/screens/RouteScreen.js
  function RouteScreen(data, options = {}) {
    const web = options.layout === "web";
    const { from, to, now } = data;
    const tomorrow = data.day === "tomorrow";
    const link = (r) => `#/train/${r.train.number}${r.runId ? `?run=${r.runId}` : ""}`;
    const trainOf = (r) => ({ number: r.train.label, direction: r.train.up ? "up" : "dn", name: trainTitle(r.train) });
    const leaving = data.leaving.map((r) => {
      const known = r.late != null;
      return DepartureRow({
        href: link(r),
        train: trainOf(r),
        time: known ? { expected: approx(r.dep + r.late), scheduled: time(r.dep) } : { expected: time(r.dep) },
        sub: `${t("arrives", { time: known ? approx(r.arr + r.late) : time(r.arr) })} \xB7 ${t("stopsBetween", { n: r.stopsBetween })}`,
        status: known ? delayStatus(r.late, { gps: r.gps }) : r.gps === false ? delayStatus(null, { gps: false }) : { tone: "neutral", text: tomorrow ? t("timetable") : t("inTime", { d: dur(r.dep - now) }) }
      });
    });
    const modeOptions = [{ value: "search", label: t("search"), href: "#/search" }, { value: "trip", label: t("fromTo"), href: "#/trip" }];
    const mode = SegmentedControl({ label: t("searchBy"), value: "trip", options: modeOptions });
    const both = !!(from && to);
    let content = [];
    if (!both) content = [note(t("pickBoth"))];
    else if (data.loading) content = [note(t("loading"))];
    else if (!leaving.length) content = [note(t("noTrips"))];
    else {
      if (tomorrow) content.push(note(t("timetableTimes")));
      if (leaving.length) content.push(section(SectionHeader({ label: t("leavingNext", { station: place2(from) }), count: leaving.length }), list(...leaving)));
    }
    const days = both ? SegmentedControl({
      label: t("dayChoice"),
      value: data.day,
      options: [
        { value: "today", label: `${t("today")} \xB7 ${dateLabel(data.date)}`, ...data.hrefs ? { href: data.hrefs.today } : {} },
        { value: "tomorrow", label: `${t("tomorrow")} \xB7 ${dateLabel(nextDay(data.date))}`, ...data.hrefs ? { href: data.hrefs.tomorrow } : {} }
      ]
    }) : "";
    const panel = body(
      web ? mode : row(backButton("#/"), homeButton(), fill(mode)),
      StationFields({ from: from ? place2(from) : null, to: to ? place2(to) : null, fromLabel: t("from"), toLabel: t("to") }),
      days,
      ...content
    );
    if (!web) return frame({ name: "route", options, snap: "full", label: t("fromTo"), map: countryMap({ layout: "phone" }), body: panel });
    return frame({
      name: "route",
      options,
      label: t("fromTo"),
      map: countryMap({ layout: "web" }),
      end: mapButton("zoomIn") + mapButton("zoomOut"),
      body: navBar(data.live) + panel
    });
  }
  function nextDay(iso) {
    const [y, m, d2] = String(iso).split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d2 + 1)).toISOString().slice(0, 10);
  }

  // public/js/screens/TrainScreen.js
  var haltOf = (s) => s && s.arr != null && s.dep != null && s.dep - s.arr >= 5 ? s.dep - s.arr : 0;
  var schedOf = (s) => s?.arr ?? s?.dep ?? null;
  function derive(data) {
    const { stops, run } = data;
    const ests2 = data.ests || [];
    const progress = run && data.progress ? data.progress : { passedIdx: -1, nextIdx: -1, kmDone: 0, kmToNext: 0 };
    const now = data.now ?? 0;
    const ref = run && data.now != null ? data.now : void 0;
    const first = stops[0], last = stops.at(-1);
    const { nextIdx, passedIdx } = progress;
    const mineIdx = data.myStop ? stops.findIndex((s) => s.id === data.myStop) : -1;
    const est = (i) => ests2[i]?.est != null && !ests2[i].passed ? ests2[i].est : null;
    const behind = (i) => {
      const e = ests2[i];
      if (e?.passed && e.at != null) return { at: e.at, approx: !!e.approx };
      const s = schedOf(stops[i]);
      return s != null ? { at: s, approx: false } : null;
    };
    const inTime = (i) => est(i) != null ? t("inTime", { d: dur(est(i) - now) }) : "";
    const exp = (i) => est(i) != null ? { expected: approx(est(i), ref) } : schedOf(stops[i]) != null ? { expected: time(schedOf(stops[i]), ref) } : void 0;
    const both = (i) => {
      const sched = schedOf(stops[i]);
      if (est(i) == null) return exp(i);
      return { expected: approx(est(i), ref), ...sched != null && Math.round(est(i)) !== sched ? { scheduled: time(sched, ref) } : {} };
    };
    const trainText = (full) => {
      const st = run?.status;
      let text;
      if (st?.kind === "stopAt") text = t("stStoppedAt", { station: place2(st.station) });
      else if (st?.kind === "stopBetween") text = t("stStoppedBetween");
      else if (st?.kind === "wait") text = t("stNotDeparted");
      else if (st?.kind === "done") text = t("stArrived", { station: place2(st.station ?? last) });
      else if (st?.kind === "lost") text = t("stLost", { d: dur(st.minutes) });
      else if (!full && nextIdx >= 0) text = t("trainHereKm", { km: kmNum(progress.kmToNext), station: place2(stops[nextIdx]) });
      else text = t("trainHere", { speed: run?.speed ?? 0 });
      return full && progress.kmDone > 0 ? `${text} \xB7 ${km(progress.kmDone)}` : text;
    };
    return {
      first,
      last,
      nextIdx,
      passedIdx,
      mineIdx,
      est,
      now,
      ref,
      run,
      progress,
      stops,
      lastIdx: stops.length - 1,
      next: stops[nextIdx],
      prev: stops[passedIdx],
      mine: mineIdx >= 0 ? stops[mineIdx] : null,
      totalKm: last?.km ?? 0,
      nextHalt: haltOf(stops[nextIdx]),
      haltOf,
      schedOf,
      inTime,
      exp,
      both,
      behind,
      trainText
    };
  }
  function trainMapFor(data, layout) {
    const d2 = derive(data);
    if (!data.run || !d2.next || !d2.prev) return "";
    const train2 = { label: `${trainNo(data.train)} \xB7 ${t("kmh", { n: data.run.speed })}` };
    const when = d2.est(d2.nextIdx) != null ? approx(d2.est(d2.nextIdx), d2.ref) : "";
    const join2 = (...p) => p.filter(Boolean).join(" \xB7 ");
    if (layout !== "web") {
      return trainMap({ layout, train: train2, next: { title: place2(d2.next), sub: join2(when, km(d2.progress.kmToNext)) } });
    }
    return trainMap({
      layout,
      train: train2,
      next: { title: place2(d2.next), sub: join2(when, d2.inTime(d2.nextIdx), km(d2.progress.kmToNext)) },
      ...d2.mine && d2.mineIdx > d2.nextIdx && d2.est(d2.mineIdx) != null ? { yourStop: { title: place2(d2.mine), sub: `${t("yourStop")} \xB7 ${approx(d2.est(d2.mineIdx), d2.ref)}` } } : {}
    });
  }
  function speedCard(data) {
    const { speed, stops } = data;
    if (!data.run || !speed) return "";
    return Card({
      body: SpeedChart({
        title: t("speedSoFar"),
        stats: !speed.illustrative,
        points: speed.points,
        stops: speed.stops.map((s) => ({ ms: s.ms, name: place2(stops.find((x) => x.id === s.id)) })),
        now: speed.now
      })
    });
  }
  function statusCard(data, d2) {
    const { run, now } = data;
    if (!run) {
      const gps = data.gps !== false;
      return Card({
        tone: "key",
        header: t("rightNow"),
        body: stack(row(StatusChip(delayStatus(null, { gps }))), note(t(gps ? "noLiveRun" : "noGpsTrain")), data.lastSeen ? note(data.lastSeen) : "")
      });
    }
    const st = run.status;
    const ago = now - run.updatedAt;
    const speed = { label: t("speedLabel") };
    if (st?.kind === "stopAt") Object.assign(speed, { value: t("stopped"), sub: place2(st.station) });
    else if (st?.kind === "stopBetween") speed.value = t("stopped");
    else if (st?.kind === "wait") speed.value = t("stNotDeparted");
    else if (st?.kind === "lost") speed.value = t("stLost", { d: dur(st.minutes) });
    else if (st?.kind === "done") Object.assign(speed, { value: t("stArrived", { station: place2(st.station ?? d2.last) }), wide: true });
    else speed.value = t("kmh", { n: run.speed });
    const items = [speed, { label: t("delayLabel"), value: delayText(run.late), tone: statusTone(run.late) }];
    if (st?.kind !== "done") {
      if (st?.kind === "wait" || d2.passedIdx < 0) {
        items.push(
          { label: t("startsFrom"), value: place2(d2.first) },
          { label: t("detailDeparts"), value: d2.inTime(0) || dayTime(d2.first.dep, d2.ref), sub: d2.inTime(0) ? dayTime(d2.first.dep, d2.ref) : "" }
        );
      } else if (d2.nextIdx >= 0) {
        const i = d2.nextIdx;
        const expected = d2.est(i) != null ? dayApprox(d2.est(i), d2.ref) : dayTime(d2.schedOf(d2.stops[i]), d2.ref);
        items.push(
          { label: t("nextStop"), value: place2(d2.next), sub: t("kmAway", { km: kmNum(d2.progress.kmToNext) }) },
          { label: t("arrivalLabel"), value: d2.inTime(i) || expected, sub: d2.inTime(i) ? expected : "" }
        );
      }
    }
    return Card({
      tone: "key",
      header: t("rightNow"),
      body: stack(
        DetailGrid({ size: "lg", items: items.filter((i) => i.value) }),
        note(t("updated", { ago: ago < 1 ? t("justNow") : t("ago", { d: dur(ago) }) }))
      )
    });
  }
  function alertsCard(data) {
    const a = data.alerts;
    if (!a) return "";
    const pick = `#/train/${data.train.number}/stops?pick=1${data.runId ? `&run=${encodeURIComponent(data.runId)}` : ""}`;
    let content;
    if (a.state === "off") {
      content = stack(note(t("alertsWhat")), Button({ label: t("notifyMe"), icon: "bell", href: pick, variant: "secondary", full: true }));
    } else if (a.state === "on") {
      content = stack(
        note(`${t("alertsOn")} \xB7 ${a.stopName ? t("alertsFor", { station: a.stopName }) : t("alertsWholeTrip")}`),
        row(Button({ label: t("alertsChange"), href: pick, variant: "link" }), Button({ label: t("alertsOff"), variant: "link", className: "p-alerts-off" }))
      );
    } else {
      const key = { blocked: "alertsBlocked", unsupported: "alertsUnsupported", nolive: "alertsNoLive" }[a.state];
      if (!key) return "";
      content = note(t(key));
    }
    return Card({ header: t("alertsHeader"), body: content });
  }
  function journeyCard(data, d2) {
    const { train: train2, run } = data;
    const { stops, lastIdx, passedIdx, progress, ref } = d2;
    const keepRun = data.runId ? `?run=${encodeURIComponent(data.runId)}` : "";
    const stopsHref = `#/train/${train2.number}/stops${keepRun}`;
    const seeAll = Button({ label: t("seeAllStopsN", { n: stops.length }), href: stopsHref, variant: "primary", icon: "chevronEnd", full: true });
    const replay = data.gps ? Button({ label: t("replay"), href: `#/train/${train2.number}/replay${keepRun}`, variant: "secondary", icon: "play", full: true }) : "";
    const more = (n) => n > 0 ? [{ kind: "more", name: t("moreStops", { n }), href: stopsHref }] : [];
    if (!run) {
      const stopRow = (kind, label, s, at3) => ({ kind, label, name: place2(s), ...at3 != null ? { time: { expected: time(at3) } } : {} });
      return Card({
        header: t("journey"),
        body: stack(
          StopTimeline({
            mode: "card",
            rows: [stopRow("stop", t("firstStop"), d2.first, d2.first.dep), ...more(lastIdx - 1), stopRow("final", t("lastStop"), d2.last, d2.last.arr)]
          }),
          seeAll,
          replay
        )
      });
    }
    const st = run.status;
    const behind = (i) => {
      const b = d2.behind(i);
      return b ? { time: { expected: (b.approx ? dayApprox : dayTime)(b.at, ref) } } : {};
    };
    const ahead = (i) => {
      const e = d2.est(i), s = d2.schedOf(stops[i]);
      const expected = e != null ? dayApprox(e, ref) : s != null ? dayTime(s, ref) : null;
      return { ...expected ? { time: { expected } } : {}, ...d2.inTime(i) ? { countdown: d2.inTime(i) } : {} };
    };
    const planned = (i) => {
      const e = d2.est(i), s = d2.schedOf(stops[i]);
      return e != null && s != null && Math.round(e) !== s ? t("plannedAt", { time: time(s, ref) }) : "";
    };
    const rows = [{ kind: passedIdx >= 0 ? "passed" : "next", label: t("firstStop"), name: place2(d2.first), ...passedIdx >= 0 ? behind(0) : ahead(0) }];
    let f = -1, focus = null;
    const k = st?.kind === "stopAt" ? stops.findIndex((s) => s.id === st.station?.id) : -1;
    if (k >= 1 && k <= lastIdx - 1) {
      f = k;
      focus = { kind: "next", label: t("currentStop"), name: place2(stops[k]) };
    } else if (d2.nextIdx > 0 && d2.nextIdx < lastIdx) {
      f = d2.nextIdx;
      focus = { kind: "next", label: t("nextStop"), name: place2(d2.next), ...ahead(f) };
    }
    if (focus) rows.push(...more(f - 1), focus, ...more(lastIdx - f - 1));
    else rows.push(...more(lastIdx - 1));
    if (st?.kind === "done" || passedIdx >= lastIdx) {
      rows.push({ kind: "passed", label: t("lastStop"), name: place2(d2.last), ...behind(lastIdx) });
    } else {
      rows.push({ kind: "final", label: t("lastStop"), name: place2(d2.last), sub: planned(lastIdx), ...ahead(lastIdx) });
    }
    const done = st?.kind === "done";
    return Card({
      header: t("journey"),
      body: stack(
        StopTimeline({ mode: "card", rows }),
        JourneyProgress({
          fraction: d2.totalKm > 0 ? Math.min(1, Math.max(0, progress.kmDone / d2.totalKm)) : 0,
          start: "",
          end: t("kmOf", { done: kmNum(done ? d2.totalKm : progress.kmDone), total: kmNum(d2.totalKm) }),
          train: true,
          moving: run.speed > 0 && !["stopAt", "stopBetween", "wait", "done", "lost"].includes(st?.kind)
        }),
        seeAll,
        replay
      )
    });
  }
  function about(data, d2) {
    const { train: train2, run, details, returnTrain } = data;
    const scheduled = d2.last.arr != null && d2.first.dep != null ? dur(d2.last.arr - d2.first.dep) : "";
    const items = [
      { label: t("detailNumber"), value: trainNo(train2) },
      { label: t("detailUrduName"), value: train2.nameUr, lang: "ur" },
      { label: t("detailDirection"), value: t("directionTo", { dir: t(train2.up ? "upDir" : "down"), x: cityOf(d2.last) }) },
      ...details?.locomotive ? [{ label: t("detailLocomotive"), value: details.locomotive }] : [],
      { label: t("detailDistance"), value: d2.totalKm ? km(d2.totalKm) : "" },
      { label: t("detailScheduledTime"), value: scheduled },
      ...run ? [{ label: t("detailThisRun"), value: t("leftOn", { date: dateLabel(run.date) }) }] : [],
      { label: t("liveTracking"), value: (run ? run.gps : data.gps !== false) ? t("gps") : t("timetable") }
    ].filter((i) => i.value);
    return cards(
      Card({ header: t("aboutTrain"), body: data.photo ? stack(Photo(data.photo), DetailGrid({ items })) : DetailGrid({ items }) }),
      returnTrain ? LinkRow({ href: `#/train/${returnTrain.number}`, eyebrow: t("returnShort"), label: `${trainNo(returnTrain)} ${trainTitle(returnTrain)}` }) : ""
    );
  }
  function header(data, d2) {
    const { train: train2 } = data;
    return PageHeader({
      leading: { badge: badgeOf(train2, "md") },
      title: train2.name,
      titleUr: train2.nameUr,
      ...d2.first && d2.last ? { subtitle: route(d2.first, d2.last) } : {},
      actions: [{ kind: "follow", followed: data.followed, name: trainTitle(train2) }, { kind: "share", label: t("share") }]
    });
  }
  function runChoice(data) {
    const { train: train2, runs, runId, hiddenRuns } = data;
    const parts = [];
    if (runs && runs.length > 1) {
      parts.push(SegmentedControl({
        label: t("whichRun"),
        value: runId,
        options: runs.map((r) => ({ value: r.id, label: t("leftOn", { date: dateLabel(r.date) }), href: `#/train/${train2.number}?run=${encodeURIComponent(r.id)}` }))
      }));
    }
    if (hiddenRuns?.count) {
      parts.push(row(
        fill(note(t("hiddenRuns", { n: hiddenRuns.count }))),
        Button({ label: t("showAnyway"), href: hiddenRuns.href, variant: "link" })
      ));
    }
    return parts.length ? cards(...parts) : "";
  }
  function TrainScreen(data, options = {}) {
    const web = options.layout === "web";
    const d2 = derive(data);
    const label = trainTitle(data.train);
    const following = MapToggle({ on: data.following !== false, label: t("following") });
    const wholeRoute = mapButton("wholeRoute");
    const map = options.standin === false ? "" : trainMapFor(data, web ? "web" : "phone");
    const status = data.notice != null ? notice(data.notice) : "";
    const content = d2.first ? [header(data, d2), status, runChoice(data), statusCard(data, d2), alertsCard(data), journeyCard(data, d2)] : [header(data, d2), status, note(t("loading"))];
    if (!web) {
      return frame({
        name: "train",
        options,
        label,
        snap: "half",
        map,
        back: { href: "#/", label: t("back") },
        end: following + wholeRoute,
        body: body(...content, d2.first ? speedCard(data) : "", d2.first ? about(data, d2) : "")
      });
    }
    return frame({
      name: "train",
      options,
      label,
      map,
      end: following + wholeRoute + mapButton("zoomIn") + mapButton("zoomOut"),
      dock: d2.first ? speedCard(data) : "",
      body: navBar(data.live) + body(...content, d2.first ? about(data, d2) : "")
    });
  }

  // public/js/screens/StopsScreen.js
  function rowsOf(data, d2) {
    const { stops, run, train: train2 } = data;
    const { passedIdx, nextIdx, lastIdx, haltOf: haltOf2 } = d2;
    const pick = !!data.pick;
    const hrefOf = (s) => `#/train/${train2.number}?stop=${encodeURIComponent(s.id)}${data.runId ? `&run=${encodeURIComponent(data.runId)}` : ""}`;
    const halt = (s) => {
      const h = haltOf2(s);
      return h ? t("halt", { d: dur(h) }) : "";
    };
    const join2 = (...parts) => parts.filter(Boolean).join(" \xB7 ");
    const out = [];
    if (run && passedIdx < 0) out.push({ kind: "train", name: d2.trainText(true) });
    stops.forEach((s, i) => {
      const name = place2(s);
      const passed = run && i <= passedIdx;
      if (passed) {
        const b = d2.behind(i), sched = d2.schedOf(s);
        const at3 = b ? { time: {
          expected: (b.approx ? approx : time)(b.at, d2.ref),
          ...sched != null && Math.round(b.at) !== sched ? { scheduled: time(sched, d2.ref) } : {}
        } } : {};
        const kmText = i === 0 ? join2(t("start"), km(0)) : i === passedIdx ? join2(km(s.km), t("lastPassed")) : km(s.km);
        out.push({ kind: "passed", name, sub: kmText, ...at3 });
        if (i === passedIdx) out.push({ kind: "train", name: d2.trainText(true) });
        return;
      }
      const tm = d2.both(i);
      const time_ = tm ? { time: tm } : {};
      const link = pick ? { href: hrefOf(s) } : {};
      if (i === lastIdx) out.push({ kind: "final", name, sub: join2(t("end"), km(s.km)), ...time_, ...link });
      else if (run && i === nextIdx) out.push({ kind: "next", name, sub: join2(t("nextStop"), km(s.km), halt(s)), ...time_, ...link });
      else out.push({ kind: "stop", name, sub: join2(i === 0 ? t("start") : "", km(s.km), halt(s)), ...time_, ...link });
    });
    return out;
  }
  function StopsScreen(data, options = {}) {
    const web = options.layout === "web";
    const d2 = derive(data);
    const { train: train2, run, stops } = data;
    const pick = !!data.pick;
    const title = pick ? t("alertsChooseStop") : t("allStopsN", { n: stops.length });
    const header2 = PageHeader({
      title,
      subtitle: d2.first ? `${trainNo(train2)} ${trainTitle(train2)} \xB7 ${route(d2.first, d2.last)}` : `${trainNo(train2)} ${trainTitle(train2)}`
      // No back of its own: the Panel's top bar (phone) or the AppBar (web) links back to the train.
    });
    const content = body(
      header2,
      data.notice != null ? notice(data.notice) : "",
      ...d2.first ? [
        row(StatusChip(delayStatus(run ? run.late : null, { gps: run ? run.gps : data.gps !== false }))),
        pick ? note(t("pickStopHint")) : "",
        pick ? Button({ label: t("alertsSkipStop"), variant: "secondary", full: true, className: "p-alerts-whole" }) : "",
        !run ? note(t("timetableTimes")) : "",
        StopTimeline({ mode: "full", rows: rowsOf(data, d2), legend: !!run })
      ] : [note(t("loading"))]
    );
    const map = options.standin === false ? "" : trainMapFor(data, web ? "web" : "phone");
    const backHref = `#/train/${train2.number}${data.runId ? `?run=${encodeURIComponent(data.runId)}` : ""}`;
    if (!web) {
      return frame({ name: "stops", options, snap: "full", label: title, map, body: content, back: { href: backHref, label: t("back") } });
    }
    return frame({
      name: "stops",
      options,
      snap: "full",
      label: title,
      map,
      body: navBar(data.live, backHref) + content
    });
  }

  // public/js/screens/ReplayScreen.js
  function ReplayScreen(data, options = {}) {
    const web = options.layout === "web";
    const { train: train2, replay: r } = data;
    const title = t("replayTitle");
    const header2 = PageHeader({
      title,
      subtitle: `${trainNo(train2)} ${trainTitle(train2)}${r.returnName ? ` \xB7 ${t("replayWith", { name: r.returnName })}` : ""}`
    });
    const inside = r.state === "ready" ? [ReplayBar(r.bar), note(r.since), note(t("replayHint"))] : [note(t(r.state === "loading" ? "loading" : r.state === "failed" ? "replayFailed" : "replayEmpty"))];
    const content = body(
      header2,
      Card({
        body: stack(
          SegmentedControl({ label: t("replayPeriod"), value: String(r.days), options: r.periods }),
          ...inside
        )
      })
    );
    const map = options.standin === false ? "" : trainMapFor(data, web ? "web" : "phone");
    const backHref = `#/train/${train2.number}${data.runId ? `?run=${encodeURIComponent(data.runId)}` : ""}`;
    if (!web) {
      return frame({ name: "replay", options, snap: "half", label: title, map, body: content, back: { href: backHref, label: t("back") } });
    }
    return frame({
      name: "replay",
      options,
      snap: "half",
      label: title,
      map,
      body: navBar(data.live, backHref) + content
    });
  }

  // public/js/screens/StationScreen.js
  function StationScreen(data, options = {}) {
    const web = options.layout === "web";
    const { station: station2, rows, now, updatedAt } = data;
    const name = place2(station2);
    const selected = { title: name };
    const hover = web && data.map?.hover ? { key: data.map.hover.key, title: place2(data.map.hover.station), sub: t("clickForStation") } : void 0;
    const timetableView = data.view === "timetable";
    const age = now - updatedAt < 1 ? t("justNow") : t("ago", { d: dur(now - updatedAt) });
    const panel = body(
      PageHeader({
        leading: { icon: "pin" },
        title: placeEn(station2),
        titleUr: placeUr2(station2) || void 0,
        subtitle: cityOf(station2),
        actions: [
          { kind: "follow", followed: data.saved, name, label: { off: t("saveStation", { name }), on: t("saved") } },
          { kind: "share", label: t("share") }
        ]
      }),
      notice(data.notice),
      data.photo ? Photo(data.photo) : "",
      SegmentedControl({
        label: t("stationBoard"),
        value: timetableView ? "timetable" : "next",
        options: [
          { value: "next", label: t("nextTrains"), href: `#/station/${station2.id}` },
          { value: "timetable", label: t("timetable"), href: `#/station/${station2.id}?view=timetable` }
        ]
      }),
      timetableView ? timetableSection(data) : data.loading ? note(t("loading")) : section(
        row(fill(SectionHeader({ label: t("nextTrains"), count: rows.length })), StatusChip({ tone: "neutral", text: t("updated", { ago: age }) })),
        rows.length ? list(...rows.map((r) => boardRow(r, station2, data.now))) : note(t("noTrainsSoon"))
      )
    );
    return frame({
      name: "station",
      options,
      label: name,
      snap: "half",
      map: stationMap({ layout: web ? "web" : "phone", selected, ...hover ? { hover } : {} }),
      back: { href: "#/", label: t("back") },
      end: web ? mapButton("zoomIn") + mapButton("zoomOut") + mapButton("layers") : "",
      body: web ? navBar(data.live) + panel : panel
    });
  }
  function timetableSection(data) {
    if (data.loadingTimetable) return note(t("loading"));
    const rows = data.timetable || [];
    return section(
      SectionHeader({ label: t("timetable"), count: rows.length }),
      note(t("tripsCount", { n: rows.length })),
      list(...rows.map((r) => {
        const { train: train2, kind, origin, dest, time: at3, late, gps, runId } = r;
        const sub = kind === "starts" ? t("startsHereTo", { x: place2(dest) }) : kind === "ends" ? t("arrivesFrom", { x: place2(origin) }) : t("toStation", { x: place2(dest) });
        return DepartureRow({
          href: `#/train/${train2.number}${runId ? `?run=${runId}` : ""}`,
          time: { expected: time(at3) },
          train: { number: train2.label, direction: train2.up ? "up" : "dn", name: trainTitle(train2) },
          sub,
          ...late != null ? { status: delayStatus(late, { gps }) } : {}
        });
      }))
    );
  }
  function boardRow(r, station2, now) {
    const { train: train2, kind, origin, dest, sched, est, late, gps, runId, kmAway, atPlatform, lastSeen } = r;
    const moved = est !== sched;
    let when;
    if (atPlatform) when = { expected: time(est, now) };
    else if (late != null) when = { expected: approx(est, now) };
    else when = { expected: time(sched, now) };
    if (when.expected !== time(sched, now) && moved) when.scheduled = time(sched, now);
    let sub;
    if (kind === "starts") sub = t("startsHereTo", { x: place2(dest) });
    else if (kind === "ends") sub = t("arrivesFrom", { x: place2(origin) });
    else sub = t("toStation", { x: place2(dest) }) + (kmAway != null ? ` \xB7 ${t("kmAway", { km: kmAway })}` : "");
    if (lastSeen && (late == null || gps === false)) sub += ` \xB7 ${lastSeen}`;
    let status;
    if (atPlatform) status = { tone: late == null ? "ontime" : statusTone(late), text: t("atPlatform") };
    else if (gps === false) status = delayStatus(null, { gps: false });
    else status = delayStatus(late, { gps });
    return DepartureRow({
      href: `#/train/${train2.number}${runId ? `?run=${runId}` : ""}`,
      time: when,
      train: { number: train2.label, direction: train2.up ? "up" : "dn", name: trainTitle(train2) },
      sub,
      status
    });
  }

  // public/js/screens/_sample.js
  var freeze = (o) => {
    if (o && typeof o === "object" && !Object.isFrozen(o)) {
      Object.freeze(o);
      Object.values(o).forEach(freeze);
    }
    return o;
  };
  var S = {
    lahore: { id: "108", name: "Lahore Jn.", nameUr: "\u0644\u0627\u06C1\u0648\u0631 \u062C\u0646\u06A9\u0634\u0646", city: "Lahore", cityUr: "\u0644\u0627\u06C1\u0648\u0631" },
    kotLakhpat: { id: "165", name: "Kot Lakhpat", nameUr: "\u06A9\u0648\u0679 \u0644\u06A9\u06BE\u067E\u062A", city: "Lahore" },
    raiwind: { id: "109", name: "Raiwind Jn.", nameUr: "\u0631\u0627\u06D3\u0648\u0650\u0646\u0688 \u062C\u0646\u06A9\u0634\u0646", city: "Raiwind" },
    okara: { id: "111", name: "Okara", nameUr: "\u0627\u0648\u06A9\u0627\u0691\u0627 ", city: "Okara" },
    sahiwal: { id: "112", name: "Sahiwal", nameUr: "\u0633\u0627\u06C1\u0650\u064A\u0648\u0627\u0644", city: "Sahiwal" },
    multan: { id: "116", name: "Multan Cantt", nameUr: "\u0645\u0644\u062A\u0627\u0646 \u06A9\u06CC\u0646\u0679", city: "Multan", cityUr: "\u0645\u0644\u062A\u0627\u0646" },
    bahawalpur: { id: "117", name: "Bahawalpur", nameUr: "\u0628\u06C1\u0627\u0648\u0644\u067E\u0648\u0631", city: "Bahawalpur" },
    khanpur: { id: "118", name: "Khanpur Jn.", nameUr: "\u062E\u0627\u0646\u067E\u0648\u0631 \u062C\u0646\u06A9\u0634\u0646", city: "Khanpur" },
    rahimYarKhan: { id: "119", name: "Rahim Yar Khan", nameUr: "\u0631\u062D\u06CC\u0645 \u06CC\u0627\u0631 \u062E\u0627\u0646", city: "Rahim Yar Khan" },
    sadiqabad: { id: "138", name: "Sadiqabad", nameUr: "\u0635\u0627\u062F\u0642 \u0622\u0628\u0627\u062F", city: "Rahim Yar Khan" },
    ghotki: { id: "136", name: "Ghotki", nameUr: "\u06AF\u06BE\u0648\u0679\u06A9\u06CC ,", city: "Ghotki" },
    rohri: { id: "120", name: "Rohri Jn.", nameUr: "\u0631\u0648\u06C1\u0691\u06CC \u062C\u0646\u06A9\u0634\u0646", city: "Rohri" },
    nawabshah: { id: "123", name: "Nawabshah Jn.", nameUr: "\u0646\u0648\u0627\u0628\u0634\u0627\u06C1 \u062C\u0646\u06A9\u0634\u0646", city: "Nawabshah" },
    hyderabad: { id: "126", name: "Hyderabad Jn", nameUr: "\u062D\u06CC\u062F\u0631\u0622\u0628\u0627\u062F \u062C\u0646\u06A9\u0634\u0646", city: "Hyderabad" },
    landhi: { id: "127", name: "Landhi Jn.", nameUr: "\u0644\u0627\u0646\u0688\u06BE\u06CC \u062C\u0646\u06A9\u0634\u0646", city: "Karachi" },
    karachi: { id: "129", name: "Karachi Cantt", nameUr: "\u06A9\u0631\u0627\u0686\u06CC \u06A9\u064A\u0646\u0679", city: "Karachi", cityUr: "\u06A9\u0631\u0627\u0686\u06CC" },
    karachiCity: { id: "172", name: "Karachi City", nameUr: "\u0633\u0679\u06CC \u0627\u0633\u0679\u06CC\u0634\u0646 \u06A9\u0631\u0627\u0686\u06CC ", city: "Karachi" },
    rawalpindi: { id: "101", name: "Rawalpindi", nameUr: "\u0631\u0627\u0648\u0644\u067E\u0650\u0646\u0688\u0649", city: "Rawalpindi" },
    peshawar: { id: "170", name: "Peshawar Cantt", nameUr: "\u067E\u0634\u0627\u0648\u0631 \u06A9\u06CC\u0646\u0679", city: "Peshawar" },
    jacobabad: { id: "232", name: "Jacobabad Jn", nameUr: "\u062C\u06CC\u06A9\u0628 \u0622\u0628\u0627\u062F", city: "Jacobabad" },
    sargodha: { id: "152", name: "Sargodha Jn", nameUr: "\u0633\u0631\u06AF\u0648\u062F\u06BE\u0627 \u062C\u0646\u06A9\u0634\u0646 ", city: "Sargodha" },
    shaheenabad: { id: "151", name: "Shaheenabad Jn", nameUr: "\u0634\u0627\u06C1\u06CC\u0646 \u0622\u0628\u0627\u062F \u062C\u0646\u06A9\u0634\u0646", city: "Sargodha" },
    padidan: { id: "137", name: "Padidan", nameUr: "\u067E\u0688\u0639\u06CC\u062F\u0646 ,", city: "Naushahro Feroze" },
    khanewal: { id: "135", name: "Khanewal Jn", nameUr: "\u062E\u0627\u0646\u06CC\u0648\u0627\u0644 \u062C\u0646\u06A9\u0634\u0646 ,", city: "Khanewal" }
  };
  var train = (number, up, name, nameUr) => ({ number, label: String(number), up, name, nameUr });
  var T = {
    1: train(1, true, "Khyber Mail", "\u062E\u06CC\u0628\u0631 \u0645\u06CC\u0644"),
    2: train(2, false, "Khyber Mail", "\u062E\u06CC\u0628\u0631 \u0645\u06CC\u0644"),
    8: train(8, false, "Tezgam", "\u062A\u06CC\u0632\u06AF\u0627\u0645"),
    10: train(10, false, "Allama Iqbal Express", "\u0639\u0644\u0627\u0645\u06C1 \u0627\u0642\u0628\u0627\u0644 \u0627\u06CC\u06A9\u0633\u067E\u0631\u06CC\u0633"),
    11: train(11, true, "Hazara Express", "\u06C1\u0632\u0627\u0631\u0627 \u0627\u06CC\u06A9\u0633\u067E\u0631\u06CC\u0633"),
    16: train(16, false, "Karachi Express", "\u06A9\u0631\u0627\u0686\u06CC \u0627\u06CC\u06A9\u0633\u067E\u0631\u06CC\u0633"),
    18: train(18, false, "Millat Express", "\u0645\u0644\u062A \u0627\u06CC\u06A9\u0633\u067E\u0631\u06CC\u0633"),
    26: train(26, false, "Bahauddin Zikria Express", "\u0628\u06C1\u0627\u0626\u0648 \u0627\u0644\u062F\u06CC\u0646 \u0632\u06A9\u0631\u06CC\u0627 \u0627\u06CC\u06A9\u0633\u067E\u0631\u06CC\u0633"),
    27: train(27, true, "Shalimar Express", "\u0634\u0627\u0644\u06CC\u0645\u0627\u0631 \u0627\u06CC\u06A9\u0633\u067E\u0631\u06CC\u0633"),
    28: train(28, false, "Shalimar Express", "\u0634\u0627\u0644\u06CC\u0645\u0627\u0631 \u0627\u06CC\u06A9\u0633\u067E\u0631\u06CC\u0633"),
    34: train(34, false, "Pak Business", "\u067E\u0627\u06A9 \u0628\u0632\u0646\u0633"),
    38: train(38, false, "Fareed Express", "\u0641\u0631\u06CC\u062F \u0627\u06CC\u06A9\u0633\u067E\u0631\u06CC\u0633"),
    40: train(40, false, "Jaffar Express", "\u062C\u0639\u0641\u0631 \u0627\u06CC\u06A9\u0633\u067E\u0631\u06CC\u0633"),
    42: train(42, false, "Karakoram Express", "\u0642\u0631\u0627\u0642\u0631\u0645 \u0627\u06CC\u06A9\u0633\u067E\u0631\u06CC\u0633"),
    46: train(46, false, "Pakistan Express", "\u067E\u0627\u06A9\u0633\u062A\u0627\u0646 \u0627\u06CC\u06A9\u0633\u067E\u0631\u06CC\u0633"),
    47: train(47, true, "Rehman Baba Express", "\u0631\u062D\u0645\u0627\u0646 \u0628\u0627\u0628\u0627 \u0627\u06CC\u06A9\u0633\u067E\u0631\u06CC\u0633"),
    48: train(48, false, "Rehman Baba Express", "\u0631\u062D\u0645\u0627\u0646 \u0628\u0627\u0628\u0627 \u0627\u06CC\u06A9\u0633\u067E\u0631\u06CC\u0633"),
    127: train(127, true, "Mehr Express", "\u0645\u06BE\u0631 \u0627\u06CC\u06A9\u0633\u067E\u0631\u06CC\u0633")
  };
  var between = (from, to) => ({ kind: "between", from, to });
  var home = {
    live: "on",
    myTrains: [
      { train: T[28], where: between(S.sahiwal, S.multan), late: 30, gps: true, runId: "281810", yourStop: { station: S.bahawalpur, est: 895 } },
      { train: T[10], where: { kind: "stopped", at: S.lahore }, late: 47, gps: true, runId: "101810" }
    ],
    // The six rows the web wireframe lists, in train-number order.
    running: [
      { train: T[11], where: between(S.nawabshah, S.padidan), late: 36, gps: true },
      { train: T[18], where: between(S.sargodha, S.shaheenabad), late: 15, gps: true },
      { train: T[27], where: between(S.nawabshah, S.rohri), late: 34, gps: true, runId: "271810" },
      { train: T[28], where: between(S.sahiwal, S.multan), late: 30, gps: true, runId: "281810" },
      { train: T[47], where: between(S.landhi, S.hyderabad), late: 4, gps: true },
      { train: T[48], where: { kind: "notDeparted", at: S.peshawar }, late: -3, gps: true }
    ],
    runningCount: 41,
    map: { hover: { key: "lahore", station: S.lahore } }
  };
  var search = {
    live: "on",
    query: "Shalimar",
    trains: [
      { train: T[28], from: S.lahore, to: S.karachi, late: 30, gps: true, followed: true, runId: "281810" },
      { train: T[27], from: S.karachi, to: S.lahore, late: 34, gps: true, followed: false, runId: "271810" }
    ],
    recent: [
      { kind: "trip", from: S.lahore, to: S.karachi },
      { kind: "station", station: S.multan }
    ]
  };
  var routeSample = {
    live: "on",
    from: S.lahore,
    to: S.karachi,
    date: "2026-10-18",
    day: "today",
    now: 794,
    leaving: [
      { train: T[8], dep: 825, arr: 2070, late: 110, gps: true, stopsBetween: 21, runId: "81810" },
      { train: T[42], dep: 900, arr: 2085, late: null, gps: true, stopsBetween: 7 },
      { train: T[34], dep: 990, arr: 2130, late: null, gps: false, stopsBetween: 11 },
      { train: T[16], dep: 1080, arr: 2255, late: null, gps: true, stopsBetween: 11 }
    ],
    onTheWay: [
      { train: T[38], dep: 360, arr: 1915, late: 55, gps: true, stopsBetween: 43, runId: "381810" },
      { train: T[28], dep: 430, arr: 1580, late: 30, gps: true, stopsBetween: 14, runId: "281810" },
      { train: T[2], dep: 470, arr: 1820, late: 198, gps: true, stopsBetween: 29, runId: "21710" },
      { train: T[10], dep: 730, arr: 1995, late: 47, gps: true, stopsBetween: 26, runId: "101810" }
    ]
  };
  var STOPS = [
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
    [S.karachi, 1580, null, 1165.2]
  ].map(([s, arr, dep, km2]) => ({ ...s, arr, dep, km: km2 }));
  var LATE = 30;
  var PASSED = 4;
  var ests = STOPS.map((s, i) => i <= PASSED ? { passed: true } : { passed: false, est: (s.arr ?? s.dep) + LATE });
  var DAY0 = Date.UTC(2026, 9, 18) - 5 * 36e5;
  var SPEED_STOPS = [{ min: 490, id: S.raiwind.id }, { min: 585, id: S.okara.id }, { min: 633, id: S.sahiwal.id }];
  function speedPoints() {
    const pts = [];
    for (let m = 430; m < 780; m += 4) {
      const d2 = Math.min(...SPEED_STOPS.map((s) => Math.abs(m - s.min)));
      const cruise = 100 + 9 * Math.sin(m / 11) + 4 * Math.sin(m / 3.3);
      pts.push([DAY0 + m * 6e4, d2 < 1.5 ? 0 : Math.round(cruise * Math.min(1, d2 / 9))]);
    }
    pts.push([DAY0 + 780 * 6e4, 105]);
    return pts;
  }
  var trainSample = {
    live: "on",
    train: T[28],
    stops: STOPS,
    gps: true,
    run: { speed: 105, late: LATE, updatedAt: 779, date: "2026-10-18", gps: true },
    now: 780,
    ests,
    progress: { passedIdx: PASSED, nextIdx: PASSED + 1, kmDone: 305, kmToNext: 27 },
    followed: true,
    speed: {
      illustrative: true,
      points: speedPoints(),
      stops: SPEED_STOPS.map((s) => ({ ms: DAY0 + s.min * 6e4, id: s.id })),
      now: DAY0 + 780 * 6e4
    },
    details: { locomotive: "9052" },
    returnTrain: T[27]
  };
  var board = (t2, kind, origin, dest, sched, est, late, gps, extra = {}) => ({ train: t2, kind, origin, dest, sched, est, late, gps, runId: null, kmAway: null, atPlatform: false, ...extra });
  var station = {
    live: "on",
    station: S.multan,
    saved: false,
    now: 970,
    updatedAt: 970,
    rows: [
      board(T[26], "starts", S.multan, S.karachiCity, 960, 975, 15, false, { runId: "261810", atPlatform: true }),
      board(T[127], "starts", S.multan, S.rawalpindi, 975, 975, null, false),
      board(T[1], "passes", S.karachi, S.peshawar, 875, 998, 123, true, { kmAway: 27 }),
      board(T[2], "passes", S.peshawar, S.karachi, 820, 1018, 198, true, { runId: "21710", kmAway: 48 }),
      board(T[46], "passes", S.rawalpindi, S.karachi, 1030, 1080, 50, true, { runId: "461810", kmAway: 110 }),
      board(T[8], "passes", S.rawalpindi, S.karachi, 1130, 1245, 115, true, { runId: "81810", kmAway: 294 }),
      board(T[27], "passes", S.karachi, S.lahore, 1195, 1265, 70, true, { runId: "271810", kmAway: 341 }),
      board(T[40], "passes", S.peshawar, S.jacobabad, 1245, 1272, 27, true, { runId: "401810", kmAway: 328 })
    ],
    map: { hover: { key: "khanewal", station: S.khanewal } }
  };
  var REPLAY_FROM = DAY0 - 4 * 864e5 + 7 * 36e5;
  var REPLAY_TO = DAY0 + 20 * 36e5;
  var replaySample = {
    ...trainSample,
    replay: {
      state: "ready",
      days: 7,
      periods: [7, 30, 90].map((n) => ({ value: String(n), label: `${n} days`, href: `#/train/28/replay?days=${n}` })),
      bar: {
        playing: true,
        at: DAY0 - 864e5 + 15 * 36e5,
        from: REPLAY_FROM,
        to: REPLAY_TO,
        days: [0, 1, 2, 3, 4].map((i) => ({ start: DAY0 - (4 - i) * 864e5, recorded: i !== 2 })),
        time: "Sat 17 Oct \xB7 3:00 PM",
        speed: "96 km/h",
        label: "Replay time"
      },
      since: "Recorded since Wed 14 Oct",
      returnName: "27 UP Shalimar Express"
    }
  };
  var samples = freeze({ home, search, route: routeSample, train: trainSample, replay: replaySample, station });

  // ds-entry.js
  var wrap = (mod) => {
    const out = {};
    for (const [name, value] of Object.entries(mod)) {
      out[name] = typeof value === "function" ? function(...args) {
        __syncLang();
        return value.apply(this, args);
      } : value;
    }
    return out;
  };
  var api = wrap(components_exports);
  api.screens = wrap(screens_exports);
  api.samples = samples;
  window.Patri = api;
})();
