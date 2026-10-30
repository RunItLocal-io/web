"use client";

import { useState, type FormEvent } from "react";
import { EMAIL_RE } from "@/lib/bench";
import { track, utm } from "@/lib/analytics";

// Podcast sign-up. Posts to /api/subscribe; the hidden "website" field catches bots. A success is a "signup"
// event in Umami (source, page, utm_*) and a failure is "signup_fail" (source, page, error), never the address.
export default function Signup({ source = "site", cta = "Subscribe", placeholder = "you@example.com" }: { source?: string; cta?: string; placeholder?: string }) {
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget, f = new FormData(form);
    const email = String(f.get("email") ?? "").trim();
    if (!EMAIL_RE.test(email)) {
      track("signup_fail", { source, page: location.pathname, error: "bad_email" });
      return setMsg({ kind: "err", text: "That email doesn't look right. Check it and try again." });
    }
    setBusy(true);
    try {
      const res = await fetch("/api/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, name: String(f.get("name") ?? "").trim(), source, website: f.get("website") }) });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Couldn't sign you up just now. Try again in a minute.");
      if (!f.get("website")) track("signup", { source, page: location.pathname, ...utm() });
      setMsg({ kind: "ok", text: "You're in. New episodes and lab notes come straight to your inbox." });
      form.reset();
    } catch (err) {
      track("signup_fail", { source, page: location.pathname, error: (err instanceof Error ? err.message : "unknown").slice(0, 100) });
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Couldn't sign you up just now." });
    }
    setBusy(false);
  }

  return (
    <div className="signup-wrap">
      <form className="signup" onSubmit={onSubmit} noValidate>
        <label htmlFor={`name-${source}`} className="sr">Name (optional)</label>
        <input id={`name-${source}`} name="name" type="text" autoComplete="name" placeholder="Name (optional)" maxLength={80} />
        <label htmlFor={`email-${source}`} className="sr">Email</label>
        <input id={`email-${source}`} name="email" type="email" autoComplete="email" placeholder={placeholder} maxLength={120} />
        <input name="website" tabIndex={-1} autoComplete="off" className="trap" aria-hidden="true" />
        <button className="btn" type="submit" disabled={busy}>{busy ? "Joining…" : cta}</button>
      </form>
      <div role="status">{msg && <p className={"msg " + msg.kind}>{msg.text}</p>}</div>
    </div>
  );
}
