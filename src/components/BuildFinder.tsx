"use client";

import { useState } from "react";
import { MODELS, NEMOTRON_BOLT_GGUF, buildForBudget, buildForModel, orChat, usd, type Build } from "@/lib/builds";

export default function BuildFinder() {
  const [tab, setTab] = useState<"budget" | "model">("budget");
  const [budget, setBudget] = useState(500);
  const [modelIdx, setModelIdx] = useState(3);

  const model = MODELS[modelIdx];
  const hitModel = tab === "model" ? model.n : undefined;
  const b: Build = tab === "budget" ? buildForBudget(budget) : buildForModel(model);
  const target = hitModel ? model : MODELS.filter(m => m.gb <= b.vram && m.or).pop();

  return (
    <div className="card finder">
      <div className="tabs" role="tablist" aria-label="Find a build">
        <button className="tab" role="tab" id="t-budget" aria-selected={tab === "budget"} aria-controls="ask-budget" type="button" onClick={() => setTab("budget")}>I have a budget</button>
        <button className="tab" role="tab" id="t-model" aria-selected={tab === "model"} aria-controls="ask-model" type="button" onClick={() => setTab("model")}>I want a model</button>
      </div>
      <div className="ask" id="ask-budget" role="tabpanel" aria-labelledby="t-budget" hidden={tab !== "budget"}>
        <label htmlFor="budget">How much do you want to spend on hardware?</label>
        <div className="budget">
          <input id="budget" type="range" min={200} max={5000} step={50} value={budget} onChange={e => setBudget(Number(e.target.value))} />
          <output htmlFor="budget">{usd(budget)}</output>
        </div>
      </div>
      <div className="ask" id="ask-model" role="tabpanel" aria-labelledby="t-model" hidden={tab !== "model"}>
        <label htmlFor="model">Which model do you want to run?</label>
        <select id="model" value={modelIdx} onChange={e => setModelIdx(Number(e.target.value))}>
          {MODELS.map((m, i) => <option key={m.n} value={i}>{m.n}  (about {m.gb} GB)</option>)}
        </select>
      </div>
      <div className="build" aria-live="polite">
        <div className="name">
          <span className="kicker">{b.tier}</span>
          <h3>{b.name}</h3>
          <span className="price">{usd(b.lo)} to {usd(b.hi)}</span>
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
            <a className="btn" href="#builds">See the full build</a>
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
