// The benchmark prompt people paste into their local agent, and the validator for the JSON it prints back.

/** The tests people can pick. Results are only ranked against runs of the same test. */
export const TESTS = [
  { tier: "S", model: "Qwen3-8B", quant: "Q4_K_M", fits: "Any GPU with 8 GB or more" },
  { tier: "M", model: "Qwen3.6-35B-A3B", quant: "UD-Q4_K_M", fits: "24 GB or more in total" },
] as const;

export type Tier = (typeof TESTS)[number]["tier"];

const STEP2_AUTO = `STEP 2: PICK THE TEST TIER
Pick the largest tier that fits in total GPU memory (or unified memory on Apple Silicon), and tell me which one you picked before continuing:
- Tier S (under 24 GB total): Qwen3-8B, Q4_K_M GGUF
- Tier M (24 GB or more total): Qwen3.6-35B-A3B, unsloth UD-Q4_K_M GGUF
If the model file is not already on disk, tell me the file name and size and ask before downloading it.`;

const step2Fixed = (t: (typeof TESTS)[number]) => `STEP 2: THE TEST
Use Tier ${t.tier}: ${t.model}, ${t.tier === "M" ? "unsloth " : ""}${t.quant} GGUF. If it does not fit in total GPU memory (or unified memory on Apple Silicon), stop and tell me.
If the model file is not already on disk, tell me the file name and size and ask before downloading it.`;

const FINISH_PASTE = "When you're done, tell me to paste the JSON at runitlocal.io under Submit.";

const finishPost = (url: string) => `STEP 5: SUBMIT
Save the JSON to a file, show it to me, and once I say yes, send it to the RunItLocal.io leaderboard:
curl -sS -X POST "${url}" -H "Content-Type: application/json" --data-binary @<file>
(On Windows without curl, use Invoke-RestMethod -Method Post -ContentType "application/json" -InFile <file> -Uri "${url}".)
Show me the response. It says where my rig landed on the board. The link works once.`;

/** The prompt for one run: a picked test or auto, and either a one-time submit link or the paste-it-back ending. */
export function benchPrompt({ tier, submitUrl }: { tier?: Tier; submitUrl?: string } = {}) {
  const t = TESTS.find(x => x.tier === tier);
  return BASE.replace("{{STEP2}}", t ? step2Fixed(t) : STEP2_AUTO).replace("{{FINISH}}", submitUrl ? finishPost(submitUrl) : FINISH_PASTE);
}

const BASE = `You are running the RunItLocal.io benchmark on this machine. Work step by step, show me each command before you run it, and do not install anything, download anything, or use sudo without asking me first. Do not change any system settings.

PRIVACY: Never include hostnames, usernames, IP or MAC addresses, serial numbers, UUIDs, file paths under my home folder, or anything from my environment variables in the output.

STEP 1: HARDWARE AND SOFTWARE
Detect, using only read-only commands that fit this OS (Linux, Windows or macOS):
- OS name and version, kernel
- CPU model, physical cores, threads, max clock
- RAM total in GB, speed in MT/s if available, number of DIMMs if available
- Motherboard model if available
- Each GPU: model, VRAM in GB, driver version, CUDA/ROCm/Metal version, power limit in W, current PCIe generation and width under load (nvidia-smi, rocm-smi or system_profiler)
- Inference engine and version: llama.cpp (commit hash), Ollama, vLLM, LM Studio or other

{{STEP2}}

STEP 3: RUN THE TEST
Use llama.cpp's llama-bench with all layers on GPU and flash attention on:
llama-bench -m <model> -ngl 99 -fa 1 -p 512,4096,16384 -n 128 -r 3 -o json
If the model needs more than one GPU, use the default layer split and record how many cards it used.
While it runs, sample every second and keep the min, max and average of: GPU power (W), GPU temperature (C), SM clock (MHz), VRAM used (GB), throttle reasons. On NVIDIA use:
nvidia-smi --query-gpu=index,power.draw,temperature.gpu,clocks.sm,memory.used,clocks_throttle_reasons.active --format=csv,noheader,nounits -l 1
Also record idle GPU power for 10 seconds before the test starts.
If llama-bench is not available but Ollama is, run the same model with "ollama run <model> --verbose" on a fixed 500-word prompt three times and report its prompt eval and eval rates instead, and set engine name to "ollama".

STEP 4: OUTPUT
Print exactly one JSON code block in this shape, with null for anything you could not detect, then a three-line plain summary. Do not invent or estimate numbers; mark anything inferred in "notes".

{
  "schema": "runitlocal-bench/1",
  "date": "YYYY-MM-DD",
  "system": {
    "os": "", "kernel": "",
    "cpu": {"model": "", "cores": 0, "threads": 0, "max_mhz": 0},
    "ram": {"total_gb": 0, "speed_mts": null, "dimms": null},
    "motherboard": null
  },
  "gpus": [
    {"model": "", "vram_gb": 0, "driver": "", "runtime": "", "power_limit_w": 0, "pcie": "Gen3 x16"}
  ],
  "engine": {"name": "llama.cpp", "version": "", "flags": "-ngl 99 -fa 1"},
  "test": {
    "tier": "M",
    "model": "Qwen3.6-35B-A3B",
    "quant": "UD-Q4_K_M",
    "gpus_used": 2,
    "prefill_tps": {"512": 0, "4096": 0, "16384": 0},
    "decode_tps": 0
  },
  "telemetry": {
    "idle_w": 0,
    "power_w": {"avg": 0, "max": 0},
    "temp_c": {"avg": 0, "max": 0},
    "sm_mhz": {"avg": 0, "min": 0},
    "vram_used_gb": {"max": 0},
    "throttled": false,
    "throttle_reasons": []
  },
  "derived": {
    "joules_per_token": 0,
    "kwh_per_million_tokens": 0
  },
  "notes": ""
}

Compute joules_per_token as average GPU power during decode divided by decode tok/s. Compute kwh_per_million_tokens as joules_per_token times 1,000,000 divided by 3,600,000.

{{FINISH}}`;

export const BENCH_PROMPT = benchPrompt();

type Obj = Record<string, unknown>;
const str = (v: unknown, n = 120) => typeof v === "string" ? v.slice(0, n) : null;
const num = (v: unknown) => typeof v === "number" && isFinite(v) ? v : null;
const obj = (v: unknown): Obj => v && typeof v === "object" && !Array.isArray(v) ? v as Obj : {};

/** Rebuilt field by field from the schema, so nothing outside it is kept. */
export function clean(j: Obj) {
  const s = obj(j.system), cpu = obj(s.cpu), ram = obj(s.ram), e = obj(j.engine), t = obj(j.test), pf = obj(t.prefill_tps), tl = obj(j.telemetry), d = obj(j.derived);
  const pw = obj(tl.power_w), tc = obj(tl.temp_c), vu = obj(tl.vram_used_gb);
  return {
    schema: str(j.schema, 40), date: str(j.date, 10),
    system: {os: str(s.os), cpu: {model: str(cpu.model), cores: num(cpu.cores), threads: num(cpu.threads)}, ram: {total_gb: num(ram.total_gb)}},
    gpus: (Array.isArray(j.gpus) ? j.gpus : []).slice(0, 16).map(x => { const g = obj(x); return {model: str(g.model, 80), vram_gb: num(g.vram_gb), driver: str(g.driver, 40), runtime: str(g.runtime, 40), power_limit_w: num(g.power_limit_w), pcie: str(g.pcie, 20)}; }),
    engine: {name: str(e.name, 30), version: str(e.version, 60)},
    test: {tier: str(t.tier, 2), model: str(t.model, 60), quant: str(t.quant, 30), gpus_used: num(t.gpus_used),
      prefill_tps: {"512": num(pf["512"]), "4096": num(pf["4096"]), "16384": num(pf["16384"])}, decode_tps: num(t.decode_tps)},
    telemetry: {idle_w: num(tl.idle_w), power_w: {avg: num(pw.avg), max: num(pw.max)}, temp_c: {max: num(tc.max)}, vram_used_gb: {max: num(vu.max)}, throttled: typeof tl.throttled === "boolean" ? tl.throttled : null},
    derived: {joules_per_token: num(d.joules_per_token)},
  };
}

export type BenchRun = ReturnType<typeof clean>;

export function validate(text: string): {errors: string[]; clean?: BenchRun} {
  let j: unknown; const m = text.match(/\{[\s\S]*\}/);
  try { j = JSON.parse(m ? m[0] : text); } catch { return {errors: ["That isn't valid JSON. Paste only the JSON block your agent printed."]}; }
  const c = clean(obj(j)), errors: string[] = [];
  if (c.schema !== "runitlocal-bench/1") errors.push('"schema" must be "runitlocal-bench/1". Use the prompt above so the format matches.');
  if (!c.gpus.length || !c.gpus[0].model) errors.push("At least one GPU with a model name is required.");
  if (c.test.decode_tps == null || c.test.decode_tps <= 0) errors.push("test.decode_tps must be a number above 0.");
  else if (c.test.decode_tps > 5000) errors.push("test.decode_tps over 5,000 tok/s looks wrong. Check the units.");
  return {errors, clean: c};
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
