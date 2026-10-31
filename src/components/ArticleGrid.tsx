"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Totals } from "@/lib/reactions";
import { CardStats, allReactions } from "./Reactions";

// The Articles list: one card per article, with its share card as the picture. Newest first when the page loads;
// "Top" and "Most read" reorder by the live totals once they arrive. The newest article leads, full width.

export type Item = { slug: string; title: string; description: string; date: string; by: string | null };

const SORTS = [
  { id: "new", label: "Newest" },
  { id: "top", label: "Top" },
  { id: "read", label: "Most read" },
] as const;
type Sort = (typeof SORTS)[number]["id"];

const score = (t?: Totals) => (t ? t.up - t.down : 0);

export default function ArticleGrid({ items }: { items: Item[] }) {
  const [sort, setSort] = useState<Sort>("new");
  const [totals, setTotals] = useState<Record<string, Totals>>({});
  useEffect(() => { allReactions().then(setTotals); }, []);

  const list = sort === "new" ? items : [...items].sort((a, b) =>
    sort === "top" ? score(totals[b.slug]) - score(totals[a.slug]) || (totals[b.slug]?.views ?? 0) - (totals[a.slug]?.views ?? 0)
      : (totals[b.slug]?.views ?? 0) - (totals[a.slug]?.views ?? 0));

  return (
    <>
      <div className="sort" role="tablist" aria-label="Sort articles">
        {SORTS.map(s => (
          <button key={s.id} type="button" role="tab" aria-selected={sort === s.id} onClick={() => setSort(s.id)}>{s.label}</button>
        ))}
      </div>
      <ul className="article-grid">
        {list.map((a, i) => (
          <li key={a.slug} className={i === 0 ? "lead" : undefined}>
            <Link href={`/learn/${a.slug}`} transitionTypes={["nav-forward"]}>
              {/* The article's own share card: the same picture people see when it's posted. Built at deploy. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/learn/${a.slug}/opengraph-image/card`} alt="" width={1200} height={630} loading={i < 3 ? "eager" : "lazy"} />
              <div className="card-text">
                <span className="card-meta">{a.date}{a.by ? ` · from ${a.by}` : ""}</span>
                <b>{a.title}</b>
                <span className="card-desc">{a.description}</span>
                <CardStats slug={a.slug} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
