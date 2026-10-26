// GPU specs for matching what the browser reports. Browsers never expose VRAM, so it comes from this table.
// bw = memory bandwidth in GB/s, which is what sets token generation speed.
// vram lists the sizes a card was sold in, most common first. For Apple chips and AI boxes it lists unified memory options.

// unified = a non-Apple chip whose GPU shares one big pool of fast memory: DGX Spark, Ryzen AI Max, Jetson.
export type GpuKind = "discrete" | "apple" | "unified" | "integrated";

export type Gpu = {
  key: string;      // normalized name the renderer string must contain, see normalize()
  name: string;
  vendor: "NVIDIA" | "AMD" | "Intel" | "Apple" | "Other";
  kind: GpuKind;
  vram: number[];
  bw: number;
  /** Other names people search for: the product it ships in, the chip's code name. */
  aka?: string;
};

const nv = (key: string, name: string, vram: number[], bw: number): Gpu => ({ key, name, vendor: "NVIDIA", kind: "discrete", vram, bw });
const amd = (key: string, name: string, vram: number[], bw: number): Gpu => ({ key, name, vendor: "AMD", kind: "discrete", vram, bw });
const intel = (key: string, name: string, vram: number[], bw: number): Gpu => ({ key, name, vendor: "Intel", kind: "discrete", vram, bw });
const apple = (key: string, name: string, mem: number[], bw: number): Gpu => ({ key, name, vendor: "Apple", kind: "apple", vram: mem, bw });
const box = (vendor: Gpu["vendor"], key: string, name: string, mem: number[], bw: number, aka: string): Gpu => ({ key, name, vendor, kind: "unified", vram: mem, bw, aka });
const igpu = (vendor: Gpu["vendor"], key: string, name: string, mem: number[], bw: number, aka: string): Gpu => ({ key, name, vendor, kind: "integrated", vram: mem, bw, aka });

export const GPUS: Gpu[] = [
  // NVIDIA desktop
  nv("gtx 970", "GTX 970", [4], 224),
  nv("gtx 980", "GTX 980", [4], 224),
  nv("gtx 980 ti", "GTX 980 Ti", [6], 336),
  nv("gtx 1060", "GTX 1060", [6, 3], 192),
  nv("gtx 1070", "GTX 1070", [8], 256),
  nv("gtx 1070 ti", "GTX 1070 Ti", [8], 256),
  nv("gtx 1080", "GTX 1080", [8], 320),
  nv("gtx 1080 ti", "GTX 1080 Ti", [11], 484),
  nv("gtx 1650", "GTX 1650", [4], 128),
  nv("gtx 1660", "GTX 1660", [6], 192),
  nv("gtx 1660 super", "GTX 1660 Super", [6], 336),
  nv("gtx 1660 ti", "GTX 1660 Ti", [6], 288),
  nv("rtx 2060", "RTX 2060", [6, 12], 336),
  nv("rtx 2060 super", "RTX 2060 Super", [8], 448),
  nv("rtx 2070", "RTX 2070", [8], 448),
  nv("rtx 2070 super", "RTX 2070 Super", [8], 448),
  nv("rtx 2080", "RTX 2080", [8], 448),
  nv("rtx 2080 super", "RTX 2080 Super", [8], 496),
  nv("rtx 2080 ti", "RTX 2080 Ti", [11], 616),
  nv("rtx 3050", "RTX 3050", [8, 6], 224),
  nv("rtx 3060", "RTX 3060", [12, 8], 360),
  nv("rtx 3060 ti", "RTX 3060 Ti", [8], 448),
  nv("rtx 3070", "RTX 3070", [8], 448),
  nv("rtx 3070 ti", "RTX 3070 Ti", [8], 608),
  nv("rtx 3080", "RTX 3080", [10, 12], 760),
  nv("rtx 3080 ti", "RTX 3080 Ti", [12], 912),
  nv("rtx 3090", "RTX 3090", [24], 936),
  nv("rtx 3090 ti", "RTX 3090 Ti", [24], 1008),
  nv("rtx 4060", "RTX 4060", [8], 272),
  nv("rtx 4060 ti", "RTX 4060 Ti", [8, 16], 288),
  nv("rtx 4070", "RTX 4070", [12], 504),
  nv("rtx 4070 super", "RTX 4070 Super", [12], 504),
  nv("rtx 4070 ti", "RTX 4070 Ti", [12], 504),
  nv("rtx 4070 ti super", "RTX 4070 Ti Super", [16], 672),
  nv("rtx 4080", "RTX 4080", [16], 717),
  nv("rtx 4080 super", "RTX 4080 Super", [16], 736),
  nv("rtx 4090", "RTX 4090", [24], 1008),
  nv("rtx 5060", "RTX 5060", [8], 448),
  nv("rtx 5060 ti", "RTX 5060 Ti", [16, 8], 448),
  nv("rtx 5070", "RTX 5070", [12], 672),
  nv("rtx 5070 ti", "RTX 5070 Ti", [16], 896),
  nv("rtx 5080", "RTX 5080", [16], 960),
  nv("rtx 5090", "RTX 5090", [32], 1792),
  // NVIDIA laptop: same names, much less bandwidth
  nv("rtx 3050 laptop", "RTX 3050 Laptop", [4, 6], 192),
  nv("rtx 3060 laptop", "RTX 3060 Laptop", [6], 336),
  nv("rtx 3070 laptop", "RTX 3070 Laptop", [8], 448),
  nv("rtx 3070 ti laptop", "RTX 3070 Ti Laptop", [8], 448),
  nv("rtx 3080 laptop", "RTX 3080 Laptop", [8, 16], 448),
  nv("rtx 3080 ti laptop", "RTX 3080 Ti Laptop", [16], 512),
  nv("rtx 4050 laptop", "RTX 4050 Laptop", [6], 192),
  nv("rtx 4060 laptop", "RTX 4060 Laptop", [8], 256),
  nv("rtx 4070 laptop", "RTX 4070 Laptop", [8], 256),
  nv("rtx 4080 laptop", "RTX 4080 Laptop", [12], 432),
  nv("rtx 4090 laptop", "RTX 4090 Laptop", [16], 576),
  nv("rtx 5070 laptop", "RTX 5070 Laptop", [8], 384),
  nv("rtx 5070 ti laptop", "RTX 5070 Ti Laptop", [12], 672),
  nv("rtx 5080 laptop", "RTX 5080 Laptop", [16], 896),
  nv("rtx 5090 laptop", "RTX 5090 Laptop", [24], 896),
  // NVIDIA workstation and data center
  nv("rtx a2000", "RTX A2000", [6, 12], 288),
  nv("rtx a4000", "RTX A4000", [16], 448),
  nv("rtx a4500", "RTX A4500", [20], 640),
  nv("rtx a5000", "RTX A5000", [24], 768),
  nv("rtx a6000", "RTX A6000", [48], 768),
  nv("rtx 4000 ada", "RTX 4000 Ada", [20], 360),
  nv("rtx 6000 ada", "RTX 6000 Ada", [48], 960),
  nv("tesla p40", "Tesla P40", [24], 346),
  nv("tesla p100", "Tesla P100", [16, 12], 732),
  nv("tesla t4", "Tesla T4", [16], 320),
  nv("tesla v100", "Tesla V100", [16, 32], 900),
  nv("a100", "A100", [40, 80], 1555),
  nv("h100", "H100", [80], 3350),
  nv("l40s", "L40S", [48], 864),
  nv("tesla m40", "Tesla M40", [24, 12], 288),
  nv("rtx pro 6000", "RTX Pro 6000 Blackwell", [96], 1792),
  // AMD
  amd("rx 6600", "RX 6600", [8], 224),
  amd("rx 6600 xt", "RX 6600 XT", [8], 256),
  amd("rx 6700 xt", "RX 6700 XT", [12], 384),
  amd("rx 6800", "RX 6800", [16], 512),
  amd("rx 6800 xt", "RX 6800 XT", [16], 512),
  amd("rx 6900 xt", "RX 6900 XT", [16], 512),
  amd("rx 6950 xt", "RX 6950 XT", [16], 576),
  amd("rx 7600", "RX 7600", [8], 288),
  amd("rx 7600 xt", "RX 7600 XT", [16], 288),
  amd("rx 7700 xt", "RX 7700 XT", [12], 432),
  amd("rx 7800 xt", "RX 7800 XT", [16], 624),
  amd("rx 7900 gre", "RX 7900 GRE", [16], 576),
  amd("rx 7900 xt", "RX 7900 XT", [20], 800),
  amd("rx 7900 xtx", "RX 7900 XTX", [24], 960),
  amd("rx 9060 xt", "RX 9060 XT", [16, 8], 320),
  amd("rx 9070", "RX 9070", [16], 640),
  amd("rx 9070 xt", "RX 9070 XT", [16], 640),
  amd("r9700", "Radeon AI Pro R9700", [32], 640),
  amd("mi50", "Instinct MI50", [32, 16], 1024),
  // Intel Arc
  intel("arc a750", "Arc A750", [8], 512),
  intel("arc a770", "Arc A770", [16, 8], 560),
  intel("arc b570", "Arc B570", [10], 380),
  intel("arc b580", "Arc B580", [12], 456),
  intel("arc pro b60", "Arc Pro B60", [24], 456),
  // Apple silicon: vram = unified memory options
  apple("apple m1", "Apple M1", [16, 8], 68),
  apple("apple m1 pro", "Apple M1 Pro", [16, 32], 200),
  apple("apple m1 max", "Apple M1 Max", [32, 64], 400),
  apple("apple m1 ultra", "Apple M1 Ultra", [64, 128], 800),
  apple("apple m2", "Apple M2", [16, 8, 24], 100),
  apple("apple m2 pro", "Apple M2 Pro", [16, 32], 200),
  apple("apple m2 max", "Apple M2 Max", [32, 64, 96], 400),
  apple("apple m2 ultra", "Apple M2 Ultra", [64, 128, 192], 800),
  apple("apple m3", "Apple M3", [16, 8, 24], 100),
  apple("apple m3 pro", "Apple M3 Pro", [18, 36], 150),
  apple("apple m3 max", "Apple M3 Max", [36, 48, 64, 96, 128], 400),
  apple("apple m3 ultra", "Apple M3 Ultra", [96, 256, 512], 819),
  apple("apple m4", "Apple M4", [16, 24, 32], 120),
  apple("apple m4 pro", "Apple M4 Pro", [24, 48, 64], 273),
  apple("apple m4 max", "Apple M4 Max", [36, 48, 64, 128], 546),
  apple("apple m5", "Apple M5", [16, 24, 32], 153),
  apple("apple m5 pro", "Apple M5 Pro", [24, 48, 64], 307),
  apple("apple m5 max", "Apple M5 Max", [36, 48, 64, 128], 460), // 460 GB/s with the 32-core GPU, 614 with 40
  // AI boxes and mini PCs: one big pool of memory the GPU can use
  box("NVIDIA", "gb10", "NVIDIA DGX Spark", [128], 273, "dgx spark gb10 grace blackwell asus ascent gx10 dell pro max gb10 msi edgexpert"),
  box("AMD", "8060s", "Ryzen AI Max+ 395 (Radeon 8060S)", [128, 64, 96], 256, "strix halo framework desktop gmktec evo-x2 hp z2 mini g1a mini pc"),
  box("AMD", "8050s", "Ryzen AI Max 390 (Radeon 8050S)", [64, 32], 256, "strix halo mini pc laptop"),
  box("NVIDIA", "orin", "Jetson AGX Orin", [64, 32], 205, "jetson orin nvidia edge robot"),
  // Laptops and built-in graphics: WebLLM runs small models on these in the browser
  igpu("AMD", "890m", "Radeon 890M", [32, 16, 64], 120, "strix point ryzen ai 9 hx 370 laptop"),
  igpu("AMD", "780m", "Radeon 780M", [16, 32], 90, "ryzen 7840 8845 laptop mini pc handheld rog ally legion go"),
  igpu("Intel", "arc 140v", "Intel Arc 140V", [16, 32], 136, "lunar lake core ultra laptop"),
  igpu("Other", "adreno x1 85", "Snapdragon X Elite (Adreno X1-85)", [16, 32], 135, "qualcomm snapdragon copilot+ pc arm laptop surface"),
];

/** Stand-ins when the browser shows a vendor but no model. Memory is system RAM, which models share. */
export const MAC_UNKNOWN: Gpu = { key: "", name: "Your Mac", vendor: "Apple", kind: "apple", vram: [16, 8, 24, 32, 64], bw: 100 };
export const INTEGRATED: Gpu = { key: "", name: "Built-in graphics", vendor: "Other", kind: "integrated", vram: [16, 8, 32, 64], bw: 60 };

export function normalize(s: string) {
  return s.toLowerCase()
    .replace(/\((r|tm)\)/g, "")
    .replace(/[^a-z0-9.]+/g, " ")
    .replace(/\b(geforce|nvidia|radeon)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** A chip tier we don't list yet must not fall back to the base chip: "Apple M6 Pro" is not an "Apple M6". */
const TIERS = new Set(["pro", "max", "ultra"]);

/** Longest key found as whole words in the renderer string wins, so "rtx 3060 ti" beats "rtx 3060". */
export function matchGpu(renderer: string): Gpu | null {
  const n = " " + normalize(renderer) + " ";
  let best: Gpu | null = null;
  for (const g of GPUS) {
    const at = n.indexOf(" " + g.key + " ");
    if (at < 0) continue;
    const next = n.slice(at + g.key.length + 2).split(" ")[0];
    if (TIERS.has(next)) continue;
    if (!best || g.key.length > best.key.length) best = g;
  }
  return best;
}

/** Built-in graphics that share system memory: Intel UHD/Iris/Arc without a model number, Radeon without "RX". */
export function isIntegrated(renderer: string) {
  const s = renderer.toLowerCase();
  if (/intel/.test(s) && !/arc.*\b[ab]\d{3}\b/.test(s)) return true;
  if (/radeon/.test(s) && !/\brx\b/.test(s)) return true;
  return false;
}

/** URL form of a GPU, as in /?gpu=rtx-3090&mem=24. */
export function gpuSlug(g: Gpu) {
  return g === MAC_UNKNOWN ? "mac" : g === INTEGRATED ? "integrated" : g.key.replace(/\s+/g, "-");
}

export function gpuFromSlug(s: string | null | undefined): Gpu | null {
  if (!s) return null;
  if (s === "mac") return MAC_UNKNOWN;
  if (s === "integrated") return INTEGRATED;
  return GPUS.find(g => gpuSlug(g) === s.toLowerCase()) ?? null;
}

const card = (vendor: Gpu["vendor"]) => GPUS.filter(g => g.vendor === vendor && g.kind === "discrete");

export const GPU_GROUPS: { label: string; gpus: Gpu[] }[] = [
  { label: "NVIDIA", gpus: card("NVIDIA") },
  { label: "AMD", gpus: card("AMD") },
  { label: "Intel Arc", gpus: card("Intel") },
  { label: "Apple", gpus: GPUS.filter(g => g.kind === "apple") },
  { label: "AI boxes and mini PCs", gpus: GPUS.filter(g => g.kind === "unified") },
  { label: "Laptops and built-in graphics", gpus: GPUS.filter(g => g.kind === "integrated") },
];
