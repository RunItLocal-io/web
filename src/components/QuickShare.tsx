"use client";

import { useState } from "react";
import { copyText } from "@/lib/copy";
import { SITE } from "@/lib/share";

// One tap to share a page: the device's share sheet where there is one, else the link goes on the clipboard.
// The link is tagged so a visit from it shows up in Umami as utm_source=share.

type Props = { path: string; page: string; text: string; label: string; className?: string };

export default function QuickShare({ path, page, text, label, className }: Props) {
  const [said, setSaid] = useState<string | null>(null);
  const url = `${SITE}${path}?utm_source=share&utm_medium=referral&utm_content=${encodeURIComponent(page)}`;

  function flash(s: string) { setSaid(s); setTimeout(() => setSaid(null), 1800); }

  async function share() {
    if (typeof navigator.share === "function") {
      try { await navigator.share({ title: "RunItLocal.io", text, url }); return; }
      catch (e) { if (e instanceof DOMException && e.name === "AbortError") return; /* closed the sheet */ }
    }
    copyText(url, null, () => flash("Link copied"), () => flash("Couldn't copy, the link is " + url));
  }

  return (
    <button type="button" className={className} onClick={share} data-umami-event="share_click" data-umami-event-page={page}>
      <span role="status">{said ?? label}</span>
    </button>
  );
}
