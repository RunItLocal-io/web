"use client";

import { useEffect } from "react";
import { captureUtm, dedupePageviews } from "@/lib/analytics";

// Runs before the tracker script loads (it's afterInteractive), so the hook is in place for the first pageview.
if (typeof window !== "undefined") dedupePageviews();

export default function Analytics() {
  useEffect(captureUtm, []);
  return null;
}
