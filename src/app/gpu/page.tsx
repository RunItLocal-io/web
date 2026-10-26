import type { Metadata } from "next";
import Link from "next/link";
import Page, { PageHead } from "@/components/Page";
import { pickHero, rateAll, usableGb } from "@/lib/estimate";
import { GPU_GROUPS, gpuSlug, type Gpu } from "@/lib/gpus";
import "../catalog.css";

export const metadata: Metadata = {
  title: "What can your GPU run? Every card, every model",
  description: "Pick your graphics card or Mac to see which open AI models it runs locally, how fast, and the Ollama command to start.",
  alternates: { canonical: "/gpu" },
};

const best = (g: Gpu) => pickHero(rateAll(g.bw, usableGb(g, g.vram[0])))?.name ?? "Browser models only";

export default function Gpus() {
  return (
    <Page>
      <section className="hero">
        <PageHead kicker="Every GPU" title="What can your GPU run?">
          Pick your card or Mac. Each page lists every model it can run, how fast, and the command to start.
        </PageHead>
      </section>
      {GPU_GROUPS.map(group => (
        <section key={group.label} aria-labelledby={`g-${group.label}`}>
          <div className="head"><h2 id={`g-${group.label}`}>{group.label}</h2></div>
          <ul className="gpu-list">
            {group.gpus.map(g => (
              <li key={g.key}><Link href={`/gpu/${gpuSlug(g)}`} transitionTypes={["nav-forward"]}><b>{g.name}</b><span>{g.vram.join(" / ")} GB · best: {best(g)}</span></Link></li>
            ))}
          </ul>
        </section>
      ))}
    </Page>
  );
}
