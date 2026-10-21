// Photo: a picture with a credit line under it.
import { esc, bdi, cx } from './_shared.js';

/**
 * A photo with its credit underneath: the train in About this train, the city on the Station page. It loads only when scrolled near, and reserves its 16:9 box so nothing shifts.
 * @typedef {object} PhotoProps
 * @property {string} src - The image URL.
 * @property {string} alt - What the photo shows, for screen readers.
 * @property {string} credit - Already localised, such as "Photo: A. Khan · CC BY-SA 4.0".
 * @property {string} [href] - The photo's source page. The credit links to it, opening in a new tab.
 * @property {string} [className] - Extra classes, so a composing component can hook its own styles.
 */
export function Photo({ src = '', alt = '', credit = '', href, className } = {}) {
  const text = bdi(credit);
  const line = href ? `<a class="p-photo__link" href="${esc(href)}" target="_blank" rel="noopener">${text}</a>` : text;
  return `<figure class="${cx('p-photo', className)}"><img class="p-photo__img" src="${esc(src)}" alt="${esc(alt)}" width="800" height="450" loading="lazy" decoding="async">${credit ? `<figcaption class="p-photo__credit">${line}</figcaption>` : ''}</figure>`;
}
