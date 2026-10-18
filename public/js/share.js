// Sharing a page: the phone's share sheet (Web Share API) where the browser has one, otherwise the link
// goes to the clipboard and the view shows "Link copied" (a neutral StatusChip in the screen's notice).
// The message is the WhatsApp-friendly text the views build (train, delay, your stop, then the link).

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Plain-http local-network links have no async clipboard; fall back to a hidden textarea.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch {}
    ta.remove();
    return ok;
  }
}

/**
 * @param {{ title: string, text: string, url: string }} what - text is the full message and already ends with the url.
 * @returns {Promise<'shared' | 'cancelled' | 'copied' | 'failed'>}
 */
export async function share({ title, text, url }) {
  if (navigator.share) {
    try {
      // The message already carries the link; passing url as well would paste it twice in WhatsApp.
      await navigator.share({ title, text });
      return 'shared';
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled';
    }
  }
  return (await copy(url)) ? 'copied' : 'failed';
}
