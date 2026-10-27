"use client";

import Link from "next/link";
import { useState } from "react";
import { BUILDS, MODELS, NEMOTRON_BOLT_GGUF, buildForBudget, buildForModel, orChat, usd, type Build } from "@/lib/builds";
import { pickHero, rateAll, usableGb } from "@/lib/estimate";
import { GPUS, gpuMatches, gpuSlug, type Gpu } from "@/lib/gpus";
import { STUDIO, tabFor } from "@/lib/studio/links";

type Tab = "budget" | "model" | "search";

const SUGGEST = ["DGX Spark", "Strix Halo", "Mac", "RTX 3090", "Laptop", "Chromebook"];

// Every word of the query has to appear somewhere in the item's text.
const hits = (text: string, q: string) => q.split(/\s+/).every(w => text.includes(w));
const buildText = (b: Build) => `${b.tier} ${b.name} ${b.why} ${b.bom.map(p => p[0]).join(" ")}`.toLowerCase();
const best = (g: Gpu) => pickHero(rateAll(g.bw, usableGb(g, g.vram[0])))?.name ?? "browser models";
const price = (b: Build) => b.hi === 0 ? "Free" : `${usd(b.lo)} to ${usd(b.hi)}`;

export default function BuildFinder() {
  const [tab, setTab] = useState<Tab>("budget");
  const [budget, setBudget] = useState(1000);
  const [modelIdx, setModelIdx] = useState(3);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Build | null>(null);

  const q = query.trim().toLowerCase();
  const foundBuilds = q ? BUILDS.filter(b => hits(buildText(b), q)) : [];
  const foundGpus = q ? GPUS.filter(g => gpuMatches(g, q)) : [];

  const model = MODELS[modelIdx];
  const hitModel = tab === "model" ? model.n : undefined;
  const b: Build = tab === "budget" ? buildForBudget(budget)
    : tab === "model" ? buildForModel(model)
    : (picked && foundBuilds.includes(picked) ? picked : foundBuilds[0]) ?? picked ?? buildForBudget(budget);
  const target = hitModel ? model : MODELS.filter(m => m.gb <= b.vram && m.or).pop();
  const free = b.hi === 0;

  return (
    <div className="card finder">
      <div className="tabs" role="tablist" aria-label="Find a build">
        <button className="tab" role="tab" id="t-budget" aria-selected={tab === "budget"} aria-controls="ask-budget" type="button" onClick={() => setTab("budget")}>I have a budget</button>
        <button className="tab" role="tab" id="t-model" aria-selected={tab === "model"} aria-controls="ask-model" type="button" onClick={() => setTab("model")}>I want a model</button>
        <button className="tab" role="tab" id="t-search" aria-selected={tab === "search"} aria-controls="ask-search" type="button" onClick={() => setTab("search")}>Search hardware</button>
      </div>
      <div className="ask" id="ask-budget" role="tabpanel" aria-labelledby="t-budget" hidden={tab !== "budget"}>
        <label htmlFor="budget">How much do you want to spend on hardware?</label>
        <div className="budget">
          <input id="budget" type="range" min={0} max={8000} step={100} value={budget} onChange={e => setBudget(Number(e.target.value))} />
          <output htmlFor="budget">{budget === 0 ? "$0" : usd(budget)}</output>
        </div>
      </div>
      <div className="ask" id="ask-model" role="tabpanel" aria-labelledby="t-model" hidden={tab !== "model"}>
        <label htmlFor="model">Which model do you want to run?</label>
        <select id="model" value={modelIdx} onChange={e => setModelIdx(Number(e.target.value))}>
          {MODELS.map((m, i) => <option key={m.n} value={i}>{m.n}  (about {m.gb} GB)</option>)}
        </select>
      </div>
      <div className="ask" id="ask-search" role="tabpanel" aria-labelledby="t-search" hidden={tab !== "search"}>
        <label htmlFor="hw">Search any GPU, Mac, AI box or laptop</label>
        <input id="hw" type="search" placeholder="DGX Spark, Ryzen AI Max, RTX 3090, Chromebook…" value={query} autoComplete="off" onChange={e => { setQuery(e.target.value); setPicked(null); }} />
        {!q && (
          <div className="runs" aria-label="Try">
            {SUGGEST.map(s => <button key={s} type="button" className="chip" onClick={() => setQuery(s)}>{s}</button>)}
          </div>
        )}
        {q && foundBuilds.length > 0 && (
          <div className="runs" aria-label="Matching builds">
            {foundBuilds.map(x => <button key={x.name} type="button" className={"chip" + (x === b ? " hit" : "")} aria-pressed={x === b} onClick={() => setPicked(x)}>{x.name}</button>)}
          </div>
        )}
        {q && foundGpus.length > 0 && (
          <ul className="gpu-list" aria-label="Matching hardware">
            {foundGpus.slice(0, 12).map(g => (
              <li key={g.key}><Link href={`/gpu/${gpuSlug(g)}`} transitionTypes={["nav-forward"]}><b>{g.name}</b><span>{g.vram.join(" / ")} GB · best: {best(g)}</span></Link></li>
            ))}
          </ul>
        )}
        {foundGpus.length > 12 && <p className="small">And {foundGpus.length - 12} more. Add a word to narrow it down, or see <Link href="/gpu">every GPU</Link>.</p>}
        {q && !foundBuilds.length && !foundGpus.length && (
          <p className="small">Nothing matches &ldquo;{query}&rdquo; yet. Anything with a recent Chrome or Edge can still run small models in the <Link href={STUDIO} {...tabFor(STUDIO)}>Studio</Link>.</p>
        )}
      </div>
      <div className="build" aria-live="polite">
        <div className="name">
          <span className="kicker">{b.tier}</span>
          <h3>{b.name}</h3>
          <span className="price">{price(b)}</span>
          <div className="facts"><span>{b.vram} GB for models</span><span>{b.power}</span></div>
          <p className="why">{b.why}{b.measured ? " " + b.measured + "." : ""}</p>
          <div className="runs" aria-label="Runs these models">
            {MODELS.filter(m => m.gb <= b.vram).map(m => <span key={m.n} className={"chip" + (hitModel === m.n ? " hit" : "")}>{m.n}</span>)}
          </div>
        </div>
        <div className="side">
          <ul className="bom" aria-label="Parts list">
            {b.bom.map(([part, price]) => <li key={part}><span>{part}</span><span>{price}</span></li>)}
          </ul>
          <p className="note">{b.gotcha}</p>
          <div className="btns">
            {free
              ? <Link className="btn" href={STUDIO} {...tabFor(STUDIO)}>Open the Studio</Link>
              : <a className="btn" href="#builds">See the full build</a>}
            {target && (
              <a className="btn alt" href={target.or ? orChat(target.or) : NEMOTRON_BOLT_GGUF} target="_blank" rel="noopener">
                {target.or ? `Chat with ${target.n} on OpenRouter` : `${target.n}: download from Hugging Face`}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
