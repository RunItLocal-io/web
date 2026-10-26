// RunItLocal.io Studio: a Python sandbox (Pyodide, Python compiled to WebAssembly) in its own worker. Each chat
// gets one, so each agent has its own little computer: a filesystem with the user's files in /data, and a
// Python that keeps its variables between runs. Nothing here touches the network except loading Pyodide and
// its packages once (the service worker keeps them for offline use).

// A module worker: Pyodide loads with import(), a CORS request, which works where importScripts can fail.
const PYODIDE = "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/";

const ready = (async () => {
  const { loadPyodide } = await import(PYODIDE + "pyodide.mjs");
  const py = await loadPyodide({ indexURL: PYODIDE, env: { MPLBACKEND: "AGG", HOME: "/home/pyodide" } });
  py.FS.mkdirTree("/data");
  py.FS.chdir("/data");
  return py;
})();

// Runs user code, then hands back any matplotlib figures as base64 PNGs and closes them.
const FIGURES = `
def __ril_figures():
    import sys
    if "matplotlib.pyplot" not in sys.modules:
        return []
    import io, base64
    import matplotlib.pyplot as plt
    out = []
    for n in plt.get_fignums():
        buf = io.BytesIO()
        plt.figure(n).savefig(buf, format="png", dpi=110, bbox_inches="tight")
        out.append(base64.b64encode(buf.getvalue()).decode())
    plt.close("all")
    return out
__ril_figures()
`;

self.onmessage = async ({ data: msg }) => {
  const reply = r => self.postMessage({ id: msg.id, ...r });
  let py;
  try { py = await ready; } catch (e) { return reply({ ok: false, out: "", error: "Python failed to start: " + e }); }

  if (msg.type === "write") {
    py.FS.writeFile("/data/" + msg.name, new Uint8Array(msg.bytes));
    return reply({ ok: true });
  }

  let out = "";
  const take = s => { if (out.length < 20000) out += s + "\n"; };
  py.setStdout({ batched: take });
  py.setStderr({ batched: take });
  try {
    await py.loadPackagesFromImports(msg.code, { messageCallback: () => {}, errorCallback: take });
    const result = await py.runPythonAsync(msg.code);
    if (result !== undefined && result !== null && out === "") take(String(result));
    if (result && typeof result.destroy === "function") result.destroy();
    const figs = py.runPython(FIGURES);
    const images = figs.toJs();
    figs.destroy();
    reply({ ok: true, out, images });
  } catch (e) {
    // Keep only the useful end of a Python traceback.
    const text = String(e && e.message || e).split("\n").filter(l => !l.includes("/lib/python") && !l.includes("_pyodide")).join("\n").trim();
    reply({ ok: false, out, error: text });
  }
};
