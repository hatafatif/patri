// AppBar: the top bar on Home and the header of the web sidebar.
import { esc, icon as icons, LOGO_SRC } from './_shared.js';
import { LiveIndicator } from './LiveIndicator.js';
import { LanguageToggle } from './LanguageToggle.js';

/**
 * The top bar: the bilingual logo (or a back link), then the live indicator and the language switch at the end.
 * The logo is the file brand/patri-logo.svg, relative to the page, about 132×44.
 * @typedef {object} AppBarProps
 * @property {'on' | 'reconnecting' | 'off'} [live='off'] - The LiveIndicator state.
 * @property {'en' | 'ur'} [lang='en'] - The active language, for the LanguageToggle.
 * @property {{ href: string, label: string }} [back] - When present, a back link replaces the logo. The label is already localised.
 */
export function AppBar({ live = 'off', lang = 'en', back } = {}) {
  const start = back
    ? `<a class="p-appbar__back" href="${esc(back.href)}">${icons.back}<span class="p-appbar__backlabel">${esc(back.label)}</span></a>`
    : `<a class="p-appbar__brand" href="#/"><img class="p-appbar__logo" src="${LOGO_SRC}" alt="Patri"></a>`;
  return `<header class="p-appbar">${start}<div class="p-appbar__end">${LiveIndicator({ state: live })}${LanguageToggle({ lang })}</div></header>`;
}
