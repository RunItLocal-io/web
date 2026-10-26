// Machine-readable version of what the site recommends, for agents. Built once at build time from the same
// tables the pages use, so it never drifts from what people see.

import { BUILDS } from "@/lib/builds";
import { LOCAL_MODELS, rateAll, usableGb } from "@/lib/estimate";
import { GPUS, gpuSlug } from "@/lib/gpus";

export function GET() {
  const gpus = GPUS.filter(g => g.kind !== "integrated").flatMap(g => g.vram.map(mem => {
    const usable = usableGb(g, mem);
    return {
      gpu: g.name, link: `https://runitlocal.io/?gpu=${gpuSlug(g)}&mem=${mem}`, vendor: g.vendor, kind: g.kind, memory_gb: mem, usable_gb: Math.round(usable * 10) / 10, bandwidth_gbs: g.bw,
      runs: rateAll(g.bw, usable).filter(r => r.fits).map(r => ({ model: r.name, ollama: r.tag, est_tps: Math.round(r.tps), verdict: r.verdict })),
    };
  }));
  return Response.json({
    schema: "runitlocal-models/1",
    note: "Speeds are estimates: memory bandwidth ÷ active weight size × efficiency, single card, default Ollama quant. Measured community runs will replace them as rigs are added.",
    models: LOCAL_MODELS.map(m => ({ model: m.name, ollama: m.tag, file_gb: m.file, active_gb: m.active, moe: m.active < m.file, good_for: m.blurb })),
    builds: BUILDS.map(b => ({ tier: b.tier, name: b.name, usd: [b.lo, b.hi], usable_gb: b.vram, bandwidth_gbs: b.bw, power: b.power, measured: b.measured ?? null, why: b.why, parts: b.bom, gotcha: b.gotcha })),
    gpus,
  });
}
