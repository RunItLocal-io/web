"use client";

import { useState } from "react";
import Icon, { kindIcon } from "@/components/studio/Icon";
import type { WebGpuInfo } from "@/lib/detect";
import { GROUPS, STUDIO_MODELS, cantRun, type Progress, type StudioModel, type storedModels } from "@/lib/studio/models";

// The model library: every model the Studio can run, what each is good at, whether it's on this device, and
// a button to download, use or remove it.

export type Stored = Awaited<ReturnType<typeof storedModels>>[number];

type Props = {
  model: StudioModel; live: string | null; loading: (Progress & { model: StudioModel }) | null;
  webgpu: WebGpuInfo | null; usableGb: number; stored: Stored[]; locked: boolean; where: string;
  onUse: (m: StudioModel) => void; onDownload: (m: StudioModel) => void; onRemove: (s: Stored) => void;
};

export default function ModelsView(p: Props) {
  const [only, setOnly] = useState(false);
  const mine = (m: StudioModel) => p.live === m.id || p.stored.some(s => s.model.id === m.id);
  const count = STUDIO_MODELS.filter(mine).length;

  return (
    <div className="library">
      <header className="lib-head">
        <div>
          <h1>Local models</h1>
          <p>Everything here runs on {p.where}, inside this tab. Download a model once and it works offline.</p>
        </div>
        <div className="seg" role="tablist" aria-label="Filter">
          <button type="button" role="tab" aria-selected={!only} onClick={() => setOnly(false)}>All <span>{STUDIO_MODELS.length}</span></button>
          <button type="button" role="tab" aria-selected={only} onClick={() => setOnly(true)}>On this device <span>{count}</span></button>
        </div>
      </header>

      {only && count === 0 && <p className="lib-empty">Nothing downloaded yet. Pick a model below and it stays on this device.</p>}

      {GROUPS.map(g => {
        const list = STUDIO_MODELS.filter(m => m.group === g && (!only || mine(m)));
        if (!list.length) return null;
        return (
          <section key={g} className="lib-group" aria-label={g}>
            <h2 className="side-h"><Icon name={kindIcon(g)} />{g}</h2>
            <div className="lib-grid">
              {list.map(m => {
                const why = p.webgpu ? cantRun(m, p.webgpu, p.usableGb) : "Checking your GPU";
                const s = p.stored.find(x => x.model.id === m.id);
                const isLive = p.live === m.id;
                const ld = p.loading?.model.id === m.id ? p.loading : null;
                return (
                  <article key={m.id} className={"lib-card" + (m.id === p.model.id ? " on" : "") + (why ? " off" : "")}>
                    <div className="lib-top">
                      <span className={"model-badge" + (isLive ? " live" : "")}><Icon name={kindIcon(m.group)} /></span>
                      <div className="lib-name">
                        <b>{m.label}</b>
                        <span>{m.size}</span>
                      </div>
                      <span className={"pill" + (isLive ? " live" : s ? " here" : "")}>{isLive ? "Running" : s ? "On device" : why ? "Won't fit" : "Not downloaded"}</span>
                    </div>
                    <p>{why ?? m.blurb}</p>
                    {ld ? (
                      <div className="lib-load" role="status">
                        <div className="bar"><span style={{ width: `${Math.max(2, Math.round(ld.p * 100))}%` }} /></div>
                        <span>{Math.round(ld.p * 100)}% · {ld.text || "Starting…"}</span>
                      </div>
                    ) : !why && (
                      <div className="lib-acts">
                        {isLive || s
                          ? <button className="btn" type="button" disabled={p.locked} onClick={() => p.onUse(m)}><Icon name={kindIcon(m.group)} />{isLive ? "Open chat" : "Use"}</button>
                          : <button className="btn alt" type="button" disabled={p.locked} onClick={() => p.onDownload(m)}><Icon name="down" />Download {m.size}</button>}
                        {s && <button className="icon-btn" type="button" disabled={p.locked} onClick={() => p.onRemove(s)} aria-label={`Remove ${m.label} from this device`} title="Remove from this device"><Icon name="trash" /></button>}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
