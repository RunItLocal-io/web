"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// The Learn sidebar, docs-app style: a filter box, every guide grouped by step, the current one marked and its step
// open. It lives in the Learn layout, so it stays put while pages change. On phones it's a drawer behind a menu bar.

export type SidebarTrack = { id: string; label: string; items: { slug: string; title: string }[] };

export default function LearnSidebar({ tracks }: { tracks: SidebarTrack[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const current = path.startsWith("/learn/") ? path.slice("/learn/".length) : null;
  const currentTitle = tracks.flatMap(t => t.items).find(a => a.slug === current)?.title ?? "Welcome";
  const query = q.trim().toLowerCase();
  const matches = query ? tracks.flatMap(t => t.items.filter(a => a.title.toLowerCase().includes(query)).map(a => ({ ...a, track: t.label }))) : [];

  const link = (slug: string, title: string, extra?: string) => (
    <Link href={`/learn/${slug}`} aria-current={slug === current ? "page" : undefined}>{title}{extra && <span className="side-track">{extra}</span>}</Link>
  );

  return (
    <>
      <button type="button" className="docs-menu" aria-expanded={open} aria-controls="guides" onClick={() => setOpen(true)}>
        <span className="burger" aria-hidden="true" />Guides<span className="here">{currentTitle}</span>
      </button>
      {open && <div className="docs-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}
      <aside
        className={"docs-side" + (open ? " open" : "")} id="guides" aria-label="All guides"
        onClick={e => { if ((e.target as HTMLElement).closest("a")) setOpen(false); }}
        onKeyDown={e => { if (e.key === "Escape") setOpen(false); }}
      >
        <div className="side-top">
          <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Filter guides" aria-label="Filter guides" />
          <button type="button" className="side-close" onClick={() => setOpen(false)} aria-label="Close guides">×</button>
        </div>
        <div className="side-scroll">
          {query ? (
            <ul className="side-results">
              {matches.map(a => <li key={a.slug}>{link(a.slug, a.title, a.track)}</li>)}
              {!matches.length && <li className="side-none">No guides match “{q}”.</li>}
            </ul>
          ) : (
            <>
              <Link className="side-home" href="/learn" aria-current={path === "/learn" ? "page" : undefined}>Welcome</Link>
              <Link className="side-home" href="/articles">Articles</Link>
              {tracks.map((t, i) => {
                const here = t.items.some(a => a.slug === current);
                return (
                  <details key={t.id + (here ? "-here" : "")} open={here || undefined}>
                    <summary><span className="n">0{i + 1}</span><span className="label">{t.label}</span><span className="count">{t.items.length}</span></summary>
                    <ul>{t.items.map(a => <li key={a.slug}>{link(a.slug, a.title)}</li>)}</ul>
                  </details>
                );
              })}
            </>
          )}
        </div>
        <div className="side-foot">
          <Link href="/articles#share">Send us a run or a fix</Link>
          <Link href="/learn#subscribe">Get new guides by email</Link>
          <Link href="/podcast">Podcast</Link>
          <Link href="/gpu">What can my GPU run?</Link>
        </div>
      </aside>
    </>
  );
}
