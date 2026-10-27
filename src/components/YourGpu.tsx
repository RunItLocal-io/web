"use client";

import { useEffect, useId, useState, type CSSProperties } from "react";
import CopyCommand from "@/components/CopyCommand";
import { Decode } from "@/components/Decode";
import DieField, { pulse } from "@/components/DieField";
import Gauge from "@/components/Gauge";
import Lineup from "@/components/Lineup";
import RunInBrowser from "@/components/RunInBrowser";
import { detectGpu, type Detection, type WebGpuInfo } from "@/lib/detect";
import {
  LOCAL_MODELS, VERDICT_PHRASE, combineRig, fmtTps, pickHero, rateAll,
} from "@/lib/estimate";
import { STUDIO, tabFor } from "@/lib/studio/links";
import {
  GPUS, INTEGRATED, MAC_UNKNOWN, MAX_CARDS, gpuMatches, rigFromParams, rigName, rigParams, type Gpu, type RigCard,
} from "@/lib/gpus";

/** How long the probe log plays before the verdict appears. Detection itself takes a few milliseconds. */
const BOOT_MS = 1500;
const SHOWN = 8;
const UNSURE: [string, Gpu][] = [["A Mac, not sure which chip", MAC_UNKNOWN], ["No graphics card / built-in graphics", INTEGRATED]];

/** Type-to-search instead of a 200-option select, which is hard to scroll on a phone. */
function GpuPicker({ label, cardsOnly, onPick, onCancel }: { label: string; cardsOnly?: boolean; onPick: (g: Gpu) => void; onCancel?: () => void }) {
  const id = useId();
  const [q, setQ] = useState("");
  const [at, setAt] = useState(0);
  const words = q.trim();
  const found = words ? GPUS.filter(g => (!cardsOnly || g.kind === "discrete") && gpuMatches(g, words)).slice(0, SHOWN) : [];
  const open = found.length > 0;

  return (
    <div className="picker">
      <label htmlFor={id + "-q"}>{label}</label>
      <input
        id={id + "-q"} type="search" autoComplete="off" spellCheck={false} placeholder="Type a model, like 3090, RTX 8000 or M4 Max"
        role="combobox" aria-expanded={open} aria-controls={id + "-list"} aria-autocomplete="list"
        aria-activedescendant={open ? `${id}-${at}` : undefined}
        value={q}
        onChange={e => { setQ(e.target.value); setAt(0); }}
        onKeyDown={e => {
          if (e.key === "ArrowDown" && open) { e.preventDefault(); setAt((at + 1) % found.length); }
          else if (e.key === "ArrowUp" && open) { e.preventDefault(); setAt((at - 1 + found.length) % found.length); }
          else if (e.key === "Enter" && open) { e.preventDefault(); onPick(found[at]); }
          else if (e.key === "Escape") { if (q) setQ(""); else onCancel?.(); }
        }}
      />
      {open && (
        <ul className="pick-list" id={id + "-list"} role="listbox">
          {found.map((g, i) => (
            <li key={g.key} id={`${id}-${i}`} role="option" aria-selected={i === at} onMouseEnter={() => setAt(i)} onClick={() => onPick(g)}>
              <b>{g.name}</b><span>{g.vram.slice().sort((a, b) => a - b).join(" / ")} GB</span>
            </li>
          ))}
        </ul>
      )}
      {words && !open && <p className="small">No match. Try just the number, like &ldquo;8000&rdquo;.</p>}
      <div className="facts-row">
        {!cardsOnly && UNSURE.map(([text, g]) => <button key={text} className="linkish" type="button" onClick={() => onPick(g)}>{text}</button>)}
        {onCancel && <button className="linkish" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
}

/** Survives client-side navigation, so coming back home shows the result instead of replaying the probe. */
type Visit = { det: Detection | null; webgpu: WebGpuInfo | null; cards: RigCard[]; picked: boolean };
const visit: Visit = { det: null, webgpu: null, cards: [], picked: false };
const remember = (patch: Partial<Visit>) => { Object.assign(visit, patch); };

// Browsers never reveal memory size or how many cards there are, so a choice is kept across visits and written
// into the URL: /?gpu=quadro-rtx-8000x2,rtx-a4000&mem=48,16 is shareable and lets an LLM send someone
// straight to their setup.
const SAVED = "runitlocal:my-gpu";

/** Cards the visitor chose before (URL first, then storage), else the memory size to apply to the detected GPU. */
function initialChoice(): { cards: RigCard[]; mem: number | null } {
  const q = new URLSearchParams(location.search);
  if (q.get("gpu") || q.get("mem")) return { cards: rigFromParams(q.get("gpu"), q.get("mem")), mem: Number(q.get("mem")) || null };
  try {
    const s = JSON.parse(localStorage.getItem(SAVED) ?? "null") as { gpu?: string; mem?: number | string; picked?: boolean } | null;
    return { cards: s?.picked ? rigFromParams(s.gpu, String(s.mem ?? "")) : [], mem: Number(s?.mem) || null };
  } catch { return { cards: [], mem: null }; }
}

function saveChoice(cards: RigCard[], picked: boolean) {
  const p = rigParams(cards);
  try { localStorage.setItem(SAVED, JSON.stringify({ ...p, picked })); } catch {}
  const url = new URL(location.href);
  url.searchParams.set("gpu", p.gpu);
  url.searchParams.set("mem", p.mem);
  history.replaceState(history.state, "", url);
}

const sizes = (g: Gpu) => g.vram.slice().sort((a, b) => a - b);
const isCard = (g: Gpu) => g.kind === "discrete";

export default function YourGpu() {
  const [det, setDet] = useState<Detection | null>(visit.det);
  const [webgpu, setWebgpu] = useState<WebGpuInfo | null>(visit.webgpu);
  const [booted, setBooted] = useState(visit.det !== null);
  const [cards, setCards] = useState<RigCard[]>(visit.cards);
  const [picked, setPicked] = useState(visit.picked);
  const [changing, setChanging] = useState<null | "replace" | "add">(null);

  useEffect(() => {
    if (visit.det) return;
    let timer = 0;
    detectGpu().then(r => {
      const c = initialChoice();
      const g = r.detection.status === "found" || r.detection.status === "guess" ? r.detection.gpu : null;
      const start = c.cards.length ? c.cards : g ? [{ gpu: g, mem: c.mem && g.vram.includes(c.mem) ? c.mem : g.vram[0], count: 1 }] : [];
      remember({ cards: start, picked: c.cards.length > 0 });
      setCards(start); setPicked(c.cards.length > 0);
      setDet(r.detection); setWebgpu(r.webgpu);
      const wait = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : BOOT_MS;
      timer = window.setTimeout(() => {
        remember({ det: r.detection, webgpu: r.webgpu });
        setBooted(true); pulse(1.8, .3, .4);
      }, wait);
    });
    return () => clearTimeout(timer);
  }, []);

  const rig = booted ? cards : [];
  const gpu = rig[0]?.gpu ?? null;
  const single = rig.length === 1 && rig[0].count === 1;
  const { usable, bw, memGb } = rig.length ? combineRig(rig) : { usable: 0, bw: 0, memGb: 0 };
  const rated = gpu ? rateAll(bw, usable) : [];
  const hero = pickHero(rated);
  const name = gpu === INTEGRATED ? "computer" : gpu === MAC_UNKNOWN ? "Mac" : rigName(rig);
  const subject = gpu ? "Your " + name : "";
  const gpuName = gpu && gpu !== INTEGRATED && gpu !== MAC_UNKNOWN ? gpu.name : null;
  const allFit = rated.length > 0 && rated.every(r => r.fits);

  /** Any change by hand makes the setup the visitor's pick, even if it started from detection. */
  function commit(next: RigCard[], strength = 1) {
    remember({ cards: next, picked: true }); setCards(next); setPicked(true); setChanging(null);
    saveChoice(next, true); pulse(strength, .3, .4);
  }
  const replace = (g: Gpu) => commit([{ gpu: g, mem: g.vram[0], count: 1 }], 1.4);
  function add(g: Gpu) {
    const i = cards.findIndex(c => c.gpu === g);
    commit(i >= 0 ? cards.map((c, j) => j === i ? { ...c, count: Math.min(MAX_CARDS, c.count + 1) } : c) : [...cards, { gpu: g, mem: g.vram[0], count: 1 }], 1.4);
  }
  const edit = (i: number, patch: Partial<RigCard>) => commit(cards.map((c, j) => j === i ? { ...c, ...patch } : c));
  // Memory alone doesn't make it a pick: a detected GPU at a different size is still detected.
  function chooseMem(i: number, v: number) {
    if (picked || !single) return edit(i, { mem: v });
    const next = [{ ...cards[0], mem: v }];
    remember({ cards: next }); setCards(next); saveChoice(next, false); pulse(1, .3, .5);
  }

  let kicker = "Local AI, from people who run it";
  if (picked) kicker = single ? "Your pick" : "Your rig";
  else if (booted && det?.status === "found") kicker = det.approx ? "Detected in your browser · approximate" : "Detected in your browser";
  else if (booted && det?.status === "guess") kicker = det.reason === "mac" ? "Mac detected" : "Built-in graphics detected";

  // The probe log shows what the browser actually reported.
  const probe: [string, string][] = det ? [
    ["webgl.renderer", det.raw || "hidden by browser"],
    ["webgpu.adapter", webgpu?.available ? (webgpu.f16 ? "online · shader-f16" : "online") : "unavailable"],
    ["gpu.match", picked && gpu ? `${rigName(rig)} · ${Math.round(bw)} GB/s · your pick` : det.status === "found" ? `${det.gpu.name} · ${det.gpu.bw} GB/s` : det.status === "guess" ? `${det.gpu.name} · needs your input` : det.status === "mobile" ? "phone, skipping" : "no match"],
    ["models.fit", gpu ? `${rated.filter(r => r.fits).length}/${rated.length} fit${hero ? " · best " + hero.name : ""}` : `${LOCAL_MODELS.length} candidates · estimating`],
  ] : [];

  const showPicker = booted && (changing !== null || !gpu || (det?.status === "guess" && !picked));

  return (
    <>
      <section className="you">
        <DieField />
        <div className="you-main">
          <span className="kicker">{kicker}</span>
          {gpu && hero ? (
            <>
              <h1>Your <span className="grad"><Decode text={name} /></span> can run AI right&nbsp;now.</h1>
              <p className="lede">
                <b>{hero.name}</b> at about <b className="hot">{fmtTps(hero.tps)} tok/s</b>, {VERDICT_PHRASE[hero.verdict as keyof typeof VERDICT_PHRASE]}. {hero.blurb}.
              </p>
              <CopyCommand cmd={`ollama run ${hero.tag}`} />
              <p className="small">First time? <a href="https://ollama.com/download" rel="noopener">Install Ollama</a>, then paste that into a terminal.</p>
            </>
          ) : gpu ? (
            <>
              <h1>{subject} is tight on memory. You&apos;re not out.</h1>
              <p className="lede">Most models won&apos;t fit in {memGb} GB. Try a small model right in your browser in the <a href={STUDIO} {...tabFor(STUDIO)}>Studio</a>.</p>
            </>
          ) : (
            <>
              <h1>Run AI on your <span className="grad">own hardware.</span></h1>
              <p className="lede">
                {!booted ? <>Probing your GPU<span className="caret" aria-hidden="true" /></>
                  : det?.status === "mobile" ? "You're on a phone, so let's talk about your computer. Search for the graphics card it has, or open this page on it."
                  : "Your browser didn't tell us your GPU. Search for it and we'll show you what it can run."}
              </p>
            </>
          )}

          {gpu && (
            <div className="rig-cards">
              {rig.map((c, i) => (
                <div className="facts-row" key={`${i}-${c.gpu.key}`}>
                  {!single && <b className="rig-name">{c.gpu.name}</b>}
                  {c.gpu.vram.length > 1 && (
                    <label className="mem-pick">
                      <span className="seg-label">{isCard(c.gpu) ? "Card memory" : "Memory"}</span>
                      <select value={c.mem} onChange={e => chooseMem(i, Number(e.target.value))}>
                        {sizes(c.gpu).map(v => <option key={v} value={v}>{v} GB</option>)}
                      </select>
                    </label>
                  )}
                  {isCard(c.gpu) && (
                    <label className="mem-pick">
                      <span className="seg-label">How many</span>
                      <select value={c.count} onChange={e => edit(i, { count: Number(e.target.value) })}>
                        {Array.from({ length: MAX_CARDS }, (_, n) => <option key={n} value={n + 1}>{n + 1}</option>)}
                      </select>
                    </label>
                  )}
                  {i > 0 && <button className="linkish" type="button" onClick={() => commit(cards.filter((_, j) => j !== i))}>Remove</button>}
                </div>
              ))}
              {!changing && (
                <div className="btns">
                  {isCard(gpu) && <button className="btn outline" type="button" onClick={() => setChanging("add")}>+ Add a different card</button>}
                  <button className="btn outline" type="button" onClick={() => setChanging("replace")}>Checking a different computer?</button>
                </div>
              )}
            </div>
          )}
          {booted && det?.status === "found" && det.approx && !picked && <p className="small">Your browser reports a similar card, not your exact one. Check it.</p>}
          {booted && det?.status === "guess" && det.reason === "integrated" && !picked && <p className="small">Gaming laptop? Browsers often report the built-in chip instead of the graphics card. Pick your real GPU.</p>}
          {booted && det?.status === "guess" && det.reason === "mac" && !picked && <p className="small">Safari doesn&apos;t say which chip your Mac has. Pick it for a sharper answer.</p>}
          {showPicker && (changing === "add"
            ? <GpuPicker label="Add another card to this machine" cardsOnly onPick={add} onCancel={() => setChanging(null)} />
            : <GpuPicker label={gpu ? "Search for the GPU in the computer you want to check" : "Search for your GPU"} onPick={replace} onCancel={changing ? () => setChanging(null) : undefined} />)}
        </div>

        <aside className="hud card" aria-label="System probe">
          <div className="hud-top"><span className="led" aria-hidden="true" /><span>System probe</span><span className="hud-state">{booted ? "complete" : "running"}</span></div>
          <ol className="probe">
            {probe.map(([k, v], i) => (
              <li key={k} style={{ "--i": i } as CSSProperties}><span className="pk">{k}</span><span className="pv">{v}</span></li>
            ))}
            {!det && <li className="pending"><span className="pk">init</span><span className="pv">waiting for browser<span className="caret" aria-hidden="true" /></span></li>}
          </ol>
          <div className={"hud-gauge" + (booted ? " on" : "")}>
            <Gauge tps={hero && booted ? hero.tps : 0} label={hero && booted ? `${hero.name} · estimated` : "standing by"} />
          </div>
          {gpu && <div className="hud-spec"><span>{memGb} GB{isCard(gpu) ? " VRAM" : " memory"}</span><span>{Math.round(bw)} GB/s</span><span>{rated.filter(r => r.fits).length}/{rated.length} models fit</span></div>}
        </aside>
      </section>

      <RunInBrowser gpuName={gpuName} />

      {gpu && (
        <section className="fits" aria-labelledby="fits-h">
          <div className="head reveal">
            <span className="kicker">Your lineup</span>
            <h2 id="fits-h">Everything {subject.replace(/^Your/, "your")} can run</h2>
            <p>
              With <a href="https://ollama.com/download" rel="noopener">Ollama</a>, at its default 4-bit size. Speeds are estimates from memory bandwidth, usually within about a third of real results.
              {!single && " Across several cards we assume the model is split by layers, which runs at about one card's speed."}
              {allFit && ` Every model here fits: your setup holds models up to about ${Math.floor(usable - 1.2)} GB at 4-bit.`}
            </p>
          </div>
          <Lineup rated={rated} />
        </section>
      )}

    </>
  );
}
