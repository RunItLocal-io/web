export type Build = {
  tier: string;
  name: string;
  /** Rough used-market range in USD, October 2026. */
  lo: number;
  hi: number;
  /** Usable GB for models. */
  vram: number;
  /** Memory bandwidth of one card in GB/s. Layer-split multi-GPU runs at about one card's speed. */
  bw: number;
  power: string;
  measured?: string;
  why: string;
  bom: [part: string, price: string][];
  gotcha: string;
};

export type Model = {
  n: string;
  gb: number;
  /** OpenRouter model id, used to open a chat with that model preselected. null = not on OpenRouter. */
  or: string | null;
};

export const BUILDS: Build[] = [
  {tier:"Starter", name:"Used desktop + RTX 3060 12 GB", lo:300, hi:400, vram:12, bw:360, power:"About 200 W",
   why:"The cheapest way to run real models on a graphics card. Fast with 8B to 14B models.",
   bom:[["RTX 3060 12 GB","$180 to $230"],["Used desktop tower, 16 GB RAM, 450 W+ PSU","$100 to $150"],["1 TB SSD","$40 to $60"]],
   gotcha:"Check the PSU has an 8-pin GPU cable and the case fits a full-size card. Office small-form-factor PCs usually don't."},
  {tier:"Best value", name:"Used workstation + 2× Tesla P100", lo:450, hi:650, vram:32, bw:732, power:"About 400 W under load", measured:"53 tok/s on Qwen3.6-35B-A3B, measured on our rack",
   why:"32 GB of fast HBM2 for the price of one mid-range gaming card. Runs 30B-class models.",
   bom:[["2× Tesla P100 16 GB (we paid about $85 each)","$170 to $240"],["Dell T7810 or HP Z840 workstation, 64 GB RAM","$200 to $300"],["2× blower fan shrouds for passive cards","$30 to $50"],["Power adapter cables (EPS to GPU)","$15 to $25"]],
   gotcha:"P100s have no fans. Without a shroud or strong case airflow they overheat in minutes. Pascal also only works with llama.cpp-based tools."},
  {tier:"Popular", name:"Used desktop + RTX 3090 24 GB", lo:900, hi:1200, vram:24, bw:936, power:"About 400 W under load",
   why:"The community default. 24 GB on one card, fast, and every tool supports it.",
   bom:[["RTX 3090 24 GB","$650 to $850"],["Desktop with 32 GB RAM, 850 W PSU","$200 to $300"],["1 TB NVMe SSD","$50 to $70"]],
   gotcha:"The 3090 is long and hot. Check case clearance and give it a quality 850 W supply."},
  {tier:"Quiet", name:"Used Mac Studio, 64 GB unified memory", lo:1500, hi:2100, vram:48, bw:400, power:"About 100 W",
   why:"Silent and simple. Big memory for big models, slower than a GPU of the same size.",
   bom:[["Mac Studio M1 or M2 Max, 64 GB","$1,500 to $2,100"]],
   gotcha:"About three quarters of unified memory is usable for models by default. Speed is roughly half a 3090 on the same model."},
  {tier:"Serious", name:"Workstation + 2× RTX 3090", lo:1900, hi:2500, vram:48, bw:936, power:"About 750 W under load",
   why:"48 GB runs 70B-class models at 4-bit and serves a small team.",
   bom:[["2× RTX 3090 24 GB","$1,300 to $1,700"],["Workstation board with two x16 slots, 64 GB RAM","$350 to $500"],["1,200 W PSU","$150 to $220"],["Open frame or large case","$80 to $120"]],
   gotcha:"Two 3090s need real spacing or riser cables. Expect a 1,200 W supply and a dedicated circuit."},
  {tier:"The rack in a box", name:"Dell DSS 8440 + 10× Tesla P100", lo:2500, hi:4000, vram:160, bw:732, power:"About 2 kW under load", measured:"498 tok/s across 5 lanes, measured on our rack (SV112)",
   why:"160 GB of GPU memory. Runs the biggest open models or serves dozens of users at once.",
   bom:[["Dell DSS 8440 GPU server","$1,500 to $3,000"],["10× Tesla P100 16 GB","$850 to $1,200"],["10× PSB 14-pin to EPS 8-pin cables","$100 to $200"]],
   gotcha:"This is a loud data-center server. Plan for a rack, power and cooling before you buy."},
];

export const MODELS: Model[] = [
  {n:"Qwen3 8B", gb:7, or:"qwen/qwen3-8b"}, {n:"Qwen3 14B", gb:11, or:"qwen/qwen3-14b"},
  {n:"Gemma 3 27B", gb:20, or:"google/gemma-3-27b-it"},
  {n:"Qwen3.6-35B-A3B", gb:24, or:"qwen/qwen3.6-35b-a3b"},
  {n:"Nemotron 3.5 Bolt 74B (2-bit)", gb:24, or:null},
  {n:"Qwen3 32B", gb:24, or:"qwen/qwen3-32b"},
  {n:"Llama 3.3 70B", gb:44, or:"meta-llama/llama-3.3-70b-instruct"},
  {n:"gpt-oss-120b", gb:66, or:"openai/gpt-oss-120b"},
  {n:"Nemotron 3.5 Super VL 120B", gb:72, or:"nvidia/nemotron-3.5-super-vl"},
];

export const NEMOTRON_BOLT_GGUF = "https://huggingface.co/unsloth/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-GGUF";

export const orChat = (id: string) => "https://openrouter.ai/chat?models=" + encodeURIComponent(id).replace(/%2F/g, "/");
export const usd = (v: number) => "$" + v.toLocaleString("en-US");
export const fmt = (v: number, d = 0) => v.toLocaleString("en-US", {maximumFractionDigits: d, minimumFractionDigits: d});

export function buildForBudget(v: number): Build {
  const fits = BUILDS.filter(b => b.lo <= v);
  return fits.length ? fits[fits.length - 1] : BUILDS[0];
}

export function buildForModel(m: Model): Build {
  return BUILDS.slice().sort((x, y) => x.lo - y.lo).find(x => x.vram >= m.gb) || BUILDS[BUILDS.length - 1];
}
