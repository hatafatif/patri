// Share pop-up: copy link, WhatsApp, copy message, and the phone's share sheet where the browser
// allows it (it needs HTTPS, so on a plain local-network link only the first three show).
import { esc, t } from './i18n.js';

const phone = () => matchMedia('(max-width: 800px)').matches;
let open = null;

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

export function toast(text) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>${esc(text)}`;
  el.setAttribute('role', 'status');
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

export function closeShare() {
  if (!open) return;
  open.root.remove();
  document.removeEventListener('pointerdown', open.outside, true);
  document.body.classList.remove('sheet-open');
  open = null;
}

// opts: { anchor, title, url(includeStop) -> string, message(url, includeStop) -> string, stopName }
export function openShare(opts) {
  closeShare();
  const root = document.createElement('div');
  root.className = `share ${phone() ? 'share-sheet' : 'share-pop'}`;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-label', opts.title);
  let include = Boolean(opts.stopName);
  const draw = () => {
    const url = opts.url(include);
    const msg = opts.message(url, include);
    root.innerHTML = `
      <header class="share-head scallop"><b>${esc(opts.title)}</b>
        <button type="button" class="round-btn small" data-close aria-label="${esc(t('close'))}"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></header>
      <div class="share-body">
        <div class="share-link"><input type="text" readonly value="${esc(url)}" aria-label="Link" dir="ltr"><button type="button" class="btn teal" data-copy-link>${esc(t('copyLink'))}</button></div>
        ${opts.stopName ? `<label class="check"><input type="checkbox" data-include ${include ? 'checked' : ''}>${esc(t('includeStop', { stop: opts.stopName }))}</label>` : ''}
        <p class="share-msg">${esc(msg)}</p>
        <div class="share-actions">
          <a class="btn emerald" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${esc(t('whatsapp'))}</a>
          <button type="button" class="btn outline" data-copy-msg>${esc(t('copyMessage'))}</button>
          ${navigator.share ? `<button type="button" class="btn outline" data-native>${esc(t('more'))}</button>` : ''}
        </div>
      </div>`;
  };
  draw();
  root.addEventListener('click', async e => {
    if (e.target.closest('[data-close]')) return closeShare();
    const url = opts.url(include);
    if (e.target.closest('[data-copy-link]') && (await copy(url))) toast(t('copied'));
    if (e.target.closest('[data-copy-msg]') && (await copy(opts.message(url, include)))) toast(t('copied'));
    if (e.target.closest('[data-native]')) navigator.share({ title: opts.title, text: opts.message(url, include), url }).catch(() => {});
  });
  root.addEventListener('change', e => {
    if (e.target.matches('[data-include]')) {
      include = e.target.checked;
      draw();
    }
  });
  document.body.appendChild(root);
  if (phone()) document.body.classList.add('sheet-open');
  else if (opts.anchor) {
    const r = opts.anchor.getBoundingClientRect();
    root.style.top = `${r.bottom + 10}px`;
    root.style.insetInlineEnd = `${Math.max(12, document.documentElement.dir === 'rtl' ? r.left : innerWidth - r.right)}px`;
  }
  const outside = e => { if (!root.contains(e.target) && !opts.anchor?.contains(e.target)) closeShare(); };
  document.addEventListener('pointerdown', outside, true);
  open = { root, outside };
}
