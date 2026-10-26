// A Python sandbox per chat, each in its own Web Worker (public/py-worker.js runs Pyodide). Code that runs too
// long gets its worker killed and replaced, which is as close to pulling the plug on a computer as a tab gets.

export type RunResult = { ok: boolean; out: string; error?: string; images?: string[] };

const TIMEOUT_MS = 60_000;
const KEEP = 3;

class Sandbox {
  private worker: Worker | null = null;
  private seq = 0;
  private waiting = new Map<number, (r: RunResult) => void>();
  private files = new Map<string, ArrayBuffer>();

  private boot() {
    if (this.worker) return this.worker;
    const w = new Worker("/py-worker.js", { type: "module" });
    w.onmessage = ({ data }) => { this.waiting.get(data.id)?.(data); this.waiting.delete(data.id); };
    // If the worker itself can't start, say so now instead of waiting out the timeout.
    w.onerror = e => {
      e.preventDefault();
      const error = "The Python sandbox couldn't start" + (e.message ? `: ${e.message}` : ". Check your connection; it downloads once.");
      for (const done of this.waiting.values()) done({ ok: false, out: "", error });
      this.waiting.clear();
      this.worker?.terminate(); this.worker = null;
    };
    this.worker = w;
    // A fresh worker starts empty, so give it the chat's files again.
    for (const [name, bytes] of this.files) this.post({ type: "write", name, bytes: bytes.slice(0) });
    return w;
  }

  private post(msg: object, timeout = 0): Promise<RunResult> {
    const w = this.boot(), id = ++this.seq;
    return new Promise(resolve => {
      let timer = 0;
      this.waiting.set(id, r => { clearTimeout(timer); resolve(r); });
      if (timeout) timer = window.setTimeout(() => {
        this.waiting.delete(id);
        this.kill();
        resolve({ ok: false, out: "", error: `Stopped after ${timeout / 1000} seconds. The sandbox was restarted, so variables from earlier runs are gone.` });
      }, timeout);
      w.postMessage({ id, ...msg });
    });
  }

  write(name: string, bytes: ArrayBuffer) {
    this.files.set(name, bytes);
    return this.post({ type: "write", name, bytes: bytes.slice(0) });
  }

  has(name: string) { return this.files.has(name); }

  run(code: string) { return this.post({ type: "run", code }, TIMEOUT_MS); }

  kill() {
    this.worker?.terminate();
    this.worker = null;
    for (const done of this.waiting.values()) done({ ok: false, out: "", error: "Sandbox restarted." });
    this.waiting.clear();
  }
}

const boxes = new Map<string, Sandbox>();

/** The sandbox for a chat. Only the few most recent stay alive, since each holds its own Python in memory. */
export function sandboxFor(chatId: string): Sandbox {
  let box = boxes.get(chatId);
  if (box) { boxes.delete(chatId); boxes.set(chatId, box); return box; }
  box = new Sandbox();
  boxes.set(chatId, box);
  for (const [id, old] of boxes) {
    if (boxes.size <= KEEP) break;
    old.kill(); boxes.delete(id);
  }
  return box;
}

export function dropSandbox(chatId: string) {
  boxes.get(chatId)?.kill();
  boxes.delete(chatId);
}

/** The first ```python block in a model's answer, if any. */
export function pythonBlock(text: string): string | null {
  const m = text.match(/```(?:python|py)\s*\n([\s\S]*?)```/);
  return m ? m[1].trim() : null;
}
