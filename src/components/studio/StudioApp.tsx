"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import type { ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import { pulse } from "@/components/DieField";
import ShareButton from "@/components/ShareButton";
import PhoneGate from "@/components/studio/PhoneGate";
import Icon, { kindIcon } from "@/components/studio/Icon";
import { SITE } from "@/lib/share";
import ModelChip from "@/components/studio/ModelChip";
import ModelsView, { type Stored } from "@/components/studio/ModelsView";
import Sidebar, { type View } from "@/components/studio/Sidebar";
import { track } from "@/lib/analytics";
import { copyText } from "@/lib/copy";
import { detectGpu, type WebGpuInfo } from "@/lib/detect";
import { usableGb } from "@/lib/estimate";
import { INTEGRATED, MAC_UNKNOWN } from "@/lib/gpus";
import { deleteChat, listChats, saveChat, type Chat, type ChatFile, type SavedMsg } from "@/lib/studio/chats";
import { deleteImage, listImages, saveImage } from "@/lib/studio/gallery";
import {
  STUDIO_MODELS, cantRun, examplesFor, loadModel, storedModels, studioModel, unload, type Loaded, type Progress, type StudioModel,
} from "@/lib/studio/models";
import { PRESETS, loadInstructions, saveInstructions, systemPrompt } from "@/lib/studio/presets";
import { inAppBrowser, metered, sizeMb, uaFamily } from "@/lib/studio/gate";
import { dropSandbox, pythonBlock, sandboxFor } from "@/lib/studio/python";
import InstructionsDialog from "@/components/studio/InstructionsDialog";
import RichText from "@/components/studio/RichText";

// The installable Studio, laid out like a chat app: saved chats in the sidebar, a library of local models,
// a gallery of images, and a thread where the chosen model answers with words or a picture on the visitor's
// GPU. A model loads when picked or first needed, and the last one used reopens by itself. Chats and images
// stay in IndexedDB on this device. A service worker (public/sw.js) keeps the app itself offline-ready.

type InstallPrompt = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> };
type Pic = { id: string; url: string; prompt: string; seed: number };

type Msg =
  | { id: number; role: "user"; text: string; model: StudioModel; files?: string[] }
  | { id: number; role: "bot"; kind: "text"; model: StudioModel; text: string; chunks: string[]; done: boolean; tps?: number; warm?: boolean }
  | { id: number; role: "bot"; kind: "image"; model: StudioModel; prompt: string; url?: string; pic?: string; seed?: number; ms?: number; done: boolean; warm?: boolean }
  | { id: number; role: "bot"; kind: "run"; model: StudioModel; code: string; ok?: boolean; out: string; error?: string; images?: string[]; done: boolean }
  | { id: number; role: "note"; text: string; err?: boolean; retry?: StudioModel };

const LAST = "runitlocal:studio-model";
/**
 * Set while a model loads, refreshed as it progresses, cleared when it finishes or fails cleanly. If the page starts
 * and finds it fresh, the browser killed the tab mid-load (out of memory, usually on a phone) and reloaded it, so we
 * must not load the same model again or the tab dies in a loop.
 */
const LOADING = "runitlocal:studio-loading";
const CRASH_WINDOW_MS = 60_000;
const MAX_FILE = 25e6;
/** A load still at 0% after this long has stalled: say so and offer a retry instead of an endless 0%. */
const STALL_MS = 20_000;
const STALLED = "stalled";
/** Examples for a chat model with the Python sandbox on. */
const AGENT_EXAMPLES = [
  "Simulate 10,000 rolls of two dice and plot how often each total comes up",
  "If I save $300 a month at 5% a year, how much do I have after 10 years? Plot it",
  "Generate 200 random points, fit a straight line, and show me the plot",
];
// Message ids. Seeded from the clock so a dev hot reload, which re-runs this module while messages stay on screen,
// can never reuse an id that is already showing.
let nextId = Date.now();

/** What the model sees of a finished sandbox run. */
function runReport(ok: boolean, out: string, error?: string, images = 0) {
  const text = ok
    ? `[Sandbox] Your code ran. Output:\n${out.trim() || "(nothing printed)"}${images ? `\n[${images} plot${images > 1 ? "s" : ""} shown to the user]` : ""}`
    : `[Sandbox] Your code raised an error:\n${error ?? ""}${out.trim() ? `\nOutput before the error:\n${out.trim()}` : ""}`;
  return text.length > 4000 ? text.slice(0, 4000) + "\n[output truncated]" : text;
}

/** Earlier turns as the chat model should see them: text answers, plus sandbox output as user turns. */
function toTurns(history: Msg[]): ChatCompletionMessageParam[] {
  const turns: ChatCompletionMessageParam[] = [];
  for (const x of history) {
    if (x.role === "user" && x.model.kind === "chat") turns.push({ role: "user", content: x.text });
    else if (x.role === "bot" && x.kind === "text" && x.text) turns.push({ role: "assistant", content: splitThink(x.text).answer });
    else if (x.role === "bot" && x.kind === "run" && x.done) turns.push({ role: "user", content: runReport(!!x.ok, x.out, x.error, x.images?.length) });
  }
  return turns;
}

/** Reasoning models write their thinking inside <think>…</think> before the answer. */
function splitThink(text: string) {
  const open = text.indexOf("<think>");
  if (open < 0) return { answer: text };
  const close = text.indexOf("</think>", open);
  if (close < 0) return { think: text.slice(open + 7).trim(), answer: "", thinking: true };
  return { think: text.slice(open + 7, close).trim(), answer: (text.slice(0, open) + text.slice(close + 8)).trim() };
}

function toSaved(m: Msg): SavedMsg | null {
  if (m.role === "user") return { role: "user", text: m.text, model: m.model.id, files: m.files };
  if (m.role === "note") return null;
  if (m.kind === "text") return { role: "bot", kind: "text", model: m.model.id, text: m.text, tps: m.tps };
  if (m.kind === "run") return { role: "bot", kind: "run", model: m.model.id, code: m.code, ok: !!m.ok, out: m.out, error: m.error, images: m.images };
  return { role: "bot", kind: "image", model: m.model.id, prompt: m.prompt, pic: m.pic, seed: m.seed, ms: m.ms };
}

function fromSaved(s: SavedMsg, pics: Pic[]): Msg {
  const model = studioModel(s.model) ?? STUDIO_MODELS[0];
  if (s.role === "user") return { id: nextId++, role: "user", text: s.text, model, files: s.files };
  if (s.kind === "text") return { id: nextId++, role: "bot", kind: "text", model, text: s.text, chunks: [], done: true, tps: s.tps };
  if (s.kind === "run") return { id: nextId++, role: "bot", kind: "run", model, code: s.code, ok: s.ok, out: s.out, error: s.error, images: s.images, done: true };
  return { id: nextId++, role: "bot", kind: "image", model, prompt: s.prompt, pic: s.pic, url: pics.find(p => p.id === s.pic)?.url, seed: s.seed, ms: s.ms, done: true };
}

export default function StudioApp() {
  const [webgpu, setWebgpu] = useState<WebGpuInfo | null>(null);
  const [gpuName, setGpuName] = useState<string | null>(null);
  const [usable, setUsable] = useState(8);
  const [phone, setPhone] = useState(false);
  const [inApp, setInApp] = useState(false);
  /** A download waiting for a yes, on Data Saver or a cellular connection. */
  const [asking, setAsking] = useState<{ model: StudioModel; resolve: (ok: boolean) => void } | null>(null);
  /** The live model, when it opened from this device's cache instead of downloading. */
  const [fromCache, setFromCache] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState<string | null>(null);
  const [install, setInstall] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [online, setOnline] = useState(true);
  const [stored, setStored] = useState<Stored[]>([]);
  const [pics, setPics] = useState<Pic[]>([]);
  const [viewing, setViewing] = useState<Pic | null>(null);
  const [model, setModel] = useState<StudioModel>(STUDIO_MODELS[0]);
  const [live, setLive] = useState<string | null>(null);
  const [loading, setLoading] = useState<(Progress & { model: StudioModel }) | null>(null);
  const [view, setView] = useState<View>("chat");
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [side, setSide] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [instructions, setInstructions] = useState("");
  const [editing, setEditing] = useState(false);
  const [presetId, setPresetId] = useState("default");
  const [agentOn, setAgentOn] = useState(false);
  const [files, setFiles] = useState<ChatFile[]>([]);
  const [attached, setAttached] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const current = useRef<Loaded | null>(null);
  /**
   * Models that have answered since they were loaded. A freshly loaded model's first answer is much slower while
   * the browser prepares it for the GPU, so that answer says it's warming up instead of looking stuck.
   */
  const warmed = useRef(new Set<string>());
  const pending = useRef<{ id: string; p: Promise<Loaded | null> } | null>(null);
  const started = useRef(false);
  const storedRef = useRef<Stored[]>([]);
  const allowed = useRef(new Set<string>());
  const dirty = useRef(false);
  const whereRef = useRef("your GPU");
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const where = gpuName ? "your " + gpuName : "your GPU";
  const refreshStored = useCallback(async () => { const s = await storedModels(); storedRef.current = s; setStored(s); return s; }, []);
  const add = useCallback((m: Msg) => setMsgs(ms => [...ms, m]), []);
  const patch = (id: number, p: Partial<Msg>) => setMsgs(ms => ms.map(m => (m.id === id ? { ...m, ...p } as Msg : m)));

  /** The loaded engine for m, loading it (and unloading any other) if needed. Shared by concurrent callers. */
  const ensure = useCallback((m: StudioModel, gpu: WebGpuInfo): Promise<Loaded | null> => {
    if (current.current?.model.id === m.id) return Promise.resolve(current.current);
    if (pending.current?.id === m.id) return pending.current.p;
    const p = (async () => {
      const cached = storedRef.current.some(s => s.model.id === m.id);
      // On Data Saver or a cellular connection, a download waits for a yes. Once per model per visit.
      if (!cached && metered() && !allowed.current.has(m.id)) {
        setView("chat");
        const ok = await new Promise<boolean>(resolve => setAsking({ model: m, resolve }));
        setAsking(null);
        if (!ok) {
          if (pending.current?.id === m.id) pending.current = null;
          add({ id: nextId++, role: "note", text: `Didn't download ${m.label}. Pick one that's already on this device, or download it on Wi-Fi.` });
          return null;
        }
        allowed.current.add(m.id);
      }
      if (current.current) { unload(current.current); current.current = null; setLive(null); }
      setLoading({ model: m, p: 0, text: cached ? "Loading from cache" : "" });
      setFromCache(null);
      let marked = 0;
      const mark = () => { const now = Date.now(); if (now - marked < 1000) return; marked = now; try { localStorage.setItem(LOADING, JSON.stringify({ id: m.id, at: now })); } catch {} };
      mark();
      const t0 = performance.now(), ms = () => Math.round(performance.now() - t0);
      track("studio_model_load_start", { model: m.id, size_mb: sizeMb(m.size), cached });
      // A stalled load can't be cancelled, so it's abandoned: if it ever finishes, it's unloaded again.
      let moved = false, abandoned = false, timer = 0;
      const load = loadModel(m, gpu, pr => { if (abandoned) return; if (pr.p > 0) moved = true; mark(); setLoading({ model: m, ...pr }); });
      load.then(l => { if (abandoned) unload(l); }, () => {});
      try {
        const stall = new Promise<never>((_, no) => { timer = window.setTimeout(() => { if (!moved) no(new Error(STALLED)); }, STALL_MS); });
        const l = await Promise.race([load, stall]);
        current.current = l; setLive(m.id);
        warmed.current.delete(m.id);
        setFromCache(cached ? m.id : null);
        track("studio_model_load_done", { model: m.id, ms: ms(), cached });
        pulse(2, .5, .5);
        // Ask the browser not to clear gigabytes of weights when it's short on space.
        if (!cached) navigator.storage?.persist?.().catch(() => {});
        refreshStored();
        return l;
      } catch (err) {
        abandoned = true;
        const msg = err instanceof Error ? err.message : String(err);
        track("studio_model_load_fail", { model: m.id, error: msg.slice(0, 200), ms: ms() });
        // The error and its Retry button live in the thread, so show it even if this started from the library.
        setView("chat");
        add({ id: nextId++, role: "note", err: true, retry: m, text: msg === STALLED
          ? `${m.label} is stuck at 0%: nothing has arrived in ${STALL_MS / 1000} seconds. Check your connection and retry, or pick a smaller model.`
          : `Couldn't start ${m.label} on ${whereRef.current}: ${msg}. Close other GPU-heavy tabs and try again, or pick a smaller model.` });
        return null;
      } finally {
        clearTimeout(timer);
        try { localStorage.removeItem(LOADING); } catch {}
        setLoading(null);
        if (pending.current?.id === m.id) pending.current = null;
      }
    })();
    pending.current = { id: m.id, p };
    return p;
  }, [add, refreshStored]);

  /** Make m the current model and start loading it. */
  function pick(m: StudioModel, toChat = true) {
    if (m.id !== model.id) track("studio_change_model", { from: model.id, to: m.id });
    setModel(m); setSide(false);
    try { localStorage.setItem(LAST, m.id); } catch {}
    if (webgpu) ensure(m, webgpu);
    if (toChat) { setView("chat"); inputRef.current?.focus(); }
  }

  useEffect(() => {
    detectGpu().then(async ({ detection, webgpu }) => {
      setWebgpu(webgpu);
      let gb = 8;
      // Nothing downloads in an in-app browser, on a phone, or without WebGPU. Each is counted once per visit.
      const app = inAppBrowser();
      setInApp(app);
      const unsupported = (reason: "no_webgpu" | "in_app_browser" | "low_memory") => track("studio_unsupported", { reason, ua_family: uaFamily() });
      if (detection.status === "mobile") { setPhone(true); unsupported(app ? "in_app_browser" : "low_memory"); return; }
      if (app) { unsupported("in_app_browser"); return; }
      if (!webgpu.available) unsupported("no_webgpu");
      if (detection.status === "found" || detection.status === "guess") {
        const g = detection.gpu;
        if (g !== INTEGRATED && g !== MAC_UNKNOWN) { setGpuName(g.name); whereRef.current = "your " + g.name; }
        gb = usableGb(g, g.vram[0]);
        setUsable(gb);
      }
      setOnline(navigator.onLine);
      setInstalled(matchMedia("(display-mode: standalone)").matches);
      listImages().then(imgs => setPics(imgs.map(i => ({ id: i.id, url: URL.createObjectURL(i.blob), prompt: i.prompt, seed: i.seed }))));
      listChats().then(setChats);
      setInstructions(loadInstructions());
      const s = await refreshStored();
      if (started.current || !webgpu.available) return;
      started.current = true;
      // A load that never finished means the browser killed this tab while loading. Say so, and don't retry it.
      let crashed: StudioModel | null = null;
      try {
        const c = JSON.parse(localStorage.getItem(LOADING) ?? "null") as { id?: string; at?: number } | null;
        localStorage.removeItem(LOADING);
        if (c?.at && Date.now() - c.at < CRASH_WINDOW_MS) crashed = studioModel(c.id ?? null);
      } catch {}
      if (crashed) {
        add({ id: nextId++, role: "note", err: true, text: `Loading ${crashed.label} closed the page last time: this device probably ran out of memory for it. Close other tabs and apps, or pick a smaller model.` });
        return;
      }
      // Start on the last model used, else the first one this GPU can run. Reopen it now if it's already here.
      let last: StudioModel | null = null;
      try { last = studioModel(localStorage.getItem(LAST)); } catch {}
      const first = last && !cantRun(last, webgpu, gb) ? last : STUDIO_MODELS.find(m => !cantRun(m, webgpu, gb));
      if (!first) { unsupported("low_memory"); return; }
      setModel(first);
      if (s.some(x => x.model.id === first.id)) ensure(first, webgpu);
    });
    const onPrompt = (e: Event) => { e.preventDefault(); setInstall(e as InstallPrompt); };
    const onInstalled = () => { setInstalled(true); setInstall(null); };
    const onNet = () => setOnline(navigator.onLine);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("online", onNet);
    window.addEventListener("offline", onNet);
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") navigator.serviceWorker.register("/sw.js").catch(() => {});
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", onNet);
      window.removeEventListener("offline", onNet);
    };
  }, [refreshStored, ensure, add]);

  useEffect(() => () => { if (current.current) unload(current.current); }, []);

  // Follow the conversation while the reader is already near the bottom.
  useEffect(() => {
    const el = threadRef.current;
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 320) el.scrollTop = el.scrollHeight;
  }, [msgs, loading]);

  // Save the chat once an answer has finished.
  useEffect(() => {
    if (busy || !dirty.current || !chatId) return;
    dirty.current = false;
    const first = msgs.find(m => m.role === "user");
    if (!first) return;
    const lastModel = [...msgs].reverse().find(m => m.role !== "note");
    const c: Chat = {
      id: chatId, title: first.text.slice(0, 80), at: Date.now(),
      model: lastModel ? lastModel.model.id : model.id,
      msgs: msgs.map(toSaved).filter((x): x is SavedMsg => !!x),
      preset: presetId, agent: agentOn, files,
    };
    saveChat(c).then(() => setChats(cs => [c, ...cs.filter(x => x.id !== c.id)]));
  }, [busy, msgs, chatId, model.id, presetId, agentOn, files]);

  useEffect(() => {
    if (!viewing) return;
    const esc = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") setViewing(null); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [viewing]);

  async function run(text: string) {
    if (!webgpu?.available || inApp || busy || !text.trim()) return;
    const m = model, prompt = text.trim();
    track("studio_prompt_submit", { model: m.id, prompt_length: prompt.length });
    const history = msgs;
    const id = chatId ?? crypto.randomUUID();
    if (!chatId) setChatId(id);
    dirty.current = true;
    setView("chat");
    add({ id: nextId++, role: "user", text: prompt, model: m, files: attached.length ? attached : undefined });
    setAttached([]);
    setBusy(true);
    const l = await ensure(m, webgpu);
    if (l?.kind === "image") await paint(l.engine, m, prompt);
    else if (l?.kind === "chat") await chat(l.engine, m, prompt, history, id);
    setBusy(false);
  }

  async function paint(engine: Extract<Loaded, { kind: "image" }>["engine"], m: StudioModel, prompt: string) {
    const id = nextId++;
    add({ id, role: "bot", kind: "image", model: m, prompt, done: false, warm: !warmed.current.has(m.id) });
    try {
      const g = await engine.generate(prompt);
      warmed.current.add(m.id);
      pulse(1.6);
      const picId = `${g.at}-${g.seed}`;
      patch(id, { url: g.url, pic: picId, seed: g.seed, ms: g.ms, done: true });
      setPics(ps => [{ id: picId, url: g.url, prompt, seed: g.seed }, ...ps]);
      const blob = await fetch(g.url).then(r => r.blob());
      saveImage({ id: picId, blob, prompt, seed: g.seed, ms: g.ms, at: g.at });
    } catch (err) {
      setMsgs(ms => ms.filter(x => x.id !== id));
      add({ id: nextId++, role: "note", err: true, text: `The GPU stopped painting: ${err instanceof Error ? err.message : String(err)}` });
    }
  }

  async function chat(engine: Extract<Loaded, { kind: "chat" }>["engine"], m: StudioModel, prompt: string, history: Msg[], chat: string) {
    // The model sees the last few turns, whichever chat model wrote them. With the sandbox on, each answer that
    // contains a python block is run and its output handed back, until the model answers in plain words.
    const turns = [...toTurns(history).slice(-10), { role: "user", content: prompt } as ChatCompletionMessageParam];
    const system = systemPrompt(presetId, instructions, { on: agentOn, files: files.map(f => f.name) });
    for (let step = 0; step < 6; step++) {
      const answer = await stream(engine, m, system, turns);
      const code = agentOn ? pythonBlock(splitThink(answer).answer) : null;
      if (!code) return;
      turns.push({ role: "assistant", content: splitThink(answer).answer });
      turns.push({ role: "user", content: await execute(m, code, chat) });
    }
    add({ id: nextId++, role: "note", text: "Stopped after six steps. Ask it to continue if it wasn't done." });
  }

  /** Streams one answer into the thread and returns its full text. */
  async function stream(engine: Extract<Loaded, { kind: "chat" }>["engine"], m: StudioModel, system: string, turns: ChatCompletionMessageParam[]) {
    const id = nextId++;
    add({ id, role: "bot", kind: "text", model: m, text: "", chunks: [], done: false, warm: !warmed.current.has(m.id) });
    const chunks: string[] = [];
    let first = 0;
    try {
      const out = await engine.chat.completions.create({
        messages: [...(system ? [{ role: "system", content: system } as ChatCompletionMessageParam] : []), ...turns],
        stream: true, stream_options: { include_usage: true }, max_tokens: agentOn || m.group === "Code & reasoning" ? 1500 : 600,
        ...(m.noThink ? { extra_body: { enable_thinking: false } } : {}),
      });
      for await (const chunk of out) {
        const d = chunk.choices[0]?.delta?.content;
        if (d) {
          const now = performance.now();
          if (!first) first = now;
          chunks.push(d);
          const tps = (now - first) > 250 ? (chunks.length - 1) / ((now - first) / 1000) : undefined;
          if (chunks.length % 2 === 0) pulse(.35);
          patch(id, { text: chunks.join(""), chunks: chunks.slice(), ...(tps ? { tps } : {}) });
        }
        const exact = chunk.usage?.extra?.decode_tokens_per_s;
        if (exact) patch(id, { tps: exact });
      }
    } catch (err) {
      chunks.push("\n\n[Stopped: " + (err instanceof Error ? err.message : "the GPU gave up") + "]");
      patch(id, { text: chunks.join(""), chunks: chunks.slice() });
    }
    warmed.current.add(m.id);
    patch(id, { done: true });
    return chunks.join("");
  }

  /** Runs code in this chat's sandbox, shows the run in the thread, and returns what the model should see. */
  async function execute(m: StudioModel, code: string, chat: string) {
    const id = nextId++;
    add({ id, role: "bot", kind: "run", model: m, code, out: "", done: false });
    const box = sandboxFor(chat);
    for (const f of files) if (!box.has(f.name)) await box.write(f.name, f.bytes);
    const r = await box.run(code);
    patch(id, { ok: r.ok, out: r.out, error: r.error, images: r.images, done: true });
    if (r.images?.length) pulse(1.2);
    return runReport(r.ok, r.out, r.error, r.images?.length);
  }

  async function attach(list: FileList | null) {
    if (!list) return;
    for (const f of Array.from(list)) {
      if (f.size > MAX_FILE) { add({ id: nextId++, role: "note", err: true, text: `${f.name} is over 25 MB, too big for the browser sandbox.` }); continue; }
      const bytes = await f.arrayBuffer();
      setFiles(fs => [...fs.filter(x => x.name !== f.name), { name: f.name, bytes }]);
      setAttached(p => [...p.filter(x => x !== f.name), f.name]);
    }
    setAgentOn(true);
    inputRef.current?.focus();
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const t = input; setInput("");
    run(t);
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); onSubmit(e); }
  }

  function newChat() {
    if (busy) return;
    setChatId(null); setMsgs([]); setFiles([]); setAttached([]); setView("chat"); setSide(false);
    inputRef.current?.focus();
  }

  /** Start a fresh chat on m, from the model library. */
  function startWith(m: StudioModel) {
    if (busy) return;
    setChatId(null); setMsgs([]); setFiles([]); setAttached([]);
    pick(m);
  }

  function openChat(c: Chat) {
    if (busy) return;
    setChatId(c.id); setMsgs(c.msgs.map(s => fromSaved(s, pics))); setView("chat"); setSide(false);
    setPresetId(c.preset ?? "default"); setAgentOn(!!c.agent); setFiles(c.files ?? []); setAttached([]);
    const m = studioModel(c.model);
    if (m && webgpu && !cantRun(m, webgpu, usable)) setModel(m);
  }

  async function dropChat(c: Chat) {
    setChats(cs => cs.filter(x => x.id !== c.id));
    if (c.id === chatId) newChat();
    dropSandbox(c.id);
    await deleteChat(c.id);
  }

  async function remove(s: Stored) {
    if (current.current?.model.id === s.model.id) { unload(current.current); current.current = null; setLive(null); }
    await s.remove();
    refreshStored();
  }

  async function dropPic(p: Pic) {
    setPics(ps => ps.filter(x => x.id !== p.id));
    setViewing(null);
    await deleteImage(p.id);
  }

  function reuse(prompt: string) {
    const sd = STUDIO_MODELS.find(m => m.kind === "image");
    if (sd && webgpu && !cantRun(sd, webgpu, usable)) setModel(sd);
    setInput(prompt); setViewing(null); setView("chat");
    inputRef.current?.focus();
  }

  function copy(id: number, text: string) {
    navigator.clipboard?.writeText(text).then(() => { setCopied(id); setTimeout(() => setCopied(c => (c === id ? null : c)), 1400); }, () => {});
  }

  function retry(note: number, m: StudioModel) {
    setMsgs(ms => ms.filter(x => x.id !== note));
    pick(m);
  }

  const copyLink = () => copyText(location.href, null, () => setLinkCopied("Copied"), () => setLinkCopied("Copy it from the address bar"));

  const isImage = model.kind === "image";
  const here = stored.some(s => s.model.id === model.id);
  const noGpu = webgpu && !webgpu.available;
  const blocked = !!noGpu || inApp;
  const isLive = live === model.id;
  const ready = STUDIO_MODELS.filter(m => live === m.id || stored.some(s => s.model.id === m.id));
  const status = loading?.model.id === model.id ? `Loading ${model.label} · ${Math.round(loading.p * 100)}%`
    : isLive ? `${model.label} · ${fromCache === model.id ? "loaded from cache, " : ""}running on ${where}` : here ? `${model.label} · ready on this device` : `${model.label} · ${model.size}, downloads on first use`;
  const title = view === "models" ? "Local models" : view === "images" ? "Images" : chats.find(c => c.id === chatId)?.title ?? "New chat";

  // Installed, the app window is only the Studio, so links to the website open in the browser.
  const out = installed ? { target: "_blank", rel: "noopener" } : {};

  /** Avatar beside each answer: the model's kind, lit while it works. */
  const avatar = (m: StudioModel, working: boolean) => <span className={"avatar" + (working ? " working" : "")}><Icon name={kindIcon(m.group)} /></span>;

  if (phone) return <PhoneGate inApp={inApp} />;

  return (
    <div className="app">
      <Sidebar open={side} view={view} chats={chats} chatId={chatId} readyCount={ready.length} picCount={pics.length}
        webgpu={webgpu} gpuName={gpuName} online={online} installed={installed} canInstall={!!install}
        hasInstructions={!!instructions.trim()} onInstructions={() => { setEditing(true); setSide(false); }}
        onNew={newChat} onView={v => { setView(v); setSide(false); }} onOpen={openChat} onDelete={dropChat}
        onInstall={async () => { if (install) { await install.prompt(); setInstall(null); } }} />
      {side && <button className="scrim" type="button" aria-label="Close sidebar" onClick={() => setSide(false)} />}

      <main className={"work view-" + view}>
        <header className="work-top">
          <button className="icon-btn menu-btn" type="button" aria-label="Open sidebar" onClick={() => setSide(true)}><Icon name="menu" /></button>
          <div className="work-title">
            <b>{title}</b>
            {view === "chat" && <span className={isLive ? "hot" : ""}>{isLive && <span className="dot live" aria-hidden="true" />}{status}</span>}
          </div>
          <span className="work-flag" title="Runs entirely in this tab">Private · on-device</span>
          <ShareButton className="icon-btn" url={`${SITE}/studio`} text="I'm running AI models on my own GPU, right in the browser. Nothing leaves my machine." label="Share the Studio"><Icon name="share" /></ShareButton>
          <Link className="icon-btn" href="/" aria-label="Back to RunItLocal.io" title="Back to RunItLocal.io" {...out}><Icon name="home" /></Link>
        </header>

        {view === "models" ? (
          <div className="thread">
            <ModelsView model={model} live={live} loading={loading} webgpu={webgpu} usableGb={usable} stored={stored} locked={busy || !!loading} where={where}
              onUse={startWith} onDownload={m => pick(m, false)} onRemove={remove} />
          </div>
        ) : view === "images" ? (
          <div className="thread">
            <div className="library">
              <header className="lib-head">
                <div>
                  <h1>Images</h1>
                  <p>Everything you&apos;ve painted, kept in this browser on this device. Nothing is uploaded.</p>
                </div>
              </header>
              {pics.length ? (
                <ul className="gallery">
                  {pics.map(x => (
                    <li key={x.id}>
                      <button type="button" onClick={() => setViewing(x)} title={x.prompt}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL made on this device */}
                        <img src={x.url} alt={x.prompt} width={256} height={256} />
                        <span>{x.prompt}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="lib-empty">
                  <p>No images yet.</p>
                  {STUDIO_MODELS.filter(m => m.kind === "image").map(m => (
                    <button key={m.id} className="btn" type="button" onClick={() => pick(m)}><Icon name="image" />Paint something with {m.label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="thread" ref={threadRef} aria-live="polite">
            <div className="thread-in">
              {inApp ? (
                <div className="hello" role="alert">
                  <span className="hello-orb"><Icon name="share" /></span>
                  <h1>Open in Safari or Chrome to run models on this device</h1>
                  <p>Browsers built into apps, like Facebook and Instagram, can&apos;t load AI models. Copy the link, then open it in your browser.</p>
                  <button className="btn" type="button" onClick={copyLink}><Icon name="copy" />{linkCopied ?? "Copy link"}</button>
                </div>
              ) : noGpu ? (
                <div className="hello" role="alert">
                  <span className="hello-orb"><Icon name="chip" /></span>
                  <h1>This browser can&apos;t run local models</h1>
                  <p>It doesn&apos;t let web pages use your graphics card (WebGPU is off or unsupported), so nothing can load here. The Studio runs in current Chrome and Edge on a computer, and Safari 26 on a Mac.</p>
                  <p className="blocked-links"><Link href="/gpu" {...out}>What can my GPU run?</Link><Link href="/learn" {...out}>Learn to run AI locally</Link></p>
                </div>
              ) : !msgs.some(m => m.role === "user") ? (
                <div className="hello">
                  <span className={"hello-orb" + (isLive ? " live" : "")}><Icon name={kindIcon(model.group)} /></span>
                  <h1>{isImage ? "What should we paint?" : agentOn ? "What should we work out?" : model.group === "Chat" ? "Ask me anything." : "What are we working on?"}</h1>
                  <p>{agentOn && !isImage ? `${model.label} with a Python sandbox of its own: it writes code, runs it here in your browser, reads the result and keeps going. Attach a CSV to analyse it.` : `${model.label}: ${model.blurb}`} <button className="linkish" type="button" onClick={() => setView("models")}>Change model</button></p>
                  {!here && !isLive && webgpu && <p className="hello-note"><Icon name="down" />{model.size}, downloaded once on your first prompt. After that it opens in seconds, even offline.</p>}
                  <div className="examples">
                    {(agentOn && !isImage ? AGENT_EXAMPLES : examplesFor(model)).map(x => (
                      <button key={x} type="button" disabled={!webgpu || busy} onClick={() => { track("studio_example_click", { prompt: x }); run(x); }}>
                        <span>{x}</span><Icon name="up" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {msgs.map(m => {
                if (m.role === "user") return (
                  <div key={m.id} className="msg-you">
                    {m.files && <span className="msg-files">{m.files.map(f => <span key={f} className="file-chip"><Icon name="clip" />{f}</span>)}</span>}
                    {m.text}
                  </div>
                );
                if (m.role === "bot" && m.kind === "run") return (
                  <div key={m.id} className="msg-bot">
                    <span className={"avatar" + (m.done ? "" : " working")}><Icon name="terminal" /></span>
                    <div className="msg-body run">
                      <details className="run-code" open={!m.done}>
                        <summary>
                          {m.done ? (m.ok ? "Ran Python" : "Python hit an error") : "Running Python in your browser…"}
                          {!m.done && <span className="spin sm" aria-hidden="true" />}
                        </summary>
                        <pre><code>{m.code}</code></pre>
                      </details>
                      {m.done && (m.out.trim() || m.error) && <pre className={"run-out" + (m.ok ? "" : " err")}>{[m.out.trim(), m.error].filter(Boolean).join("\n")}</pre>}
                      {m.images?.map((img, i) => (
                        // eslint-disable-next-line @next/next/no-img-element -- a plot made in the sandbox on this device
                        <img key={i} className="run-img" src={`data:image/png;base64,${img}`} alt={`Plot ${i + 1}`} />
                      ))}
                    </div>
                  </div>
                );
                if (m.role === "note") return (
                  <p key={m.id} className={"note" + (m.err ? " err" : "")}>
                    {m.text}
                    {m.retry && <button className="btn alt note-retry" type="button" disabled={busy || !!loading} onClick={() => retry(m.id, m.retry!)}><Icon name="again" />Retry</button>}
                  </p>
                );
                if (m.kind === "image") return (
                  <div key={m.id} className="msg-bot">
                    {avatar(m.model, !m.done)}
                    <div className="msg-body">
                      <span className="msg-who">{m.model.label}</span>
                      <figure className="shot">
                        <div className={"canvas-stage" + (m.done ? "" : " busy")}>
                          {m.url
                            // eslint-disable-next-line @next/next/no-img-element -- blob: URL of an image made on this device
                            ? <img src={m.url} alt={m.prompt} width={512} height={512} />
                            : <span className="painting">{m.done ? "This image was deleted." : m.warm ? `Warming up ${where} · the first picture is slower…` : `Painting on ${where}…`}</span>}
                          {!m.done && <span className="scan" aria-hidden="true" />}
                          {m.done && m.url && (
                            <div className="shot-acts">
                              <a className="icon-btn" href={m.url} download={`runitlocal-${m.seed}.png`} aria-label="Save PNG" title="Save PNG"><Icon name="down" /></a>
                              <button className="icon-btn" type="button" onClick={() => reuse(m.prompt)} aria-label="Edit prompt" title="Edit prompt"><Icon name="reuse" /></button>
                              <button className="icon-btn" type="button" disabled={busy} onClick={() => run(m.prompt)} aria-label="Paint again" title="Paint again"><Icon name="again" /></button>
                              <ShareButton className="icon-btn" url={`${SITE}/studio`} text="Made this on my own GPU, right in the browser, with RunItLocal.io" image={{ src: m.url, name: `runitlocal-${m.seed}.png` }} label="Share image"><Icon name="share" /></ShareButton>
                            </div>
                          )}
                        </div>
                        {m.done && m.ms != null && <figcaption className="msg-meta">{(m.ms / 1000).toFixed(1)} s · seed {m.seed} · 512 × 512</figcaption>}
                      </figure>
                    </div>
                  </div>
                );
                const t = splitThink(m.text);
                return (
                  <div key={m.id} className="msg-bot">
                    {avatar(m.model, !m.done)}
                    <div className="msg-body">
                      <span className="msg-who">{m.model.label}</span>
                      {t.think !== undefined && (
                        <details className="think" open={t.thinking}>
                          <summary>{t.thinking ? "Thinking…" : "Thought it through"}</summary>
                          <p>{t.think}</p>
                        </details>
                      )}
                      {!t.thinking && (
                        <div className={"msg-text" + (!m.text ? " wait" : "")}>
                          {m.text.includes("```") ? <RichText text={t.think !== undefined ? t.answer : m.text} />
                            : t.think !== undefined || !m.chunks.length ? (t.think !== undefined ? t.answer : m.text || (m.warm ? "Warming up your GPU · the first answer is slower…" : "Thinking on your GPU…"))
                            : m.chunks.map((c, j) => <span key={j} className="tok">{c}</span>)}
                          {!m.done && <span className="caret" aria-hidden="true" />}
                        </div>
                      )}
                      <div className="msg-meta">
                        <span className="tps">{m.warm && !m.done ? "warming up" : m.tps ? `${Math.round(m.tps)} tok/s` : "––"}</span>
                        {m.done && m.text && (
                          <button className="icon-btn sm" type="button" onClick={() => copy(m.id, splitThink(m.text).answer)} aria-label="Copy answer" title="Copy">
                            <Icon name={copied === m.id ? "check" : "copy"} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {asking && (
                <div className="msg-bot">
                  {avatar(asking.model, false)}
                  <div className="msg-body loading" role="alertdialog" aria-labelledby="ask-h">
                    <div className="load-top"><span id="ask-h"><b>Download {asking.model.label}?</b></span></div>
                    <p className="ask-text">This downloads about {asking.model.size}. You look to be on Data Saver or a cellular connection, so we&apos;re checking first. After that it stays on this device.</p>
                    <div className="ask-acts">
                      <button className="btn" type="button" onClick={() => asking.resolve(true)}><Icon name="down" />Download</button>
                      <button className="btn alt" type="button" onClick={() => asking.resolve(false)}>Not now</button>
                    </div>
                  </div>
                </div>
              )}

              {loading && (
                <div className="msg-bot">
                  {avatar(loading.model, true)}
                  <div className="msg-body loading" role="status">
                    <div className="load-top">
                      <span><b>{stored.some(s => s.model.id === loading.model.id) ? "Opening" : "Downloading"} {loading.model.label}</b> onto {where}{stored.some(s => s.model.id === loading.model.id) && <span className="load-cache">from cache</span>}</span>
                      <span className="load-pct">{Math.round(loading.p * 100)}<small>%</small></span>
                    </div>
                    <div className="bar"><span style={{ width: `${Math.max(2, Math.round(loading.p * 100))}%` }} /></div>
                    <p className="load-text">{loading.text || "Starting…"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {view === "chat" && (
          <div className="composer-wrap">
            <form className="composer" onSubmit={onSubmit} noValidate>
              {attached.length > 0 && (
                <div className="pending">
                  {attached.map(f => (
                    <span key={f} className="file-chip"><Icon name="clip" />{f}
                      <button type="button" aria-label={`Remove ${f}`} onClick={() => { setAttached(p => p.filter(x => x !== f)); setFiles(fs => fs.filter(x => x.name !== f)); }}><Icon name="x" /></button>
                    </span>
                  ))}
                </div>
              )}
              <label htmlFor="studio-in" className="sr">{isImage ? "Describe an image" : "Your message"}</label>
              <textarea id="studio-in" ref={inputRef} rows={1} maxLength={2000} autoFocus autoComplete="off" disabled={blocked}
                placeholder={isImage ? "Describe an image…" : `Message ${model.label}…`} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey} />
              <div className="composer-row">
                <ModelChip model={model} ready={ready} live={live} disabled={busy || !!loading || blocked} onPick={m => pick(m)} onAll={() => setView("models")} />
                {!isImage && (
                  <>
                    <label className="preset">
                      <span className="sr">Preset</span>
                      <select value={presetId} onChange={e => setPresetId(e.target.value)} disabled={busy}>
                        {PRESETS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                      </select>
                    </label>
                    <button className={"tool-btn" + (agentOn ? " on" : "")} type="button" aria-pressed={agentOn} disabled={busy} onClick={() => setAgentOn(a => !a)}
                      title="Let the model write and run Python in a sandbox in your browser">
                      <Icon name="terminal" />Python
                    </button>
                    <button className="icon-btn" type="button" disabled={busy} onClick={() => fileRef.current?.click()} aria-label="Attach a file" title="Attach a file for the Python sandbox">
                      <Icon name="clip" />
                    </button>
                    <input ref={fileRef} type="file" multiple hidden onChange={e => { attach(e.target.files); e.target.value = ""; }} />
                  </>
                )}
                <span className="hint">Enter to {isImage ? "paint" : "send"} · Shift+Enter for a new line</span>
                <button className="send" type="submit" disabled={busy || !webgpu || blocked || !input.trim()} aria-label={isImage ? "Paint" : "Send"}>
                  {busy ? <span className="spin" aria-hidden="true" /> : <Icon name="up" />}
                </button>
              </div>
            </form>
            <p className="composer-foot">Runs on {where}. Nothing you type or make leaves this machine.</p>
          </div>
        )}
      </main>

      {editing && (
        <InstructionsDialog value={instructions} onClose={() => setEditing(false)}
          onSave={v => { setInstructions(v); saveInstructions(v); setEditing(false); }} />
      )}

      {viewing && (
        <div className="viewer" role="dialog" aria-modal="true" aria-label={viewing.prompt} onClick={() => setViewing(null)}>
          <figure onClick={e => e.stopPropagation()}>
            <button className="icon-btn viewer-x" type="button" onClick={() => setViewing(null)} aria-label="Close"><Icon name="x" /></button>
            {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL made on this device */}
            <img src={viewing.url} alt={viewing.prompt} width={512} height={512} />
            <figcaption>
              <p>{viewing.prompt}</p>
              <div className="viewer-acts">
                <button className="btn" type="button" onClick={() => reuse(viewing.prompt)}><Icon name="reuse" />Use this prompt</button>
                <a className="btn alt" href={viewing.url} download={`runitlocal-${viewing.seed}.png`}><Icon name="down" />Save PNG</a>
                <ShareButton className="btn alt" url={`${SITE}/studio`} text="Made this on my own GPU, right in the browser, with RunItLocal.io" image={{ src: viewing.url, name: `runitlocal-${viewing.seed}.png` }} label="Share">
                  <Icon name="share" />Share
                </ShareButton>
                <button className="btn alt danger" type="button" onClick={() => dropPic(viewing)}><Icon name="trash" />Delete</button>
              </div>
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}
