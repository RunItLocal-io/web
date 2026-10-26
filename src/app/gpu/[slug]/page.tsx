// One static page per GPU in the table, answering what people search for: "what can an RTX 3060 run?"
// Same estimates as the homepage, rendered on the server so search engines can read them.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CopyCommand from "@/components/CopyCommand";
import Lineup from "@/components/Lineup";
import Page, { PageHead } from "@/components/Page";
import { VERDICT_PHRASE, fmtTps, pickHero, pickUpgrade, rateAll, usableGb } from "@/lib/estimate";
import { GPUS, gpuFromSlug, gpuSlug, type Gpu } from "@/lib/gpus";
import "../../catalog.css";

export function generateStaticParams() {
  return GPUS.map(g => ({ slug: gpuSlug(g) }));
}

function lookup(slug: string): Gpu | null {
  const g = gpuFromSlug(slug);
  return g && GPUS.includes(g) ? g : null;
}

function rate(g: Gpu, mem: number) {
  const usable = usableGb(g, mem);
  const rated = rateAll(g.bw, usable);
  return { mem, usable, rated, hero: pickHero(rated), fit: rated.filter(r => r.fits).length };
}

const memWord = (g: Gpu) => g.kind === "apple" ? "unified memory" : "VRAM";

export async function generateMetadata({ params }: PageProps<"/gpu/[slug]">): Promise<Metadata> {
  const g = lookup((await params).slug);
  if (!g) return {};
  const { mem, hero, fit, rated } = rate(g, g.vram[0]);
  const best = hero ? ` Best pick: ${hero.name} at about ${fmtTps(hero.tps)} tok/s.` : "";
  return {
    title: `What can the ${g.name} run? Local AI models and speeds`,
    description: `${g.name} with ${mem} GB: ${fit} of ${rated.length} popular open models fit.${best} Speeds, Ollama commands, and what to upgrade to.`,
    alternates: { canonical: `/gpu/${gpuSlug(g)}` },
  };
}

export default async function GpuPage({ params }: PageProps<"/gpu/[slug]">) {
  const g = lookup((await params).slug);
  if (!g) notFound();
  const slug = gpuSlug(g);
  const sizes = g.vram.slice().sort((a, b) => a - b).map(m => rate(g, m));
  const main = sizes.find(s => s.mem === g.vram[0])!;
  const upgrade = pickUpgrade(main.rated, main.usable);
  const peers = GPUS.filter(x => x.vendor === g.vendor && x !== g)
    .sort((a, b) => Math.abs(a.bw - g.bw) - Math.abs(b.bw - g.bw)).slice(0, 6);

  return (
    <Page>
      <section className="hero">
        <PageHead kicker={`${g.vendor} · ${g.vram.join(" or ")} GB ${memWord(g)} · ${g.bw} GB/s`} title={`What can the ${g.name} run?`} back={{ href: "/gpu", label: "Every GPU" }}>
          {main.hero
            ? <>With {main.mem} GB, {main.fit} of {main.rated.length} popular open models fit. The best pick is <b>{main.hero.name}</b> at about <b className="hot">{fmtTps(main.hero.tps)} tok/s</b>, {VERDICT_PHRASE[main.hero.verdict as keyof typeof VERDICT_PHRASE]}.</>
            : <>With {main.mem} GB, none of the models we track fit. You can still try a tiny model in the browser in the <Link href="/studio">Studio</Link>.</>}
        </PageHead>
        {main.hero && (
          <div className="gpu-start">
            <CopyCommand cmd={`ollama run ${main.hero.tag}`} />
            <p className="small">First time? <a href="https://ollama.com/download" rel="noopener">Install Ollama</a>, then paste that into a terminal. Is this your machine? <Link href={`/?gpu=${slug}&mem=${main.mem}`}>Check it on the homepage</Link>.</p>
          </div>
        )}
      </section>

      {sizes.map(s => (
        <section key={s.mem} aria-labelledby={`fits-${s.mem}`}>
          <div className="head reveal">
            <span className="kicker">{s.mem} GB {memWord(g)}{g.kind === "apple" ? ` · about ${Math.round(s.usable)} GB for models` : ""}</span>
            <h2 id={`fits-${s.mem}`}>Every model the {g.name}{sizes.length > 1 ? ` ${s.mem} GB` : ""} can run</h2>
            {sizes.length > 1 && <p>{s.fit} of {s.rated.length} fit{s.hero ? `. Best pick: ${s.hero.name}` : ""}.</p>}
          </div>
          <Lineup rated={s.rated} />
        </section>
      ))}

      <section className="gpu-notes">
        <div className="card panel">
          <b>How we estimate</b>
          <p className="small">
            Generating a token reads the model&apos;s active weights from memory once, so speed is roughly memory bandwidth ({g.bw} GB/s) divided by the active weight size, with efficiency calibrated on our own rack. Sizes are Ollama&apos;s default 4-bit downloads plus about 1.2 GB for context.
            {g.kind === "apple" ? " macOS lets the GPU use about two thirds to three quarters of unified memory, so that is what we count." : ""}
            {" "}Real results are usually within about a third. Measured runs are on the <Link href="/leaderboard">leaderboard</Link>.
          </p>
        </div>
        {upgrade && (
          <div className="card panel">
            <b>Want something bigger?</b>
            <p className="small">The <b>{upgrade.build.name}</b> runs {upgrade.model.name} at about {fmtTps(upgrade.model.tps)} tok/s, from ${upgrade.build.lo.toLocaleString("en-US")} used.</p>
            <p><Link className="btn" href="/builds" transitionTypes={["nav-forward"]}>See the builds</Link></p>
          </div>
        )}
      </section>

      {peers.length > 0 && (
        <section aria-labelledby="peers-h">
          <div className="head"><span className="kicker">Compare</span><h2 id="peers-h">Similar cards</h2></div>
          <ul className="gpu-list">
            {peers.map(p => <li key={p.key}><Link href={`/gpu/${gpuSlug(p)}`}><b>{p.name}</b><span>{p.vram.join(" / ")} GB · {p.bw} GB/s</span></Link></li>)}
          </ul>
          <p className="small"><Link href="/gpu">Every GPU we track</Link></p>
        </section>
      )}
    </Page>
  );
}
