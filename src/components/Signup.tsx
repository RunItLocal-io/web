"use client";

import { useState, type FormEvent } from "react";
import { EMAIL_RE } from "@/lib/bench";

// Podcast sign-up. Posts to /api/subscribe; the hidden "website" field catches bots.
export default function Signup({ source = "site", cta = "Subscribe", placeholder = "you@example.com" }: { source?: string; cta?: string; placeholder?: string }) {
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget, f = new FormData(form);
    const email = String(f.get("email") ?? "").trim();
    if (!EMAIL_RE.test(email)) return setMsg({ kind: "err", text: "That email doesn't look right. Check it and try again." });
    setBusy(true);
    try {
      const res = await fetch("/api/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, source, website: f.get("website") }) });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Couldn't sign you up just now. Try again in a minute.");
      setMsg({ kind: "ok", text: "You're in. New episodes and lab notes come straight to your inbox." });
      form.reset();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Couldn't sign you up just now." });
    }
    setBusy(false);
  }

  return (
    <div className="signup-wrap">
      <form className="signup" onSubmit={onSubmit} noValidate>
        <label htmlFor={`email-${source}`} className="sr">Email</label>
        <input id={`email-${source}`} name="email" type="email" autoComplete="email" placeholder={placeholder} maxLength={120} />
        <input name="website" tabIndex={-1} autoComplete="off" className="trap" aria-hidden="true" />
        <button className="btn" type="submit" disabled={busy}>{busy ? "Joining…" : cta}</button>
      </form>
      <div role="status">{msg && <p className={"msg " + msg.kind}>{msg.text}</p>}</div>
    </div>
  );
}
