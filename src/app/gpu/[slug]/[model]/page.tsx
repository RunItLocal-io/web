// One page per question people type word for word: "can the RTX 3060 run Qwen3 14B?"
// Only the pairs in pairModels() exist: for each card, its most capable models and the first one that doesn't fit.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CopyCommand from "@/components/CopyCommand";
import JsonLd, { crumbsLd, faqLd } from "@/components/JsonLd";
import Page, { PageHead } from "@/components/Page";
import { VERDICT_LABEL, fmtTps, modelSlug, needGb, type LocalModel } from "@/lib/estimate";
import { GPUS, gpuFromSlug, gpuSlug, type Gpu } from "@/lib/gpus";
import { modelFromSlug } from "@/lib/models";
import { atMost, cheapestBuild, fitAt, isShared, memWord, pairAnswer, pairHref, pairModels, pairQuestion, runners } from "@/lib/pairs";
import "@/components/lineup.css";
import "../../../catalog.css";

export function generateStaticParams() {
  return GPUS.flatMap(g => pairModels(g).map(m => ({ slug: gpuSlug(g), model: modelSlug(m) })));
}

function lookup(slug: string, model: string): { g: Gpu; m: LocalModel } | null {
  const g = gpuFromSlug(slug), m = modelFromSlug(model);
  return g && m && GPUS.includes(g) && pairModels(g).includes(m) ? { g, m } : null;
}

export async function generateMetadata({ params }: PageProps<"/gpu/[slug]/[model]">): Promise<Metadata> {
  const { slug, model } = await params;
  const p = lookup(slug, model);
  if (!p) return {};
  return {
    title: pairQuestion(p.g, p.m),
    description: pairAnswer(p.g, p.m),
    alternates: { canonical: pairHref(p.g, p.m) },
  };
}

export default async function PairPage({ params }: PageProps<"/gpu/[slug]/[model]">) {
  const { slug, model } = await params;
  const p = lookup(slug, model);
  if (!p) notFound();
  const { g, m } = p;
  const at = fitAt(g, m), ok = at.filter(x => x.fits), first = ok[0];
  const answer = pairAnswer(g, m);
  const best = atMost(g);
  const all = runners(m);

  // Fits: the first cards that are a real step up in speed. Doesn't: cards in the same class that have the memory.
  const others = first
    ? all.filter(r => r.tps >= first.tps * 1.4).reverse().slice(0, 6)
    : all.slice().sort((a, b) => Math.abs(Math.log(a.g.bw / g.bw)) - Math.abs(Math.log(b.g.bw / g.bw))).slice(0, 6);
  const build = first ? null : cheapestBuild(m);
  const siblings = pairModels(g).filter(x => x !== m);
  const faster = first ? best.rated.filter(r => r.fits && r.tps > first.tps * 1.5).pop() : null;

  const qa = [
    { q: pairQuestion(g, m), a: answer },
    { q: `How much memory does ${m.name} need?`, a: `About ${needGb(m)} GB: the ${m.file} GB download at Ollama's default 4-bit size, plus room for context.` },
  ];

  return (
    <Page>
      <JsonLd data={faqLd(qa)} />
      <JsonLd data={crumbsLd([["Home", "/"], ["GPUs", "/gpu"], [g.name, `/gpu/${gpuSlug(g)}`], [m.name, pairHref(g, m)]])} />
      <section className="hero">
        <PageHead kicker={`${g.name} · ${m.name}`} title={pairQuestion(g, m)} back={{ href: `/gpu/${gpuSlug(g)}`, label: `Everything the ${g.name} runs` }}>
          {answer}
        </PageHead>
        {first && (
          <div className="gpu-start">
            <CopyCommand cmd={`ollama run ${m.tag}`} />
            <p className="small">First time? <a href="https://ollama.com/download" rel="noopener">Install Ollama</a>, then paste that into a terminal.</p>
          </div>
        )}
        <div className="runson">
          <div><span>{m.name} needs</span>About {needGb(m)} GB</div>
          <div><span>{g.name} has</span>{g.vram.slice().sort((a, b) => a - b).join(" or ")} GB {memWord(g)}</div>
          <div><span>Bandwidth</span>{g.bw} GB/s</div>
          <div><span>Estimated speed</span>{first ? `~${fmtTps(first.tps)} tok/s` : "Doesn't fit"}</div>
        </div>
      </section>

      {at.length > 1 && (
        <section aria-labelledby="sizes-h">
          <div className="head"><span className="kicker">By memory size</span><h2 id="sizes-h">Each {g.name} version</h2></div>
          <ul className="gpu-list">
            {at.map(x => (
              <li key={x.mem}><div className="gpu-cell"><b>{x.mem} GB{isShared(g) ? ` (about ${Math.round(x.usable)} GB usable)` : ""}</b><span><span className={"verdict " + x.verdict}>{VERDICT_LABEL[x.verdict]}</span>{x.fits ? ` ~${fmtTps(x.tps)} tok/s` : ""}</span></div></li>
            ))}
          </ul>
        </section>
      )}

      <section className="gpu-notes">
        <div className="card panel">
          <b>{first ? "Want it faster?" : `What runs ${m.name}`}</b>
          {first
            ? <p className="small">Speed comes from memory bandwidth: the card reads all {m.active} GB of active weights for every token.{faster ? <> On the {g.name}, <Link href={`/model/${modelSlug(faster)}`}>{faster.name}</Link> runs at about {fmtTps(faster.tps)} tok/s if you can trade some quality for speed.</> : ""} Cards that run {m.name} faster:</p>
            : <p className="small">These cards have the memory for it, nearest to the {g.name} first.{build ? <> The cheapest build on our list that runs it well is the <Link href="/builds">{build.b.name}</Link>, from ${build.b.lo.toLocaleString("en-US")} used, at about {fmtTps(build.e.tps)} tok/s.</> : ""}</p>}
          {others.length > 0
            ? <ul className="gpu-list">{others.map(r => <li key={r.g.key}><Link href={`/gpu/${gpuSlug(r.g)}`}><b>{r.g.name}</b><span>{r.mem} GB · ~{fmtTps(r.tps)} tok/s</span></Link></li>)}</ul>
            : <p className="small">No single card or Mac we track does. It needs a multi-GPU rig; see the <Link href="/builds">builds</Link>.</p>}
        </div>
        <div className="card panel">
          <b>How we estimate</b>
          <p className="small">Speed is roughly memory bandwidth divided by the weights read per token, calibrated on our own rack. Sizes are Ollama&apos;s default 4-bit downloads plus about 1.2 GB for context. Real results are usually within about a third. Measured it yourself? <Link href="/articles#share">Send us the number</Link>.</p>
        </div>
      </section>

      <section aria-labelledby="more-h">
        <div className="head"><span className="kicker">Keep going</span><h2 id="more-h">More about the {g.name} and {m.name}</h2></div>
        <ul className="gpu-list">
          {siblings.map(x => <li key={x.tag}><Link href={pairHref(g, x)}><b>{pairQuestion(g, x)}</b><span>{fitAt(g, x).some(f => f.fits) ? "Yes" : "No"}, needs about {needGb(x)} GB</span></Link></li>)}
          <li><Link href={`/gpu/${gpuSlug(g)}`}><b>Every model the {g.name} runs</b><span>{best.rated.filter(r => r.fits).length} of {best.rated.length} fit at {best.mem} GB</span></Link></li>
          <li><Link href={`/model/${modelSlug(m)}`}><b>Every GPU that runs {m.name}</b><span>{all.length} cards and Macs</span></Link></li>
        </ul>
      </section>
    </Page>
  );
}
