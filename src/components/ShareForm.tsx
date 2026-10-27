"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { BENCH_PROMPT, validate } from "@/lib/bench";
import { utm } from "@/lib/analytics";
import { copyText } from "@/lib/copy";
import { KINDS, type Kind } from "@/lib/submission-kinds";

type Msg = { kind: "ok" | "err"; text: string; list?: string[] } | null;

// Send us a run, a tip, a fix or a build. It goes to a private queue we read; nothing is published automatically.
// For a run, our benchmark prompt can do the measuring, and its JSON goes in the box at the bottom.
export default function ShareForm() {
  const promptRef = useRef<HTMLPreElement>(null);
  const [kind, setKind] = useState<Kind>("run");
  const [busy, setBusy] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");
  const [msg, setMsg] = useState<Msg>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget, f = new FormData(form);
    const json = String(f.get("json") ?? "").trim();
    if (json) {
      const v = validate(json);
      if (v.errors.length) return setMsg({ kind: "err", text: "The benchmark JSON needs a fix:", list: v.errors });
    }
    setBusy(true); setMsg(null);
    const res = await fetch("/api/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      kind, title: f.get("title"), body: f.get("body"), hardware: f.get("hardware"), handle: f.get("handle"), email: f.get("email"),
      json, website: f.get("website"), utm: utm(),
    }) }).catch(() => null);
    const j = await res?.json().catch(() => null) as { ok?: boolean; error?: string; errors?: string[] } | null;
    setBusy(false);
    if (!res?.ok || !j?.ok) return setMsg({ kind: "err", text: j?.error ?? "Couldn't send it just now. Try again in a minute.", list: j?.errors });
    form.reset(); setKind("run");
    setMsg({ kind: "ok", text: "Got it, thank you. We read everything that comes in. If we write it up, we'll credit you by the name you gave." });
  }

  function onCopy() {
    copyText(BENCH_PROMPT, promptRef.current,
      () => setCopyMsg("Copied. Paste it into your agent."),
      () => setCopyMsg("Selected. Press Ctrl+C or ⌘C."));
  }

  return (
    <form className="card panel share-form" onSubmit={onSubmit} noValidate>
      <fieldset className="picks">
        <legend>What are you sending?</legend>
        {KINDS.map(k => (
          <label key={k.id} className={"pick" + (kind === k.id ? " on" : "")}>
            <input type="radio" name="kind" checked={kind === k.id} onChange={() => setKind(k.id)} />
            <b>{k.label}</b><span className="small">{k.hint}</span>
          </label>
        ))}
      </fieldset>
      <label htmlFor="share-title">Title
        <input id="share-title" name="title" maxLength={120} placeholder={kind === "run" ? "Qwen3 32B on two 3090s" : kind === "fix" ? "Ollama ignored my second GPU" : "In a few words"} />
      </label>
      <label htmlFor="share-body">{kind === "run" ? "What you ran and what you got" : "Tell us about it"}
        <textarea id="share-body" name="body" maxLength={4000} rows={6}
          placeholder={kind === "run" ? "Model, quant, engine, context length, the tok/s you saw, and anything odd." : "As much or as little as you like."} />
      </label>
      <div className="two">
        <label htmlFor="share-hw">Your hardware, optional<input id="share-hw" name="hardware" maxLength={120} placeholder="2× RTX 3090, 64 GB RAM" /></label>
        <label htmlFor="share-handle">Name to credit, optional<input id="share-handle" name="handle" maxLength={40} placeholder="Sam R., or a handle" /></label>
      </div>
      <label htmlFor="share-email">Email, optional
        <input id="share-email" name="email" type="email" autoComplete="email" maxLength={120} placeholder="Only so we can say thanks or ask a question. Never shown." />
      </label>
      {kind === "run" && (
        <details className="share-bench">
          <summary>Want a number that compares? Use our benchmark prompt</summary>
          <p className="small">Paste it into an agent that runs on your machine, like Claude Code or Codex. It runs one fixed test with llama-bench, asks before it downloads or installs anything, and prints a JSON result without hostnames, paths or serials. <Link href="/learn/how-we-benchmark">What it measures</Link>.</p>
          <div className="btns"><button className="btn outline" type="button" onClick={onCopy}>Copy the prompt</button><span className="small" role="status">{copyMsg}</span></div>
          <pre className="prompt" ref={promptRef} tabIndex={0}>{BENCH_PROMPT}</pre>
          <label htmlFor="share-json">Then paste the JSON it printed
            <textarea className="json" id="share-json" name="json" spellCheck={false} placeholder='{ "schema": "runitlocal-bench/1", ... }' />
          </label>
        </details>
      )}
      <input name="website" tabIndex={-1} autoComplete="off" className="trap" aria-hidden="true" />
      <div className="btns"><button className="btn" type="submit" disabled={busy} data-umami-event="share_submit_click" data-umami-event-kind={kind}>{busy ? "Sending…" : "Send it to us"}</button></div>
      <p className="small">We read everything, and nothing goes on the site without us. The best ones become posts, with credit if you gave a name.</p>
      <div role="status">
        {msg && (
          <div className={"msg " + msg.kind}>
            {msg.text}
            {msg.list && <ul>{msg.list.map(x => <li key={x}>{x}</li>)}</ul>}
          </div>
        )}
      </div>
    </form>
  );
}
