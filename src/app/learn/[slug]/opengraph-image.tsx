import { ImageResponse } from "next/og";
import { type Bars, fmt, heroStat, shareChart } from "@/lib/charts";
import { TRACKS, article } from "@/lib/learn";

// The card social networks show for a Learn article: the brand, where the article sits, and its title. An article
// with a highlighted stat ("hi" in a stats row) leads with that figure, large, in the accent. One that marks a bars
// chart with "share": true gets that chart too (highlighted bar in the accent); the rest get their description.
// Colors match app/opengraph-image.tsx.

const size = { width: 1200, height: 630 };
const INK = "#eef3f8", INK2 = "#a3afbd", INK3 = "#6b7785", LIME = "#c8ff2e", MUTE = "#4b545f";

export function generateImageMetadata({ params }: { params: { slug: string } }) {
  return [{ id: "card", size, contentType: "image/png", alt: article(params.slug)?.title ?? "RunItLocal.io Learn" }];
}

function BarRows({ chart, width, label }: { chart: Bars; width: number; label: number }) {
  // Four bars fit the card; the article lists the ones that matter first.
  const rows = chart.rows.slice(0, 4), max = Math.max(...rows.map(r => r.value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", fontSize: 18, color: INK3, letterSpacing: 2, textTransform: "uppercase" }}>{chart.title}, {chart.unit}</div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", fontSize: label, color: r.hi ? INK : INK2 }}>{r.label}{r.sub ? ` · ${r.sub}` : ""}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: Math.max(4, Math.round((width * r.value) / max)), height: 24, borderRadius: "0 6px 6px 0", background: r.hi ? LIME : MUTE }} />
            <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: r.hi ? INK : INK2 }}>{fmt(r.value, chart.digits)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const a = article((await params).slug);
  const chart = a ? shareChart(a.body) : null, hero = a ? heroStat(a.body) : null;
  const where = !a ? "Learn" : a.kind === "post" ? "Learn · Post" : `Learn · ${TRACKS.find(t => t.id === a.track)?.label}`;
  const title = a?.title ?? "Learn to run AI on your own hardware";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 72px", background: "radial-gradient(70% 90% at 80% 40%, #0e1a22 0%, #050608 70%)", color: INK }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, fontWeight: 700, letterSpacing: -1 }}>
          <div style={{ width: 18, height: 18, borderRadius: 999, background: "#ffb020", boxShadow: "0 0 20px #ffb020" }} />
          <span>RunItLocal</span><span style={{ color: INK3, marginLeft: -16 }}>.io</span>
          <span style={{ marginLeft: 12, fontSize: 24, fontWeight: 400, color: INK3, letterSpacing: 0 }}>{where}</span>
        </div>
        {hero ? (
          <div style={{ display: "flex", gap: 56, alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, width: chart ? 560 : 1056 }}>
              <div style={{ display: "flex", fontSize: hero.value.length > 8 ? 92 : 112, fontWeight: 800, lineHeight: 1, letterSpacing: -4, color: LIME }}>{hero.value}</div>
              <div style={{ display: "flex", fontSize: 26, color: INK2, lineHeight: 1.3 }}>{hero.label}</div>
              <div style={{ display: "flex", marginTop: 26, fontSize: 38, fontWeight: 700, lineHeight: 1.15, letterSpacing: -1 }}>{title}</div>
            </div>
            {chart && <div style={{ display: "flex", flex: 1 }}><BarRows chart={chart} width={340} label={17} /></div>}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 28, flex: 1, justifyContent: "flex-end" }}>
            <div style={{ display: "flex", fontSize: chart ? 54 : 66, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2 }}>{title}</div>
            {chart ? <BarRows chart={chart} width={700} label={22} />
              : a && <div style={{ display: "flex", fontSize: 28, lineHeight: 1.4, color: INK2 }}>{a.description.length > 170 ? a.description.slice(0, a.description.lastIndexOf(" ", 168)) + "…" : a.description}</div>}
          </div>
        )}
      </div>
    ),
    size,
  );
}
