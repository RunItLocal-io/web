// GET: every run on the board, for agents and anyone else. POST ?t=<token>: the agent submits its benchmark JSON.

import { validate } from "@/lib/bench";
import { publicRuns, submitRun } from "@/lib/rigs";
import { serverEvent } from "@/lib/umami";

const MAX_BYTES = 64 * 1024;

export async function GET() {
  return Response.json({ schema: "runitlocal-board/1", runs: await publicRuns() });
}

export async function POST(req: Request) {
  const token = new URL(req.url).searchParams.get("t") ?? "";
  if (!token) return Response.json({ error: "Missing ?t=. Use the submit link from your prompt." }, { status: 400 });
  const text = await req.text();
  if (text.length > MAX_BYTES) return Response.json({ error: "That's too big for one benchmark result." }, { status: 413 });
  const v = validate(text);
  if (v.errors.length || !v.clean) return Response.json({ error: "The JSON didn't pass checks.", errors: v.errors }, { status: 400 });
  const r = await submitRun(token, v.clean);
  if (!r.ok) return Response.json({ error: r.error }, { status: r.status });
  // No browser is involved when an agent posts, so the event goes from here. utm_* ties it to the post that sent them.
  await serverEvent(req, "leaderboard_run_submitted", "/leaderboard", {
    tier: r.tier, gpu: v.clean.gpus[0]?.model ?? "unknown", tok_s: Math.round((v.clean.test.decode_tps ?? 0) * 10) / 10, ...r.utm,
  });
  const origin = new URL(req.url).origin;
  return Response.json({ ok: true, message: `Added. You're #${r.rank} of ${r.of} on the Tier ${r.tier} board.`, rank: r.rank, of: r.of, board: `${origin}/leaderboard#rig-${r.id}` });
}
