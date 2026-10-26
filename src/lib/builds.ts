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

// Sorted by price: buildForBudget picks the last one you can afford.
// Prices checked late October 2026, US. The AI memory shortage has pushed GPUs, RAM and SSDs far above 2025 prices.
export const BUILDS: Build[] = [
  {tier:"Free", name:"The computer you already have", lo:0, hi:0, vram:4, bw:100, power:"Whatever it uses now",
   why:"Any laptop, Chromebook or desktop with a recent Chrome or Edge can run small models right in the browser with WebLLM. No install, nothing leaves the machine.",
   bom:[["Chrome or Edge with WebGPU (most machines from 2019 on)","$0"],["Open the Studio and pick a small model","$0"]],
   gotcha:"Built-in graphics share system memory, so stick to 1B to 4B models. 16 GB of RAM helps a lot."},
  {tier:"Starter", name:"Used desktop + RTX 3060 12 GB", lo:600, hi:800, vram:12, bw:360, power:"About 200 W",
   why:"The cheapest way to run real models on a graphics card. Fast with 8B to 14B models.",
   bom:[["RTX 3060 12 GB, used","$300 to $380"],["Used desktop tower, 16 GB RAM, 450 W+ PSU","$150 to $250"],["1 TB NVMe SSD","$130 to $180"]],
   gotcha:"Check the PSU has an 8-pin GPU cable and the case fits a full-size card. Office small-form-factor PCs usually don't. If the tower already has an SSD, keep it: new SSDs cost about three times what they did in 2025."},
  {tier:"Best value", name:"Used workstation + 2× Tesla P100", lo:750, hi:1100, vram:32, bw:732, power:"About 400 W under load", measured:"53 tok/s on Qwen3.6-35B-A3B, measured on our rack",
   why:"32 GB of fast HBM2 for less than one used RTX 3090. Runs 30B-class models.",
   bom:[["2× Tesla P100 16 GB, used (we paid about $85 each in 2026)","$200 to $300"],["Dell T7810 or HP Z840 workstation, 64 GB RAM","$500 to $700"],["2× blower fan shrouds for passive cards","$30 to $50"],["Power adapter cables (EPS to GPU)","$15 to $25"]],
   gotcha:"P100s have no fans. Without a shroud or strong case airflow they overheat in minutes. Pascal also only works with llama.cpp-based tools. Buy workstations that already have the RAM in them; adding DDR4 now costs more than the computer."},
  {tier:"Quiet", name:"Used Mac Studio, 64 GB unified memory", lo:1700, hi:2400, vram:48, bw:400, power:"About 100 W",
   why:"Silent and simple. Big memory for big models, slower than a GPU of the same size. Now about the same price as a used 3090 build.",
   bom:[["Mac Studio M1 Max, 64 GB, used (M2 Max runs $2,000 to $3,000)","$1,700 to $2,400"]],
   gotcha:"About three quarters of unified memory is usable for models by default. Speed is roughly half a 3090 on the same model."},
  {tier:"Popular", name:"Used desktop + RTX 3090 24 GB", lo:1850, hi:2250, vram:24, bw:936, power:"About 400 W under load",
   why:"The community default. 24 GB on one card, fast, and every tool supports it.",
   bom:[["RTX 3090 24 GB, used","$1,400 to $1,600"],["Desktop with 32 GB RAM, 850 W PSU","$300 to $450"],["1 TB NVMe SSD","$130 to $180"]],
   gotcha:"The 3090 is long and hot. Check case clearance and give it a quality 850 W supply. Used prices have roughly doubled since mid-2026, so check eBay sold listings, not asking prices."},
  {tier:"Big memory, small box", name:"Ryzen AI Max+ 395 mini PC, 128 GB", lo:3400, hi:4000, vram:96, bw:256, power:"About 140 W",
   why:"AMD's Strix Halo chip puts 128 GB of fast memory next to a strong built-in GPU. Fits gpt-oss-120b and 70B models in a box the size of a lunchbox. Sold as the Framework Desktop, GMKtec EVO-X2, HP Z2 Mini G1a and others.",
   bom:[["Framework Desktop, Ryzen AI Max+ 395, 128 GB (new, $3,449 before storage)","$3,449"],["1 to 2 TB NVMe SSD","$130 to $500"]],
   gotcha:"Often out of stock or pre-order only. Memory is soldered, so buy 128 GB up front. Windows gives the GPU up to 96 GB; Linux can give it more. Big dense models run slowly; mixture-of-experts models like gpt-oss-120b shine."},
  {tier:"Serious", name:"Workstation + 2× RTX 3090", lo:3500, hi:4300, vram:48, bw:936, power:"About 750 W under load",
   why:"48 GB runs 70B-class models at 4-bit and serves a small team.",
   bom:[["2× RTX 3090 24 GB, used","$2,800 to $3,200"],["Workstation board with two x16 slots, 64 GB RAM","$500 to $750"],["1,200 W PSU","$150 to $250"],["Open frame or large case","$80 to $120"]],
   gotcha:"Two 3090s need real spacing or riser cables. Expect a 1,200 W supply and a dedicated circuit."},
  {tier:"The rack in a box", name:"Dell DSS 8440 + 10× Tesla P100", lo:5100, hi:9700, vram:160, bw:732, power:"About 2 kW under load", measured:"498 tok/s across 5 lanes, measured on our rack (SV112)",
   why:"160 GB of GPU memory. Runs the biggest open models or serves dozens of users at once.",
   bom:[["Dell DSS 8440 GPU server, used (price swings with the RAM inside)","$4,000 to $8,000"],["10× Tesla P100 16 GB, used","$1,000 to $1,500"],["10× PSB 14-pin to EPS 8-pin cables","$100 to $200"]],
   gotcha:"This is a loud data-center server. Plan for a rack, power and cooling before you buy. Listings with less RAM are much cheaper; 64 GB is plenty for GPU inference."},
  {tier:"NVIDIA on your desk", name:"NVIDIA DGX Spark, 128 GB", lo:6700, hi:7000, vram:120, bw:273, power:"About 240 W",
   why:"NVIDIA's Grace Blackwell desktop box: 128 GB of unified memory, full CUDA, and NVIDIA's own software stack. Runs 120B-class models, and two can be linked for 256 GB. Also sold as the ASUS Ascent GX10, Dell Pro Max GB10 and MSI EdgeXpert.",
   bom:[["DGX Spark 128 GB (new; it launched at $3,999 in 2025)","$6,700 to $7,000"]],
   gotcha:"A 64 GB version from partners starts at $4,999, but half the memory loses most of the point. Memory bandwidth (273 GB/s) is a third of a 3090, so token speed is modest on big dense models. It's an Arm Linux box, so check your tools have Arm builds."},
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
