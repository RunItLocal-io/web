// Charts in Learn articles: a ```chart fenced block holding one JSON spec, drawn by components/Chart.tsx. The data
// sits in the article beside the table it summarizes, so the two are edited together. A "bars" chart with
// "share": true is also drawn on the article's share card (app/learn/[slug]/opengraph-image.tsx).

export type Bars = { type: "bars"; title: string; note?: string; unit: string; digits?: number; share?: boolean;
  rows: { label: string; sub?: string; value: number; hi?: boolean }[] };
export type Lines = { type: "lines"; title: string; note?: string; unit: string; digits?: number; x: string[]; xTitle?: string;
  series: { name: string; short?: string; values: number[] }[] };
/** How many cards of `per` GB each row needs: one box per card, filled as far as the row's GB reach. */
export type Cards = { type: "cards"; title: string; note?: string; per: number;
  rows: { label: string; value: number; text: string; hi?: boolean }[] };
export type Stats = { type: "stats"; items: { value: string; label: string; hi?: boolean }[] };
export type ChartSpec = Bars | Lines | Cards | Stats;

/** Line colors, in order: lime then violet, checked as a pair for colorblind separation and contrast on the chart
 * surface. Lime is stepped down from the accent so both lines carry the same weight. A third series needs a new check. */
export const SERIES = ["#74a30c", "#8a5cff"];

export function parseChart(src: string): ChartSpec {
  let c: ChartSpec;
  try { c = JSON.parse(src); } catch (e) { throw new Error(`chart block isn't valid JSON: ${(e as Error).message}`); }
  if (!["bars", "lines", "cards", "stats"].includes(c.type)) throw new Error(`Unknown chart type "${c.type}"`);
  if (c.type === "lines" && (c.series.length > SERIES.length || c.series.some(s => s.values.length !== c.x.length)))
    throw new Error(`chart "${c.title}": at most ${SERIES.length} series, each with one value per x`);
  return c;
}

/** The bars chart an article puts on its share card, if it marks one. */
export function shareChart(body: string): Bars | null {
  for (const [, src] of body.matchAll(/^```chart\n([\s\S]*?)\n```/gm)) {
    const c = parseChart(src);
    if (c.type === "bars" && c.share) return c;
  }
  return null;
}

/** The highlighted figure from an article's stats row, which the share card shows large. */
export function heroStat(body: string) {
  for (const [, src] of body.matchAll(/^```chart\n([\s\S]*?)\n```/gm)) {
    const c = parseChart(src);
    const hi = c.type === "stats" ? c.items.find(s => s.hi) : undefined;
    if (hi) return hi;
  }
  return null;
}

export const fmt = (v: number, digits?: number) =>
  v.toLocaleString("en-US", digits == null ? {} : { minimumFractionDigits: digits, maximumFractionDigits: digits });
