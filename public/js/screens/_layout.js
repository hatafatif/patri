// Shared by the screen templates: the screen frame, the panel-body layout helpers and bindScreen().
// Layout markup only (wrappers, flex, token spacing; styles in public/css/screens.css). Every visual
// piece comes from a registered component.
import {
  Panel, bindPanel, bindSearchField, bindSegmentedControl, bindStationFields, bindFollowButton,
  bindMapToggle, bindStopTimeline, bindSpeedChart, bindLanguageToggle, bindPageHeader, IconButton, StatusChip,
} from '../components/index.js';
import { esc } from '../components/_shared.js';
import { t } from '../i18n.js';

/**
 * Options every screen template takes as its second argument.
 * @typedef {object} ScreenOptions
 * @property {'phone' | 'web'} [layout='phone'] - phone: the map with the Panel as a bottom sheet (render into a box under 940px wide). web: the Panel as the 440px sidebar and the map beside it (940px and wider).
 * @property {'down' | 'half' | 'full'} [snap] - Phone only: the sheet's starting snap. Each screen has its own default.
 * @property {boolean} [expanded] - Phone only, for showcase frames: the map keeps a 300px band at the top and the panel opens in full below it, so a tall frame shows the whole panel.
 * @property {boolean} [standin=true] - Draw the preview-only map stand-in. Views pass false and mount MapLibre in .p-screen__backdrop.
 */

/**
 * The screen frame. Returns the whole screen: map area (backdrop, floating controls, dock) and the Panel.
 * @param {object} f
 * @param {string} f.name - The screen's name, for the p-screen--<name> class and data-screen.
 * @param {ScreenOptions} f.options
 * @param {string} f.label - The Panel's accessible name, already localised.
 * @param {string} f.body - The Panel's content (HTML).
 * @param {'down' | 'half' | 'full'} [f.snap] - The screen's default snap; options.snap wins.
 * @param {string} [f.top] - Phone only: a band across the top (the Home AppBar); the map starts below it.
 * @param {string} [f.map] - The backdrop content: the map stand-in, or nothing.
 * @param {{ href: string, label: string }} [f.back] - Phone only: a labelled float pill ("← Home") at the map's top start, always above the panel.
 * @param {string} [f.start] - Controls floating at the map's top start (the back button).
 * @param {string} [f.end] - Controls floating at the map's top end (zoom, layers, Following).
 * @param {string} [f.dock] - Web only: content docked along the bottom of the map.
 */
export function frame({ name, options = {}, label = '', body = '', snap = 'half', top = '', map = '', start = '', end = '', dock = '', back }) {
  const web = options.layout === 'web';
  const expanded = !web && options.expanded;
  const sheetSnap = options.snap || (expanded ? 'full' : snap);
  const pill = !web && back;
  const startHtml = (pill ? IconButton({ icon: 'back', label: back.label, href: back.href, variant: 'float', text: true, className: 'p-screen__back' }) : '') + start;
  const cls = ['p-screen', `p-screen--${web ? 'web' : 'phone'}`, `p-screen--${name}`, expanded && 'p-screen--expanded', !web && top && 'p-screen--top', pill && 'p-screen--back']
    .filter(Boolean).join(' ');
  return `<div class="${cls}" data-screen="${esc(name)}">`
    + (!web && top ? `<div class="p-screen__top">${top}</div>` : '')
    + '<div class="p-screen__map">'
    + `<div class="p-screen__backdrop">${options.standin === false ? '' : map}</div>`
    + (startHtml ? `<div class="p-screen__controls p-screen__controls--start">${startHtml}</div>` : '')
    + (end ? `<div class="p-screen__controls p-screen__controls--end">${end}</div>` : '')
    + (web && dock ? `<div class="p-screen__dock">${dock}</div>` : '')
    + '</div>'
    + `<div class="p-screen__sheet">${Panel({ body, snap: sheetSnap, label })}</div>`
    + '</div>';
}

const join = parts => parts.filter(Boolean).join('');

/** The panel's padded content: sections one under another. */
export const body = (...parts) => `<div class="p-screen__body">${join(parts)}</div>`;
/** A section: a SectionHeader followed by its list or cards. */
export const section = (...parts) => `<section class="p-screen__section">${join(parts)}</section>`;
/** Cards one under another, 8px apart. */
export const cards = (...parts) => `<div class="p-screen__cards">${join(parts)}</div>`;
/** Rows that bring their own dividers (TrainRow, DepartureRow). */
export const list = (...parts) => `<div class="p-screen__list">${join(parts)}</div>`;
/** Pieces stacked inside a card, 16px apart. */
export const stack = (...parts) => `<div class="p-screen__stack">${join(parts)}</div>`;
/** Pieces side by side; wrap the one that should take the free space in fill(). */
export const row = (...parts) => `<div class="p-screen__row">${join(parts)}</div>`;
export const fill = html => `<div class="p-screen__fill">${html}</div>`;
/** A line of help text, already localised. */
export const note = text => `<p class="p-screen__note">${esc(text)}</p>`;

// The floating map buttons. Each carries a p-screen__mapbtn--<action> hook that bindScreen() reports through onMap.
const MAP_BUTTONS = {
  zoomIn: ['plus', 'zoomIn'], zoomOut: ['minus', 'zoomOut'], layers: ['layers', 'mapStyle'],
  locate: ['locate', 'stationsNearMe'], wholeRoute: ['trip', 'showWholeRoute'],
};
/**
 * A floating IconButton over the map. bindScreen() calls onMap(action) when it is pressed.
 * @param {'zoomIn' | 'zoomOut' | 'layers' | 'locate' | 'wholeRoute'} action
 */
export function mapButton(action) {
  const [icon, key] = MAP_BUTTONS[action];
  return IconButton({ icon, label: t(key), variant: 'float', className: `p-screen__mapbtn p-screen__mapbtn--${action}` });
}
/**
 * The back IconButton (a link). The app goes back in history when it can, and follows href otherwise.
 * @param {string} href - Where to go when there is no history, usually '#/'.
 * @param {'plain' | 'float'} [variant='plain'] - float over the map, plain in the panel.
 */
export const backButton = (href, variant = 'plain') => IconButton({ icon: 'back', label: t('back'), href, variant, className: 'p-screen__back' });
/**
 * A polite live region for short feedback, such as "Link copied": a neutral StatusChip when there is text.
 * Always render it (empty when there is nothing to say), so screen readers hear the text when it appears.
 * @param {string} [text] - Already localised.
 */
export const notice = text => `<div class="p-screen__notice" role="status" aria-live="polite">${text ? StatusChip({ tone: 'neutral', text }) : ''}</div>`;

/**
 * Wires every component inside a rendered screen: the Panel, search, segmented controls, station fields,
 * follow stars, the map toggle and map buttons, the timeline, the page header, the language toggle and the
 * speed chart. Every handler is optional. Returns unbind().
 * @param {Element} root - The element the screen was rendered into.
 * @param {object} [o]
 * @param {object} [o.data] - The data the screen was rendered from; its speed.points feed the chart readout.
 * @param {(lang: 'en' | 'ur') => void} [o.onLang] - The LanguageToggle was switched; re-render in that language.
 * @param {(snap: string) => void} [o.onSnap] - The phone sheet settled on a snap.
 * @param {(value: string) => void} [o.onSearch] - The search text changed.
 * @param {() => void} [o.onClear] - The search field was cleared.
 * @param {(value: string, group: Element) => void} [o.onSegment] - A local (button) SegmentedControl option was pressed.
 * @param {() => void} [o.onPickFrom] - StationFields: From pressed.
 * @param {() => void} [o.onPickTo] - StationFields: To pressed.
 * @param {() => void} [o.onSwap] - StationFields: swap pressed.
 * @param {(followed: boolean, button: HTMLElement) => void} [o.onFollow] - A follow star flipped: the PageHeader's or one in a row.
 * @param {(button: HTMLElement) => void} [o.onShare] - The PageHeader's share button.
 * @param {() => void} [o.onChangeStop] - The StopTimeline's Change link.
 * @param {(on: boolean) => void} [o.onFollowing] - The MapToggle ("Following") flipped.
 * @param {(action: 'zoomIn' | 'zoomOut' | 'layers' | 'locate' | 'wholeRoute', button: HTMLElement) => void} [o.onMap] - A mapButton() was pressed.
 */
export function bindScreen(root, o = {}) {
  const undo = [
    bindPanel(root, { onSnap: o.onSnap }),
    bindSearchField(root, { onInput: o.onSearch, onClear: o.onClear }),
    bindSegmentedControl(root, {
      onChange: value => o.onSegment?.(value, root.querySelector(`.p-segmentedcontrol [data-value="${CSS.escape(value)}"]`)?.closest('.p-segmentedcontrol')),
    }),
    bindStationFields(root, { onPickFrom: o.onPickFrom, onPickTo: o.onPickTo, onSwap: o.onSwap }),
    bindMapToggle(root, { onToggle: o.onFollowing }),
    bindStopTimeline(root, { onChangeStop: o.onChangeStop }),
    bindPageHeader(root, { onFollow: o.onFollow, onShare: o.onShare }),
    bindLanguageToggle(root, { onChange: lang => o.onLang?.(lang) }),
  ];
  // Stars in rows; a PageHeader binds its own star, so it is skipped here.
  for (const btn of root.querySelectorAll('.p-followbutton')) {
    if (!btn.closest('.p-pageheader')) undo.push(bindFollowButton(btn.parentElement, { onToggle: o.onFollow }));
  }
  const onMapClick = e => {
    const btn = e.target.closest?.('.p-screen__mapbtn');
    if (!btn || !root.contains(btn)) return;
    const action = [...btn.classList].find(c => c.startsWith('p-screen__mapbtn--'))?.slice('p-screen__mapbtn--'.length);
    if (action) o.onMap?.(action, btn);
  };
  root.addEventListener('click', onMapClick);
  undo.push(() => root.removeEventListener('click', onMapClick));
  const points = o.data?.speed?.points;
  if (points?.length) undo.push(bindSpeedChart(root, points));
  return () => undo.forEach(fn => fn());
}
