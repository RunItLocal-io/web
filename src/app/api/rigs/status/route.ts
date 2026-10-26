// The leaderboard page polls this while it waits for the agent to submit.

import { claimStatus } from "@/lib/rigs";

export async function GET(req: Request) {
  const s = await claimStatus(new URL(req.url).searchParams.get("t") ?? "");
  return s ? Response.json(s) : Response.json({ error: "Unknown or expired link." }, { status: 404 });
}
