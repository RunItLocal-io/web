"use client";

import { useEffect } from "react";
import { STUDIO, STUDIO_TAB } from "@/lib/studio/links";

// Studio links target one named tab (see tabFor). A plain named-target link would still reload that tab on every
// click, throwing away a model already loaded on the GPU. This switches to the open Studio instead, and only loads
// it when the tab is new or has wandered off the Studio. Without JavaScript, or with pop-ups blocked, the link just
// works as a normal named-tab link.

export default function StudioTabs() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.(`a[target="${STUDIO_TAB}"]`) as HTMLAnchorElement | null;
      if (!a) return;
      // A Studio tab that went back to the site keeps the name; drop it, or the Studio would load over this page.
      if (window.name === STUDIO_TAB && !location.pathname.startsWith(STUDIO)) window.name = "";
      const w = window.open("", STUDIO_TAB);
      if (!w) return;
      e.preventDefault();
      let there = false;
      try { there = w.location.pathname.startsWith(STUDIO); } catch { /* another site in that tab: just navigate it */ }
      if (!there) w.location.href = a.href;
      w.focus();
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
