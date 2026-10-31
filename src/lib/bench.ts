// The benchmark prompt people paste into their local agent, and the validator for the JSON it prints back. The
// result is sent in with the share form on /articles, so we can read it and write it up.

/** The tests people can pick. Results only compare with runs of the same test. */
export const TESTS = [
  { tier: "S", model: "Qwen3-8B", quant: "Q4_K_M", fits: "Any GPU with 8 GB or more",
    repo: "Qwen/Qwen3-8B-GGUF", file: "Qwen3-8B-Q4_K_M.gguf", gb: 5.03,
    sha256: "d98cdcbd03e17ce47681435b5150e34c1417f50b5c0019dd560e4882c5745785" },
  { tier: "M", model: "Qwen3.6-35B-A3B", quant: "UD-Q4_K_M", fits: "24 GB or more in total",
    repo: "unsloth/Qwen3.6-35B-A3B-GGUF", file: "Qwen3.6-35B-A3B-UD-Q4_K_M.gguf", gb: 22.13,
    sha256: "ac0e2c1189e055faa36eff361580e79c5bd6f8e76bffb4ce547f167d53e31a61" },
] as const;

export type Tier = (typeof TESTS)[number]["tier"];

/** Engines whose numbers compare with each other. */
export const ENGINES = ["llama.cpp", "ollama"] as const;

const modelLine = (t: (typeof TESTS)[number], when = "") =>
  `- Tier ${t.tier}${when}: ${t.model} ${t.quant}, file ${t.file} (${t.gb} GB, sha256 ${t.sha256}) from https://huggingface.co/${t.repo}`;

const MODEL_RULES = `Only that exact GGUF file counts. A model with the same name in another format (MLX, safetensors, EXL2, AWQ) or another quant does not, even if it is already on disk; do not use it.
If the file is not on disk, tell me its name and size and ask before downloading it with:
curl -L -o <file> https://huggingface.co/<repo>/resolve/main/<file>
After downloading, check its sha256 (shasum -a 256, sha256sum, or certutil -hashfile <file> SHA256 on Windows) and stop if it does not match.`;

const STEP2_AUTO = `STEP 2: PICK THE TEST TIER
Pick the largest tier that fits in total GPU memory (or unified memory on Apple Silicon), and tell me which one you picked before continuing:
${modelLine(TESTS[0], " (under 24 GB total)")}
${modelLine(TESTS[1], " (24 GB or more total)")}
${MODEL_RULES}`;

const step2Fixed = (t: (typeof TESTS)[number]) => `STEP 2: THE TEST
Use this test. If it does not fit in total GPU memory (or unified memory on Apple Silicon), stop and tell me.
${modelLine(t)}
${MODEL_RULES}`;

const FINISH = "When you're done, tell me I can send the JSON to RunItLocal.io by pasting it into the form at https://runitlocal.io/articles#share, if I want to.";

/** The prompt for one run, with a picked test or letting the agent pick. */
export function benchPrompt({ tier }: { tier?: Tier } = {}) {
  const t = TESTS.find(x => x.tier === tier);
  return BASE.replace("{{STEP2}}", t ? step2Fixed(t) : STEP2_AUTO).replace("{{FINISH}}", FINISH);
}

const BASE = `You are running the RunItLocal.io benchmark on this machine. Work step by step, show me each command before you run it, and do not install anything, download anything, or use sudo without asking me first. Do not change any system settings.

PRIVACY: Never include hostnames, usernames, IP or MAC addresses, serial numbers, UUIDs, file paths under my home folder, or anything from my environment variables in the output.

If anything this prompt needs is missing, stop and tell me the options. Never substitute another engine, model, format or quant; those results are not comparable with anyone else's.

STEP 1: HARDWARE AND SOFTWARE
Detect, using only read-only commands that fit this OS (Linux, Windows or macOS):
- OS name and version, kernel
- CPU model, physical cores, threads, max clock
- RAM total in GB, speed in MT/s if available, number of DIMMs if available
- Motherboard model if available
- Each GPU: model, VRAM in GB, driver version, CUDA/ROCm/Metal version, power limit in W, current PCIe generation and width under load (nvidia-smi, rocm-smi or system_profiler)
- Whether llama-bench is installed, and whether Ollama is installed. Other engines (LM Studio, MLX, vLLM) do not count for this test.
On Apple Silicon: vram_gb is the unified memory total, runtime is "Metal" plus its version from system_profiler, and driver, power_limit_w and pcie are null.

{{STEP2}}

STEP 3: GET LLAMA-BENCH
If llama-bench is not installed, ask me before installing llama.cpp:
- macOS with Homebrew: brew install llama.cpp
- Linux or Windows: the prebuilt release for this GPU (CUDA, HIP/ROCm or Vulkan) from https://github.com/ggml-org/llama.cpp/releases
Only if I say no to that and Ollama is installed, use the Ollama fallback at the end of STEP 4.

STEP 4: RUN THE TEST
First record idle GPU power for 10 seconds. Then run llama-bench twice, with all layers on GPU and flash attention on, sampling telemetry every second during each run:
Prefill: llama-bench -m <model> -ngl 99 -fa 1 -p 512,4096,16384 -n 0 -r 3 -o json
Decode:  llama-bench -m <model> -ngl 99 -fa 1 -p 0 -n 128 -r 3 -o json
Take prefill_tps and decode_tps from the "avg_ts" of each test in the JSON output; do not average them yourself. engine.version is "b<build_number> (<build_commit>)" from the same output.
If the model needs more than one GPU, use the default layer split and record how many cards it used.
Telemetry: power_w comes from the decode run only. temp_c, sm_mhz, vram_used_gb and throttle reasons cover both runs.
- NVIDIA: nvidia-smi --query-gpu=index,power.draw,temperature.gpu,clocks.sm,memory.used,clocks_event_reasons.active --format=csv,noheader,nounits -l 1 (on older drivers use clocks_throttle_reasons.active)
- AMD on Linux: rocm-smi --showpower --showtemp --showmeminfo vram --showclocks --json, once a second in a loop (or amd-smi metric on newer ROCm)
- macOS: sudo powermetrics --samplers gpu_power -i 1000 gives GPU power (mW, convert to W) and GPU active frequency (use as sm_mhz). It needs sudo, so ask me first. Temperature and VRAM are not available this way; set them to null.
- Anything else, or if I decline sudo: set the telemetry and derived fields to null and say why in notes.
Ollama fallback: load the same GGUF file with a Modelfile containing "FROM <model file>" and ollama create, then run "ollama run <name> --verbose" three times on one fixed prompt of about 512 tokens. Report the average prompt eval rate under prefill_tps "512" (4096 and 16384 null), the average eval rate as decode_tps, the exact prompt token count in notes, and set engine name to "ollama".

STEP 5: OUTPUT
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
  if (!ENGINES.some(e => e === c.engine.name)) errors.push(`engine.name must be ${ENGINES.join(" or ")}. Other engines don't compare with other runs.`);
  const t = TESTS.find(x => x.tier === c.test.tier);
  if (!t) errors.push(`test.tier must be ${TESTS.map(x => x.tier).join(" or ")}.`);
  else if (c.test.quant !== t.quant) errors.push(`Tier ${t.tier} must use ${t.file} (quant ${t.quant}).`);
  return {errors, clean: c};
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
