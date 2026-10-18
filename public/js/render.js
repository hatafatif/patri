// Paints a screen's HTML into the app root. A new page is a fresh render; a live update or a language
// switch is a morph that patches the DOM in place, so the panel's snap, its scroll position, focus and
// the text being typed survive, and the MapLibre map inside .p-screen__backdrop is never touched.

// Attributes the components change at runtime that a re-render must not reset.
const KEEP = [
  ['p-panel', ['data-snap', 'style', 'class']], // bindPanel: snap, drag height, dragging class
];

function kept(el) {
  for (const [cls, attrs] of KEEP) if (el.classList?.contains(cls)) return attrs;
  return null;
}

function syncAttrs(a, b) {
  const keep = kept(a);
  for (const { name, value } of [...b.attributes]) {
    if (keep?.includes(name)) continue;
    if (a.getAttribute(name) !== value) a.setAttribute(name, value);
  }
  for (const { name } of [...a.attributes]) {
    if (keep?.includes(name)) continue;
    if (!b.hasAttribute(name)) a.removeAttribute(name);
  }
}

function same(x, y) {
  return x.nodeType === y.nodeType && x.nodeName === y.nodeName;
}

function morph(a, b) {
  if (a.nodeType !== 1) {
    if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue;
    return;
  }
  syncAttrs(a, b);
  if (a.classList.contains('p-screen__backdrop')) return; // the map lives here
  if (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA') {
    // Never overwrite what someone is typing.
    if (document.activeElement !== a && a.value !== (b.getAttribute('value') ?? '')) a.value = b.getAttribute('value') ?? '';
    return;
  }
  const ac = [...a.childNodes], bc = [...b.childNodes];
  bc.forEach((y, i) => {
    const x = ac[i];
    if (!x) a.appendChild(y);
    else if (!same(x, y)) a.replaceChild(y, x);
    else morph(x, y);
  });
  for (let i = bc.length; i < ac.length; i++) ac[i].remove();
}

/**
 * @param {Element} root - The app root (#app).
 * @param {string} html - A screen template's output: one .p-screen element.
 * @param {{ fresh?: boolean }} [opts] - fresh replaces everything (a new page); otherwise the DOM is morphed
 *   when the same screen in the same layout is already showing.
 * @returns {boolean} true when it was a fresh render.
 */
export function paint(root, html, { fresh = false } = {}) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  const next = tpl.content.firstElementChild;
  const cur = root.firstElementChild;
  if (fresh || !cur || !next || cur.dataset.screen !== next.dataset.screen || cur.className !== next.className) {
    root.replaceChildren(tpl.content);
    return true;
  }
  morph(cur, next);
  return false;
}
