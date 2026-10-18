// LanguageToggle: the EN / اردو switch.
import { t } from '../i18n.js';

/**
 * A two-button switch between English and Urdu. The active language is filled sabz-700.
 * @typedef {object} LanguageToggleProps
 * @property {'en' | 'ur'} [lang='en'] - The active language.
 */
export function LanguageToggle({ lang = 'en' } = {}) {
  const btn = (code, attrs, text) =>
    `<button type="button" class="p-languagetoggle__btn" data-lang="${code}" aria-pressed="${lang === code ? 'true' : 'false'}" ${attrs}>${text}</button>`;
  return `<div class="p-languagetoggle" role="group" aria-label="${t('language')}">`
    + btn('en', 'lang="en" aria-label="English"', 'EN')
    + btn('ur', 'lang="ur"', 'اردو')
    + '</div>';
}

/**
 * @typedef {object} LanguageToggleHandlers
 * @property {(lang: 'en' | 'ur') => void} [onChange] - Called after aria-pressed has been updated, when the inactive button is clicked. The active button does nothing.
 */
export function bindLanguageToggle(root, handlers = {}) {
  const onClick = e => {
    const btn = e.target.closest?.('.p-languagetoggle [data-lang]');
    if (!btn || !root.contains(btn) || btn.getAttribute('aria-pressed') === 'true') return;
    for (const b of btn.parentElement.querySelectorAll('[data-lang]')) b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
    handlers.onChange?.(btn.dataset.lang);
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
