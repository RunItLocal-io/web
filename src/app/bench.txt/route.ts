// The benchmark prompt as plain text, so "read runitlocal.io/bench.txt and follow it" works in any agent.

import { BENCH_PROMPT } from "@/lib/bench";

export function GET() {
  return new Response(BENCH_PROMPT + "\n", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
