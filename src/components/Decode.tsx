"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&/<>=+*";

/** Text that resolves out of random glyphs, left to right, whenever it changes. */
export function Decode({ text, ms = 700 }: { text: string; ms?: number }) {
  const [out, setOut] = useState(text);

  useEffect(() => {
    const dur = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : ms;
    let raf = 0; const t0 = performance.now();
    const step = (now: number) => {
      const k = dur ? Math.min(1, (now - t0) / dur) : 1;
      const fixed = Math.floor(k * text.length);
      setOut(text.slice(0, fixed) + Array.from(text.slice(fixed), ch => ch === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0]).join(""));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [text, ms]);

  return <span className="decode" aria-label={text}><span aria-hidden="true">{out}</span></span>;
}

/** A number that eases to its new value. */
export function CountUp({ value, ms = 1100, format = (n: number) => String(Math.round(n)) }: { value: number; ms?: number; format?: (n: number) => string }) {
  const [n, setN] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const dur = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : ms;
    let raf = 0; const t0 = performance.now(), a = from.current;
    const step = (now: number) => {
      const k = dur ? Math.min(1, (now - t0) / dur) : 1, e = 1 - Math.pow(1 - k, 4);
      const v = a + (value - a) * e;
      setN(v); from.current = v;
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);

  return <>{format(n)}</>;
}
