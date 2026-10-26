"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Receipt = { hardware?: string; model?: string; tok_s?: number; power_cents?: number; example?: boolean };
type Entry =
  | { kind: "you" | "bot" | "wait"; text: string }
  | { kind: "receipt"; receipt: Receipt };
type ChatMsg = { role: "user" | "assistant"; content: string };

// Posts to the site's /api/chat, or NEXT_PUBLIC_RIL_API_BASE + /chat when the rack API lives elsewhere.
const API_BASE = process.env.NEXT_PUBLIC_RIL_API_BASE || "/api";

const EXAMPLE: Entry[] = [
  { kind: "you", text: "What's a quantized model, in two sentences?" },
  { kind: "bot", text: "Quantizing stores a model's weights with fewer bits, like 4 instead of 16, so it needs a quarter of the memory and runs faster. You lose a little accuracy, usually too little to notice day to day." },
  { kind: "receipt", receipt: { example: true, hardware: "2× RTX A4500", model: "Qwen3.6-35B-A3B, 4-bit", tok_s: 110, power_cents: 0.001 } },
];

function ReceiptRow({ r }: { r: Receipt }) {
  const items: [string, string | null][] = [
    ["Ran on", r.hardware ?? null],
    ["Model", r.model ?? null],
    ["Speed", r.tok_s != null ? Math.round(r.tok_s) + " tok/s" : null],
    ["Power", r.power_cents != null ? r.power_cents.toFixed(3) + "¢" : null],
  ];
  return (
    <div className="receipt">
      {r.example && <span className="ex">Example</span>}
      {items.filter(([, v]) => v).map(([k, v]) => <span key={k}><b>{k}</b>{v}</span>)}
    </div>
  );
}

export default function ChatDemo() {
  const [log, setLog] = useState<Entry[]>(EXAMPLE);
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = logRef.current;
    if (el && log !== EXAMPLE) el.scrollTop = el.scrollHeight;
  }, [log]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim(); if (!text) return;
    setInput(""); setBusy(true);
    const history: ChatMsg[] = [...chat, { role: "user", content: text }];
    setLog(l => [...l, { kind: "you", text }, { kind: "wait", text: "Thinking on the rack…" }]);
    const replaceWait = (...next: Entry[]) => setLog(l => [...l.slice(0, -1), ...next]);
    try {
      const res = await fetch(API_BASE + "/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: history.slice(-6) }) });
      const data = await res.json().catch(() => null);
      if (res.status === 429) throw new Error((data && data.error) || "That's today's 20 free messages. Come back tomorrow.");
      if (!res.ok || !data || typeof data.reply !== "string") throw new Error("The live demo connects when runitlocal.io launches. The example above shows what you'll get.");
      setChat([...history, { role: "assistant", content: data.reply }]);
      replaceWait({ kind: "bot", text: data.reply }, ...(data.receipt ? [{ kind: "receipt", receipt: data.receipt } as Entry] : []));
    } catch (err) {
      replaceWait({ kind: "wait", text: err instanceof Error ? err.message : "Couldn't reach the rack just now. Try again in a minute." });
    }
    setBusy(false);
  }

  return (
    <div className="card demo">
      <div className="log" ref={logRef} aria-live="polite">
        {log.map((x, i) => x.kind === "receipt"
          ? <ReceiptRow key={i} r={x.receipt} />
          : <div key={i} className={"bubble" + (x.kind === "bot" ? "" : " " + x.kind)}>{x.text}</div>)}
      </div>
      <form className="chatform" onSubmit={onSubmit} noValidate>
        <label htmlFor="chatin" className="sr">Your message</label>
        <input id="chatin" maxLength={2000} placeholder="Ask anything" autoComplete="off" value={input} onChange={e => setInput(e.target.value)} />
        <button className="btn" type="submit" disabled={busy}>Send</button>
      </form>
      <p className="small">20 free messages a day. Nothing you type is stored.</p>
    </div>
  );
}
