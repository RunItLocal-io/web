// SD-Turbo text-to-image on the visitor's GPU: ONNX Runtime Web with WebGPU, one denoising step, 512×512.
// Ported from Microsoft's onnxruntime-inference-examples/js/sd-turbo. Needs WebGPU with shader-f16.
// Model files stream from Hugging Face into Cache Storage once, then load from disk (and offline).

import type * as Ort from "onnxruntime-web";
import { Tokenizer } from "@huggingface/tokenizers";

const ORT_VERSION = "1.30.0";
const MODEL_BASE = "https://huggingface.co/schmuell/sd-turbo-ort-web/resolve/main";
const TOKENIZER_BASE = "https://huggingface.co/Xenova/clip-vit-base-patch16/resolve/main";
export const MODEL_CACHE = "ril-models";

const FILES = [
  { name: "text_encoder", path: "text_encoder/model.onnx", bytes: 681_393_168, dims: { batch_size: 1 } },
  { name: "unet", path: "unet/model.onnx", bytes: 1_733_430_199, dims: { batch_size: 1, num_channels: 4, height: 64, width: 64, sequence_length: 77 } },
  { name: "vae_decoder", path: "vae_decoder/model.onnx", bytes: 99_094_314, dims: { batch_size: 1, num_channels_latent: 4, height_latent: 64, width_latent: 64 } },
] as const;

export const IMAGE_MODEL = { label: "SD-Turbo", size: "about 2.5 GB", bytes: FILES.reduce((n, f) => n + f.bytes, 0) };

const SIGMA = 14.6146;
const VAE_SCALE = 0.18215;

export type LoadProgress = { loaded: number; total: number; text: string };
export type Generated = { url: string; prompt: string; seed: number; ms: number; at: number };

/** True when every model file is already on this device. */
export async function imageModelCached(): Promise<boolean> {
  try {
    const cache = await caches.open(MODEL_CACHE);
    const hits = await Promise.all(FILES.map(f => cache.match(`${MODEL_BASE}/${f.path}`)));
    return hits.every(Boolean);
  } catch {
    return false;
  }
}

export async function deleteImageModel() {
  const cache = await caches.open(MODEL_CACHE);
  await Promise.all(FILES.map(f => cache.delete(`${MODEL_BASE}/${f.path}`)));
}

/** Streams url into Cache Storage, counting bytes as they arrive, then returns the cached bytes. */
async function fetchCached(url: string, onBytes: (n: number) => void): Promise<ArrayBuffer> {
  let cache: Cache | null = null;
  try { cache = await caches.open(MODEL_CACHE); } catch { /* no Cache Storage: plain download every time */ }
  const hit = await cache?.match(url);
  if (hit) { const buf = await hit.arrayBuffer(); onBytes(buf.byteLength); return buf; }

  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`Download failed (${res.status}) for ${url.split("/").slice(-2).join("/")}`);
  const counted = res.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, ctl) { onBytes(chunk.byteLength); ctl.enqueue(chunk); },
  }));
  if (cache) {
    await cache.put(url, new Response(counted, { headers: { "content-type": "application/octet-stream" } }));
    const stored = await cache.match(url);
    if (stored) return stored.arrayBuffer();
  }
  return new Response(counted).arrayBuffer();
}

async function fetchJsonCached(url: string) {
  const buf = await fetchCached(url, () => {});
  return JSON.parse(new TextDecoder().decode(buf));
}

/** Deterministic normal noise, so a seed reproduces an image. */
function noise(n: number, seed: number) {
  let s = seed >>> 0;
  const rand = () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = Math.sqrt(-2 * Math.log(rand() || 1e-12)) * Math.cos(2 * Math.PI * rand()) * SIGMA;
  return out;
}

function toPngUrl(t: Ort.Tensor): Promise<string> {
  const [, , h, w] = t.dims as number[];
  const d = t.data as Float32Array, img = new ImageData(w, h), plane = w * h;
  for (let i = 0; i < plane; i++) {
    for (let c = 0; c < 3; c++) img.data[i * 4 + c] = Math.max(0, Math.min(255, Math.round((d[c * plane + i] / 2 + 0.5) * 255)));
    img.data[i * 4 + 3] = 255;
  }
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d")!.putImageData(img, 0, 0);
  return new Promise(r => canvas.toBlob(b => r(URL.createObjectURL(b!)), "image/png"));
}

export type ImageEngine = { generate(prompt: string, seed?: number): Promise<Generated>; dispose(): void };

export async function loadImageEngine(onProgress: (p: LoadProgress) => void): Promise<ImageEngine> {
  const ort = (await import("onnxruntime-web/webgpu")) as typeof Ort;
  ort.env.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;
  ort.env.wasm.numThreads = 1;
  // ORT warns that it puts small shape ops on the CPU, on purpose. Only real errors are worth showing.
  ort.env.logLevel = "error";

  const total = IMAGE_MODEL.bytes;
  let loaded = 0;
  onProgress({ loaded, total, text: "Fetching tokenizer" });
  const [tj, tc] = await Promise.all([fetchJsonCached(`${TOKENIZER_BASE}/tokenizer.json`), fetchJsonCached(`${TOKENIZER_BASE}/tokenizer_config.json`)]);
  const tokenizer = new Tokenizer(tj, tc);

  const base: Ort.InferenceSession.SessionOptions = {
    executionProviders: ["webgpu"],
    enableMemPattern: false,
    enableCpuMemArena: false,
    logSeverityLevel: 3,
    extra: { session: { disable_prepacking: "1", use_device_allocator_for_initializers: "1", use_ort_model_bytes_directly: "1", use_ort_model_bytes_for_initializers: "1" } },
  };
  const sessions: Record<string, Ort.InferenceSession> = {};
  for (const f of FILES) {
    const bytes = await fetchCached(`${MODEL_BASE}/${f.path}`, n => {
      loaded += n;
      onProgress({ loaded: Math.min(loaded, total), total, text: `Downloading ${f.name.replace("_", " ")}` });
    });
    onProgress({ loaded: Math.min(loaded, total), total, text: `Loading ${f.name.replace("_", " ")} onto the GPU` });
    sessions[f.name] = await ort.InferenceSession.create(new Uint8Array(bytes), {
      ...base,
      freeDimensionOverrides: f.dims,
      ...(f.name === "text_encoder" ? { preferredOutputLocation: { last_hidden_state: "gpu-buffer" } } : {}),
    });
  }
  onProgress({ loaded: total, total, text: "Ready" });

  let busy: Promise<unknown> = Promise.resolve();
  async function run(prompt: string, seed: number): Promise<Generated> {
    const t0 = performance.now();
    // The UNet takes exactly 77 text positions. SD 2.x's text encoder pads with id 0; a long prompt keeps its end token.
    const raw = tokenizer.encode(prompt).ids;
    const ids = raw.length > 77 ? [...raw.slice(0, 76), raw[raw.length - 1]] : raw;
    while (ids.length < 77) ids.push(0);
    const { last_hidden_state } = await sessions.text_encoder.run({ input_ids: new ort.Tensor("int32", Int32Array.from(ids), [1, ids.length]) });

    const shape = [1, 4, 64, 64];
    const latent = noise(64 * 64 * 4, seed);
    const scaled = latent.map(v => v / Math.sqrt(SIGMA ** 2 + 1));
    const { out_sample } = await sessions.unet.run({
      sample: new ort.Tensor(scaled, shape),
      timestep: new ort.Tensor("int64", [BigInt(999)], [1]),
      encoder_hidden_states: last_hidden_state,
    });
    last_hidden_state.dispose();

    // One Euler step from sigma to 0, folded together with the VAE scaling.
    const eps = out_sample.data as Float32Array, denoised = new Float32Array(eps.length);
    for (let i = 0; i < eps.length; i++) denoised[i] = (latent[i] - SIGMA * eps[i]) / VAE_SCALE;
    const { sample } = await sessions.vae_decoder.run({ latent_sample: new ort.Tensor(denoised, shape) });
    const url = await toPngUrl(sample);
    return { url, prompt, seed, ms: performance.now() - t0, at: Date.now() };
  }

  return {
    generate(prompt, seed = (Math.random() * 2 ** 31) | 0) {
      const next = busy.then(() => run(prompt, seed));
      busy = next.catch(() => {});
      return next;
    },
    dispose() { for (const s of Object.values(sessions)) s.release(); },
  };
}
