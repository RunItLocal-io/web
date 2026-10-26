"use client";

import { useLayoutEffect } from "react";

/**
 * While the Studio is on screen, the site's nav, footer and page scroll step aside (see studio.css).
 * Next.js keeps visited pages in the DOM, hidden by React's <Activity>, so CSS like body:has(.app) would
 * keep matching after you leave. Effects do run their cleanup when a page is hidden, so a class works.
 */
export default function StudioChrome() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add("studio-open");
    return () => root.classList.remove("studio-open");
  }, []);
  return null;
}
