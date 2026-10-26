import { connection } from "next/server";
import { TESTS } from "@/lib/bench";
import { referenceRun, type ReferenceRun } from "@/lib/reference-runs";
import { allRuns, ranked, type Run } from "@/lib/rigs";

// The community leaderboard, read fresh on every request. Render it inside <Suspense>.

function gpuLine(r: { gpus: { model: string | null; vram_gb: number | null }[] }) {
  const counts = new Map<string, { n: number; gb: number }>();
  for (const g of r.gpus) {
    const k = g.model ?? "Unknown GPU";
    const c = counts.get(k) ?? { n: 0, gb: 0 };
    counts.set(k, { n: c.n + 1, gb: c.gb + (g.vram_gb ?? 0) });
  }
  return [...counts].map(([m, c]) => (c.n > 1 ? `${c.n}× ` : "") + m + (c.gb ? ` · ${Math.round(c.gb)} GB` : "")).join(" + ");
}

const n0 = (v: number | null | undefined) => v == null ? "–" : Math.round(v).toLocaleString("en-US");
const n2 = (v: number | null | undefined) => v == null ? "–" : v.toFixed(2);

export default async function Board() {
  await connection();
  const runs = await allRuns();
  return (
    <div className="boards">
      {TESTS.map(t => {
        const rows = ranked(runs, t.tier);
        // Our reference run sits where its speed puts it, but community ranks count only community runs.
        const ref = referenceRun(t.tier);
        const at = ref ? rows.findIndex(r => (r.test.decode_tps ?? 0) < (ref.decode_tps ?? 0)) : -1;
        const list: (Run | ReferenceRun)[] = ref ? (at < 0 ? [...rows, ref] : [...rows.slice(0, at), ref, ...rows.slice(at)]) : rows;
        return (
          <div className="card panel" key={t.tier}>
            <div className="panel-head">
              <h3>Tier {t.tier} · {t.model} <span className="small">{t.quant}</span></h3>
              <span className="small">{t.fits} · ranked by generation speed</span>
            </div>
            {list.length ? (
              <div className="board-scroll">
                <table className="board">
                  <thead>
                    <tr><th>#</th><th>Rig</th><th>Engine</th><th className="num">Prompt tok/s<br /><span>4K ctx</span></th><th className="num">Gen tok/s</th><th className="num">Avg W</th><th className="num">J / token</th></tr>
                  </thead>
                  <tbody>
                    {list.map(r => "id" in r ? (
                      <tr key={r.id} id={"rig-" + r.id}>
                        <td className="rank">{rows.indexOf(r) + 1}</td>
                        <td><b>{r.handle}</b>{r.use && <span className="small"> · {r.use}</span>}<div className="small">{gpuLine(r)}</div></td>
                        <td className="small">{r.engine.name ?? "–"}</td>
                        <td className="num">{n0(r.test.prefill_tps["4096"])}</td>
                        <td className="num hit">{n0(r.test.decode_tps)}</td>
                        <td className="num">{n0(r.telemetry.power_w.avg)}</td>
                        <td className="num">{n2(r.derived.joules_per_token)}</td>
                      </tr>
                    ) : (
                      <tr key="ref" className="ref-run">
                        <td className="rank" title="Not ranked">Ref</td>
                        <td><b>{r.handle}</b><span className="ref-tag">Reference run</span><div className="small">{gpuLine(r)}</div></td>
                        <td className="small">{r.engine}</td>
                        <td className="num">{n0(r.prefill_4096)}</td>
                        <td className="num hit">{n0(r.decode_tps)}</td>
                        <td className="num">{n0(r.power_w)}</td>
                        <td className="num">{n2(r.joules_per_token)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="small">No Tier {t.tier} runs yet. Yours could be the first on the board.</p>}
            {ref && !rows.length && <p className="small">Our reference run is up; yours could be the first community run on this board.</p>}
          </div>
        );
      })}
    </div>
  );
}
