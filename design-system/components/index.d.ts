// GENERATED FILE: do not edit by hand. Built by scripts/build-design-system.js from the
// @typedef JSDoc in public/js/components/*.js and public/js/screens/*.js. Run `npm run ds`.
//
// Patri components, Sabz look. Load tokens.css, bundle.css and bundle.js, then call
// window.Patri.<Name>(props) for an HTML string and window.Patri.bind<Name>(root, handlers)
// for behaviour; each bind returns an unbind function. Text props arrive already localised.

/** The top bar: the bilingual logo (or a back link), then the live indicator and the language switch at the end. The logo is the file brand/patri-logo.svg, relative to the page, about 132×44. (AppBar.js) */
export interface AppBarProps {
  /** The LiveIndicator state. Default 'off'. */
  live?: 'on' | 'reconnecting' | 'off';
  /** The active language, for the LanguageToggle. Default 'en'. */
  lang?: 'en' | 'ur';
  /** When present, a back link replaces the logo. The label is already localised. */
  back?: { href: string, label: string };
}

/** The text button: primary for the main action, secondary next to it, link for inline actions such as "Change". (Button.js) */
export interface ButtonProps {
  /** Already localised. */
  label: string;
  /** Renders an <a> instead of a <button>. */
  href?: string;
  /** primary is a sabz-700 fill; secondary is outlined in sabz-700; link is underlined inline text with a 44px hit area. Default 'primary'. */
  variant?: 'primary' | 'secondary' | 'link';
  /** A trailing icon key, usually 'chevronEnd', which flips in right-to-left. */
  icon?: string;
  /** Stretches the button to the full width of its container. */
  full?: boolean;
  /** Extra classes, so a composing component can hook its own styles and behaviour. */
  className?: string;
}

/** A bordered surface for a block of content. The key tone marks the most important card on a screen, such as Right now. (Card.js) */
export interface CardProps {
  /** An HTML string, inserted as-is. */
  body: string;
  /** A label shown as a ruled SectionHeader inside the top of the card. Already localised. */
  header?: string;
  /** plain has a 1px line border; key a 1.5px sabz-700 border. Default 'plain'. */
  tone?: 'plain' | 'key';
}

/** One train on a station board or in a From → To list: time column, train number and name, a sub line and the status. (DepartureRow.js) */
export interface DepartureRowProps {
  /** Where the row links to. */
  href: string;
  /** The expected time, such as "~1:20 PM". When scheduled is given and differs, it appears underneath, struck through. caption is a small label above the time, such as "Left" over "7:10 AM" for a train already on its way. Already formatted and localised. */
  time: { expected: string, scheduled?: string, caption?: string };
  /** Number and direction show as "28 DN" in muted label style, then the name. */
  train: { number: string | number, direction: 'up' | 'dn', name: string };
  /** The line under the name, such as "To Karachi Cantt · 48 km away" or "Starts here → Karachi City". Already localised. */
  sub: string;
  /** The status chip. */
  status: StatusChipProps;
}

/** Key and value facts about a train, in a two-column grid. (DetailGrid.js) */
export interface DetailGridProps {
  /** Already localised. A value with lang 'ur' renders right-to-left in Nastaliq, even on an English page. */
  items: { label: string, value: string, lang?: 'ur' }[];
  /** Extra classes, so a composing component can hook its own styles. */
  className?: string;
}

/** The star that adds a train to My trains: filled sabz-700 when followed, empty ink-muted otherwise. (FollowButton.js) */
export interface FollowButtonProps {
  /** Whether the train is currently followed. Sets aria-pressed and the filled star. */
  followed?: boolean;
  /** The train's name, already localised. Used in the aria-label ("Follow Shalimar Express"). */
  name: string;
  /** Overrides the aria-label: off while not followed, on while followed, such as { off: 'Save Multan Cantt', on: 'Saved' } for stations. Already localised. bindFollowButton swaps it when the button flips. */
  label?: { off: string, on: string };
}

/** FollowButton.js */
export interface FollowButtonHandlers {
  /** Called after the star flips, with the new state and the button that was pressed. Saving is the view's job. */
  onToggle?: (followed: boolean, button: HTMLElement) => void;
}

/** A 44×44 icon-only control: plain, outlined, or floating over the map. (IconButton.js) */
export interface IconButtonProps {
  /** A key in the icon set in _shared.js, such as 'swap', 'star', 'close' or 'plus'. */
  icon: string;
  /** Required, already localised. Becomes the aria-label. */
  label: string;
  /** plain has no border; outline has a 1.5px line border on surface; float sits over the map on surface with shadow-float. Default 'plain'. */
  variant?: 'plain' | 'outline' | 'float';
  /** For toggles only: sets aria-pressed. Leave it out for plain actions. */
  pressed?: boolean;
  /** Renders an <a> instead of a <button>. */
  href?: string;
  /** Extra classes, so a composing component can hook its own styles and behaviour. */
  className?: string;
}

/** How far along the route the train is: a progress bar with a start label and an end label below it. (JourneyProgress.js) */
export interface JourneyProgressProps {
  /** 0 to 1; values outside are clamped. */
  fraction: number;
  /** Already localised, such as "Left Lahore Jn 7:10 AM". */
  start: string;
  /** Already localised, such as "305 of 1,165 km". Also the progressbar's aria-valuetext. */
  end: string;
  /** Extra classes, so a composing component can hook its own styles. */
  className?: string;
}

/** A two-button switch between English and Urdu. The active language is filled sabz-700. (LanguageToggle.js) */
export interface LanguageToggleProps {
  /** The active language. Default 'en'. */
  lang?: 'en' | 'ur';
}

/** LanguageToggle.js */
export interface LanguageToggleHandlers {
  /** Called after aria-pressed has been updated, when the inactive button is clicked. The active button does nothing. */
  onChange?: (lang: 'en' | 'ur') => void;
}

/** A full-width link row, such as "Return train" over "27 UP Shalimar Express". (LinkRow.js) */
export interface LinkRowProps {
  /** Where the row goes. */
  href: string;
  /** Already localised small label above the name. */
  eyebrow: string;
  /** Already localised name or title. */
  label: string;
  /** Extra classes, so a composing component can hook its own styles. */
  className?: string;
}

/** A small status dot with a word: "Live" when the feed is up, "Reconnecting" when it dropped, nothing when it is off. (LiveIndicator.js) */
export interface LiveIndicatorProps {
  /** on shows a sabz-700 dot and "Live"; reconnecting a zard-500 dot and "Reconnecting"; off renders the element hidden, with no text. Default 'off'. */
  state?: 'on' | 'reconnecting' | 'off';
}

/** The followed train's marker: a yellow dot with a dark ring and halo, and a dark label beside it. Anchor the marker at its centre, which is the dot. (MapMarkers.js) */
export interface TrainMarkerProps {
  /** The text beside the dot, such as "28 DN · 105 km/h". Already localised. */
  label: string;
}

/** A label card on the map: the next stop, your stop, the selected station or the one under the pointer. (MapMarkers.js) */
export interface MapLabelProps {
  /** The station name. Already localised. */
  title: string;
  /** A second line, such as "~12:40 PM". Already localised. */
  sub?: string;
  /** next and hover are light with a sabz-700 border; yourstop and selected are dark with a yellow title. */
  kind: 'next' | 'yourstop' | 'selected' | 'hover';
}

/** MapLibre paint values read from the design tokens when called, so a token change reaches the map. Pass them as the paint of a layer: station and majorCity to circle layers, rail, routeDone, routeDoneCasing, routeAhead and border to line layers, land and water to fill layers, cityLabel to a symbol layer. (MapMarkers.js) */
export interface MapPaintResult {
  /** Small station dot, map-station, radius 2.5; shown when the map is zoomed in. */
  station: Record<string, unknown>;
  /** Surface fill, ink stroke 2, radius 5.5. */
  majorCity: Record<string, unknown>;
  /** A zard-500 fill inside a sabz-700 ring. */
  selectedStation: Record<string, unknown>;
  /** Rail lines with no train selected, map-rail. */
  rail: Record<string, unknown>;
  /** The white casing under the route done, width 8. */
  routeDoneCasing: Record<string, unknown>;
  /** The route the train has covered: sabz-700, width 5. */
  routeDone: Record<string, unknown>;
  /** The route still to run: sabz-700, width 3, dashed. */
  routeAhead: Record<string, unknown>;
  /** Text paint for major city labels: ink with a surface halo. */
  cityLabel: Record<string, unknown>;
  /** Land fill, map-land. */
  land: Record<string, unknown>;
  /** Water fill, map-water. */
  water: Record<string, unknown>;
  /** Province and country borders, map-border, dashed. */
  border: Record<string, unknown>;
}

/** A single entry point for the registry, so the component can be called by name as Patri.MapMarkers. It dispatches to trainMarker or mapLabel. (MapMarkers.js) */
export interface MapMarkersProps {
  /** train renders trainMarker; label renders mapLabel. */
  type: 'train' | 'label';
  /** For type train: the text beside the dot. */
  label?: string;
  /** For type label: the station name. */
  title?: string;
  /** For type label: a second line. */
  sub?: string;
  /** For type label: the card style. Default 'next'. */
  kind?: 'next' | 'yourstop' | 'selected' | 'hover';
}

/** The on/off pill over the map, such as "Following". (MapToggle.js) */
export interface MapToggleProps {
  /** Whether it is on. Sets aria-pressed. Default false. */
  on?: boolean;
  /** Already localised. */
  label: string;
  /** Extra classes, so a composing component can hook its own styles. */
  className?: string;
}

/** Handlers for bindMapToggle. (MapToggle.js) */
export interface MapToggleHandlers {
  /** Called with the new state after it flips. */
  onToggle?: (on: boolean) => void;
}

/** The page header: an optional back link, a train badge or station mark, the name with its Urdu (or English) twin and a subtitle, and the follow and share actions at the end. (PageHeader.js) */
export interface PageHeaderProps {
  /** A TrainBadge (shown at the size in its props, md by default) or the station mark, a 50px circle with a zard-500 ring and a pin. Leave it out on pages that have neither, such as All stops. */
  leading?: { badge: TrainBadgeProps } | { icon: 'pin' };
  /** The English name, already localised. It is the <h1>, except when the whole interface is Urdu and titleUr is given. */
  title: string;
  /** The Urdu name. In English it sits on its own line under the title, start-aligned with it. When the interface is Urdu it becomes the <h1> and the English title moves to the second line. */
  titleUr?: string;
  /** A caption line in ink-muted, such as "Lahore Jn → Karachi Cantt" or "Multan". Already localised. */
  subtitle?: string;
  /** A back link renders at the start, before the leading element. Follow and share render at the end, in the order given. Labels and names are already localised. A follow action's optional label replaces its aria-label, off while not followed and on while followed (see FollowButton), such as 'Save Multan Cantt' and 'Saved' on a station. */
  actions?: ({ kind: 'follow', followed: boolean, name: string, label?: { off: string, on: string } } | { kind: 'share', label: string } | { kind: 'back', href: string, label: string })[];
}

/** PageHeader.js */
export interface PageHeaderHandlers {
  /** Called after the follow star flips, with the new state and the button. Saving is the view's job. */
  onFollow?: (followed: boolean, button: HTMLElement) => void;
  /** Called when the share button is clicked. */
  onShare?: (button: HTMLElement) => void;
}

/** The container for a screen's content. It is absolutely positioned inside its host, which must be `position: relative; container-type: inline-size` with a definite height. When the host is under 940px wide the panel is a bottom sheet with three snap heights; from 940px it is a 440px sidebar. (Panel.js) */
export interface PanelProps {
  /** An HTML string, inserted as-is. */
  body: string;
  /** The sheet's starting height: 150px, 55% of the host, or the host minus 8px. Ignored in the sidebar. Default 'half'. */
  snap?: 'down' | 'half' | 'full';
  /** The accessible name of the panel. Already localised. */
  label: string;
}

/** Panel.js */
export interface PanelHandlers {
  /** Called every time the sheet settles on a different snap. */
  onSnap?: (snap: 'down' | 'half' | 'full') => void;
}

/** A photo with its credit underneath: the train in About this train, the city on the Station page. It loads only when scrolled near, and reserves its 16:9 box so nothing shifts. (Photo.js) */
export interface PhotoProps {
  /** The image URL. */
  src: string;
  /** What the photo shows, for screen readers. */
  alt: string;
  /** Already localised, such as "Photo: A. Khan · CC BY-SA 4.0". */
  credit: string;
  /** The photo's source page. The credit links to it, opening in a new tab. */
  href?: string;
  /** Extra classes, so a composing component can hook its own styles. */
  className?: string;
}

/** The search box for a train name, number, station or city. With a route it also shows a "From → To" link beside the field. (SearchField.js) */
export interface SearchFieldProps {
  /** The current text. The clear button is shown only when this is not empty. Default ''. */
  value?: string;
  /** Already localised. Also used as the input's aria-label. */
  placeholder: string;
  /** Adds a secondary "From → To" link beside the field. */
  route?: { href: string, label: string };
  /** Extra classes, so a composing component can hook its own styles. */
  className?: string;
}

/** Handlers for bindSearchField. (SearchField.js) */
export interface SearchFieldHandlers {
  /** Called on every change of the text. */
  onInput?: (value: string) => void;
  /** Called after the clear button, or Escape, empties the field. */
  onClear?: () => void;
}

/** The label above a list: "MY TRAINS · 2", with an optional action at the end and an optional 2px rule underneath. (SectionHeader.js) */
export interface SectionHeaderProps {
  /** Already localised. */
  label: string;
  /** Shown after the label, as "· 2". */
  count?: number | string;
  /** A link at the end of the row, such as "Edit". The label is already localised. */
  action?: { label: string, href: string };
  /** Adds a 2px rule line underneath. */
  ruled?: boolean;
}

/** A choice between 2 or 3 options. Options with an href are links (the page is the state); the others are toggle buttons. (SegmentedControl.js) */
export interface SegmentedControlProps {
  /** Labels already localised. An option with href renders as an <a>. */
  options: { value: string, label: string, href?: string }[];
  /** The value of the active option. */
  value: string;
  /** Already localised. Becomes the group's aria-label. */
  label: string;
  /** Extra classes, so a composing component can hook its own styles. */
  className?: string;
}

/** Handlers for bindSegmentedControl. (SegmentedControl.js) */
export interface SegmentedControlHandlers {
  /** Called with the value of the option that was pressed. */
  onChange?: (value: string) => void;
}

/** The train's speed since it left: a line and area over time, dashed marks where it stopped at stations, a dot for now, and the average and top speed above. Fewer than two points shows an empty message instead. (SpeedChart.js) */
export interface SpeedChartProps {
  /** Speed samples as [milliseconds since the epoch, km/h], oldest first. */
  points: [number, number][];
  /** ] - Stations the train has passed, with the time and the localised name. Names that would overlap are skipped. Default [. */
  stops?: { ms: number, name: string }[];
  /** Milliseconds since the epoch for the right edge of the chart. Defaults to the last point; never earlier than it. */
  now?: number;
  /** Replaces the default heading ("Speed today"), such as "Speed so far". Already localised. */
  title?: string;
  /** false hides the average and top speed, for illustrative points. They are only ever worked out from the points passed in; with fewer than two points there is no chart and no stats either way. Default true. */
  stats?: boolean;
}

/** The From and To pickers with a swap button. Each field opens a station picker; the picker itself belongs to the view. (StationFields.js) */
export interface StationFieldsProps {
  /** The chosen From station's name, or null to show the placeholder. */
  from: string | null;
  /** The chosen To station's name, or null to show the placeholder. */
  to: string | null;
  /** Already localised small label, such as "From". */
  fromLabel: string;
  /** Already localised small label, such as "To". */
  toLabel: string;
  /** Extra classes, so a composing component can hook its own styles. */
  className?: string;
}

/** Handlers for bindStationFields. (StationFields.js) */
export interface StationFieldsHandlers {
  /** The From field was pressed. */
  onPickFrom?: () => void;
  /** The To field was pressed. */
  onPickTo?: () => void;
  /** The swap button was pressed. */
  onSwap?: () => void;
}

/** A small status chip: on time, late, early, no GPS, or plain muted text. (StatusChip.js) */
export interface StatusChipProps {
  /** Picks the colours. Get it from statusTone() in _shared.js; neutral is plain ink-muted text with no background. */
  tone: 'ontime' | 'late' | 'early' | 'nogps' | 'neutral';
  /** Already localised, such as "30 min late". */
  text: string;
  /** Show a small dot in the text colour before the text. */
  dot?: boolean;
}

/** The Sabz signature: a pale-green running panel joined to a coloured delay block in one sabz-700 frame, with an optional "updated" note after it. (StatusChip.js) */
export interface StatusStripProps {
  /** The running panel, such as "Running · 105 km/h". Already localised. */
  running: { text: string };
  /** The delay block, coloured by tone, such as "30 min late". */
  delay: { tone: 'ontime' | 'late' | 'early' | 'nogps', text: string };
  /** Muted note after the strip, such as "Updated 1 min ago". Already localised. */
  updated?: string;
}

/** The stops timeline: a rail down the start edge with one marker per row, the stop name, and the times at the end edge. The Right now card uses the card form, the All stops page the full form, and compact is the tight form without sub lines. (StopTimeline.js) */
export interface StopTimelineProps {
  /** One entry per row, top to bottom. name is already localised: for a train row it is the whole sentence ("Train here · 27 km to Multan Cantt"), for a more row the collapsed text ("8 more stops", href required). label is a short label above the name, such as "Next stop" (card mode). sub shows in full and card modes. time.scheduled is struck through under the expected time. countdown is a short phrase such as "in 20 min". href turns the name into a link. change adds a Change link; wire it with bindStopTimeline(). */
  rows: { kind: 'passed' | 'train' | 'next' | 'yourstop' | 'stop' | 'more' | 'final', name: string, label?: string, sub?: string, time?: { expected: string, scheduled?: string }, countdown?: string, href?: string, change?: boolean }[];
  /** compact hides sub and uses tighter padding; full shows everything; card is the Right now form: a label over each name, heading-size names and sub lines shown. Default 'full'. */
  mode?: 'compact' | 'full' | 'card';
  /** Adds an "expected · scheduled" key above the rows, at the end edge over the time column. Decorative (aria-hidden); the struck time already has a hidden "Scheduled" prefix. Default false. */
  legend?: boolean;
}

/** StopTimeline.js */
export interface StopTimelineHandlers {
  /** Called when the Change link on the your-stop row is clicked. */
  onChangeStop?: () => void;
}

/** The train number badge: a sabz-900 square with the number in zard-500 and UP or DN underneath. (TrainBadge.js) */
export interface TrainBadgeProps {
  /** The train number, such as 28 or 115. */
  number: string | number;
  /** Shown as UP or DN in English, اپ or ڈاؤن in Urdu. */
  direction: 'up' | 'dn';
  /** 40, 54 or 64px square. Default 'md'. */
  size?: 'sm' | 'md' | 'lg';
}

/** One followed train on Home: badge, name, where it is, the rider's own stop, and its status. (TrainCard.js) */
export interface TrainCardProps {
  /** Where the card links to, such as '#/train/28dn'. */
  href: string;
  /** The badge, shown at the md size. */
  badge: TrainBadgeProps;
  /** The train's name, already localised. */
  name: string;
  /** Where the train is, such as "Sahiwal → Multan Cantt" or "Stopped · Lahore Jn". Already localised. */
  position: string;
  /** The rider's own stop and the time the train reaches it. Adds a "Your stop · name · time" line. */
  yourStop?: { name: string, time: string };
  /** The status chip, at the end of the card. */
  status: StatusChipProps;
}

/** A compact train row: small badge, name, a sub line and the status, with an optional follow star. The star is a sibling of the link, never inside it. (TrainRow.js) */
export interface TrainRowProps {
  /** Where the row links to. */
  href: string;
  /** The badge, shown at the sm size. */
  badge: TrainBadgeProps;
  /** The train's name, already localised. */
  name: string;
  /** The line under the name, such as "Lahore Jn → Karachi Cantt". Already localised. */
  sub: string;
  /** The status chip, at the end of the link. */
  status: StatusChipProps;
  /** Search text; each word found in the name or sub line is wrapped in <mark>. */
  match?: string;
  /** Adds a FollowButton beside the link. Wire it with bindFollowButton(). */
  follow?: { followed: boolean };
}

/** Home: the station map (stations, not trains) under the AppBar, and the Panel with the search field and its From → To link, My trains and Running now. Phone: half snap by default. Web: the Panel is the sidebar with the AppBar as its header; the map gets zoom buttons. (screens/HomeScreen.js) */
export interface HomeScreenData {
  /** The feed state, for the AppBar's LiveIndicator. */
  live: 'on' | 'reconnecting' | 'off';
  /** The followed trains (localStorage myTrains), in the rider's order, then recently viewed ones. The section is hidden when empty. */
  myTrains: HomeTrain[];
  /** Trains running now (views/home.js running()). Shown in train-number order, never sorted or filtered by lateness. */
  running: HomeTrain[];
  /** How many trains are running now, for "Running now · 41"; running may be a subset. */
  runningCount: number;
  /** A short feedback line under the search field, such as "Nearest station: Multan Cantt" (an always-present live region; empty when there is nothing to say). */
  notice?: string;
  /** Map stand-in only: a city shown hovered on the web map (key as the stand-in knows it, such as 'lahore'). */
  map?: { hover?: { key: string, station: ScreenStation } };
}

/** One train in My trains or Running now. (screens/HomeScreen.js) */
export interface HomeTrain {
  train: ScreenTrain;
  /** Where it is: between two stations, stopped at one, or not departed yet. null when the train has no live run: the row says "Not running now". */
  where: ScreenWhere | null;
  /** run.lateBy in minutes; null when unknown. */
  late: number | null;
  /** false when the train has no GPS. */
  gps?: boolean;
  /** Adds ?run= to the train link. */
  runId?: string;
  /** The rider's stop and the expected time there, in minutes after midnight. scheduled: true shows the timetable time without the "~" (no live run to estimate from). */
  yourStop?: { station: ScreenStation, est: number, scheduled?: boolean };
}

/** Search › From → To: the Panel at full height with a back button and the mode switch, the From and To fields with swap, a Today | Tomorrow switch, then the direct trains leaving From next and those already on the way (views/trip.js, /api/trip). Either station may be null (the field shows its placeholder; the day switch and the lists are left out and a hint asks for both). Tomorrow shows every direct train as leaving, from the timetable, with a note. (screens/RouteScreen.js) */
export interface RouteScreenData {
  from: ScreenStation | null;
  to: ScreenStation | null;
  /** Today in Pakistan time, 'YYYY-MM-DD'; the day switch shows "Today · Sun 18 Oct" and "Tomorrow · Mon 19 Oct". */
  date: string;
  /** Which day is selected. */
  day: 'today' | 'tomorrow';
  /** Makes the day switch two links (the page is the state); without it the options are buttons. */
  hrefs?: { today: string, tomorrow: string };
  /** The trains haven't arrived yet: a loading note instead of the lists. */
  loading?: boolean;
  /** Minutes after midnight today. */
  now: number;
  /** Trains still to leave From, in departure order. */
  leaving: RouteTrip[];
  /** Trains that have left From for To, in departure order. Empty on Tomorrow. */
  onTheWay: RouteTrip[];
}

/** One direct train: a /api/trip row with the train resolved. (screens/RouteScreen.js) */
export interface RouteTrip {
  train: ScreenTrain;
  /** Scheduled departure from From, minutes after midnight. */
  dep: number;
  /** Scheduled arrival at To, minutes after midnight of the same day (1440+ is the next day). */
  arr: number;
  /** Today's delay in minutes; null when it isn't running yet, has no GPS, or the day is tomorrow (timetable times). */
  late: number | null;
  /** false when the train has no GPS. */
  gps: boolean;
  /** Stops between From and To. */
  stopsBetween: number;
  /** Adds ?run= to the train link. */
  runId?: string;
}

/** Search, opened from Home: the Panel at full height with a back button, the search field, the Train or station | From → To switch, the matching trains, recent searches and a hint. (screens/SearchScreen.js) */
export interface SearchScreenData {
  /** The text in the search box, such as "Shalimar". Matches are highlighted in the results. */
  query: string;
  /** The matching trains, in the order the search ranked them (never by lateness). */
  trains: SearchTrain[];
  /** Recent searches, newest first. */
  recent: SearchRecent[];
  /** Stations that match the query, as LinkRows under "Stations · n". The view gives each href. */
  stations?: SearchStation[];
  /** Saved stations, shown under "Saved stations" (the view passes them when the query is empty). */
  saved?: SearchStation[];
  /** The main station of each major city, shown under "Main stations" (pick mode, empty query). */
  main?: SearchStation[];
  /** pick chooses a station for From → To: no trains, no Train-or-station | From → To switch, and the field searches stations. Default 'all'. */
  mode?: 'all' | 'pick';
  /** Pick mode: the side being picked ("From" or "To"), already localised, as a SectionHeader above the stations. */
  pickLabel?: string;
  /** Where the back button goes when there is no history (the trip page in pick mode). Default '#/'. */
  backHref?: string;
  /** List the matching stations above the trains (the view does this when the query is a name rather than a number). */
  stationsFirst?: boolean;
  /** Show the help text at the end. The view turns it off once there is a query. Default true. */
  hint?: boolean;
}

/** One station row: a LinkRow to its page, or, in pick mode, to the trip with that station picked. (screens/SearchScreen.js) */
export interface SearchStation {
  station: ScreenStation;
  href: string;
  /** The small label above the name, already localised. Defaults to the station's city, or "Station board". */
  eyebrow?: string;
}

/** screens/SearchScreen.js */
export interface SearchTrain {
  train: ScreenTrain;
  /** Where the train starts. */
  from: ScreenStation;
  /** Where it ends. */
  to: ScreenStation;
  /** Today's delay in minutes; null when it isn't running or unknown. */
  late: number | null;
  /** false when the train has no GPS. */
  gps?: boolean;
  /** Whether it is in My trains (the star). */
  followed: boolean;
  /** Adds ?run= to the train link. */
  runId?: string;
}

export type SearchRecent = { kind: 'trip', from: ScreenStation, to: ScreenStation } | { kind: 'station', station: ScreenStation };

/** The Station page, opened from a station on the map or in search: the map zoomed to the station, and the Panel with the PageHeader (save, share) and the next trains through it (views/station.js, /api/board). Rows keep the board's order (expected time); they are never sorted or filtered by lateness. The map shows stations, not trains. Web: the AppBar with a back link above the same board in the sidebar, the map beside it with zoom buttons. (screens/StationScreen.js) */
export interface StationScreenData {
  /** The feed state, for the web sidebar's AppBar. */
  live: 'on' | 'reconnecting' | 'off';
  /** With city and cityUr for the subtitle. */
  station: ScreenStation;
  /** Whether the station is saved (the star). */
  saved: boolean;
  /** Minutes after midnight. */
  now: number;
  /** When the board was fetched, minutes after midnight: "Updated just now" or "Updated 3 min ago". */
  updatedAt: number;
  /** The next trains, in expected-time order (never by lateness). Empty shows "No trains due". */
  rows: StationRow[];
  /** The board hasn't arrived yet: a loading note instead of the list. */
  loading?: boolean;
  /** Short feedback under the header, already localised, such as "Link copied". It sits in a polite live region. */
  notice?: string;
  /** Map stand-in only: a station shown hovered on the web map (key such as 'khanewal'). */
  map?: { hover?: { key: string, station: ScreenStation } };
}

/** One train on the board: a /api/board row with the train and stations resolved. (screens/StationScreen.js) */
export interface StationRow {
  train: ScreenTrain;
  /** Starts here, passes through, or ends here. */
  kind: 'starts' | 'passes' | 'ends';
  /** Where the train starts. */
  origin: ScreenStation;
  /** Where it ends. */
  dest: ScreenStation;
  /** Scheduled time here, minutes after midnight. */
  sched: number;
  /** Expected time here. */
  est: number;
  /** Delay in minutes; null when not running or unknown. */
  late: number | null;
  /** false when the train has no GPS. */
  gps: boolean;
  /** The live run, if any. */
  runId?: string | null;
  /** How far away it is. */
  kmAway?: number | null;
  /** Standing at the platform now. */
  atPlatform?: boolean;
}

/** The Train page: the map following the train, and the Panel with the PageHeader, the Right now card (status, stops around the train, progress, See all stops), speed so far, About this train and the return train. Web: the same content in the sidebar, the speed chart docked along the bottom of the map. The same data renders StopsScreen. With `run` null (no live run now, or a train without GPS) the page is in timetable mode: a Right now card with a "Timetable" or "No GPS" chip, your stop with its scheduled time, About this train and the return train; no speed card. With no `stops` yet it shows the header and a loading note. (screens/TrainScreen.js) */
export interface TrainScreenData {
  /** The feed state, for the web sidebar's AppBar. */
  live: 'on' | 'reconnecting' | 'off';
  train: ScreenTrain;
  /** The route, first to last (/api/route?train=N). Empty while it loads. */
  stops: TrainStop[];
  /** The live run, or null for timetable mode. */
  run: TrainRun | null;
  /** Whether the train has GPS at all. Only read when run is null: it picks "no live run" or "no GPS" and the chip. Default true. */
  gps?: boolean;
  /** Minutes after midnight on the run's first day. Needed with a run. */
  now?: number;
  /** One per stop, as eta.js estimates() gives them, in minutes: passed stops show their timetable time (at, when known, is when the train passed); the rest have an expected time (est may be missing). Needed with a run. */
  ests?: { passed: boolean, est?: number, at?: number }[];
  /** eta.js progress(): the last stop passed (-1 before departure), the next stop (-1 once arrived or unknown), km run so far and km to the next stop. Needed with a run. */
  progress?: { passedIdx: number, nextIdx: number, kmDone: number, kmToNext: number };
  /** The rider's stop id. */
  myStop?: string;
  /** Whether the train is in My trains. */
  followed: boolean;
  /** SpeedChart input: [ms, km/h] samples, the stations passed (by stop id) and now in ms. Needed with a run. */
  speed?: { points: [number, number][], stops: { ms: number, id: string }[], now: number, illustrative?: boolean };
  /** Extra facts for About this train. */
  details?: { locomotive?: string };
  /** The train running the other way. */
  returnTrain?: ScreenTrain;
  /** The runs worth choosing between, newest first (two or three). More than one shows a SegmentedControl of links ("Left Sun 18 Oct"), each to #/train/N?run=id. */
  runs?: { id: string, date: string }[];
  /** The id of the run shown, for the SegmentedControl and for links that keep the run. */
  runId?: string;
  /** Suspect runs that are not shown: a note and a "Show anyway" link to href. */
  hiddenRuns?: { count: number, href: string };
  /** The MapToggle's state. Default true. */
  following?: boolean;
  /** Short feedback under the PageHeader ("Link copied"). Pass '' when there is none, so the live region exists before the text arrives. */
  notice?: string;
  /** StopsScreen only: choose-your-stop mode. */
  pick?: boolean;
}

/** The live run of a train. (screens/TrainScreen.js) */
export interface TrainRun {
  /** km/h. */
  speed: number;
  /** Delay in minutes. */
  late: number;
  /** When it last reported, minutes after midnight on the first day. */
  updatedAt: number;
  /** The day it left, 'YYYY-MM-DD'. */
  date: string;
  /** Whether it has GPS. */
  gps: boolean;
  /** eta.js status(): what the train is doing. Without it the strip says "Running · N km/h". */
  status?: { kind: 'run' | 'stopAt' | 'stopBetween' | 'wait' | 'done' | 'lost', station?: ScreenStation, minutes?: number };
}

/** One stop on the route, as /api/route gives it. (screens/TrainScreen.js) */
export interface TrainStop {
  id: string;
  name: string;
  nameUr?: string;
  city?: string;
  cityUr?: string;
  /** Distance from the first stop. */
  km: number;
  /** Scheduled arrival, minutes after midnight on the first day (null at the first stop). */
  arr: number | null;
  /** Scheduled departure (null at the last stop). */
  dep: number | null;
}

/** A station as the API gives it (/api/stations, /api/route, /api/board): English and Urdu names. (screens/_format.js) */
export interface ScreenStation {
  /** The station id, such as '116'. */
  id?: string;
  /** English name as the API has it ("Lahore Jn."); cleaned for display. */
  name: string;
  /** Urdu name. */
  nameUr?: string;
  /** English city ("Multan"). */
  city?: string;
  /** Urdu city ("ملتان"). */
  cityUr?: string;
}

/** A train: the fields of trainInfo() in public/js/names.js that the screens use. (screens/_format.js) */
export interface ScreenTrain {
  /** The train number, such as 28. */
  number: number;
  /** The number as shown, such as '28'. */
  label: string;
  /** true for UP, false for DN. */
  up: boolean;
  /** English name, without number or direction. */
  name: string;
  /** Urdu name. */
  nameUr?: string;
}

/** Where a train is, as views/home.js works it out from a run (prevStation, nextStation, speed). (screens/_format.js) */
export type ScreenWhere = { kind: 'between', from: ScreenStation, to: ScreenStation } | { kind: 'stopped', at: ScreenStation } | { kind: 'notDeparted', at: ScreenStation };

/** Options every screen template takes as its second argument. (screens/_layout.js) */
export interface ScreenOptions {
  /** phone: the map with the Panel as a bottom sheet (render into a box under 940px wide). web: the Panel as the 440px sidebar and the map beside it (940px and wider). Default 'phone'. */
  layout?: 'phone' | 'web';
  /** Phone only: the sheet's starting snap. Each screen has its own default. */
  snap?: 'down' | 'half' | 'full';
  /** Phone only, for showcase frames: the map keeps a 300px band at the top and the panel opens in full below it, so a tall frame shows the whole panel. */
  expanded?: boolean;
  /** Draw the preview-only map stand-in. Views pass false and mount MapLibre in .p-screen__backdrop. Default true. */
  standin?: boolean;
}

/** window.Patri.screens: page templates built from the components (public/js/screens/). */
export interface PatriScreens {
  HomeScreen(data: HomeScreenData, options?: ScreenOptions): string;
  RouteScreen(data: RouteScreenData, options?: ScreenOptions): string;
  SearchScreen(data: SearchScreenData, options?: ScreenOptions): string;
  StationScreen(data: StationScreenData, options?: ScreenOptions): string;
  StopsScreen(data: TrainScreenData, options?: ScreenOptions): string;
  TrainScreen(data: TrainScreenData, options?: ScreenOptions): string;
  bindScreen(root: Element, opts?: { data?: unknown; onLang?: (lang: 'en' | 'ur') => void; onSnap?: (snap: 'down' | 'half' | 'full') => void; onSearch?: (value: string) => void; onClear?: () => void; onSegment?: (value: string, group: Element) => void; onPickFrom?: () => void; onPickTo?: () => void; onSwap?: () => void; onFollow?: (followed: boolean, button: HTMLElement) => void; onShare?: (button: HTMLElement) => void; onChangeStop?: () => void; onFollowing?: (on: boolean) => void; onMap?: (action: 'zoomIn' | 'zoomOut' | 'layers' | 'locate' | 'wholeRoute', button: HTMLElement) => void }): () => void;
}

/** window.Patri.samples: frozen real sample data, one per screen (public/js/screens/_sample.js). */
export interface PatriSamples {
  home: HomeScreenData;
  search: SearchScreenData;
  route: RouteScreenData;
  train: TrainScreenData;
  station: StationScreenData;
}

export interface PatriApi {
  AppBar(props: AppBarProps): string;
  Button(props: ButtonProps): string;
  Card(props: CardProps): string;
  DepartureRow(props: DepartureRowProps): string;
  DetailGrid(props: DetailGridProps): string;
  FollowButton(props: FollowButtonProps): string;
  IconButton(props: IconButtonProps): string;
  JourneyProgress(props: JourneyProgressProps): string;
  LanguageToggle(props: LanguageToggleProps): string;
  LinkRow(props: LinkRowProps): string;
  LiveIndicator(props: LiveIndicatorProps): string;
  MapMarkers(props: MapMarkersProps): string;
  MapToggle(props: MapToggleProps): string;
  PageHeader(props: PageHeaderProps): string;
  Panel(props: PanelProps): string;
  Photo(props: PhotoProps): string;
  SearchField(props: SearchFieldProps): string;
  SectionHeader(props: SectionHeaderProps): string;
  SegmentedControl(props: SegmentedControlProps): string;
  SpeedChart(props: SpeedChartProps): string;
  StationFields(props: StationFieldsProps): string;
  StatusChip(props: StatusChipProps): string;
  StatusStrip(props: StatusStripProps): string;
  StopTimeline(props: StopTimelineProps): string;
  TrainBadge(props: TrainBadgeProps): string;
  TrainCard(props: TrainCardProps): string;
  TrainRow(props: TrainRowProps): string;
  bindFollowButton(root: Element, handlers?: FollowButtonHandlers): () => void;
  bindLanguageToggle(root: Element, handlers?: LanguageToggleHandlers): () => void;
  bindMapToggle(root: Element, handlers?: MapToggleHandlers): () => void;
  bindPageHeader(root: Element, handlers?: PageHeaderHandlers): () => void;
  bindPanel(root: Element, handlers?: PanelHandlers): () => void;
  bindSearchField(root: Element, handlers?: SearchFieldHandlers): () => void;
  bindSegmentedControl(root: Element, handlers?: SegmentedControlHandlers): () => void;
  bindSpeedChart(root: Element, points: [number, number][]): () => void;
  bindStationFields(root: Element, handlers?: StationFieldsHandlers): () => void;
  bindStopTimeline(root: Element, handlers?: StopTimelineHandlers): () => void;
  mapLabel(props: MapLabelProps): string;
  mapPaint(): MapPaintResult;
  statusTone(lateMin: number | null | undefined, opts?: { gps?: boolean }): 'ontime' | 'late' | 'early' | 'nogps';
  trainMarker(props: TrainMarkerProps): string;
  screens: PatriScreens;
  samples: PatriSamples;
}

declare global {
  interface Window { Patri: PatriApi }
}
