import { ImageResponse } from "next/og";

// App icon for the install manifest: a dark die with a lit grid of cells and the amber power LED.
const SIZES = [192, 512];

export function generateStaticParams() {
  return SIZES.map(s => ({ size: String(s) }));
}

const CELLS = 5;
const color = (i: number, j: number) => {
  const t = (i + j) / (2 * (CELLS - 1));
  const on = (i * 7 + j * 3) % 4 !== 0;
  const c = t < .5 ? "#c8ff2e" : t < .8 ? "#2ee6ff" : "#8a5cff";
  return on ? c : "rgba(255,255,255,.12)";
};

export async function GET(_req: Request, ctx: RouteContext<"/app-icon/[size]">) {
  const { size: raw } = await ctx.params;
  const size = SIZES.includes(Number(raw)) ? Number(raw) : 512;
  const u = size / 512;
  const cell = 46 * u, gap = 18 * u;
  return new ImageResponse(
    (
      <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", background: "#050608" }}>
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap, padding: 40 * u, borderRadius: 40 * u, border: `${4 * u}px solid rgba(200,255,46,.35)`, background: "#0b0f14" }}>
          {Array.from({ length: CELLS }, (_, i) => (
            <div key={i} style={{ display: "flex", gap }}>
              {Array.from({ length: CELLS }, (_, j) => (
                <div key={j} style={{ width: cell, height: cell, borderRadius: 8 * u, background: color(i, j) }} />
              ))}
            </div>
          ))}
          <div style={{ position: "absolute", top: -14 * u, right: -14 * u, width: 30 * u, height: 30 * u, borderRadius: 999, background: "#ffb020", boxShadow: `0 0 ${24 * u}px #ffb020` }} />
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
