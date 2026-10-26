"use client";

import { useRef, useState, type FormEvent } from "react";
import { BENCH_PROMPT, EMAIL_RE, validate } from "@/lib/bench";
import { copyText } from "@/lib/copy";

type Msg = { kind: "ok" | "err"; text: string; list?: string[] } | null;

// Submissions are validated in the browser for now. Saving to the board needs a backend; until then the
// form says so instead of pretending to store anything.
export default function AddRig() {
  const promptRef = useRef<HTMLPreElement>(null);
  const [copyMsg, setCopyMsg] = useState("");
  const [msg, setMsg] = useState<Msg>(null);

  function onCopy() {
    copyText(BENCH_PROMPT, promptRef.current,
      () => setCopyMsg("Copied. Paste it into your agent."),
      () => setCopyMsg("Selected. Press Ctrl+C or ⌘C."));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = validate(String(f.get("rigjson") ?? ""));
    if (v.errors.length) return setMsg({ kind: "err", text: "Fix these and try again:", list: v.errors });
    const email = String(f.get("rigemail") ?? "").trim();
    if (email && !EMAIL_RE.test(email)) return setMsg({ kind: "err", text: "That email doesn't look right. Fix it or leave it blank." });
    setMsg({ kind: "err", text: "Your JSON checks out. Saving opens when runitlocal.io launches." });
  }

  return (
    <>
      <div className="connect">
        <div className="card panel">
          <ol className="steps3">
            <li>Copy the prompt.</li>
            <li>Paste it into Claude Code, Codex, OpenClaw, Hermes or whatever agent runs on your machine.</li>
            <li>Paste the JSON it prints into the box on the right.</li>
          </ol>
          <div className="btns"><button className="btn" type="button" onClick={onCopy}>Copy the prompt</button><span className="small" role="status">{copyMsg}</span></div>
          <pre className="prompt" ref={promptRef} tabIndex={0}>{BENCH_PROMPT}</pre>
        </div>
        <form className="card panel" onSubmit={onSubmit} noValidate>
          <label htmlFor="rigjson">Your benchmark JSON
            <textarea className="json" id="rigjson" name="rigjson" spellCheck={false} placeholder='{ "schema": "runitlocal-bench/1", ... }' />
          </label>
          <div className="two">
            <label htmlFor="righandle">Name or handle, optional<input id="righandle" name="righandle" maxLength={40} placeholder="Shown on the board" /></label>
            <label htmlFor="riguse">What you use it for, optional<input id="riguse" name="riguse" maxLength={80} placeholder="Coding, home lab, video…" /></label>
          </div>
          <label htmlFor="rigemail">Email, optional<input id="rigemail" name="rigemail" type="email" maxLength={120} placeholder="Only if you want us to reach out. Never shown." /></label>
          <div className="btns"><button className="btn" type="submit">Add my rig</button></div>
          <div role="status">
            {msg && (
              <div className={"msg " + msg.kind}>
                {msg.text}
                {msg.list && <ul>{msg.list.map(x => <li key={x}>{x}</li>)}</ul>}
              </div>
            )}
          </div>
        </form>
      </div>
      <div className="card panel">
        <div className="panel-head">
          <h3>Community rigs</h3>
          <a className="more" href="https://claude.ai/artifact/Ci55mmJWhp3J16mq6xgVa4">Full leaderboard</a>
        </div>
        <div className="rigs"><p className="small">No community rigs yet. Yours could be the first on the board.</p></div>
      </div>
    </>
  );
}
