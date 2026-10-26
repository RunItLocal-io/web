// One static page per model we track, for searches like "qwen3 32b vram" or "run llama 3.3 70b locally":
// what it's for, how much memory it needs, and every GPU we know of that runs it, with estimated speed.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CopyCommand from "@/components/CopyCommand";
import Page, { PageHead } from "@/components/Page";
import { LOCAL_MODELS, VERDICT_LABEL, fmtTps, modelSlug, needGb, type Verdict } from "@/lib/estimate";
import { gpuSlug } from "@/lib/gpus";
import { aboutModel } from "@/lib/learn";
import { MODEL_INFO, modelFromSlug } from "@/lib/models";
import { cheapestBuild, hasPair, pairHref, runners } from "@/lib/pairs";
import "@/components/lineup.css";
import "../../catalog.css";

export function generateStaticParams() {
  return LOCAL_MODELS.map(m => ({ slug: modelSlug(m) }));
}

export async function generateMetadata({ params }: PageProps<"/model/[slug]">): Promise<Metadata> {
  const m = modelFromSlug((await params).slug);
  if (!m) return {};
  return {
    title: `Run ${m.name} locally: memory, speed, and the GPUs that run it`,
    description: `${m.name} needs about ${needGb(m)} GB of VRAM or unified memory at Ollama's default 4-bit size. ${m.blurb}. See which GPUs and Macs run it, how fast, and the command to start.`,
    alternates: { canonical: `/model/${modelSlug(m)}` },
  };
}

const GROUPS: Exclude<Verdict, "nofit">[] = ["great", "usable", "slow"];

export default async function ModelPage({ params }: PageProps<"/model/[slug]">) {
  const m = modelFromSlug((await params).slug);
  if (!m) notFound();
  const info = MODEL_INFO[m.tag];
  const all = runners(m);
  const build = cheapestBuild(m);
  const reading = aboutModel(modelSlug(m));
  const moe = m.active < m.file;

  return (
    <Page>
      <section className="hero">
        <PageHead kicker={info ? `${info.maker} · ${info.params}` : "Open model"} title={m.name} back={{ href: "/model", label: "Every model" }}>
          {info?.about ?? m.blurb + "."}
        </PageHead>
        <div className="gpu-start">
          <CopyCommand cmd={`ollama run ${m.tag}`} />
          <p className="small">Needs about <b>{needGb(m)} GB</b> of graphics memory, or unified memory on a Mac. First time? <a href="https://ollama.com/download" rel="noopener">Install Ollama</a>, then paste that into a terminal.</p>
        </div>
        <div className="runson">
          <div><span>Download</span>{m.file} GB</div>
          <div><span>Memory to run</span>About {needGb(m)} GB</div>
          <div><span>Read per token</span>{m.active} GB{moe ? " (mixture of experts)" : ""}</div>
          {info && <><div><span>License</span>{info.license}</div><div><span>Context</span>{info.context}</div><div><span>Released</span>{info.released}</div></>}
        </div>
      </section>

      {info && (
        <section className="gpu-notes">
          <div className="card panel"><b>Good for</b><ul className="ticks">{info.goodFor.map(t => <li key={t}>{t}</li>)}</ul></div>
          <div className="card panel"><b>Not the best pick for</b><ul className="ticks no">{info.skip.map(t => <li key={t}>{t}</li>)}</ul></div>
        </section>
      )}

      <section aria-labelledby="runs-h">
        <div className="head reveal">
          <span className="kicker">{all.length} GPUs and Macs</span>
          <h2 id="runs-h">What runs {m.name}</h2>
          <p>Estimated speed on each card at the smallest memory size that fits it, from memory bandwidth. {moe ? "As a mixture-of-experts model it reads only part of its weights per token, so it runs much faster than its size suggests." : "As a dense model it reads all its weights for every token, so memory bandwidth sets the speed."}</p>
        </div>
        {all.length === 0 && <p>No single card or Mac we track fits it. It needs a multi-GPU rig; see the <Link href="/builds">builds</Link>.</p>}
        {GROUPS.map(v => {
          const rows = all.filter(r => r.verdict === v);
          if (!rows.length) return null;
          return (
            <div key={v} className="runs-group">
              <h3><span className={"verdict " + v}>{VERDICT_LABEL[v]}</span> {rows.length} {rows.length === 1 ? "card" : "cards"}</h3>
              <ul className="gpu-list">
                {rows.map(r => <li key={r.g.key}><Link href={hasPair(r.g, m) ? pairHref(r.g, m) : `/gpu/${gpuSlug(r.g)}`}><b>{r.g.name}</b><span>{r.mem} GB · ~{fmtTps(r.tps)} tok/s</span></Link></li>)}
              </ul>
            </div>
          );
        })}
        {build && <p className="note">Cheapest build from our list that runs it well: <b>{build.b.name}</b>, from ${build.b.lo.toLocaleString("en-US")} used, at about {fmtTps(build.e.tps)} tok/s. <Link href="/builds">See the builds</Link>.</p>}
      </section>

      {reading.length > 0 && (
        <section aria-labelledby="read-h">
          <div className="head"><span className="kicker">Learn</span><h2 id="read-h">Read more about {m.name}</h2></div>
          <ul className="gpu-list">{reading.map(a => <li key={a.slug}><Link href={`/learn/${a.slug}`}><b>{a.title}</b><span>{a.description}</span></Link></li>)}</ul>
        </section>
      )}

      <section aria-labelledby="other-h">
        <div className="head"><span className="kicker">Compare</span><h2 id="other-h">Other models</h2></div>
        <ul className="gpu-list">
          {LOCAL_MODELS.filter(x => x !== m).map(x => <li key={x.tag}><Link href={`/model/${modelSlug(x)}`}><b>{x.name}</b><span>About {needGb(x)} GB · {x.blurb}</span></Link></li>)}
        </ul>
      </section>
    </Page>
  );
}
