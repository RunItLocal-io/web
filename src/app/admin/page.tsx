import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import Page, { PageHead } from "@/components/Page";
import { adminEnabled, isAdmin } from "@/lib/admin";
import { KINDS } from "@/lib/submission-kinds";
import { submissions, type Submission } from "@/lib/submissions";
import { logout, mark, remove } from "./actions";
import Login from "./Login";
import "./admin.css";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

// What people sent in from /learn/posts. Nothing here is public: mark one "used" once it's written up as a post
// (by hand, in content/learn with "kind: post"), or dismiss it.

export default function Admin() {
  return (
    <Page>
      <PageHead kicker="Admin" title="Sent in" />
      <Suspense fallback={<div className="card panel"><p className="small">Loading…</p></div>}>
        <Queue />
      </Suspense>
    </Page>
  );
}

async function Queue() {
  // ADMIN_TOKEN is set at run time, not build time, so nothing here can be prerendered.
  await connection();
  if (!adminEnabled()) return <div className="card panel"><p className="small">Admin is off. Set ADMIN_TOKEN (12 characters or more) in the server&apos;s environment to turn it on.</p></div>;
  if (!(await isAdmin())) return <Login />;
  const all = await submissions();
  const fresh = all.filter(s => s.status === "new"), done = all.filter(s => s.status !== "new");
  return (
    <div className="admin">
      <div className="admin-bar">
        <span className="small">{fresh.length} new · {done.length} handled</span>
        <form action={logout}><button className="linkish" type="submit">Sign out</button></form>
      </div>
      {fresh.length ? fresh.map(s => <Item key={s.id} s={s} />) : <div className="card panel"><p className="small">Nothing new. You&apos;re caught up.</p></div>}
      {done.length > 0 && (
        <details className="admin-done">
          <summary>Used and dismissed ({done.length})</summary>
          {done.map(s => <Item key={s.id} s={s} />)}
        </details>
      )}
    </div>
  );
}

const when = (iso: string) => new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";

function Item({ s }: { s: Submission }) {
  const r = s.run;
  const button = (status: string, label: string) => (
    <form action={mark}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="status" value={status} /><button className="btn outline" type="submit">{label}</button></form>
  );
  return (
    <article className={"card panel admin-item " + s.status}>
      <header>
        <span className="kicker">{KINDS.find(k => k.id === s.kind)?.label ?? s.kind}{s.status !== "new" ? ` · ${s.status}` : ""}</span>
        <h2>{s.title}</h2>
        <p className="small">{when(s.at)} · {s.handle || "no name"}{s.email && <> · <a href={`mailto:${s.email}`}>{s.email}</a></>}{s.hardware && ` · ${s.hardware}`}</p>
      </header>
      {s.body && <p className="admin-body">{s.body}</p>}
      {r && (
        <div className="admin-run">
          <p className="small">
            <b>Benchmark:</b> Tier {r.test.tier} · {r.test.model} {r.test.quant} · <b>{r.test.decode_tps} tok/s</b> generation
            {r.test.prefill_tps["4096"] != null && `, ${r.test.prefill_tps["4096"]} tok/s prefill at 4K`} · {r.engine.name} {r.engine.version}
            {" · "}{r.gpus.map(g => `${g.model} (${g.vram_gb} GB)`).join(", ")}
            {r.telemetry.power_w.avg != null && ` · ${r.telemetry.power_w.avg} W avg`}
          </p>
          <details><summary className="small">Full JSON</summary><pre className="prompt">{JSON.stringify(r, null, 2)}</pre></details>
        </div>
      )}
      {s.utm && <p className="small">Came from {Object.entries(s.utm).map(([k, v]) => `${k}=${v}`).join(" ")}</p>}
      <div className="btns">
        {s.status !== "used" && button("used", "Mark used")}
        {s.status !== "dismissed" && button("dismissed", "Dismiss")}
        {s.status !== "new" && button("new", "Back to new")}
        {s.status === "dismissed" && (
          <form action={remove}><input type="hidden" name="id" value={s.id} /><button className="btn alt" type="submit">Delete for good</button></form>
        )}
      </div>
    </article>
  );
}
