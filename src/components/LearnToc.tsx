"use client";

import { useEffect, useState } from "react";

// "On this page" for a Learn article: its ## headings, with the one you're reading highlighted.

export default function LearnToc({ items }: { items: { id: string; text: string }[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = items.map(i => document.getElementById(i.id)).filter(e => e !== null);
    const io = new IntersectionObserver(entries => {
      const seen = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (seen) setActive(seen.target.id);
    }, { rootMargin: "-90px 0px -65% 0px" });
    els.forEach(e => io.observe(e));
    return () => io.disconnect();
  }, [items]);

  if (items.length < 2) return null;
  return (
    <aside className="docs-toc" aria-label="On this page">
      <span className="toc-label">On this page</span>
      <ul>
        {items.map(i => <li key={i.id}><a href={`#${i.id}`} aria-current={active === i.id ? "location" : undefined}>{i.text}</a></li>)}
      </ul>
    </aside>
  );
}
