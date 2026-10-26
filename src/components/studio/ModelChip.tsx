"use client";

import { useEffect, useRef, useState } from "react";
import Icon, { kindIcon } from "@/components/studio/Icon";
import type { StudioModel } from "@/lib/studio/models";

// The model chip in the composer: switch between models already on this device, or open the full library.

type Props = {
  model: StudioModel; ready: StudioModel[]; live: string | null; disabled: boolean;
  onPick: (m: StudioModel) => void; onAll: () => void;
};

export default function ModelChip({ model, ready, live, disabled, onPick, onAll }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <div className="chip-menu" ref={ref}>
      <button className="model-chip" type="button" disabled={disabled} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <span className={"dot" + (live === model.id ? " live" : "")} aria-hidden="true" />{model.label}<span className="caret-down" aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="chip-pop" role="menu">
          <div className="side-h">On this device</div>
          {ready.length === 0 && <p className="side-empty">Nothing downloaded yet.</p>}
          {ready.map(m => (
            <button key={m.id} type="button" role="menuitemradio" aria-checked={m.id === model.id} onClick={() => { setOpen(false); onPick(m); }}>
              <Icon name={kindIcon(m.group)} /><span>{m.label}</span>
              {live === m.id ? <span className="ml-meta live">live</span> : m.id === model.id && <Icon name="check" />}
            </button>
          ))}
          <button type="button" role="menuitem" className="chip-all" onClick={() => { setOpen(false); onAll(); }}>
            <Icon name="chip" /><span>All local models</span><span className="ml-meta">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
