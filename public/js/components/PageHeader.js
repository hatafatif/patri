// PageHeader: the header at the top of the Train page, the Station page and All stops.
import { esc, bdi, icon as icons } from './_shared.js';
import { isUrdu } from '../i18n.js';
import { TrainBadge } from './TrainBadge.js';
import { IconButton } from './IconButton.js';
import { FollowButton, bindFollowButton } from './FollowButton.js';

/**
 * The page header: an optional back link, a train badge or station mark, the name with its Urdu (or English) twin and a subtitle, and the follow and share actions at the end.
 * @typedef {object} PageHeaderProps
 * @property {{ badge: import('./TrainBadge.js').TrainBadgeProps } | { icon: 'pin' }} [leading] - A TrainBadge (shown at the size in its props, md by default) or the station mark, a 50px circle with a zard-500 ring and a pin. Leave it out on pages that have neither, such as All stops.
 * @property {string} title - The English name, already localised. It is the <h1>, except when the whole interface is Urdu and titleUr is given.
 * @property {string} [titleUr] - The Urdu name. In English it sits on its own line under the title, start-aligned with it. When the interface is Urdu it becomes the <h1> and the English title moves to the second line.
 * @property {string} [subtitle] - A caption line in ink-muted, such as "Lahore Jn → Karachi Cantt" or "Multan". Already localised.
 * @property {({ kind: 'follow', followed: boolean, name: string, label?: { off: string, on: string } } | { kind: 'share', label: string } | { kind: 'back', href: string, label: string })[]} [actions] - A back link renders at the start, before the leading element. Follow and share render at the end, in the order given. Labels and names are already localised. A follow action's optional label replaces its aria-label, off while not followed and on while followed (see FollowButton), such as 'Save Multan Cantt' and 'Saved' on a station.
 */
export function PageHeader({ leading, title, titleUr, subtitle, actions = [] } = {}) {
  const back = actions.find(a => a.kind === 'back');
  const end = actions.filter(a => a.kind !== 'back').map(a => {
    if (a.kind === 'follow') return FollowButton({ followed: a.followed, name: a.name, label: a.label });
    if (a.kind === 'share') return IconButton({ icon: 'share', label: a.label, className: 'p-pageheader__share' });
    return '';
  }).join('');

  let lead = '';
  if (leading?.badge) lead = TrainBadge(leading.badge);
  else if (leading?.icon) lead = `<span class="p-pageheader__mark" aria-hidden="true">${icons[leading.icon] ?? ''}</span>`;

  // The second line sits in an isolated inline span, so it starts at the same edge as the title
  // even though its own direction differs from the page's.
  let heading;
  let second = '';
  if (titleUr && isUrdu()) {
    heading = `<h1 class="p-pageheader__title" lang="ur">${bdi(titleUr)}</h1>`;
    second = `<p class="p-pageheader__alt p-pageheader__alt--latin"><span lang="en" dir="ltr">${esc(title)}</span></p>`;
  } else {
    heading = `<h1 class="p-pageheader__title">${bdi(title)}</h1>`;
    if (titleUr) second = `<p class="p-pageheader__alt"><span lang="ur" dir="rtl">${esc(titleUr)}</span></p>`;
  }
  const sub = subtitle ? `<p class="p-pageheader__subtitle">${bdi(subtitle)}</p>` : '';

  return `<header class="p-pageheader">`
    + (back ? IconButton({ icon: 'back', label: back.label, href: back.href, className: 'p-pageheader__back' }) : '')
    + lead
    + `<div class="p-pageheader__text">${heading}${second}${sub}</div>`
    + (end ? `<div class="p-pageheader__actions">${end}</div>` : '')
    + `</header>`;
}

/**
 * @typedef {object} PageHeaderHandlers
 * @property {(followed: boolean, button: HTMLElement) => void} [onFollow] - Called after the follow star flips, with the new state and the button. Saving is the view's job.
 * @property {(button: HTMLElement) => void} [onShare] - Called when the share button is clicked.
 */
export function bindPageHeader(root, { onFollow, onShare } = {}) {
  // The follow star only counts inside a .p-pageheader, so other stars in the same root are left to
  // their own binds. bindFollowButton is reused through a root that is scoped that way. It listens in
  // the capture phase and stops the click there, so a bindFollowButton on an ancestor can't flip the
  // same star back a second time.
  let wrapped;
  const scoped = {
    contains: node => root.contains(node) && !!node.closest?.('.p-pageheader'),
    addEventListener: (type, fn) => {
      wrapped = e => {
        const btn = e.target.closest?.('.p-followbutton');
        if (!btn || !scoped.contains(btn)) return;
        fn(e);
        e.stopPropagation();
      };
      root.addEventListener(type, wrapped, true);
    },
    removeEventListener: type => root.removeEventListener(type, wrapped, true),
  };
  const unbindFollow = bindFollowButton(scoped, { onToggle: onFollow });

  const onClick = e => {
    const btn = e.target.closest?.('.p-pageheader__share');
    if (!btn || !root.contains(btn)) return;
    onShare?.(btn);
  };
  root.addEventListener('click', onClick);
  return () => {
    unbindFollow();
    root.removeEventListener('click', onClick);
  };
}
