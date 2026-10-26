"use client";

import { useEffect, useRef } from "react";

// A field of memory cells behind the hero. Cells twinkle, light up around the cursor, and ripple
// outward when something calls pulse(): on GPU detection, and on every token the in-tab model writes.

type Pulse = { x: number; y: number; t0: number; s: number };

/** x, y are 0..1 across the field; omit them for a random spot. */
export function pulse(strength = 1, x?: number, y?: number) {
  window.dispatchEvent(new CustomEvent("ril:pulse", { detail: { x, y, strength } }));
}

const GAP = 20;
const SPEED = 560;      // ring speed, px/s
const LIFE = 2.4;       // seconds
const BAND = 38;        // ring thickness, px

export default function DieField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, cols = 0, rows = 0, raf = 0, visible = true, lastAmbient = 0;
    let seeds = new Float32Array(0), colColor: string[] = [];
    const pulses: Pulse[] = [];
    const mouse = { x: -1e4, y: -1e4 };

    function resize() {
      const dpr = Math.min(2, devicePixelRatio || 1);
      w = c!.clientWidth; h = c!.clientHeight;
      c!.width = Math.round(w * dpr); c!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / GAP) + 1; rows = Math.ceil(h / GAP) + 1;
      seeds = new Float32Array(cols * rows).map(() => Math.random());
      // lime on the left fading to cyan, then violet on the far right
      colColor = Array.from({ length: cols }, (_, i) => {
        const t = i / Math.max(1, cols - 1);
        const [a, b, k] = t < .6 ? [[200, 255, 46], [46, 230, 255], t / .6] : [[46, 230, 255], [138, 92, 255], (t - .6) / .4];
        return a.map((v, j) => Math.round(v + (b[j] - v) * k)).join(",");
      });
    }

    function frame(now: number) {
      ctx!.clearRect(0, 0, w, h);
      ctx!.globalCompositeOperation = "lighter";
      const t = now / 1000;
      if (!reduce && now - lastAmbient > 1600) { pulses.push({ x: Math.random() * w, y: Math.random() * h * .8, t0: t, s: .45 }); lastAmbient = now; }
      for (let k = pulses.length - 1; k >= 0; k--) if (t - pulses[k].t0 > LIFE) pulses.splice(k, 1);
      for (let i = 0; i < cols; i++) {
        const x = i * GAP + GAP / 2;
        for (let j = 0; j < rows; j++) {
          const y = j * GAP + GAP / 2, seed = seeds[i * rows + j];
          let v = .05 + .05 * Math.sin(t * 1.3 + seed * 6.283);
          for (const p of pulses) {
            const age = t - p.t0, d = Math.hypot(x - p.x, y - p.y) - age * SPEED;
            v += Math.exp(-(d * d) / (2 * BAND * BAND)) * p.s * (1 - age / LIFE);
          }
          const dm = Math.hypot(x - mouse.x, y - mouse.y);
          if (dm < 260) v += .55 * Math.exp(-(dm * dm) / (2 * 80 * 80));
          if (v < .05) continue;
          if (v > 1) v = 1;
          const s = 1 + v * 2.4;
          ctx!.fillStyle = `rgba(${colColor[i]},${v})`;
          ctx!.fillRect(x - s / 2, y - s / 2, s, s);
        }
      }
      ctx!.globalCompositeOperation = "source-over";
      if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(frame);
    }

    function start() { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }

    function onPulse(e: Event) {
      if (reduce) return;
      const d = (e as CustomEvent<{ x?: number; y?: number; strength?: number }>).detail || {};
      pulses.push({ x: (d.x ?? Math.random()) * w, y: (d.y ?? Math.random() * .8) * h, t0: performance.now() / 1000, s: d.strength ?? 1 });
      if (pulses.length > 24) pulses.shift();
    }
    function onMove(e: PointerEvent) {
      const r = c!.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    }
    function onVis() { if (!document.hidden && visible) start(); }

    resize(); start();
    const ro = new ResizeObserver(() => { resize(); if (reduce) start(); });
    ro.observe(c);
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) start(); });
    io.observe(c);
    window.addEventListener("ril:pulse", onPulse);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      window.removeEventListener("ril:pulse", onPulse);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} className="field" aria-hidden="true" />;
}
