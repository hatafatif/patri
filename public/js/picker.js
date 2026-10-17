// Searchable list for choosing a train, station or stop: a popover under its button on desktop,
// a full-screen sheet on phones. Arrow keys, Enter and Escape work.
import { esc, t } from './i18n.js';

const phone = () => matchMedia('(max-width: 800px)').matches;
let current = null;

export function highlight(text, tokens) {
  text = String(text ?? '');
  if (!tokens.length) return esc(text);
  const re = new RegExp(tokens.map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'giu');
  let out = '', last = 0;
  for (const m of text.matchAll(re)) {
    if (!m[0]) continue;
    out += `${esc(text.slice(last, m.index))}<mark>${esc(m[0])}</mark>`;
    last = m.index + m[0].length;
  }
  return out + esc(text.slice(last));
}

export function closePicker(refocus = true) {
  if (!current) return;
  const { root, anchor } = current;
  root.remove();
  document.body.classList.remove('sheet-open');
  document.removeEventListener('pointerdown', current.outside, true);
  current = null;
  if (refocus && anchor) anchor.focus();
}

// groups: [{ title, items }]; render(item, tokens) -> inner HTML of the option;
// search(item) -> lowercase haystack; key(item) -> unique key.
export function openPicker({ anchor, title, placeholder, groups, render, search, key, selectedKey, onPick, footer }) {
  closePicker(false);
  const root = document.createElement('div');
  root.className = `picker ${phone() ? 'picker-sheet' : 'picker-pop'}`;
  root.innerHTML = `
    <div class="picker-head">
      ${title ? `<div class="picker-title"><h2>${esc(title)}</h2><button type="button" class="round-btn small" data-close aria-label="${esc(t('close'))}"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>` : ''}
      <label class="search">
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input type="search" autocomplete="off" spellcheck="false" placeholder="${esc(placeholder)}" aria-label="${esc(placeholder)}" role="combobox" aria-expanded="true" aria-controls="picker-list" aria-autocomplete="list">
      </label>
      ${!title && phone() ? `<button type="button" class="link-btn" data-close>${esc(t('cancel'))}</button>` : ''}
    </div>
    <ul class="picker-list" id="picker-list" role="listbox"></ul>
    ${footer || ''}`;
  document.body.appendChild(root);
  if (phone()) document.body.classList.add('sheet-open');
  else if (anchor) {
    const r = anchor.getBoundingClientRect();
    root.style.top = `${r.bottom + 8}px`;
    root.style.left = `${r.left}px`;
    root.style.width = `${Math.max(r.width, 360)}px`;
    root.style.maxHeight = `${Math.max(280, innerHeight - r.bottom - 24)}px`;
  }
  const input = root.querySelector('input');
  const list = root.querySelector('.picker-list');
  let items = [], active = -1;

  const draw = () => {
    const q = input.value.trim().toLowerCase();
    const tokens = q.split(/\s+/).filter(Boolean);
    items = [];
    let html = '';
    for (const g of groups) {
      const matches = g.items.filter(i => tokens.every(tok => search(i).includes(tok)));
      if (!matches.length) continue;
      if (g.title) html += `<li class="picker-group" role="presentation"><span>${esc(g.title)}</span><span>${matches.length}</span></li>`;
      for (const item of matches) {
        html += `<li class="picker-opt" role="option" id="opt-${items.length}" data-i="${items.length}" aria-selected="${key(item) === selectedKey}">${render(item, tokens)}</li>`;
        items.push(item);
      }
    }
    list.innerHTML = html || `<li class="picker-empty" role="presentation">${esc(t('noMatch', { q: input.value.trim() }))}</li>`;
    setActive(0, false);
  };
  const setActive = (i, scroll = 'nearest') => {
    if (!items.length) return input.removeAttribute('aria-activedescendant');
    i = Math.max(0, Math.min(items.length - 1, i));
    list.querySelector('.picker-opt.active')?.classList.remove('active');
    const el = list.querySelector(`#opt-${i}`);
    el.classList.add('active');
    active = i;
    input.setAttribute('aria-activedescendant', el.id);
    if (scroll === 'center') list.scrollTop = el.offsetTop - list.clientHeight / 2 + el.offsetHeight / 2;
    else if (scroll) el.scrollIntoView({ block: 'nearest' });
  };
  const pick = i => {
    const item = items[i];
    if (!item) return;
    closePicker();
    onPick(item);
  };

  input.addEventListener('input', draw);
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
    else if (e.key === 'PageDown') { e.preventDefault(); setActive(active + 6); }
    else if (e.key === 'PageUp') { e.preventDefault(); setActive(active - 6); }
    else if (e.key === 'Enter') { e.preventDefault(); pick(active); }
    else if (e.key === 'Escape') { e.preventDefault(); closePicker(); }
    else if (e.key === 'Tab') closePicker(false);
  });
  list.addEventListener('mousemove', e => {
    const o = e.target.closest('.picker-opt');
    if (o && +o.dataset.i !== active) setActive(+o.dataset.i, false);
  });
  list.addEventListener('click', e => {
    const o = e.target.closest('.picker-opt');
    if (o) pick(+o.dataset.i);
  });
  root.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) closePicker();
  });
  const outside = e => {
    if (!root.contains(e.target) && !(anchor && anchor.contains(e.target))) closePicker(false);
  };
  document.addEventListener('pointerdown', outside, true);
  current = { root, anchor, outside };

  draw();
  const sel = items.findIndex(i => key(i) === selectedKey);
  setActive(Math.max(sel, 0), sel >= 0 ? 'center' : false);
  input.focus();
  return root;
}

export const pickerOpen = () => Boolean(current);
