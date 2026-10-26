"use client";

import { useEffect } from "react";

/** Feeds the cursor position to whichever .card is under it, for the hover spotlight in globals.css. */
export default function Spotlight() {
  useEffect(() => {
    function onMove(e: PointerEvent) {
      const card = (e.target as Element | null)?.closest?.(".card") as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return null;
}
