// Photos of cities and trains for the Station and Train pages, from public/photos/photos.json: hand-picked,
// freely licensed photos from Wikimedia Commons (scripts/build-photos.py). Loaded once, on first use.
import { t } from './i18n.js';
import { haversineKm } from './eta.js';

const NEAR_KM = 15; // a station this close to a city's photo point gets that city's photo
let manifest = null, loading = null;

/** Loads the manifest once. Resolves when it's ready (an empty one if it can't load); render again then. */
export function loadPhotos() {
  loading ||= fetch('/photos/photos.json')
    .then(r => (r.ok ? r.json() : null))
    .catch(() => null)
    .then(m => { manifest = m || { cities: {}, trains: {}, general: [] }; return manifest; });
  return loading;
}

const props = p => (p ? { src: `/photos/${p.file}`, alt: p.alt, credit: t('photoBy', { author: p.author, licence: p.licence }), href: p.href } : null);

/** Photo props for a train: its own photo, else a general Pakistan Railways one; null before loading or when there is none. */
export function trainPhoto(number) {
  if (!manifest) return null;
  const general = manifest.general || [];
  return props(manifest.trains?.[String(number)] || general[Number(number) % general.length]);
}

/** Photo props for the city a station is in (its photo point within 15 km), or null. */
export function cityPhoto(station) {
  if (!manifest || !station || !Number.isFinite(station.lat) || !Number.isFinite(station.lon)) return null;
  let best = null, bd = NEAR_KM;
  for (const c of Object.values(manifest.cities || {})) {
    const d = haversineKm(station, c);
    if (d <= bd) { bd = d; best = c; }
  }
  return props(best);
}
