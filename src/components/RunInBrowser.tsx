"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import type { MLCEngine } from "@mlc-ai/web-llm";
import { pulse } from "@/components/DieField";
import type { WebGpuInfo } from "@/lib/detect";

// Runs a small model on the visitor's own GPU with WebLLM (WebGPU). The weights download once from
// Hugging Face and are cached by the browser; after that it works offline.

const CHOICES = [
  { id: "Llama-3.2-1B-Instruct", label: "Llama 3.2 1B", size: "about 0.7 GB", minGb: 0 },
  { id: "Llama-3.2-3B-Instruct", label: "Llama 3.2 3B", size: "about 1.8 GB", minGb: 6 },
];

const FIRST_PROMPT = "In three short sentences: why would someone run AI on their own computer instead of the cloud?";
const TRACE_LEN = 48;

/** Assistant replies keep their streamed chunks so each one can glow in as it arrives. */
type Line = { role: "user" | "assistant"; content: string; chunks?: string[] };

export default function RunInBrowser({ webgpu, gpuName, usableGb }: { webgpu: WebGpuInfo | null; gpuName: string | null; usableGb: number }) {
  const [choice, setChoice] = useState(0);
  const [phase, setPhase] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [progress, setProgress] = useState({ p: 0, text: "" });
  const [error, setError] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [tps, setTps] = useState<number | null>(null);
  const [trace, setTrace] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const engine = useRef<MLCEngine | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => { engine.current?.unload(); }, []);
  useEffect(() => { const el = logRef.current; if (el) el.scrollTop = el.scrollHeight; }, [lines]);

  const choices = CHOICES.filter(c => usableGb >= c.minGb);
  const model = choices[Math.min(choice, choices.length - 1)];
  const where = gpuName ? "your " + gpuName : "your GPU";

  async function send(text: string, history: Line[]) {
    const e = engine.current; if (!e) return;
    const msgs: Line[] = [...history, { role: "user", content: text }];
    setLines([...msgs, { role: "assistant", content: "", chunks: [] }]);
    setBusy(true); setTps(null); setTrace([]);
    const chunks: string[] = [], stamps: number[] = [];
    let first = 0;
    try {
      const stream = await e.chat.completions.create({
        messages: msgs.slice(-8).map(({ role, content }) => ({ role, content })),
        stream: true, stream_options: { include_usage: true }, max_tokens: 400,
      });
      for await (const chunk of stream) {
        const d = chunk.choices[0]?.delta?.content;
        if (d) {
          const now = performance.now();
          if (!first) first = now;
          chunks.push(d); stamps.push(now);
          // instantaneous rate over the last 8 tokens, for the trace
          const k = Math.max(0, stamps.length - 9);
          const inst = stamps.length > 1 ? (stamps.length - 1 - k) / ((now - stamps[k]) / 1000) : 0;
          const avg = (now - first) > 250 ? (chunks.length - 1) / ((now - first) / 1000) : null;
          if (avg) setTps(avg);
          if (inst) setTrace(t => [...t.slice(-(TRACE_LEN - 1)), inst]);
          if (chunks.length % 2 === 0) pulse(.35);
          setLines([...msgs, { role: "assistant", content: chunks.join(""), chunks: chunks.slice() }]);
        }
        const exact = chunk.usage?.extra?.decode_tokens_per_s;
        if (exact) setTps(exact);
      }
    } catch (err) {
      setLines([...msgs, { role: "assistant", content: chunks.join("") + "\n\n[Stopped: " + (err instanceof Error ? err.message : "the GPU gave up") + "]" }]);
    }
    setBusy(false);
  }

  async function start() {
    if (!webgpu?.available) return;
    setPhase("loading"); setError("");
    try {
      const { CreateMLCEngine } = await import("@mlc-ai/web-llm");
      const id = `${model.id}-${webgpu.f16 ? "q4f16_1" : "q4f32_1"}-MLC`;
      engine.current = await CreateMLCEngine(id, { initProgressCallback: r => setProgress({ p: r.progress, text: r.text }) });
      setPhase("ready");
      pulse(2, .5, .5);
      await send(FIRST_PROMPT, []);
    } catch (err) {
      setPhase("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const t = input.trim(); if (!t || busy) return;
    setInput("");
    send(t, lines.filter(l => l.content));
  }

  if (webgpu && !webgpu.available) {
    return (
      <div className="card prove">
        <span className="kicker">Prove it</span>
        <p>Your browser can&apos;t reach the GPU directly (WebGPU is off or unsupported), so the in-tab demo won&apos;t run here. It works in current Chrome and Edge on desktop.</p>
        <p><Link className="more" href="/try">Chat with bigger models on our rack instead</Link></p>
      </div>
    );
  }

  const peak = Math.max(1, ...trace);

  return (
    <div className={"card prove" + (phase === "ready" ? " live" : "")}>
      {phase === "idle" && (
        <div className="prove-idle">
          <div className="prove-head">
            <span className="kicker">Prove it</span>
            <h2>Run a model on <span className="grad">{where}</span>, right in this tab.</h2>
            <p>No install, no account, no cloud. The model downloads once ({model.size}), then runs entirely on your machine. Pull the network cable afterwards and it keeps working.</p>
          </div>
          <div className="prove-go">
            {choices.length > 1 && (
              <div className="seg" role="radiogroup" aria-label="Model size">
                {choices.map((c, i) => (
                  <button key={c.id} type="button" role="radio" aria-checked={c === model} onClick={() => setChoice(i)}>
                    {c.label} <span>{c.size}</span>
                  </button>
                ))}
              </div>
            )}
            <button className="btn big" type="button" onClick={start} disabled={!webgpu}>
              <span className="play" aria-hidden="true" />{webgpu ? "Run it on my GPU" : "Checking your GPU…"}
            </button>
          </div>
        </div>
      )}

      {phase === "loading" && (
        <div className="loading" role="status">
          <div className="load-top">
            <span className="kicker">Loading {model.label} onto {where}</span>
            <span className="load-pct">{Math.round(progress.p * 100)}<small>%</small></span>
          </div>
          <div className="bar"><span style={{ width: `${Math.max(2, Math.round(progress.p * 100))}%` }} /></div>
          <p className="small mono">{progress.text || "Starting…"}</p>
        </div>
      )}

      {phase === "error" && (
        <div className="msg err">
          Couldn&apos;t start the model: {error}
          {" "}Try the smaller model, close other GPU-heavy tabs, or <Link href="/try">chat on our rack</Link>.
          <div className="btns" style={{ marginTop: 10 }}><button className="btn alt" type="button" onClick={() => { setChoice(0); setPhase("idle"); }}>Back</button></div>
        </div>
      )}

      {phase === "ready" && (
        <>
          <div className="meter">
            <div className="meter-read">
              <span className="tps">{tps ? Math.round(tps) : "––"}<small> tok/s</small></span>
              <span className="where"><span className="led" aria-hidden="true" />{model.label} on {where} · in this tab · nothing sent anywhere</span>
            </div>
            <div className="trace" aria-hidden="true">
              {Array.from({ length: TRACE_LEN }, (_, i) => {
                const v = trace[i - (TRACE_LEN - trace.length)];
                return <span key={i} style={{ height: v ? `${Math.max(6, (v / peak) * 100)}%` : "6%" }} className={v ? "on" : ""} />;
              })}
            </div>
          </div>
          <div className="log" ref={logRef} aria-live="polite">
            {lines.map((l, i) => (
              <div key={i} className={"bubble" + (l.role === "user" ? " you" : " bot") + (!l.content ? " wait" : "")}>
                {l.chunks?.length ? l.chunks.map((c, j) => <span key={j} className="tok">{c}</span>) : l.content || "Thinking on your GPU…"}
                {busy && i === lines.length - 1 && l.role === "assistant" && <span className="caret" aria-hidden="true" />}
              </div>
            ))}
          </div>
          <form className="chatform" onSubmit={onSubmit} noValidate>
            <label htmlFor="localin" className="sr">Your message</label>
            <input id="localin" maxLength={2000} placeholder="Ask it anything" autoComplete="off" value={input} onChange={e => setInput(e.target.value)} />
            <button className="btn" type="submit" disabled={busy}>Send</button>
          </form>
          {!busy && <p className="small">Try this: turn off Wi-Fi and ask another question. It still answers, because it was never using the internet. This is a tiny model; the ones listed below are far smarter.</p>}
        </>
      )}
    </div>
  );
}
