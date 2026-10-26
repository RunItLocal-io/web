"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import CopyCommand from "@/components/CopyCommand";
import { Decode } from "@/components/Decode";
import DieField, { pulse } from "@/components/DieField";
import Gauge, { speedFrac } from "@/components/Gauge";
import RunInBrowser from "@/components/RunInBrowser";
import { usd } from "@/lib/builds";
import { detectGpu, type Detection, type WebGpuInfo } from "@/lib/detect";
import {
  LOCAL_MODELS, VERDICT_LABEL, VERDICT_PHRASE, fmtTps, pickHero, pickUpgrade, rateAll, usableGb,
} from "@/lib/estimate";
import { GPUS, GPU_GROUPS, INTEGRATED, MAC_UNKNOWN, type Gpu } from "@/lib/gpus";

const PICK_INTEGRATED = "__integrated";
const PICK_MAC = "__mac";
/** How long the probe log plays before the verdict appears. Detection itself takes a few milliseconds. */
const BOOT_MS = 1500;

function GpuPicker({ value, onPick }: { value: Gpu | null; onPick: (g: Gpu) => void }) {
  const v = value === INTEGRATED ? PICK_INTEGRATED : value === MAC_UNKNOWN ? PICK_MAC : value?.key ?? "";
  return (
    <label className="picker">
      Pick your GPU
      <select value={v} onChange={e => {
        const k = e.target.value;
        const g = k === PICK_INTEGRATED ? INTEGRATED : k === PICK_MAC ? MAC_UNKNOWN : GPUS.find(x => x.key === k);
        if (g) onPick(g);
      }}>
        <option value="" disabled>Choose…</option>
        {GPU_GROUPS.map(grp => (
          <optgroup key={grp.label} label={grp.label}>
            {grp.gpus.map(g => <option key={g.key} value={g.key}>{g.name}</option>)}
          </optgroup>
        ))}
        <optgroup label="Other">
          <option value={PICK_MAC}>A Mac, not sure which chip</option>
          <option value={PICK_INTEGRATED}>No graphics card / built-in graphics</option>
        </optgroup>
      </select>
    </label>
  );
}

export default function YourGpu() {
  const [det, setDet] = useState<Detection | null>(null);
  const [webgpu, setWebgpu] = useState<WebGpuInfo | null>(null);
  const [booted, setBooted] = useState(false);
  const [picked, setPicked] = useState<Gpu | null>(null);
  const [mem, setMem] = useState<number | null>(null);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    let timer = 0;
    detectGpu().then(r => {
      setDet(r.detection); setWebgpu(r.webgpu);
      const wait = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : BOOT_MS;
      timer = window.setTimeout(() => { setBooted(true); pulse(1.8, .3, .4); }, wait);
    });
    return () => clearTimeout(timer);
  }, []);

  const detected = det && (det.status === "found" || det.status === "guess") ? det.gpu : null;
  const gpu = booted ? picked ?? detected : null;
  const memGb = gpu ? (mem && gpu.vram.includes(mem) ? mem : gpu.vram[0]) : 0;
  const usable = gpu ? usableGb(gpu, memGb) : 0;
  const rated = gpu ? rateAll(gpu.bw, usable) : [];
  const hero = pickHero(rated);
  const upgrade = gpu ? pickUpgrade(rated, usable) : null;
  const subject = !gpu ? "" : gpu === INTEGRATED ? "Your computer" : gpu === MAC_UNKNOWN ? "Your Mac" : "Your " + gpu.name;
  const gpuName = gpu && gpu !== INTEGRATED && gpu !== MAC_UNKNOWN ? gpu.name : null;

  function pick(g: Gpu) { setPicked(g); setMem(null); setChanging(false); pulse(1.4, .3, .4); }
  function chooseMem(v: number) { setMem(v); pulse(1, .3, .5); }

  let kicker = "Local AI, from people who run it";
  if (picked) kicker = "Your pick";
  else if (booted && det?.status === "found") kicker = det.approx ? "Detected in your browser · approximate" : "Detected in your browser";
  else if (booted && det?.status === "guess") kicker = det.reason === "mac" ? "Mac detected" : "Built-in graphics detected";

  // The probe log shows what the browser actually reported.
  const probe: [string, string][] = det ? [
    ["webgl.renderer", det.raw || "hidden by browser"],
    ["webgpu.adapter", webgpu?.available ? (webgpu.f16 ? "online · shader-f16" : "online") : "unavailable"],
    ["gpu.match", det.status === "found" ? `${det.gpu.name} · ${det.gpu.bw} GB/s` : det.status === "guess" ? `${det.gpu.name} · needs your input` : det.status === "mobile" ? "phone, skipping" : "no match"],
    ["models.fit", gpu ? `${rated.filter(r => r.fits).length}/${rated.length} fit${hero ? " · best " + hero.name : ""}` : `${LOCAL_MODELS.length} candidates · estimating`],
  ] : [];

  return (
    <>
      <section className="you">
        <DieField />
        <div className="you-main">
          <span className="kicker">{kicker}</span>
          {gpu && hero ? (
            <>
              <h1>Your <span className="grad"><Decode text={subject.slice("Your ".length)} /></span> can run AI right&nbsp;now.</h1>
              <p className="lede">
                <b>{hero.name}</b> at about <b className="hot">{fmtTps(hero.tps)} tok/s</b>, {VERDICT_PHRASE[hero.verdict as keyof typeof VERDICT_PHRASE]}. {hero.blurb}.
              </p>
              <CopyCommand cmd={`ollama run ${hero.tag}`} />
              <p className="small">First time? <a href="https://ollama.com/download" rel="noopener">Install Ollama</a>, then paste that into a terminal.</p>
            </>
          ) : gpu ? (
            <>
              <h1>{subject} is tight on memory. You&apos;re not out.</h1>
              <p className="lede">Most models won&apos;t fit in {memGb} GB. Run the tiny model below right in your browser, or <Link href="/try">chat with big models on our rack</Link>.</p>
            </>
          ) : (
            <>
              <h1>Run AI on your <span className="grad">own hardware.</span></h1>
              <p className="lede">
                {!booted ? <>Probing your GPU<span className="caret" aria-hidden="true" /></>
                  : det?.status === "mobile" ? "You're on a phone, so let's talk about your computer. Pick the graphics card it has, or open this page on it."
                  : "Your browser didn't tell us your GPU. Pick it and we'll show you what it can run."}
              </p>
            </>
          )}

          {gpu && (
            <div className="facts-row">
              {gpu.vram.length > 1 && (
                <span className="seg small-seg" role="radiogroup" aria-label={gpu.kind === "discrete" ? "Card memory" : "Memory"}>
                  <span className="seg-label">{gpu.kind === "discrete" ? "Version" : "Memory"}</span>
                  {gpu.vram.slice().sort((a, b) => a - b).map(v => (
                    <button key={v} type="button" role="radio" aria-checked={v === memGb} onClick={() => chooseMem(v)}>{v} GB</button>
                  ))}
                </span>
              )}
              {!changing && <button className="linkish" type="button" onClick={() => setChanging(true)}>Not your GPU? Change it</button>}
            </div>
          )}
          {booted && det?.status === "found" && det.approx && !picked && <p className="small">Your browser reports a similar card, not your exact one. Check it.</p>}
          {booted && det?.status === "guess" && det.reason === "integrated" && !picked && <p className="small">Gaming laptop? Browsers often report the built-in chip instead of the graphics card. Pick your real GPU.</p>}
          {booted && det?.status === "guess" && det.reason === "mac" && !picked && <p className="small">Safari doesn&apos;t say which chip your Mac has. Pick it for a sharper answer.</p>}
          {booted && (changing || !gpu || (det?.status === "guess" && !picked)) && <GpuPicker value={gpu} onPick={pick} />}
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
          {gpu && <div className="hud-spec"><span>{memGb} GB{gpu.kind === "discrete" ? " VRAM" : " memory"}</span><span>{gpu.bw} GB/s</span><span>{rated.filter(r => r.fits).length}/{rated.length} models fit</span></div>}
        </aside>
      </section>

      <RunInBrowser webgpu={webgpu} gpuName={gpuName} usableGb={usable || 4} />

      {gpu && (
        <section className="fits" aria-labelledby="fits-h">
          <div className="head reveal">
            <span className="kicker">Your lineup</span>
            <h2 id="fits-h">Everything {subject.replace(/^Your/, "your")} can run</h2>
            <p>With <a href="https://ollama.com/download" rel="noopener">Ollama</a>, at its default 4-bit size. Speeds are estimates from memory bandwidth, usually within about a third of real results.</p>
          </div>
          <ul className="models">
            {rated.map(r => (
              <li key={r.tag} className={"reveal " + r.verdict}>
                <div className="m-name"><b>{r.name}</b><span>{r.blurb}</span></div>
                <div className="m-meter">
                  <span className="m-num">{r.fits ? `~${fmtTps(r.tps)} tok/s` : `needs ${Math.ceil(r.file + 1.2)} GB`}</span>
                  <span className="m-track"><span className="m-fill" style={{ "--w": r.fits ? speedFrac(r.tps) : 0 } as CSSProperties} /></span>
                </div>
                <div className="m-side">
                  <span className={"verdict " + r.verdict}>{VERDICT_LABEL[r.verdict]}</span>
                  <code className="m-tag">{r.tag}</code>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {gpu && upgrade && (
        <section className="card upgrade reveal">
          <span className="kicker">One upgrade away</span>
          <h3>{upgrade.build.name}</h3>
          <p>Used, about {usd(upgrade.build.lo)} to {usd(upgrade.build.hi)}. It runs <b>{upgrade.model.name}</b> at about {fmtTps(upgrade.model.tps)} tok/s, which won&apos;t fit on what you have now.</p>
          <p><Link className="more" href="/builds">See the build and parts list</Link></p>
        </section>
      )}
      {gpu && !upgrade && usable >= 40 && (
        <section className="card upgrade reveal">
          <span className="kicker">You&apos;re ahead of most people</span>
          <h3>That&apos;s a serious machine.</h3>
          <p>Help everyone else: run our benchmark and put your real numbers on the board.</p>
          <p><Link className="more" href="/leaderboard">Add your rig</Link></p>
        </section>
      )}
    </>
  );
}
