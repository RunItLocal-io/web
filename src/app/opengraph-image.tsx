import { ImageResponse } from "next/og";

// The card social networks show when someone shares a link to the site: the brand, what it does, and the die
// from the app icon. Child routes inherit it unless they set their own.

export const alt = "RunItLocal.io: run AI on your own hardware";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CELLS = 5;
const color = (i: number, j: number) => {
  const t = (i + j) / (2 * (CELLS - 1));
  const on = (i * 7 + j * 3) % 4 !== 0;
  return on ? (t < .5 ? "#c8ff2e" : t < .8 ? "#2ee6ff" : "#8a5cff") : "rgba(255,255,255,.12)";
};

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "72px 88px", background: "radial-gradient(70% 90% at 80% 50%, #0e1a22 0%, #050608 70%)", color: "#eef3f8" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 640 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
            <div style={{ width: 22, height: 22, borderRadius: 999, background: "#ffb020", boxShadow: "0 0 24px #ffb020" }} />
            <span>RunItLocal</span><span style={{ color: "#6b7785", marginLeft: -18 }}>.io</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3 }}>
            <span>Run AI on your</span>
            <span style={{ color: "#c8ff2e" }}>own hardware.</span>
          </div>
          <div style={{ fontSize: 28, color: "#a3afbd", lineHeight: 1.4 }}>
            See what your GPU can run, then chat and make images with models that never leave your machine.
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 16, padding: 36, borderRadius: 36, border: "4px solid rgba(200,255,46,.35)", background: "#0b0f14" }}>
          {Array.from({ length: CELLS }, (_, i) => (
            <div key={i} style={{ display: "flex", gap: 16 }}>
              {Array.from({ length: CELLS }, (_, j) => <div key={j} style={{ width: 42, height: 42, borderRadius: 8, background: color(i, j) }} />)}
            </div>
          ))}
          <div style={{ position: "absolute", top: -14, right: -14, width: 30, height: 30, borderRadius: 999, background: "#ffb020", boxShadow: "0 0 24px #ffb020" }} />
        </div>
      </div>
    ),
    size,
  );
}
