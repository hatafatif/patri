// StationFields: the From and To pickers stacked in one frame, with a swap button.
import { cx, bdi, esc } from './_shared.js';
import { t } from '../i18n.js';
import { IconButton } from './IconButton.js';

const field = (which, label, station) => {
  const name = station
    ? `<span class="p-stationfields__name">${bdi(station)}</span>`
    : `<span class="p-stationfields__name p-stationfields__name--empty">${esc(t('chooseStation'))}</span>`;
  return `<button type="button" class="p-stationfields__field" data-field="${which}"><span class="p-stationfields__label">${esc(label)}</span>${name}</button>`;
};

/**
 * The From and To pickers with a swap button. Each field opens a station picker; the picker itself belongs to the view.
 * @typedef {object} StationFieldsProps
 * @property {string | null} from - The chosen From station's name, or null to show the placeholder.
 * @property {string | null} to - The chosen To station's name, or null to show the placeholder.
 * @property {string} fromLabel - Already localised small label, such as "From".
 * @property {string} toLabel - Already localised small label, such as "To".
 * @property {string} [className] - Extra classes, so a composing component can hook its own styles.
 */
export function StationFields({ from = null, to = null, fromLabel = '', toLabel = '', className } = {}) {
  const swap = IconButton({ icon: 'swap', label: t('swap'), variant: 'outline', className: 'p-stationfields__swap' });
  return `<div class="${cx('p-stationfields', className)}">${field('from', fromLabel, from)}${field('to', toLabel, to)}${swap}</div>`;
}

/**
 * Handlers for bindStationFields.
 * @typedef {object} StationFieldsHandlers
 * @property {() => void} [onPickFrom] - The From field was pressed.
 * @property {() => void} [onPickTo] - The To field was pressed.
 * @property {() => void} [onSwap] - The swap button was pressed.
 */
/**
 * Wires the two fields and the swap button. Returns unbind().
 * @param {Element} root - The element the HTML was rendered into, or the component itself.
 * @param {StationFieldsHandlers} [handlers]
 * @returns {() => void}
 */
export function bindStationFields(root, { onPickFrom, onPickTo, onSwap } = {}) {
  const onClick = e => {
    const el = e.target.closest?.('.p-stationfields__field, .p-stationfields__swap');
    if (!el || !root.contains(el)) return;
    if (el.classList.contains('p-stationfields__swap')) onSwap?.();
    else if (el.dataset.field === 'from') onPickFrom?.();
    else onPickTo?.();
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
