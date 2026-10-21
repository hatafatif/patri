// Panel: the single container for screen content: a bottom sheet on phones, a left sidebar on the web.
import { esc, icon as icons } from './_shared.js';
import { t } from '../i18n.js';

/**
 * The container for a screen's content. It is absolutely positioned inside its host, which must be
 * `position: relative; container-type: inline-size` with a definite height. When the host is under 940px
 * wide the panel is a bottom sheet with three snap heights; from 940px it is a 440px sidebar.
 * @typedef {object} PanelProps
 * @property {string} body - An HTML string, inserted as-is.
 * @property {'down' | 'half' | 'full'} [snap='half'] - The sheet's starting height: 150px, 55% of the host, or the host minus 8px. Ignored in the sidebar.
 * @property {string} label - The accessible name of the panel. Already localised.
 * @property {{ href: string, label: string }} [back] - A back link at the inline-start of the sheet's top bar (beside the handle), which never scrolls, so the way back stays visible at every snap and scroll. Phone sheet only; the sidebar's AppBar carries the web back link. The label is already localised.
 */
export function Panel({ body = '', snap = 'half', label = '', back } = {}) {
  const link = back ? `<a class="p-panel__back" href="${esc(back.href)}">${icons.back}<span class="p-panel__backlabel">${esc(back.label)}</span></a>` : '';
  return `<section class="p-panel" data-snap="${esc(snap)}" aria-label="${esc(label)}">`
    + `<div class="p-panel__top">${link}<button type="button" class="p-panel__handle" aria-label="${t('panelHandle')}"><span class="p-panel__bar"></span></button></div>`
    + `<div class="p-panel__body">${body}</div></section>`;
}

const SNAPS = ['down', 'half', 'full'];
const DOWN_PX = 150;
const TOP_GAP = 8;
const DRAG_SLOP = 4;

/**
 * @typedef {object} PanelHandlers
 * @property {(snap: 'down' | 'half' | 'full') => void} [onSnap] - Called every time the sheet settles on a different snap.
 */
export function bindPanel(root, handlers = {}) {
  const panels = root.matches?.('.p-panel') ? [root] : [...root.querySelectorAll('.p-panel')];
  const cleanups = panels.map(panel => bindOne(panel, handlers));
  return () => cleanups.forEach(fn => fn());
}

function bindOne(panel, handlers) {
  const handle = panel.querySelector('.p-panel__handle');
  const host = () => panel.offsetParent || panel.parentElement;
  const hostH = () => host()?.clientHeight || 0;
  const isSidebar = () => getComputedStyle(handle).display === 'none';
  const current = () => (SNAPS.includes(panel.dataset.snap) ? panel.dataset.snap : 'half');
  const heightOf = (snap, H = hostH()) => Math.min(H, snap === 'down' ? DOWN_PX : snap === 'half' ? Math.round(H * 0.55) : H - TOP_GAP);

  let dragging = false;
  let moved = false;
  let suppressClick = false;
  let startY = 0;
  let startH = 0;
  let dragH = 0;
  let wasSidebar = null;

  // The visible pixel height of the sheet, which the map reads to fit its content above the panel.
  function publish() {
    const sidebar = isSidebar();
    if (sidebar && wasSidebar === false) panel.style.blockSize = '';
    wasSidebar = sidebar;
    const px = sidebar ? 0 : dragging ? dragH : heightOf(current());
    document.documentElement.style.setProperty('--panel-visible', `${px}px`);
  }

  function setSnap(snap) {
    if (snap === current()) return;
    panel.dataset.snap = snap;
    publish();
    handlers.onSnap?.(snap);
  }

  const step = dir => setSnap(SNAPS[Math.max(0, Math.min(SNAPS.length - 1, SNAPS.indexOf(current()) + dir))]);

  function onDown(e) {
    if (isSidebar() || (e.pointerType === 'mouse' && e.button !== 0)) return;
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
    if (!moved) { moved = true; panel.classList.add('p-panel--dragging'); }
    dragH = Math.max(DOWN_PX, Math.min(hostH() - TOP_GAP, startH + dy));
    panel.style.blockSize = `${dragH}px`;
    publish();
  }

  function onUp(e) {
    if (!dragging) return;
    dragging = false;
    handle.releasePointerCapture?.(e.pointerId);
    if (!moved) return;
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 0);
    const H = hostH();
    const nearest = SNAPS.reduce((best, s) => (Math.abs(heightOf(s, H) - dragH) < Math.abs(heightOf(best, H) - dragH) ? s : best));
    panel.style.blockSize = '';
    panel.classList.remove('p-panel--dragging');
    if (nearest === current()) publish(); else setSnap(nearest);
  }

  function onCancel(e) {
    if (!dragging) return;
    dragging = false;
    moved = false;
    panel.style.blockSize = '';
    panel.classList.remove('p-panel--dragging');
    publish();
  }

  function onClick(e) {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); return; }
    setSnap(SNAPS[(SNAPS.indexOf(current()) + 1) % SNAPS.length]);
  }

  function onKey(e) {
    if (e.key === 'ArrowUp') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); step(-1); }
  }

  handle.addEventListener('pointerdown', onDown);
  handle.addEventListener('pointermove', onMove);
  handle.addEventListener('pointerup', onUp);
  handle.addEventListener('pointercancel', onCancel);
  handle.addEventListener('click', onClick);
  handle.addEventListener('keydown', onKey);
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(publish) : null;
  const h = host();
  if (ro && h) ro.observe(h);
  publish();

  return () => {
    handle.removeEventListener('pointerdown', onDown);
    handle.removeEventListener('pointermove', onMove);
    handle.removeEventListener('pointerup', onUp);
    handle.removeEventListener('pointercancel', onCancel);
    handle.removeEventListener('click', onClick);
    handle.removeEventListener('keydown', onKey);
    ro?.disconnect();
  };
}
