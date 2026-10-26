// Reads the GPU name the browser exposes. Runs only in the browser and nothing here is sent anywhere.
// Chrome and Edge on Windows/Linux usually give the exact card; Chrome on a Mac gives the chip;
// Safari says only "Apple GPU"; Firefox rounds to a similar card; Brave may randomize it.

import { INTEGRATED, MAC_UNKNOWN, isIntegrated, matchGpu, type Gpu } from "./gpus";

export type Detection =
  | { status: "found"; gpu: Gpu; raw: string; approx: boolean }
  | { status: "guess"; gpu: Gpu; raw: string; reason: "mac" | "integrated" }
  | { status: "mobile"; raw: string }
  | { status: "unknown"; raw: string };

export type WebGpuInfo = { available: boolean; f16: boolean };

function rendererString(): string {
  try {
    const canvas = document.createElement("canvas");
    const opts = { powerPreference: "high-performance" } as WebGLContextAttributes;
    const gl = (canvas.getContext("webgl2", opts) || canvas.getContext("webgl", opts)) as WebGLRenderingContext | null;
    if (!gl) return "";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const r = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || "");
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return r;
  } catch {
    return "";
  }
}

type Adapter = { features: Set<string>; info?: { vendor?: string; architecture?: string; description?: string } };
type NavGpu = { requestAdapter(o?: { powerPreference?: string }): Promise<Adapter | null> };

export async function webGpu(): Promise<WebGpuInfo & { description: string }> {
  const gpu = (navigator as Navigator & { gpu?: NavGpu }).gpu;
  if (!gpu) return { available: false, f16: false, description: "" };
  try {
    // Some browsers expose navigator.gpu but never answer requestAdapter. Treat no answer in 5 s as no adapter.
    const a = await Promise.race([gpu.requestAdapter({ powerPreference: "high-performance" }), new Promise<null>(r => setTimeout(() => r(null), 5000))]);
    if (!a) return { available: false, f16: false, description: "" };
    return { available: true, f16: a.features.has("shader-f16"), description: a.info?.description || "" };
  } catch {
    return { available: false, f16: false, description: "" };
  }
}

function isMobile() {
  const uaData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData;
  if (uaData?.mobile) return true;
  const ua = navigator.userAgent;
  if (/Android|iPhone|iPod|Mobi/i.test(ua)) return true;
  return /Macintosh/.test(ua) && navigator.maxTouchPoints > 1; // iPad reports as a Mac
}

export async function detectGpu(): Promise<{ detection: Detection; webgpu: WebGpuInfo }> {
  const wg = await webGpu();
  const raw = rendererString() || wg.description;
  const webgpu = { available: wg.available, f16: wg.f16 };
  if (isMobile()) return { detection: { status: "mobile", raw }, webgpu };
  const gpu = matchGpu(raw) || (wg.description ? matchGpu(wg.description) : null);
  if (gpu) return { detection: { status: "found", gpu, raw, approx: /or similar/i.test(raw) }, webgpu };
  if (/apple/i.test(raw) || /Macintosh/.test(navigator.userAgent)) return { detection: { status: "guess", gpu: MAC_UNKNOWN, raw, reason: "mac" }, webgpu };
  if (isIntegrated(raw)) return { detection: { status: "guess", gpu: INTEGRATED, raw, reason: "integrated" }, webgpu };
  return { detection: { status: "unknown", raw }, webgpu };
}
