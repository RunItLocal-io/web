/** Copies text; if the clipboard is unavailable, selects the element's text so the user can copy it by hand. */
export function copyText(txt: string, selectEl: HTMLElement | null, done: () => void, fail: () => void) {
  const sel = () => {
    if (selectEl) { const r = document.createRange(); r.selectNodeContents(selectEl); const s = getSelection(); s?.removeAllRanges(); s?.addRange(r); }
    fail();
  };
  try { navigator.clipboard.writeText(txt).then(done, sel); } catch { sel(); }
}
