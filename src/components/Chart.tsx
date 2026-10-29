import type { CSSProperties } from "react";
import { type Bars, type Cards, type ChartSpec, type Lines, type Stats, SERIES, fmt } from "@/lib/charts";

// Charts for Learn articles, from ```chart blocks (see lib/charts.ts). Plain HTML and CSS, plus one SVG for the line
// paths, so labels stay readable at phone width. Highlighted marks take the accent and the rest stay gray. Each chart
// sits beside a table with the same numbers, so hover tooltips add detail but never hold the only copy of a value.

const vars = (v: Record<string, number>) => v as CSSProperties;

/** A round top for the y axis in at most five steps: 333.9 becomes 400 in steps of 100. */
function scale(max: number) {
  const base = 10 ** Math.floor(Math.log10(max / 4));
  const step = [1, 2, 2.5, 5, 10].map(m => m * base).find(s => Math.ceil(max / s) <= 5)!;
  return { top: Math.ceil(max / step) * step, step };
}

function BarChart({ c }: { c: Bars }) {
  const max = Math.max(...c.rows.map(r => r.value));
  return (
    <div className="chart-bars">
      {c.rows.map((r, i) => (
        <div key={i} className={r.hi ? "bar-row hi" : "bar-row"}>
          <span className="bar-label"><b>{r.label}</b>{r.sub && <span>{r.sub}</span>}</span>
          <span className="bar-track">
            <span className="bar" style={vars({ "--w": r.value / max })} />
            <span className="bar-value">{fmt(r.value, c.digits)} {c.unit}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ c }: { c: Lines }) {
  const { top, step } = scale(Math.max(...c.series.flatMap(s => s.values)));
  const n = c.x.length, xs = c.x.map((_, j) => 6 + (88 * j) / Math.max(1, n - 1)), y = (v: number) => (100 * v) / top;
  // Name the lines where they're furthest apart, so the labels can't collide; the table carries the rest.
  const gap = (j: number) => Math.abs(c.series[0].values[j] - (c.series[1]?.values[j] ?? 0));
  const at = c.series.length < 2 ? n - 1 : c.x.reduce((best, _, j) => (gap(j) > gap(best) ? j : best), 0);
  const edge = (j: number) => (j === 0 ? "start" : j === n - 1 ? "end" : "mid");
  return (
    <>
      <ul className="chart-legend">{c.series.map((s, i) => <li key={i}><i style={{ background: SERIES[i] }} />{s.name}</li>)}</ul>
      <div className="line-chart">
        <div className="line-plot">
          {Array.from({ length: top / step + 1 }, (_, k) => k * step).map(t => (
            <span key={t} className="grid" style={{ bottom: `${y(t)}%` }}><span>{fmt(t)}</span></span>
          ))}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {c.series.map((s, i) => <polyline key={i} stroke={SERIES[i]} points={s.values.map((v, j) => `${xs[j]},${100 - y(v)}`).join(" ")} />)}
          </svg>
          {c.series.map((s, i) => s.values.map((v, j) => (
            <span key={`${i}.${j}`} className="dot" style={{ left: `${xs[j]}%`, bottom: `${y(v)}%`, background: SERIES[i] }} />
          )))}
          {c.series.map((s, i) => {
            // The lower line's label goes under its point, unless that would run into the x axis.
            const v = s.values[at], above = v >= Math.max(...c.series.map(o => o.values[at])) || y(v) < 15;
            return (
              <span key={i} className={`dot-label ${edge(at)} ${above ? "above" : "below"}`} style={{ left: `${xs[at]}%`, bottom: `${y(v)}%` }}>
                {s.short ?? s.name} <b>{fmt(v, c.digits)}</b>
              </span>
            );
          })}
          {c.x.map((x, j) => (
            <span key={j} className={`line-col ${edge(j)}`} tabIndex={0} style={{ left: `${xs[j]}%`, width: `${88 / Math.max(1, n - 1)}%` }}
              aria-label={`${x}: ${c.series.map(s => `${s.name} ${fmt(s.values[j], c.digits)} ${c.unit}`).join(", ")}`}>
              <span className="tip" aria-hidden="true">
                <span>{x}{c.xTitle ? ` · ${c.xTitle.toLowerCase()}` : ""}</span>
                {c.series.map((s, i) => <span key={i}><i style={{ background: SERIES[i] }} /><b>{fmt(s.values[j], c.digits)} {c.unit}</b> {s.short ?? s.name}</span>)}
              </span>
            </span>
          ))}
        </div>
        <div className="line-x">{c.x.map((x, j) => <span key={j} style={{ left: `${xs[j]}%` }}>{x}</span>)}</div>
        {c.xTitle && <span className="line-x-title">{c.xTitle}</span>}
      </div>
    </>
  );
}

function CardChart({ c }: { c: Cards }) {
  const need = (gb: number) => Math.ceil(gb / c.per);
  return (
    <div className="chart-cards" style={vars({ "--n": Math.max(...c.rows.map(r => need(r.value))) })}>
      {c.rows.map((r, i) => (
        <div key={i} className={r.hi ? "cards-row hi" : "cards-row"}>
          <span className="cards-label"><b>{r.label}</b><span>{r.text} · {need(r.value)} {need(r.value) === 1 ? "card" : "cards"}</span></span>
          <span className="cards" aria-hidden="true">
            {Array.from({ length: need(r.value) }, (_, k) => <i key={k} style={vars({ "--f": Math.min(1, r.value / c.per - k) })} />)}
          </span>
        </div>
      ))}
    </div>
  );
}

const StatRow = ({ c }: { c: Stats }) => (
  <div className="chart-stats">{c.items.map((s, i) => <div key={i} className={s.hi ? "stat hi" : "stat"}><b>{s.value}</b><span>{s.label}</span></div>)}</div>
);

export default function Chart({ spec }: { spec: ChartSpec }) {
  if (spec.type === "stats") return <StatRow c={spec} />;
  return (
    <figure className="chart">
      <figcaption><b>{spec.title}</b>{spec.note && <span>{spec.note}</span>}</figcaption>
      {spec.type === "bars" ? <BarChart c={spec} /> : spec.type === "lines" ? <LineChart c={spec} /> : <CardChart c={spec} />}
    </figure>
  );
}
