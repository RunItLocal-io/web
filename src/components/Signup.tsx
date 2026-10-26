"use client";

import { useState, type FormEvent } from "react";
import { EMAIL_RE } from "@/lib/bench";

// Validates only. Signups need a backend (mailing list or database) before they can be stored.
export default function Signup() {
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    if (!EMAIL_RE.test(email)) return setMsg({ kind: "err", text: "That email doesn't look right. Check it and try again." });
    setMsg({ kind: "err", text: "Signups open when runitlocal.io launches." });
  }

  return (
    <>
      <form className="signup" onSubmit={onSubmit} noValidate>
        <label htmlFor="email" className="sr">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" placeholder="Get lab notes by email" maxLength={120} />
        <button className="btn" type="submit">Subscribe</button>
      </form>
      <div role="status">{msg && <p className={"msg " + msg.kind}>{msg.text}</p>}</div>
    </>
  );
}
