import { ImageResponse } from "next/og";
import { fmt, shareChart } from "@/lib/charts";
import { TRACKS, article } from "@/lib/learn";

// The card social networks show for a Learn article: the brand, where the article sits, and its title. An article
// that marks a bars chart with "share": true gets that chart under the title (highlighted bar in the accent);
// the rest get their description. Colors match app/opengraph-image.tsx.

const size = { width: 1200, height: 630 };
const BAR = 700;

export function generateImageMetadata({ params }: { params: { slug: string } }) {
  return [{ id: "card", size, contentType: "image/png", alt: article(params.slug)?.title ?? "RunItLocal.io Learn" }];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const a = article((await params).slug);
  const chart = a ? shareChart(a.body) : null;
  const where = !a ? "Learn" : a.kind === "post" ? "Learn · Post" : `Learn · ${TRACKS.find(t => t.id === a.track)?.label}`;
  const max = chart ? Math.max(...chart.rows.map(r => r.value)) : 1;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 72px", background: "radial-gradient(70% 90% at 80% 40%, #0e1a22 0%, #050608 70%)", color: "#eef3f8" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, fontWeight: 700, letterSpacing: -1 }}>
            <div style={{ width: 18, height: 18, borderRadius: 999, background: "#ffb020", boxShadow: "0 0 20px #ffb020" }} />
            <span>RunItLocal</span><span style={{ color: "#6b7785", marginLeft: -16 }}>.io</span>
            <span style={{ marginLeft: 12, fontSize: 24, fontWeight: 400, color: "#6b7785", letterSpacing: 0 }}>{where}</span>
          </div>
          <div style={{ display: "flex", fontSize: chart ? 54 : 66, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2 }}>{a?.title ?? "Learn to run AI on your own hardware"}</div>
          {!chart && a && <div style={{ display: "flex", fontSize: 28, lineHeight: 1.4, color: "#a3afbd" }}>{a.description.length > 170 ? a.description.slice(0, a.description.lastIndexOf(" ", 168)) + "…" : a.description}</div>}
        </div>
        {chart && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", fontSize: 20, color: "#6b7785", letterSpacing: 2, textTransform: "uppercase" }}>{chart.title}, {chart.unit}</div>
            {chart.rows.map((r, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", fontSize: 22, color: r.hi ? "#eef3f8" : "#a3afbd" }}>{r.label}{r.sub ? ` · ${r.sub}` : ""}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: Math.round((BAR * r.value) / max), height: 26, borderRadius: "0 6px 6px 0", background: r.hi ? "#c8ff2e" : "#4b545f" }} />
                  <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: r.hi ? "#eef3f8" : "#a3afbd" }}>{fmt(r.value, chart.digits)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    size,
  );
}
