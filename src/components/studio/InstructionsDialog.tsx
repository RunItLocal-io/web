"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/studio/Icon";

// The master prompt: standing instructions sent to every chat model, kept in this browser only.

type Props = { value: string; onSave: (v: string) => void; onClose: () => void };

export default function InstructionsDialog({ value, onSave, onClose }: Props) {
  const [text, setText] = useState(value);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div className="viewer" role="dialog" aria-modal="true" aria-labelledby="ins-h" onClick={onClose}>
      <form className="dialog" onClick={e => e.stopPropagation()} onSubmit={e => { e.preventDefault(); onSave(text); }}>
        <button className="icon-btn viewer-x" type="button" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        <h2 id="ins-h">Instructions</h2>
        <p>Tell every chat model about you and how you like answers. This goes with each message, and stays in this browser.</p>
        <textarea rows={7} maxLength={2000} autoFocus value={text} onChange={e => setText(e.target.value)}
          placeholder={"I'm a web developer in Toronto. Keep answers short, use metric units, and show code in TypeScript."} />
        <div className="viewer-acts">
          <button className="btn" type="submit"><Icon name="check" />Save</button>
          {value && <button className="btn alt" type="button" onClick={() => onSave("")}>Clear</button>}
        </div>
      </form>
    </div>
  );
}
