// SectionHeader: the label above a list, with an optional count and action.
import { esc, bdi } from './_shared.js';

/**
 * The label above a list: "MY TRAINS · 2", with an optional action at the end and an optional 2px rule underneath.
 * @typedef {object} SectionHeaderProps
 * @property {string} label - Already localised.
 * @property {number | string} [count] - Shown after the label, as "· 2".
 * @property {{ label: string, href: string }} [action] - A link at the end of the row, such as "Edit". The label is already localised.
 * @property {boolean} [ruled] - Adds a 2px rule line underneath.
 */
export function SectionHeader({ label, count, action, ruled } = {}) {
  const n = count == null || count === '' ? '' : `<span class="p-sectionheader__count"> · ${bdi(count)}</span>`;
  const act = action ? `<a class="p-sectionheader__action" href="${esc(action.href)}">${esc(action.label)}</a>` : '';
  return `<div class="p-sectionheader${ruled ? ' p-sectionheader--ruled' : ''}"><h2 class="p-sectionheader__label">${esc(label)}${n}</h2>${act}</div>`;
}
