// Head-to-head pages for searches like "rtx 3090 vs rtx 4090 for llm": which fits bigger models, which runs
// them faster, and every model side by side. Only the matchups in MATCHUPS exist.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd, { crumbsLd, faqLd } from "@/components/JsonLd";
import Page, { PageHead } from "@/components/Page";
import { VERDICT_LABEL, fmtTps, modelSlug, needGb, type Rated } from "@/lib/estimate";
import { gpuSlug, type Gpu } from "@/lib/gpus";
import { MATCHUPS, compareSummary, hasPair, isShared, matchupFromSlug, matchupHref, matchupSlug, matchupsFor, memWord, pairHref } from "@/lib/pairs";
import "@/app/leaderboard/leaderboard.css";
import "@/components/lineup.css";
import "../../catalog.css";

export function generateStaticParams() {
  return MATCHUPS.map(([a, b]) => ({ pair: matchupSlug(a, b) }));
}

const title = (a: Gpu, b: Gpu) => `${a.name} vs ${b.name} for local AI`;

export async function generateMetadata({ params }: PageProps<"/compare/[pair]">): Promise<Metadata> {
  const p = matchupFromSlug((await params).pair);
  if (!p) return {};
  const [a, b] = p;
  const s = compareSummary(a, b);
  return {
    title: title(a, b),
    description: `${s.fits} ${s.speed} Every popular open model, side by side.`,
    alternates: { canonical: matchupHref(a, b) },
  };
}

function Cell({ g, r }: { g: Gpu; r: Rated }) {
  const body = r.fits ? <>~{fmtTps(r.tps)} tok/s <span className={"verdict " + r.verdict}>{VERDICT_LABEL[r.verdict]}</span></> : <span className="small">Needs {needGb(r)} GB</span>;
  return <td>{hasPair(g, r) ? <Link href={pairHref(g, r)}>{body}</Link> : body}</td>;
}

export default async function ComparePage({ params }: PageProps<"/compare/[pair]">) {
  const p = matchupFromSlug((await params).pair);
  if (!p) notFound();
  const [a, b] = p;
  const { speed, fits, verdict, A, B } = compareSummary(a, b);
  const sides = [{ g: a, s: A }, { g: b, s: B }];
  const more = (g: Gpu, other: Gpu) => matchupsFor(g).filter(x => x !== other).slice(0, 4);

  const qa = [
    { q: `Which is better for local AI, the ${a.name} or the ${b.name}?`, a: `${verdict} ${fits} ${speed}` },
    ...sides.map(({ g, s }) => ({ q: `What is the biggest model the ${g.name} can run?`, a: s.top ? `${s.top.name}, which needs about ${needGb(s.top)} GB, on the ${s.mem} GB version at about ${fmtTps(s.top.tps)} tok/s.` : `None of the models we track fit in ${s.mem} GB.` })),
  ];

  return (
    <Page>
      <JsonLd data={faqLd(qa)} />
      <JsonLd data={crumbsLd([["Home", "/"], ["Compare", "/compare"], [`${a.name} vs ${b.name}`, matchupHref(a, b)]])} />
      <section className="hero">
        <PageHead kicker="Head to head" title={title(a, b)} back={{ href: "/compare", label: "Every comparison" }}>
          {fits} {speed}
        </PageHead>
      </section>

      <section aria-labelledby="specs-h">
        <div className="head"><span className="kicker">The numbers that matter</span><h2 id="specs-h">Memory and bandwidth</h2>
          <p>Memory decides which models fit. Bandwidth decides how fast they generate, because every token reads the model&apos;s active weights once.</p></div>
        <div className="card panel">
          <div className="board-scroll">
            <table className="board">
              <thead><tr><th></th>{sides.map(({ g }) => <th key={g.key}><Link href={`/gpu/${gpuSlug(g)}`}>{g.name}</Link></th>)}</tr></thead>
              <tbody>
                <tr><td>Memory</td>{sides.map(({ g }) => <td key={g.key}>{g.vram.slice().sort((x, y) => x - y).join(" or ")} GB {memWord(g)}</td>)}</tr>
                {sides.some(({ g }) => isShared(g)) && <tr><td>Usable for models</td>{sides.map(({ g, s }) => <td key={g.key}>{isShared(g) ? `About ${Math.round(s.usable)} GB of ${s.mem} GB` : `All ${s.mem} GB`}</td>)}</tr>}
                <tr><td>Bandwidth</td>{sides.map(({ g }) => <td key={g.key} className={g.bw >= Math.max(a.bw, b.bw) && a.bw !== b.bw ? "hit" : ""}>{g.bw} GB/s</td>)}</tr>
                <tr><td>Biggest model that fits</td>{sides.map(({ g, s }) => <td key={g.key}>{s.top ? <Link href={`/model/${modelSlug(s.top)}`}>{s.top.name}</Link> : "None we track"}</td>)}</tr>
                <tr><td>Best everyday pick</td>{sides.map(({ g, s }) => <td key={g.key}>{s.hero ? `${s.hero.name}, ~${fmtTps(s.hero.tps)} tok/s` : "Browser models"}</td>)}</tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section aria-labelledby="models-h">
        <div className="head"><span className="kicker">Model by model</span><h2 id="models-h">Every model, side by side</h2>
          <p>Estimated generation speed at the largest memory size each was sold in ({A.mem} GB and {B.mem} GB).</p></div>
        <div className="card panel">
          <div className="board-scroll">
            <table className="board">
              <thead><tr><th>Model</th><th>{a.name}</th><th>{b.name}</th></tr></thead>
              <tbody>
                {A.rated.map((r, i) => (
                  <tr key={r.tag}>
                    <td><Link href={`/model/${modelSlug(r)}`}><b>{r.name}</b></Link><br /><span className="small">About {needGb(r)} GB</span></td>
                    <Cell g={a} r={r} />
                    <Cell g={b} r={B.rated[i]} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="gpu-notes">
        <div className="card panel">
          <b>Which should you get?</b>
          <p className="small">{verdict} Price matters as much as either number: check used prices on the <Link href="/builds">builds</Link> page, where every parts list has a measured or estimated speed.</p>
        </div>
        <div className="card panel">
          <b>How we estimate</b>
          <p className="small">Both columns use the same formula: memory bandwidth divided by the weights read per token, calibrated on our own rack, with Ollama&apos;s default 4-bit sizes. Real results are usually within about a third. Measured runs are on the <Link href="/leaderboard">leaderboard</Link>.</p>
        </div>
      </section>

      <section aria-labelledby="other-h">
        <div className="head"><span className="kicker">Compare</span><h2 id="other-h">Other matchups</h2></div>
        <ul className="gpu-list">
          {sides.flatMap(({ g }) => more(g, g === a ? b : a).map(x => (
            <li key={g.key + x.key}><Link href={matchupHref(g, x)}><b>{g.name} vs {x.name}</b><span>{x.vram.join(" / ")} GB · {x.bw} GB/s</span></Link></li>
          )))}
        </ul>
        <p className="small"><Link href="/compare">Every comparison</Link></p>
      </section>
    </Page>
  );
}
