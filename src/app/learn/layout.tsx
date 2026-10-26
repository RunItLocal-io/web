import type { ReactNode } from "react";
import LearnSidebar from "@/components/LearnSidebar";
import { TRACKS, inTrack } from "@/lib/learn";
import "./learn.css";

// Learn is a docs app: a fixed sidebar with every guide on the left, the page in the middle, and on article pages
// an "On this page" list on the right. It runs wider than the rest of the site.

export default function LearnLayout({ children }: { children: ReactNode }) {
  const tracks = TRACKS.map(t => ({ id: t.id, label: t.label, items: inTrack(t.id).map(a => ({ slug: a.slug, title: a.nav })) }))
    .filter(t => t.items.length);
  return (
    <div className="docs-shell">
      <LearnSidebar tracks={tracks} />
      <div className="docs-main">{children}</div>
    </div>
  );
}
