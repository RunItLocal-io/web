import type { Metadata } from "next";
import Link from "next/link";
import Page, { PageHead } from "@/components/Page";
import { GPU_GROUPS, type Gpu } from "@/lib/gpus";
import { MATCHUPS, POPULAR_MATCHUPS, matchupHref } from "@/lib/pairs";
import "../catalog.css";

export const metadata: Metadata = {
  title: "GPU comparisons for local AI",
  description: "RTX 3090 vs 4090, 7900 XTX, M4 Max, DGX Spark and more: which runs bigger open models and which runs them faster, model by model.",
  alternates: { canonical: "/compare" },
};

const Item = ({ pair: [a, b] }: { pair: [Gpu, Gpu] }) => (
  <li><Link href={matchupHref(a, b)} transitionTypes={["nav-forward"]}><b>{a.name} vs {b.name}</b><span>{a.vram.join(" / ")} GB vs {b.vram.join(" / ")} GB</span></Link></li>
);

export default function Compare() {
  const popular = new Set(POPULAR_MATCHUPS.map(p => matchupHref(...p)));
  return (
    <Page>
      <section className="hero">
        <PageHead kicker="Head to head" title="GPU comparisons for local AI" back={{ href: "/gpu", label: "Every GPU" }}>
          Two cards, side by side: which fits bigger models, which runs them faster, and the speed of every popular open model on each.
        </PageHead>
      </section>
      <section aria-labelledby="popular-h">
        <div className="head"><h2 id="popular-h">Most asked</h2></div>
        <ul className="gpu-list">{POPULAR_MATCHUPS.map(p => <Item key={matchupHref(...p)} pair={p} />)}</ul>
      </section>
      {GPU_GROUPS.map(group => {
        const rows = MATCHUPS.filter(p => group.gpus.includes(p[0]) && !popular.has(matchupHref(...p)));
        if (!rows.length) return null;
        return (
          <section key={group.label} aria-labelledby={`c-${group.label}`}>
            <div className="head"><h2 id={`c-${group.label}`}>{group.label}</h2></div>
            <ul className="gpu-list">{rows.map(p => <Item key={matchupHref(...p)} pair={p} />)}</ul>
          </section>
        );
      })}
    </Page>
  );
}
