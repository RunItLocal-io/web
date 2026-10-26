// The brand mark drawn for ImageResponse: a dark die with a lit grid of cells and the amber power LED.
// Same drawing as app-icon/[size] and opengraph-image, scaled to any square size.

const CELLS = 5;
const color = (i: number, j: number) => {
  const t = (i + j) / (2 * (CELLS - 1));
  const on = (i * 7 + j * 3) % 4 !== 0;
  return on ? (t < .5 ? "#c8ff2e" : t < .8 ? "#2ee6ff" : "#8a5cff") : "rgba(255,255,255,.12)";
};

/** Full-bleed square icon. `tight` drops the outer margin so it still reads at favicon size. */
export function Die({ size, tight = false }: { size: number; tight?: boolean }) {
  const u = size / 512;
  const pad = (tight ? 34 : 40) * u, cell = (tight ? 64 : 46) * u, gap = (tight ? 20 : 18) * u;
  return (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", background: tight ? "transparent" : "#050608" }}>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap, padding: pad, borderRadius: (tight ? 96 : 40) * u, border: `${(tight ? 16 : 4) * u}px solid rgba(200,255,46,.45)`, background: "#0b0f14" }}>
        {Array.from({ length: CELLS }, (_, i) => (
          <div key={i} style={{ display: "flex", gap }}>
            {Array.from({ length: CELLS }, (_, j) => (
              <div key={j} style={{ width: cell, height: cell, borderRadius: (tight ? 12 : 8) * u, background: color(i, j) }} />
            ))}
          </div>
        ))}
        <div style={{ position: "absolute", top: (tight ? -6 : -14) * u, right: (tight ? -6 : -14) * u, width: (tight ? 80 : 30) * u, height: (tight ? 80 : 30) * u, borderRadius: 999, background: "#ffb020", boxShadow: `0 0 ${24 * u}px #ffb020` }} />
      </div>
    </div>
  );
}
