"use client";

import { useEffect, useSyncExternalStore } from "react";

// The tracker checks localStorage "umami.disabled" before every send, so setting it is all it takes.
const KEY = "umami.disabled";

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
/** "off", "on", or "blocked" when this browser won't let the page use storage. */
function read() {
  try { return localStorage.getItem(KEY) ? "off" : "on"; } catch { return "blocked"; }
}
function write(off: boolean) {
  try { if (off) localStorage.setItem(KEY, "1"); else localStorage.removeItem(KEY); } catch {}
  listeners.forEach(l => l());
}

export default function NoTrack() {
  const state = useSyncExternalStore(subscribe, read, () => null);
  useEffect(() => write(true), []);

  if (state === null) return <div className="card panel"><p className="small">Checking this browser…</p></div>;
  if (state === "blocked") return <div className="card panel"><p>This browser won&apos;t let the page save the setting (storage is blocked), so it can&apos;t turn tracking off here.</p></div>;
  const off = state === "off";

  return (
    <div className="card panel" role="status">
      <p><b>{off ? "Tracking off on this browser" : "Tracking on on this browser"}</b></p>
      <p className="small">{off ? "Pages you open here aren't counted in our analytics." : "Pages you open here are counted again, like any visitor's."}</p>
      <div className="btns"><button className={off ? "btn alt" : "btn"} type="button" onClick={() => write(!off)}>{off ? "Turn tracking back on" : "Turn tracking off"}</button></div>
    </div>
  );
}
