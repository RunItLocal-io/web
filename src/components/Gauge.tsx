import { CountUp } from "./Decode";

// A 240° arc gauge for tokens per second, on a log scale so 10, 30 and 100 tok/s all read clearly.
const MAX = 200;
const R = 80, C = 2 * Math.PI * R, SWEEP = 240 / 360;

export const speedFrac = (tps: number) => Math.min(1, Math.log1p(Math.max(0, tps)) / Math.log1p(MAX));

export default function Gauge({ tps, label }: { tps: number; label: string }) {
  const arc = C * SWEEP;
  const filled = arc * speedFrac(tps);
  return (
    <div className="gauge">
      <svg viewBox="0 0 200 180" role="img" aria-label={`About ${Math.round(tps)} tokens per second`}>
        <defs>
          <linearGradient id="gauge-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#c8ff2e" /><stop offset=".55" stopColor="#2ee6ff" /><stop offset="1" stopColor="#8a5cff" />
          </linearGradient>
        </defs>
        <g transform="rotate(150 100 100)">
          <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="10" strokeDasharray={`${arc} ${C}`} strokeLinecap="round" />
          <circle className="gauge-fill" cx="100" cy="100" r={R} fill="none" stroke="url(#gauge-grad)" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${filled} ${C}`} />
        </g>
        {[10, 30, 100].map(v => {
          const a = (150 + 240 * speedFrac(v)) * Math.PI / 180;
          return <text key={v} x={100 + 102 * Math.cos(a)} y={100 + 102 * Math.sin(a) + 3} className="gauge-tick" textAnchor="middle">{v}</text>;
        })}
      </svg>
      <div className="gauge-read">
        <span className="gauge-num"><CountUp value={tps} /></span>
        <span className="gauge-unit">tok/s</span>
        <span className="gauge-label">{label}</span>
      </div>
    </div>
  );
}
