// Small shared pieces of Truck Art markup.
import { esc, bdi, t, dur, delayText, delayTone } from './i18n.js';
import { trainName, stationName } from './names.js';

export const icon = {
  train: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 10h14M9 13.5h.01M15 13.5h.01M8 21l2-4M16 21l-2-4"/></svg>',
  station: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/></svg>',
  trip: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h6.5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7H16"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  share: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"/></svg>',
  pin: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  swap: '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4v16M7 4 4 7M7 4l3 3M17 20V4M17 20l-3-3M17 20l3-3"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  flower: '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><g fill="#ffb000"><circle cx="12" cy="5" r="3.4"/><circle cx="12" cy="19" r="3.4"/><circle cx="5" cy="12" r="3.4"/><circle cx="19" cy="12" r="3.4"/></g><circle cx="12" cy="12" r="3.6" fill="#ffffff"/></svg>',
  stop: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><rect x="7" y="6" width="3.5" height="12" rx="1"/><rect x="13.5" y="6" width="3.5" height="12" rx="1"/></svg>',
  clock: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>',
  flag: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 21V4M6 4h11l-2 4 2 4H6"/></svg>',
  signalOff: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 5.2-2.8M19 12.5a10 10 0 0 0-2.3-1.7M12 20h.01"/></svg>',
};

// Round number badge with the saffron ring; colour shows direction.
export function badge(info, size = 'md') {
  return `<span class="badge badge-${size} ${info.up ? 'up' : 'dn'}"><b>${bdi(info.label)}</b><small>${esc(t(info.up ? 'up' : 'dn'))}</small></span>`;
}

export function chipBadge(info) {
  return `<span class="chip-badge ${info.up ? 'up' : 'dn'}">${bdi(info.label)} ${esc(t(info.up ? 'up' : 'dn'))}</span>`;
}

// short: just the amount ("2 h 6 min"), for tight rows where the colour already says late or early.
export function delayPill(late, short = false) {
  if (late == null) return `<span class="pill t-none">${esc(t('timetable'))}</span>`;
  const text = short && Math.abs(late) >= 1 ? dur(Math.abs(late)) : delayText(late);
  return `<span class="pill t-${delayTone(late)}">${esc(text)}</span>`;
}

export const dotColor = late => ({ ontime: '#1fa35b', late: '#ffb000', vlate: '#e63946', none: '#8d7c86' }[delayTone(late)]);

export const trainTitle = info => esc(trainName(info));

// "Karachi Cantt ➜ Lahore Jn", in Urdu when the station has an Urdu name.
export function routeLine(info, stationById) {
  const name = (id, fallback) => {
    const s = stationById?.get(id);
    return s ? stationName(s.name, s.nameUr) : fallback;
  };
  const from = name(info.fromId, info.from), to = name(info.toId, info.to);
  return `${esc(from)}${to ? ` <span class="arrow">➜</span> ${esc(to)}` : ''}`;
}
