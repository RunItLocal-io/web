"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TESTS, benchPrompt, validate, type Tier } from "@/lib/bench";
import { copyText } from "@/lib/copy";

type Msg = { kind: "ok" | "err"; text: string; list?: string[] } | null;
type Pending = { token: string; tier: Tier | "auto" };

const KEY = "runitlocal:pending-rig";
const POLL_MS = 4000;

// The pending submit link lives in localStorage, so a reload while the agent is still running keeps waiting
// on it. Falls back to memory when storage is blocked.
let mem: string | null = null;
const listeners = new Set<() => void>();
const readStored = () => { try { return localStorage.getItem(KEY); } catch { return mem; } };
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
function store(p: Pending | null) {
  mem = p && JSON.stringify(p);
  try { if (mem) localStorage.setItem(KEY, mem); else localStorage.removeItem(KEY); } catch {}
  listeners.forEach(l => l());
}

// Pick a test, give a name, get a prompt with a one-time submit link. The agent posts its result itself; this
// page polls until it lands, then refreshes the board. Pasting the JSON by hand uses the same link.
export default function AddRig() {
  const router = useRouter();
  const promptRef = useRef<HTMLPreElement>(null);
  const [tier, setTier] = useState<Tier | "auto">("auto");
  const raw = useSyncExternalStore(subscribe, readStored, () => null);
  const pending = useMemo(() => { try { return JSON.parse(raw ?? "null") as Pending | null; } catch { return null; } }, [raw]);
  const [busy, setBusy] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");
  const [msg, setMsg] = useState<Msg>(null);

  const finish = useCallback((text: string) => {
    store(null);
    setMsg({ kind: "ok", text });
    router.refresh();
  }, [router]);

  const token = pending?.token;
  useEffect(() => {
    if (!token) return;
    const id = setInterval(async () => {
      const res = await fetch("/api/rigs/status?t=" + token).catch(() => null);
      if (res?.status === 404) return store(null);
      const s = await res?.json().catch(() => null) as { done?: boolean; rank?: number; of?: number; tier?: Tier; id?: string } | null;
      if (s?.done) {
        finish(`Your rig is on the board: #${s.rank} of ${s.of} on Tier ${s.tier}.`);
        setTimeout(() => document.getElementById("rig-" + s.id)?.scrollIntoView({ behavior: "smooth", block: "center" }), 600);
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [token, finish]);

  const submitUrl = pending ? `${location.origin}/api/rigs?t=${pending.token}` : "";
  const prompt = pending ? benchPrompt({ tier: pending.tier === "auto" ? undefined : pending.tier, submitUrl }) : "";

  async function onStart(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true); setMsg(null); setCopyMsg("");
    const res = await fetch("/api/rigs/claim", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle: f.get("righandle"), use: f.get("riguse"), tier }) }).catch(() => null);
    const j = await res?.json().catch(() => null) as { token?: string; error?: string } | null;
    setBusy(false);
    if (!j?.token) return setMsg({ kind: "err", text: j?.error ?? "Couldn't reach the board. Try again in a minute." });
    store({ token: j.token, tier });
  }

  async function onPaste(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pending) return;
    const text = String(new FormData(e.currentTarget).get("rigjson") ?? "");
    const v = validate(text);
    if (v.errors.length) return setMsg({ kind: "err", text: "Fix these and try again:", list: v.errors });
    const res = await fetch("/api/rigs?t=" + pending.token, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v.clean) }).catch(() => null);
    const j = await res?.json().catch(() => null) as { message?: string; error?: string; errors?: string[] } | null;
    if (res?.ok && j?.message) return finish(j.message);
    setMsg({ kind: "err", text: j?.error ?? "Couldn't reach the board. Try again in a minute.", list: j?.errors });
  }

  function onCopy() {
    copyText(prompt, promptRef.current,
      () => setCopyMsg("Copied. Paste it into your agent."),
      () => setCopyMsg("Selected. Press Ctrl+C or ⌘C."));
  }

  function startOver() {
    store(null); setMsg(null);
  }

  const status = (
    <div role="status">
      {msg && (
        <div className={"msg " + msg.kind}>
          {msg.text}
          {msg.list && <ul>{msg.list.map(x => <li key={x}>{x}</li>)}</ul>}
        </div>
      )}
    </div>
  );

  if (!pending) return (
    <form className="card panel" onSubmit={onStart}>
      <fieldset className="picks">
        <legend>1. Pick a test</legend>
        <label className={"pick" + (tier === "auto" ? " on" : "")}>
          <input type="radio" name="tier" checked={tier === "auto"} onChange={() => setTier("auto")} />
          <b>Let my agent pick</b><span className="small">The biggest test that fits your GPUs</span>
        </label>
        {TESTS.map(t => (
          <label key={t.tier} className={"pick" + (tier === t.tier ? " on" : "")}>
            <input type="radio" name="tier" checked={tier === t.tier} onChange={() => setTier(t.tier)} />
            <b>Tier {t.tier} · {t.model}</b><span className="small">{t.fits}</span>
          </label>
        ))}
      </fieldset>
      <div className="two">
        <label htmlFor="righandle">2. Your name or handle<input id="righandle" name="righandle" maxLength={40} placeholder="Shown on the board" /></label>
        <label htmlFor="riguse">What you use it for, optional<input id="riguse" name="riguse" maxLength={80} placeholder="Coding, home lab, video…" /></label>
      </div>
      <div className="btns"><button className="btn" type="submit" disabled={busy}>{busy ? "Getting your prompt…" : "Get my prompt"}</button></div>
      {status}
    </form>
  );

  return (
    <div className="connect">
      <div className="card panel">
        <ol className="steps3">
          <li>Copy the prompt. It has your own submit link in it.</li>
          <li>Paste it into Claude Code, Codex, OpenClaw, Hermes or whatever agent runs on your machine.</li>
          <li>It runs the test, shows you the result, and posts it here once you say yes.</li>
        </ol>
        <div className="btns"><button className="btn" type="button" onClick={onCopy}>Copy the prompt</button><span className="small" role="status">{copyMsg}</span></div>
        <pre className="prompt" ref={promptRef} tabIndex={0}>{prompt}</pre>
      </div>
      <form className="card panel" onSubmit={onPaste} noValidate>
        <p className="waiting"><span className="led" aria-hidden="true" />Waiting for your agent… This page updates when your run lands.</p>
        <label htmlFor="rigjson">Agent can&apos;t send it? Paste the JSON here instead
          <textarea className="json" id="rigjson" name="rigjson" spellCheck={false} placeholder='{ "schema": "runitlocal-bench/1", ... }' />
        </label>
        <div className="btns">
          <button className="btn" type="submit">Add my rig</button>
          <button className="btn alt" type="button" onClick={startOver}>Start over</button>
        </div>
        {status}
      </form>
    </div>
  );
}
