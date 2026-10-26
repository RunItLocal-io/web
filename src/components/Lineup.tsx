import Link from "next/link";
import type { CSSProperties } from "react";
import { speedFrac } from "@/components/Gauge";
import { VERDICT_LABEL, fmtTps, modelSlug, type Rated } from "@/lib/estimate";
import "./lineup.css";

/** Every model with its estimated speed and verdict. Shared by the homepage and the GPU pages. */
export default function Lineup({ rated }: { rated: Rated[] }) {
  return (
    <ul className="models">
      {rated.map(r => (
        <li key={r.tag} className={"reveal " + r.verdict}>
          <div className="m-name"><Link href={`/model/${modelSlug(r)}`}><b>{r.name}</b></Link><span>{r.blurb}</span></div>
          <div className="m-meter">
            <span className="m-num">{r.fits ? `~${fmtTps(r.tps)} tok/s` : `needs ${Math.ceil(r.file + 1.2)} GB`}</span>
            <span className="m-track"><span className="m-fill" style={{ "--w": r.fits ? speedFrac(r.tps) : 0 } as CSSProperties} /></span>
          </div>
          <div className="m-side">
            <span className={"verdict " + r.verdict}>{VERDICT_LABEL[r.verdict]}</span>
            <code className="m-tag">{r.tag}</code>
          </div>
        </li>
      ))}
    </ul>
  );
}
