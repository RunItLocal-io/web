import Link from "next/link";
import type { ReactNode } from "react";

export const SECTIONS = [
  { href: "/builds", label: "Builds" },
  { href: "/learn", label: "Learn" },
  { href: "/notes", label: "Lab notes" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/people", label: "People" },
];

export function SiteNav() {
  return (
    <nav aria-label="Main">
      <Link className="brand" href="/"><span className="led" aria-hidden="true" />run it local</Link>
      <ul>
        {SECTIONS.map(s => <li key={s.href}><Link href={s.href}>{s.label}</Link></li>)}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <span className="tagline"><span className="led" aria-hidden="true" />Run It Local · run it yourself, own your data</span>
      <ul>
        {SECTIONS.map(s => <li key={s.href}><Link href={s.href}>{s.label}</Link></li>)}
        <li><Link href="/try">Try our rack</Link></li>
      </ul>
    </footer>
  );
}

/** Heading block for a subpage. */
export function PageHead({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <header className="head page-head">
      <span className="kicker">{kicker}</span>
      <h1>{title}</h1>
      {children && <p className="lede">{children}</p>}
    </header>
  );
}
