import Link from "next/link";
import { connection } from "next/server";
import { TESTS } from "@/lib/bench";
import { LOCAL_MODELS, estimate, fmtTps, usableGb } from "@/lib/estimate";
import { matchGpu, type Gpu } from "@/lib/gpus";
import { publicRuns } from "@/lib/rigs";
import "@/app/leaderboard/leaderboard.css";

// Leaderboard runs on rigs built only from this card, read fresh on every request. Render it inside <Suspense>.
// Measured numbers are what a spec-sheet site can't show, so they go next to our estimates.

/** Tier S runs the same model and quant as our Qwen3 8B, so its estimate is a like-for-like check. */
const TIER_S_MODEL = LOCAL_MODELS.find(m => m.tag === "qwen3:8b")!;

export default async function MeasuredRuns({ gpu }: { gpu: Gpu }) {
  await connection();
  const runs = (await publicRuns())
    .filter(r => r.gpus.length > 0 && r.gpus.every(x => x.model && matchGpu(x.model) === gpu))
    .sort((a, b) => (b.test.decode_tps ?? 0) - (a.test.decode_tps ?? 0));

  if (!runs.length) {
    return (
      <div className="card panel">
        <b>No measured runs on the {gpu.name} yet</b>
        <p className="small">Everything above is an estimate. Have one? Run our benchmark prompt and your result shows up here and on the leaderboard.</p>
        <p><Link className="btn" href="/leaderboard#rigs" data-umami-event="leaderboard_join_click" data-umami-event-location="gpu-page">Add your run</Link></p>
      </div>
    );
  }

  const est = estimate(TIER_S_MODEL, gpu.bw, usableGb(gpu, gpu.vram[0]));
  return (
    <div className="card panel">
      <div className="board-scroll">
        <table className="board">
          <thead><tr><th>Rig</th><th>Test</th><th className="num">Cards</th><th>Engine</th><th className="num">Generation <span>tok/s</span></th><th>Date</th></tr></thead>
          <tbody>
            {runs.map(r => (
              <tr key={r.id}>
                <td>{r.handle}</td>
                <td>Tier {r.tier} · {TESTS.find(t => t.tier === r.tier)?.model}</td>
                <td className="num">{r.gpus.length}</td>
                <td>{r.engine.name}</td>
                <td className="num hit">{fmtTps(r.test.decode_tps ?? 0)}</td>
                <td>{r.date ?? r.submitted.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small">Tier S is Qwen3 8B at Q4_K_M; we estimate about {fmtTps(est.tps)} tok/s for it on one {gpu.name}. <Link href="/leaderboard">See the full leaderboard</Link>.</p>
    </div>
  );
}
